import { NextResponse } from 'next/server';
import { listerArticles } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * Ping hebdomadaire pour Supabase.
 *
 * Le plan gratuit met un projet en pause après sept jours sans requête —
 * DEPLOIEMENT.md le disait déjà, et c'est exactement ce qui a coupé la
 * sauvegarde d'articles le 12 septembre : le site public restait visible
 * (pages mises en cache), mais toute écriture réelle échouait, le projet
 * étant devenu injoignable jusqu'à un réveil manuel.
 *
 * Cette route ne fait rien d'utile en elle-même — elle lit juste un contenu
 * pour compter comme une vraie requête. `vercel.json` la déclenche chaque
 * lundi, largement avant les sept jours de la fenêtre de pause.
 *
 * Protégée par CRON_SECRET : sans jeton, n'importe qui pourrait sinon
 * déclencher la route depuis son URL publique (elle ne fait rien de nuisible
 * en soi, mais autant fermer une porte qui n'a pas à être ouverte).
 */
export async function GET(requete) {
  const attendu = process.env.CRON_SECRET;
  const recu = requete.headers.get('authorization');

  if (!attendu || recu !== `Bearer ${attendu}`) {
    return NextResponse.json({ erreur: 'Non autorisé.' }, { status: 401 });
  }

  try {
    await listerArticles({ langue: 'fr' });
    return NextResponse.json({ ok: true, verifieLe: new Date().toISOString() });
  } catch (e) {
    // On journalise mais on ne fait pas échouer bruyamment le cron : la
    // prochaine tentative (lundi suivant) suffit, et une alerte email
    // Vercel existe déjà pour les crons en échec répété.
    console.error('Ping Supabase (cron) :', e);
    return NextResponse.json({ erreur: 'Échec du ping.' }, { status: 502 });
  }
}
