import { NextResponse } from 'next/server';
import { lireArticle, majArticle, supprimerArticle, supprimerImage } from '@/lib/db';
import { normaliser, valider } from '@/lib/article';
import { refuserSiNonConnecte } from '@/lib/garde';

export async function GET(_requete, { params }) {
  const refus = await refuserSiNonConnecte();
  if (refus) return refus;

  const { id } = await params;
  const article = await lireArticle(id);
  if (!article) return NextResponse.json({ erreur: 'Article introuvable.' }, { status: 404 });
  return NextResponse.json({ article });
}

export async function PUT(requete, { params }) {
  const refus = await refuserSiNonConnecte();
  if (refus) return refus;

  const { id } = await params;
  const corps = await requete.json().catch(() => null);
  if (!corps) return NextResponse.json({ erreur: 'Corps de requête illisible.' }, { status: 400 });

  const existant = await lireArticle(id);
  if (!existant) return NextResponse.json({ erreur: 'Article introuvable.' }, { status: 404 });

  const erreurs = valider(normaliser({ ...existant, ...corps }));
  if (erreurs.length > 0) return NextResponse.json({ erreurs }, { status: 422 });

  const article = await majArticle(id, corps);
  return NextResponse.json({ article });
}

export async function DELETE(_requete, { params }) {
  const refus = await refuserSiNonConnecte();
  if (refus) return refus;

  const { id } = await params;
  const article = await lireArticle(id);
  if (!article) return NextResponse.json({ erreur: 'Article introuvable.' }, { status: 404 });

  // On nettoie les fichiers en même temps que la fiche : sans ça le stockage
  // se remplit de photos que plus rien ne référence.
  const medias = [article.couverture, ...(article.galerie ?? [])].filter(Boolean);
  await Promise.allSettled(medias.map((url) => supprimerImage(url)));

  await supprimerArticle(id);
  return NextResponse.json({ ok: true });
}
