/**
 * Adresse publique du site.
 *
 * `||` et non `??` : une variable d'environnement non renseignée vaut la
 * chaîne vide, pas undefined — `??` la laisserait passer et new URL('')
 * ferait planter le rendu.
 */
// Barre oblique finale retirée : le reste du code compose les URL en
// `${SITE_URL}/chemin`, une valeur Vercel saisie avec un « / » final (ça
// arrive) donnerait sinon un double slash dans le sitemap et le JSON-LD.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3100').replace(
  /\/+$/,
  '',
);
