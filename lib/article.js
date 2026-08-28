import { RUBRIQUES, RUBRIQUE_DEFAUT } from '@/lib/rubriques';
import { FORMATS, FORMAT_DEFAUT } from '@/lib/formats';
import { LANGUE_DEFAUT, langueValide } from '@/lib/i18n';

const IDS_RUBRIQUES = RUBRIQUES.map((r) => r.id);
const IDS_FORMATS = FORMATS.map((f) => f.id);

/**
 * Forme canonique d'un contenu, partagée par les deux adaptateurs de données.
 *
 * Tout ce qui entre par un formulaire passe ici : types garantis, valeurs par
 * défaut posées, champs inconnus jetés. La rubrique dit de quoi ça parle, le
 * format dit comment ça se lit — les deux sont contraints à une liste connue,
 * jamais du texte libre, sinon la navigation se remplit de doublons.
 *
 * Bilingue : un contenu et sa traduction sont **deux enregistrements
 * distincts**, reliés par un même `groupeId`. Ce choix permet à un article de
 * sortir en français puis d'être traduit trois jours plus tard, avec un slug
 * propre à chaque langue — indispensable au référencement. L'alternative
 * (des colonnes titre_fr / titre_en) obligerait à tout écrire d'un coup.
 */
export function normaliser(brut = {}) {
  const statut = brut.statut === 'publie' ? 'publie' : 'brouillon';
  const rubrique = IDS_RUBRIQUES.includes(brut.rubrique) ? brut.rubrique : RUBRIQUE_DEFAUT;
  const format = IDS_FORMATS.includes(brut.format) ? brut.format : FORMAT_DEFAUT;

  return {
    langue: langueValide(brut.langue) ? brut.langue : LANGUE_DEFAUT,
    // Le groupe relie les traductions entre elles. Un contenu sans groupe est
    // le premier de sa famille : l'adaptateur lui en attribue un.
    groupeId: brut.groupeId ? String(brut.groupeId) : null,
    titre: String(brut.titre ?? '').trim(),
    chapeau: String(brut.chapeau ?? '').trim(),
    contenu: String(brut.contenu ?? ''),
    couverture: brut.couverture ? String(brut.couverture) : null,
    galerie: Array.isArray(brut.galerie) ? brut.galerie.map(String) : [],
    // L'humeur reste facultative : « aucun » est un choix valide, et c'est
    // même le défaut pour un média — le bitmoji sert les contenus personnels.
    humeur: brut.humeur ? String(brut.humeur) : null,
    rubrique,
    format,
    // Signature : un média a plusieurs plumes, contrairement au blog d'avant.
    auteur: String(brut.auteur ?? 'MUK').trim() || 'MUK',
    statut,
    // Les pièces de la tenue n'ont de sens que pour le format OFOTD.
    piecesTenue:
      format === 'ofotd' && Array.isArray(brut.piecesTenue)
        ? brut.piecesTenue.map((p) => String(p).trim()).filter(Boolean)
        : [],
    // Une seule mise en avant à la fois côté rédaction : c'est la une.
    aLaUne: Boolean(brut.aLaUne),
    datePublication: brut.datePublication
      ? new Date(brut.datePublication).toISOString()
      : new Date().toISOString(),
  };
}

/** Champs obligatoires. Retourne la liste des messages d'erreur. */
export function valider(contenu) {
  const erreurs = [];
  if (!contenu.titre) erreurs.push('Le titre est obligatoire.');
  if (contenu.titre.length > 160) erreurs.push('Le titre dépasse 160 caractères.');
  if (!contenu.chapeau) erreurs.push('Le chapeau est obligatoire.');
  if (contenu.statut === 'publie' && !contenu.contenu.trim()) {
    erreurs.push('Un contenu publié doit avoir du texte.');
  }
  if (contenu.statut === 'publie' && !contenu.couverture) {
    erreurs.push('Un contenu publié doit avoir une image de couverture.');
  }
  return erreurs;
}

/** Le format OFOTD, seul format à afficher une liste de pièces. */
export const estTenue = (contenu) => contenu?.format === 'ofotd';
