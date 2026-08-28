/**
 * Les formats de contenu de MUK (§10 de la fiche éditoriale).
 *
 * Le format dit *comment* un contenu se lit ; la rubrique dit *de quoi* il
 * parle. Un même format vit dans plusieurs rubriques : une interview a sa
 * place dans SOUND comme dans PEOPLE.
 *
 * Cette liste est la réponse au §13 — « éviter de construire un site
 * uniquement pensé pour publier des articles ». Chaque format aura son
 * gabarit d'affichage et sa portion de formulaire dans l'admin ; ajouter un
 * format n'impose aucune migration de base.
 *
 * `pret` distingue ce qui est en place de ce qui viendra avec les phases 2
 * et 3 de la fiche (podcasts, vidéos, événements). L'admin ne propose que
 * les formats prêts.
 */
export const FORMATS = [
  {
    id: 'article',
    nomEn: 'Article',
    nom: 'Article',
    resume: 'Le format éditorial courant.',
    pret: true,
  },
  {
    id: 'interview',
    nomEn: 'Interview',
    nom: 'Interview',
    resume: 'Questions et réponses avec une personnalité.',
    pret: true,
  },
  {
    id: 'portrait',
    nomEn: 'Portrait',
    nom: 'Portrait',
    resume: 'Un récit construit autour d’une personne.',
    pret: true,
  },
  {
    id: 'tribune',
    nomEn: 'Op-ed',
    nom: 'Tribune',
    resume:
      'Une personne raconte sa propre expérience, signée de son nom. L’espace de parole de la fiche.',
    pret: true,
  },
  {
    id: 'essai',
    nomEn: 'Essay',
    nom: 'Essai',
    resume: 'Texte long et réflexif.',
    pret: true,
  },
  {
    id: 'photo',
    nomEn: 'Photo story',
    nom: 'Photo story',
    resume: 'Un récit porté par les images, texte réduit.',
    pret: true,
  },
  {
    id: 'ofotd',
    nomEn: 'Outfit of the day',
    nom: 'Tenue du jour',
    resume: 'La tenue portée, pièce par pièce. Format récurrent de MUK / Fashion.',
    pret: true,
  },
  // Phases 2 et 3 : la structure les accueille déjà, les gabarits viendront.
  { id: 'playlist', nomEn: 'Playlist', nom: 'Playlist', resume: 'Sélection musicale intégrée.', pret: false },
  { id: 'video', nomEn: 'Video', nom: 'Vidéo', resume: 'Interview filmée, session, mini-documentaire.', pret: false },
  { id: 'guide', nomEn: 'Guide', nom: 'Guide', resume: 'Sélections, lieux, recommandations.', pret: false },
  { id: 'evenement', nomEn: 'Event', nom: 'Événement', resume: 'Date, lieu, billetterie.', pret: false },
];

export const FORMAT_DEFAUT = 'article';

/** Le nom du format dans la langue demandée. */
export const nomFormat = (format, langue) => (langue === 'en' ? format.nomEn : format.nom);

export function trouverFormat(id) {
  return FORMATS.find((f) => f.id === id) ?? FORMATS.find((f) => f.id === FORMAT_DEFAUT);
}

export const formatsDisponibles = () => FORMATS.filter((f) => f.pret);
