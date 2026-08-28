/**
 * Les rubriques de MUK, telles que définies au §09 de la fiche éditoriale.
 *
 * VOICES n'apparaît pas : la fiche hésitait entre PEOPLE et VOICES et leur
 * donnait deux intentions différentes — le portrait d'un côté, la prise de
 * parole de l'autre. PEOPLE a été retenu comme rubrique ; la prise de parole
 * est devenue un format (voir lib/formats.js), pas une entrée de menu.
 *
 * `descripteur` est le mot romain qui accompagne le logo dans l'en-tête quand
 * on consulte la rubrique — c'est le système modulaire du logotype.
 */
export const RUBRIQUES = [
  {
    id: 'culture',
    nom: 'Culture',
    nomEn: 'Culture',
    descripteur: 'culture',
    resume:
      'Cinéma, littérature, art, photographie, danse, design, culture populaire.',
    resumeEn:
      'Film, literature, art, photography, dance, design, popular culture.',
  },
  {
    id: 'fashion',
    nom: 'Fashion',
    nomEn: 'Fashion',
    descripteur: 'fashion',
    resume: 'La mode comme langage culturel et social. Créateurs, archives, tenues.',
    resumeEn: 'Fashion as a cultural and social language. Designers, archives, outfits.',
  },
  {
    id: 'sound',
    nom: 'Sound',
    nomEn: 'Sound',
    descripteur: 'sounds',
    resume: 'Scènes musicales, DJ sets, playlists, découvertes, nouvelles sonorités.',
    resumeEn: 'Music scenes, DJ sets, playlists, discoveries, new sounds.',
  },
  {
    id: 'ideas',
    nom: 'Ideas',
    nomEn: 'Ideas',
    descripteur: 'ideas',
    resume: 'Société, politique, philosophie, identité, génération, diaspora.',
    resumeEn: 'Society, politics, philosophy, identity, generation, diaspora.',
  },
  {
    id: 'people',
    nom: 'People',
    nomEn: 'People',
    descripteur: 'people',
    resume: 'Celles et ceux qui construisent la culture de demain.',
    resumeEn: 'The people building tomorrow’s culture.',
  },
  {
    id: 'city',
    nom: 'City',
    nomEn: 'City',
    descripteur: 'city',
    resume: 'Villes, lieux, scènes culturelles, communautés.',
    resumeEn: 'Cities, places, cultural scenes, communities.',
  },
];

export const RUBRIQUE_DEFAUT = 'culture';

/** Le nom et le résumé dans la langue demandée. */
export const nomRubrique = (rubrique, langue) =>
  langue === 'en' ? rubrique.nomEn : rubrique.nom;

export const resumeRubrique = (rubrique, langue) =>
  langue === 'en' ? rubrique.resumeEn : rubrique.resume;

export function trouverRubrique(id) {
  return (
    RUBRIQUES.find((r) => r.id === id) ??
    RUBRIQUES.find((r) => r.id === RUBRIQUE_DEFAUT)
  );
}

/**
 * Ne renvoie que les rubriques qui ont au moins un contenu publié.
 *
 * Décision prise avec le client : les huit rubriques sont déclarées dès
 * maintenant, mais une rubrique vide ne s'affiche pas dans la navigation —
 * rien ne fait plus abandonné qu'un média dont six sections sur huit sont
 * vides le jour de son lancement. Elles réapparaissent seules au premier
 * article publié.
 */
export function rubriquesVivantes(contenus) {
  const peuplees = new Set(contenus.map((c) => c.rubrique));
  return RUBRIQUES.filter((r) => peuplees.has(r.id));
}
