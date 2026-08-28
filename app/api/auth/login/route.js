import { NextResponse } from 'next/server';
import { COOKIE, creerJeton, motDePasseCorrect } from '@/lib/auth';

// Ralentisseur mémoire : 5 essais par IP toutes les 10 minutes. Suffisant
// contre le forçage bête ; à remplacer par un vrai limiteur (Upstash, Vercel
// KV) le jour où l'admin s'ouvre à plusieurs rédactrices.
const ESSAIS = new Map();
const FENETRE = 10 * 60 * 1000;
const MAX_ESSAIS = 5;

function tropDEssais(ip) {
  const maintenant = Date.now();
  const historique = (ESSAIS.get(ip) ?? []).filter((t) => maintenant - t < FENETRE);
  ESSAIS.set(ip, historique);
  return historique.length >= MAX_ESSAIS;
}

function noterEssai(ip) {
  ESSAIS.set(ip, [...(ESSAIS.get(ip) ?? []), Date.now()]);
}

export async function POST(requete) {
  const ip = requete.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';

  if (tropDEssais(ip)) {
    return NextResponse.json(
      { erreur: 'Trop de tentatives. Réessayez dans quelques minutes.' },
      { status: 429 },
    );
  }

  const { motDePasse } = await requete.json().catch(() => ({}));

  if (!motDePasseCorrect(motDePasse)) {
    noterEssai(ip);
    return NextResponse.json({ erreur: 'Mot de passe incorrect.' }, { status: 401 });
  }

  ESSAIS.delete(ip);

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
