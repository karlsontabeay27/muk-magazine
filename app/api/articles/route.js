import { NextResponse } from 'next/server';
import { creerArticle, listerArticles } from '@/lib/db';
import { normaliser, valider } from '@/lib/article';
import { refuserSiNonConnecte, sessionOuverte } from '@/lib/garde';

/** GET /api/articles — les brouillons ne sortent que pour une session ouverte. */
export async function GET() {
  const connectee = await sessionOuverte();
  const articles = await listerArticles({ inclureBrouillons: connectee });
  return NextResponse.json({ articles });
}

/** POST /api/articles — création. */
export async function POST(requete) {
  const refus = await refuserSiNonConnecte();
  if (refus) return refus;

  const corps = await requete.json().catch(() => null);
  if (!corps) return NextResponse.json({ erreur: 'Corps de requête illisible.' }, { status: 400 });

  const erreurs = valider(normaliser(corps));
  if (erreurs.length > 0) return NextResponse.json({ erreurs }, { status: 422 });

  const article = await creerArticle(corps);
  return NextResponse.json({ article }, { status: 201 });
}
