import { NextResponse } from 'next/server';
import { COOKIE, creerJeton, motDePasseCorrect } from '@/lib/auth';
import { reinitialiserTentatives, tropDeTentatives } from '@/lib/limiteur';

const MAX_ESSAIS = 5;
const FENETRE_SECONDES = 10 * 60;

export async function POST(requete) {
  const ip = requete.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';

  if (await tropDeTentatives('connexion', ip, MAX_ESSAIS, FENETRE_SECONDES)) {
    return NextResponse.json(
      { erreur: 'Trop de tentatives. Réessayez dans quelques minutes.' },
      { status: 429 },
    );
  }

  const { motDePasse } = await requete.json().catch(() => ({}));

  if (!motDePasseCorrect(motDePasse)) {
    return NextResponse.json({ erreur: 'Mot de passe incorrect.' }, { status: 401 });
  }

  // Une connexion réussie efface l'historique d'échecs de cette IP : une
  // série d'essais ratés suivie de la bonne réponse ne doit pas bloquer la
  // prochaine connexion légitime dans la même fenêtre.
  await reinitialiserTentatives('connexion', ip, MAX_ESSAIS, FENETRE_SECONDES);

  const reponse = NextResponse.json({ ok: true });
  reponse.cookies.set(COOKIE.nom, await creerJeton(), {
    httpOnly: true, // inaccessible au JavaScript de la page
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE.dureeSecondes,
  });
  return reponse;
}
