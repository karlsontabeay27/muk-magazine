import { NextResponse } from 'next/server';
import { emailPlausible, inscrire } from '@/lib/abonnes';
import { traducteur } from '@/lib/i18n';
import { tropDeTentatives } from '@/lib/limiteur';

const MAX = 3;
const FENETRE_SECONDES = 10 * 60;

export async function POST(requete) {
  const ip = requete.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';

  // On lit le corps avant tout contrôle : l'inscription se fait sans
  // rechargement de page, donc tous les messages renvoyés — y compris les
  // refus — doivent être dans la langue de lecture.
  const { email, langue } = await requete.json().catch(() => ({}));
  const code = langue === 'en' ? 'en' : 'fr';
  const t = traducteur(code);

  if (!emailPlausible(email)) {
    return NextResponse.json({ erreur: t('newsletter.adresseInvalide') }, { status: 422 });
  }

  if (await tropDeTentatives('newsletter', ip, MAX, FENETRE_SECONDES)) {
    return NextResponse.json({ erreur: t('newsletter.tropDEssais') }, { status: 429 });
  }

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
