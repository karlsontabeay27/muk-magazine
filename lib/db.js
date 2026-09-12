/**
 * Point d'entrée unique pour les données.
 *
 * Deux implémentations derrière la même interface :
 *  - db-local    : fichier JSON + /public/uploads — pour développer et faire
 *                  la démonstration sans aucun compte à créer ;
 *  - db-supabase : Postgres + Supabase Storage — la production.
 *
 * Aucun composant ni aucune route d'API ne sait laquelle des deux répond.
 */
import * as local from '@/lib/db-local';
import * as supabase from '@/lib/db-supabase';
import {
  cleSecretePlausible,
  urlPresente as urlSupabasePresente,
} from '@/lib/supabase-config';

const urlPresente = urlSupabasePresente();
const cleValide = cleSecretePlausible(process.env.SUPABASE_SERVICE_ROLE_KEY);

export const utiliseSupabase = urlPresente && cleValide;

// Une clé mal collée — ou carrément absente — est l'erreur la plus fréquente
// de la mise en service : on la signale une fois au démarrage plutôt que de
// la laisser se manifester en pleine page.
//
// Sur Vercel (VERCEL=1), c'est plus grave qu'un simple avertissement : le
// mode démonstration écrit sur un disque en lecture seule, donc toute
// écriture plante immédiatement. C'est précisément ce qui s'est produit le
// 12 septembre 2026 — silencieusement, sans que ce message n'existe encore
// pour le signaler dans les journaux de la fonction.
if (!utiliseSupabase) {
  const raison = !urlPresente
    ? 'NEXT_PUBLIC_SUPABASE_URL absente'
    : 'SUPABASE_SERVICE_ROLE_KEY absente ou non secrète (clé sb_secret_… attendue)';

  console.warn(`[MUK] ${raison} — mode démonstration actif.`);
  console.warn('      Diagnostic complet : npm run supabase:verifier');

  if (process.env.VERCEL) {
    console.warn(
      '      ATTENTION : ceci tourne sur Vercel. Le mode démonstration écrit sur un ' +
        'disque en lecture seule — toute création, modification ou suppression va ' +
        'échouer (EROFS). Vérifiez les deux variables dans Vercel → Settings → ' +
        'Environment Variables, puis redéployez : une variable ajoutée après coup ' +
        'n’est prise en compte qu’au prochain build.',
    );
  }
}

const source = utiliseSupabase ? supabase : local;

export const listerArticles = (options) => source.listerArticles(options);
export const lireArticleParSlug = (slug, langue) =>
  source.lireArticleParSlug(slug, langue);
export const lireTraductions = (groupeId, saufId) =>
  source.lireTraductions(groupeId, saufId);
export const lireArticle = (id) => source.lireArticle(id);
export const creerArticle = (donnees) => source.creerArticle(donnees);
export const majArticle = (id, donnees) => source.majArticle(id, donnees);
export const supprimerArticle = (id) => source.supprimerArticle(id);
export const televerserImage = (fichier) => source.televerserImage(fichier);
export const supprimerImage = (url) => source.supprimerImage(url);
