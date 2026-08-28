import Anthropic from '@anthropic-ai/sdk';
import { trouverRubrique } from '@/lib/rubriques';
import { trouverFormat } from '@/lib/formats';

/**
 * Traduction assistée d'un contenu.
 *
 * Le parti pris, arrêté avec le client : pas de traduction automatique servie
 * telle quelle au lecteur. Un widget qui retraduit la page dans le navigateur
 * coûterait le référencement de la version anglaise et, plus grave pour un
 * média, publierait des citations d'interview que la personne interrogée n'a
 * jamais validées.
 *
 * Ici, Claude produit une **première version** que la rédaction relit et
 * corrige avant publication. Le résultat arrive donc systématiquement en
 * brouillon, jamais en ligne.
 */

const LANGUES = {
  en: { nom: 'English', depuis: 'French' },
  fr: { nom: 'French', depuis: 'English' },
};

/** La charte de ton du §06 de la fiche éditoriale, donnée comme consigne. */
const VOIX = `MUK is a generational cultural media covering culture, creation,
ideas, people and city life. Its editorial voice is: intelligent but accessible,
sharp but never elitist, young but never patronising, engaged but never
moralising, aesthetic but never superficial, international but rooted.`;

const OUTIL = {
  name: 'enregistrer_traduction',
  description:
    'Records the translated version of the piece. Call this exactly once, with the complete translation.',
  input_schema: {
    type: 'object',
    properties: {
      titre: {
        type: 'string',
        description:
          'The headline. Recreate it rather than translating it word for word: it must work as a headline in the target language.',
      },
      chapeau: {
        type: 'string',
        description: 'The standfirst, two or three sentences.',
      },
      contenu: {
        type: 'string',
        description:
          'The body, keeping the exact same markers: ## for sections, ### for subheadings, > for pull quotes, blank line between paragraphs.',
      },
      piecesTenue: {
        type: 'array',
        items: { type: 'string' },
        description: 'The outfit items, if the piece has any. Empty array otherwise.',
      },
      notes: {
        type: 'string',
        description:
          'Anything the editor should check: an untranslatable turn of phrase, a cultural reference, a quote whose wording matters.',
      },
    },
    required: ['titre', 'chapeau', 'contenu', 'piecesTenue', 'notes'],
    additionalProperties: false,
  },
  strict: true,
};

export const traductionDisponible = () => Boolean(process.env.ANTHROPIC_API_KEY);

/**
 * @returns {{ titre, chapeau, contenu, piecesTenue, notes }}
 * @throws si la clé est absente ou si le modèle n'a pas appelé l'outil.
 */
export async function traduire(contenu, versLangue) {
  if (!traductionDisponible()) {
    throw new Error(
      'ANTHROPIC_API_KEY absente : la traduction assistée est désactivée. La traduction manuelle reste possible.',
    );
  }

  const cible = LANGUES[versLangue];
  if (!cible) throw new Error(`Langue de destination inconnue : ${versLangue}`);

  const client = new Anthropic();
  const rubrique = trouverRubrique(contenu.rubrique);
  const format = trouverFormat(contenu.format);

  const consigne = [
    `You are translating a piece for MUK, from ${cible.depuis} into ${cible.nom}.`,
    '',
    VOIX,
    '',
    `This piece runs in the ${rubrique.nomEn} section, in the "${format.nomEn}" format.`,
    '',
    'Rules:',
    '- Translate the voice, not the words. A sentence that reads well in the source and clumsily in the target has been translated badly.',
    '- Keep the markdown markers exactly as they are: ## sections, ### subheadings, > pull quotes, blank line between paragraphs.',
    '- Never translate proper nouns, brand names, place names or people’s names.',
    '- Quotes from interviewees are the most sensitive part. Translate them faithfully and flag in `notes` any quote whose wording carries weight.',
    '- Keep the same number of paragraphs and the same section structure.',
    '- Do not add, cut or summarise anything.',
    '',
    'An editor reads and corrects your draft before it is published. Flag your doubts in `notes` rather than silently smoothing them over.',
  ].join('\n');

  const source = [
    `TITLE: ${contenu.titre}`,
    '',
    `STANDFIRST: ${contenu.chapeau}`,
    '',
    'BODY:',
    contenu.contenu,
    contenu.piecesTenue?.length ? `\nOUTFIT ITEMS:\n- ${contenu.piecesTenue.join('\n- ')}` : '',
  ].join('\n');

  const reponse = await client.messages.create({
    model: 'claude-opus-5',
    max_tokens: 16000,
    system: consigne,
    tools: [OUTIL],
    tool_choice: { type: 'tool', name: OUTIL.name },
    messages: [{ role: 'user', content: source }],
  });

  const appel = reponse.content.find((bloc) => bloc.type === 'tool_use');
  if (!appel) {
    throw new Error('Le modèle n’a pas renvoyé de traduction exploitable.');
  }

  return appel.input;
}
