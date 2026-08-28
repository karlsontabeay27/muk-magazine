import { NextResponse } from 'next/server';
import { creerArticle, lireArticle, lireTraductions } from '@/lib/db';
import { traduire, traductionDisponible } from '@/lib/traduction';
import { refuserSiNonConnecte } from '@/lib/garde';
import { CODES } from '@/lib/i18n';

/**
 * POST /api/articles/:id/traduire  { versLangue: 'en' }
 *
 * Crée la version traduite en **brouillon**, rattachée au même groupe que
 * l'original. Rien n'est publié : la rédaction relit, corrige, puis publie
 * depuis l'interface habituelle.
 *
 * La route est longue par nature (un appel modèle sur un texte entier), d'où
 * le maxDuration relevé pour Vercel.
 */
export const maxDuration = 120;

export async function POST(requete, { params }) {
  const refus = await refuserSiNonConnecte();
  if (refus) return refus;

  if (!traductionDisponible()) {
    return NextResponse.json(
      {
        erreur:
          'Traduction assistée indisponible : ANTHROPIC_API_KEY n’est pas renseignée. Vous pouvez créer la version traduite à la main.',
      },
      { status: 503 },
    );
  }

  const { id } = await params;
  const { versLangue } = await requete.json().catch(() => ({}));

  if (!CODES.includes(versLangue)) {
    return NextResponse.json({ erreur: 'Langue de destination inconnue.' }, { status: 422 });
  }

  const original = await lireArticle(id);
  if (!original) {
    return NextResponse.json({ erreur: 'Contenu introuvable.' }, { status: 404 });
  }
  if (original.langue === versLangue) {
    return NextResponse.json(
      { erreur: 'Ce contenu est déjà dans cette langue.' },
      { status: 422 },
    );
  }

  // Une seule traduction par langue : sans ce contrôle, un double clic
  // produirait deux versions anglaises du même texte.
  const existantes = await lireTraductions(original.groupeId, original.id);
  const deja = existantes.find((c) => c.langue === versLangue);
  if (deja) {
    return NextResponse.json(
      { erreur: 'Une version existe déjà dans cette langue.', article: deja },
      { status: 409 },
    );
  }

  let traduit;
  try {
    traduit = await traduire(original, versLangue);
  } catch (e) {
    console.error('Traduction assistée :', e);
    return NextResponse.json(
      { erreur: e.message ?? 'La traduction a échoué.' },
      { status: 502 },
    );
  }

  const article = await creerArticle({
    ...original,
    id: undefined,
    slug: undefined,
    langue: versLangue,
    groupeId: original.groupeId,
    titre: traduit.titre,
    chapeau: traduit.chapeau,
    contenu: traduit.contenu,
    piecesTenue: traduit.piecesTenue ?? [],
    // Toujours en brouillon : une traduction automatique n'est pas publiable
    // sans relecture humaine.
    statut: 'brouillon',
    aLaUne: false,
  });

  return NextResponse.json({ article, notes: traduit.notes ?? '' }, { status: 201 });
}
