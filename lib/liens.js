import { CODES } from '@/lib/i18n';

/**
 * Construit les destinations du sélecteur de langue.
 *
 * Sur une page dont l'équivalent existe dans l'autre langue — l'accueil, une
 * rubrique — la bascule mène à la même page. Sur un article, elle ne mène à la
 * traduction que si celle-ci est publiée ; sinon on ne propose rien plutôt que
 * d'envoyer le lecteur sur une 404.
 *
 * @param {string} chemin  suite d'URL après le code de langue, ex. '/fashion'
 */
export function liensDirects(chemin = '') {
  return Object.fromEntries(CODES.map((code) => [code, `/${code}${chemin}`]));
}

/**
 * Destinations pour un article : la traduction si elle existe et si elle est
 * publiée, l'accueil de l'autre langue sinon — jamais rien, pour que la
 * bascule reste utilisable.
 */
export function liensArticle(contenu, traductions) {
  return Object.fromEntries(
    CODES.map((code) => {
      if (code === contenu.langue) return [code, `/${code}/article/${contenu.slug}`];

      const traduction = traductions.find(
        (t) => t.langue === code && t.statut === 'publie',
      );
      return [code, traduction ? `/${code}/article/${traduction.slug}` : `/${code}`];
    }),
  );
}

/**
 * Balises `alternates` de Next : indiquent à Google que deux URL sont deux
 * versions linguistiques d'une même page. Sans elles, les deux versions se
 * concurrencent dans les résultats au lieu de se renforcer.
 */
export function alternatesDepuis(liens, langueCourante) {
  return {
    canonical: liens[langueCourante],
    languages: Object.fromEntries(
      Object.entries(liens).filter(([code]) => code !== langueCourante),
    ),
  };
}
