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

// Une clé mal collée est l'erreur la plus fréquente de la mise en service :
// on la signale une fois au démarrage plutôt que de la laisser se manifester
// en pleine page.
if (urlPresente && !cleValide) {
  console.warn('[MUK] SUPABASE_SERVICE_ROLE_KEY absente ou non secrète — mode démonstration.');
  console.warn('      Project Settings → API Keys → clé « secret » (sb_secret_…).');
  console.warn('      Diagnostic complet : npm run supabase:verifier');
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
