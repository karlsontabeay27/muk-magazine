import { headers } from 'next/headers';
import '@/app/globals.css';
import { SITE_URL } from '@/lib/site';
import { ENTETE_LANGUE, LANGUE_DEFAUT, traducteur, trouverLangue } from '@/lib/i18n';

export const viewport = {
  // Le bandeau du navigateur suit le thème du système, comme la page.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0b0d' },
  ],
  width: 'device-width',
  initialScale: 1,
};

/**
 * Mise en page racine.
 *
 * C'est elle qui rend <html lang>, mais elle est au-dessus du segment de
 * langue et n'en voit donc pas les paramètres de route. Le middleware lui
 * transmet la langue par un en-tête ; hors des pages publiques — le
 * back-office, par exemple — on retombe sur le français.
 */
export default async function RootLayout({ children }) {
  const entetes = await headers();
  const code = entetes.get(ENTETE_LANGUE) ?? LANGUE_DEFAUT;
  const langue = trouverLangue(code);

  return (
    <html lang={langue.htmlLang}>
      <head>
        {/* Les fontes sont auto-hébergées (voir app/fontes.css) : aucune
            requête vers Google, donc aucune adresse IP de lecteur transmise à
            un tiers. On précharge les deux fontes du premier écran pour
            éviter que les titres n'apparaissent en police de repli. */}
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fontes/ArchivoBlack-400-normal-latin.woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          as="font"
          type="font/woff2"
          href="/fontes/Archivo-400-normal-latin.woff2"
          crossOrigin="anonymous"
        />
      </head>
      {/* suppressHydrationWarning : certaines extensions de navigateur —
          Grammarly en tête — ajoutent leurs propres attributs sur <body> avant
          que React n'hydrate la page, ce qui déclenche une erreur d'hydratation
          sur la machine du développeur alors que le code est correct.

          La consigne ne porte que sur les attributs de CE nœud, jamais sur ses
          enfants : une vraie divergence dans l'arbre continue d'être signalée. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

/** Titre et description par défaut, dans la langue de la requête. */
export async function generateMetadata() {
  const entetes = await headers();
  const code = entetes.get(ENTETE_LANGUE) ?? LANGUE_DEFAUT;
  const t = traducteur(code);

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t('meta.titre'), template: '%s — MUK' },
    description: t('meta.description'),
    openGraph: {
      type: 'website',
      locale: code === 'en' ? 'en_GB' : 'fr_FR',
      siteName: 'MUK',
      title: t('meta.titre'),
      description: t('meta.description'),
    },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true },
  };
}
