import { NextResponse } from 'next/server';

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
        // DIAGNOSTIC TEMPORAIRE (12/09) : ces routes exigent déjà une session
        // admin valide avant d'arriver ici, donc exposer le détail ne fuit
        // rien à un visiteur non connecté. À retirer une fois l'incident
        // d'écriture élucidé.
        diagnostic: String(e?.stack ?? e?.message ?? e),
      },
      { status: 502 },
    );
  }
}
