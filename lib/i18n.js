import fr from '@/lib/dictionnaires/fr.json';
import en from '@/lib/dictionnaires/en.json';

/**
 * Internationalisation de l'interface.
 *
 * Deux dictionnaires JSON, aucune bibliothèque. Les textes de l'interface —
 * boutons, étiquettes, messages — sont peu nombreux et ne changent presque
 * jamais ; y ajouter une dépendance coûterait plus qu'elle ne rapporte.
 *
 * À ne pas confondre avec la traduction des *contenus*, qui vivent en base :
 * un contenu français et sa version anglaise sont deux enregistrements liés
 * par un même `groupeId` (voir lib/article.js).
 */
export const LANGUES = [
  { code: 'fr', nom: 'Français', court: 'FR', htmlLang: 'fr', intl: 'fr-FR' },
  { code: 'en', nom: 'English', court: 'EN', htmlLang: 'en', intl: 'en-GB' },
];

export const LANGUE_DEFAUT = 'fr';

/**
 * En-tête posé par le middleware pour transmettre la langue à la mise en page
 * racine, qui rend <html lang> mais ne voit pas les paramètres de route.
 */
export const ENTETE_LANGUE = 'x-muk-langue';

export const CODES = LANGUES.map((l) => l.code);

export const langueValide = (code) => CODES.includes(code);

export const trouverLangue = (code) =>
  LANGUES.find((l) => l.code === code) ?? LANGUES.find((l) => l.code === LANGUE_DEFAUT);

const DICTIONNAIRES = { fr, en };

/**
 * Retourne la fonction de traduction pour une langue.
 *
 * `t('newsletter.titre')` remonte la clé par point. Une clé absente renvoie
 * la version française plutôt qu'un blanc : mieux vaut un mot dans la mauvaise
 * langue qu'un bouton vide en production. En développement, on le signale.
 */
export function traducteur(langue) {
  const code = langueValide(langue) ? langue : LANGUE_DEFAUT;

  return function t(cle, remplacements) {
    const valeur = descendre(DICTIONNAIRES[code], cle) ?? descendre(DICTIONNAIRES.fr, cle);

    if (valeur === undefined) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[i18n] clé absente des deux dictionnaires : ${cle}`);
      }
      return cle;
    }

    if (!remplacements) return valeur;

    // Interpolation minimale : t('article.lecture', { minutes: 4 })
    return Object.entries(remplacements).reduce(
      (texte, [nom, valeurRemplacement]) =>
        texte.replaceAll(`{${nom}}`, String(valeurRemplacement)),
      valeur,
    );
  };
}

function descendre(objet, cle) {
  return cle.split('.').reduce((noeud, morceau) => noeud?.[morceau], objet);
}

/**
 * Choisit une langue à partir de l'en-tête Accept-Language du navigateur.
 * Utilisé par le middleware pour rediriger « / » vers /fr ou /en.
 */
export function langueDepuisEntete(entete) {
  if (!entete) return LANGUE_DEFAUT;

  const preferences = entete
    .split(',')
    .map((morceau) => {
      const [etiquette, q] = morceau.trim().split(';q=');
      return { code: etiquette.split('-')[0].toLowerCase(), poids: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.poids - a.poids);

  return preferences.find((p) => langueValide(p.code))?.code ?? LANGUE_DEFAUT;
}
