import { NextResponse } from 'next/server';
import { cleSecretePlausible } from '@/lib/supabase-config';

/**
 * Exécute `tache` et transforme une exception en réponse JSON lisible.
 *
 * Sans ça, une erreur non attrapée dans une route d'API Next.js renvoie un
 * 500 au corps vide — exactement ce qui a rendu la panne Supabase du
 * 12 septembre 2026 difficile à diagnostiquer : le formulaire de l'admin
 * affichait juste « L'enregistrement a échoué », sans aucune piste. Le
 * projet était en réalité mis en pause (plan gratuit, sept jours sans
 * requête — voir DEPLOIEMENT.md), mais rien dans la réponse ne le disait.
 */
export async function avecGardeErreur(tache) {
  try {
    return await tache();
  } catch (e) {
    console.error('Erreur route API :', e);
    const dbInjoignable = e instanceof Error && e.message.startsWith('Supabase :');
    return NextResponse.json(
      {
        erreur: dbInjoignable
          ? 'Base de données injoignable. Si le site a été peu utilisé récemment, ' +
            'le projet Supabase est peut-être en pause : dashboard Supabase → réveiller ' +
            'le projet, puis réessayer.'
          : 'Une erreur inattendue est survenue côté serveur.',
        // DIAGNOSTIC TEMPORAIRE (12/09, round 3) : rien de secret n'est exposé
        // ici, juste des longueurs et des préfixes de 12 caractères — de quoi
        // distinguer « absente » de « mauvais format » sans révéler la valeur.
        diagnostic: {
          url: {
            presente: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
            longueur: (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').length,
            debut: (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').slice(0, 20),
          },
          cle: {
            presente: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
            longueur: (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').length,
            prefixe: (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').slice(0, 12),
            jugeeValide: cleSecretePlausible(process.env.SUPABASE_SERVICE_ROLE_KEY),
          },
          environnementVercel: process.env.VERCEL ?? null,
          environnementVercelEnv: process.env.VERCEL_ENV ?? null,
        },
      },
      { status: 502 },
    );
  }
}
