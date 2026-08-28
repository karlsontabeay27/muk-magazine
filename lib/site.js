/**
 * Adresse publique du site.
 *
 * `||` et non `??` : une variable d'environnement non renseignée vaut la
 * chaîne vide, pas undefined — `??` la laisserait passer et new URL('')
 * ferait planter le rendu.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3100';
