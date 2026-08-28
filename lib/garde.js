import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { COOKIE, jetonValide } from '@/lib/auth';

/**
 * Vérification de session pour les routes d'API.
 *
 * Le middleware protège déjà les pages /admin, mais les routes d'API sont
 * appelables directement : elles refont le contrôle elles-mêmes plutôt que de
 * faire confiance à la couche du dessus.
 */
export async function sessionOuverte() {
  const jeton = (await cookies()).get(COOKIE.nom)?.value;
  return jetonValide(jeton);
}

/** Retourne une réponse 401 à renvoyer telle quelle, ou null si la session est valide. */
export async function refuserSiNonConnecte() {
  if (await sessionOuverte()) return null;
  return NextResponse.json({ erreur: 'Session expirée ou absente.' }, { status: 401 });
}
