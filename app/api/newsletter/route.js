import { NextResponse } from 'next/server';
import { emailPlausible, inscrire } from '@/lib/abonnes';
import { traducteur } from '@/lib/i18n';

// Ralentisseur mémoire : la route est publique, donc ouverte à l'inondation.
// Trois inscriptions par IP toutes les dix minutes suffisent largement.
const ESSAIS = new Map();
const FENETRE = 10 * 60 * 1000;
const MAX = 3;

function tropDEssais(ip) {
  const maintenant = Date.now();
  const historique = (ESSAIS.get(ip) ?? []).filter((t) => maintenant - t < FENETRE);
  ESSAIS.set(ip, historique);
  return historique.length >= MAX;
}

export async function POST(requete) {
  const ip = requete.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';

  // On lit le corps avant tout contrôle : l'inscription se fait sans
  // rechargement de page, donc tous les messages renvoyés — y compris les
  // refus — doivent être dans la langue de lecture.
  const { email, langue } = await requete.json().catch(() => ({}));
  const code = langue === 'en' ? 'en' : 'fr';
  const t = traducteur(code);

  if (tropDEssais(ip)) {
    return NextResponse.json({ erreur: t('newsletter.tropDEssais') }, { status: 429 });
  }

  if (!emailPlausible(email)) {
    return NextResponse.json({ erreur: t('newsletter.adresseInvalide') }, { status: 422 });
  }

  ESSAIS.set(ip, [...(ESSAIS.get(ip) ?? []), Date.now()]);

  try {
    await inscrire(email, code);
  } catch (e) {
    console.error('Inscription newsletter :', e);
    return NextResponse.json(
      { erreur: t('newsletter.enregistrementImpossible') },
      { status: 500 },
    );
  }

  // Même réponse que l'adresse soit nouvelle ou déjà connue : sans quoi la
  // route permettrait de tester si une adresse est inscrite.
  return NextResponse.json({ message: t('newsletter.confirmation') });
}
