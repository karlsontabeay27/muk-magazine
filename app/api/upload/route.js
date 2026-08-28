import { NextResponse } from 'next/server';
import { televerserImage } from '@/lib/db';
import { refuserSiNonConnecte } from '@/lib/garde';

const TYPES_AUTORISES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
const TAILLE_MAX = 8 * 1024 * 1024; // 8 Mo : large pour une photo de blog, borné quand même

/**
 * POST /api/upload — un fichier par appel, champ « fichier ».
 * Le type déclaré ET l'extension sont contrôlés côté serveur : le navigateur
 * n'est pas une source de vérité.
 */
export async function POST(requete) {
  const refus = await refuserSiNonConnecte();
  if (refus) return refus;

  const formulaire = await requete.formData().catch(() => null);
  const fichier = formulaire?.get('fichier');

  if (!fichier || typeof fichier === 'string') {
    return NextResponse.json({ erreur: 'Aucun fichier reçu.' }, { status: 400 });
  }

  if (!TYPES_AUTORISES.includes(fichier.type)) {
    return NextResponse.json(
      { erreur: 'Format non accepté. Utilisez JPG, PNG, WEBP, AVIF ou GIF.' },
      { status: 415 },
    );
  }

  if (fichier.size > TAILLE_MAX) {
    return NextResponse.json(
      { erreur: `Photo trop lourde (${Math.round(fichier.size / 1e6)} Mo). Maximum 8 Mo.` },
      { status: 413 },
    );
  }

  try {
    const url = await televerserImage(fichier);
    return NextResponse.json({ url }, { status: 201 });
  } catch (e) {
    console.error('Échec du téléversement :', e);
    return NextResponse.json({ erreur: 'Le téléversement a échoué.' }, { status: 500 });
  }
}
