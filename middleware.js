import { NextResponse } from 'next/server';
import { COOKIE, jetonValide } from '@/lib/auth';
import { CODES, ENTETE_LANGUE, LANGUE_DEFAUT, langueDepuisEntete } from '@/lib/i18n';

/**
 * Deux responsabilités, dans cet ordre.
 *
 * 1. Le back-office : tout /admin sauf la page de connexion exige une session
 *    valide. Les routes d'API revérifient de leur côté — le middleware n'est
 *    pas la seule ligne de défense.
 *
 * 2. La langue : chaque page publique vit sous /fr ou /en. Une URL sans
 *    préfixe est redirigée vers la langue du navigateur, ce qui laisse
 *    « monsite.fr » utilisable tel quel dans la vie courante.
 */
const SANS_PREFIXE = ['/admin', '/api', '/_next', '/favicon.ico', '/icon.svg', '/robots.txt', '/sitemap.xml'];

// Fichiers servis depuis /public : ils ne doivent jamais être préfixés.
const EST_FICHIER = /\.[a-z0-9]+$/i;

export async function middleware(requete) {
  const { pathname } = requete.nextUrl;

  // ------------------------------------------------------------- Back-office
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next();

    const jeton = requete.cookies.get(COOKIE.nom)?.value;
    if (await jetonValide(jeton)) return NextResponse.next();

    const versLogin = requete.nextUrl.clone();
    versLogin.pathname = '/admin/login';
    versLogin.searchParams.set('suite', pathname);
    return NextResponse.redirect(versLogin);
  }

  // ------------------------------------------------------------------ Langue
  if (SANS_PREFIXE.some((prefixe) => pathname.startsWith(prefixe)) || EST_FICHIER.test(pathname)) {
    return NextResponse.next();
  }

  const prefixe = CODES.find(
    (code) => pathname === `/${code}` || pathname.startsWith(`/${code}/`),
  );

  if (prefixe) {
    // La mise en page racine rend la balise <html> et doit connaître la
    // langue : elle ne peut pas la lire dans les paramètres de route, qui
    // n'existent qu'un niveau plus bas. On la lui transmet par un en-tête.
    const entetes = new Headers(requete.headers);
    entetes.set(ENTETE_LANGUE, prefixe);
    return NextResponse.next({ request: { headers: entetes } });
  }

  // On respecte la préférence du navigateur, sans mémoriser de choix : aucun
  // cookie n'est déposé pour ça, ce serait un traceur à déclarer.
  const langue = langueDepuisEntete(requete.headers.get('accept-language')) ?? LANGUE_DEFAUT;

  const cible = requete.nextUrl.clone();
  cible.pathname = `/${langue}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(cible);
}

export const config = {
  // Tout sauf les fichiers internes de Next : le reste est trié plus haut.
  matcher: ['/((?!_next/static|_next/image).*)'],
};
