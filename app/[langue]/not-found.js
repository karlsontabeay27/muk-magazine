import Link from 'next/link';
import { headers } from 'next/headers';
import { LogoMuk } from '@/components/Logo';
import { ENTETE_LANGUE, LANGUE_DEFAUT, traducteur } from '@/lib/i18n';

/**
 * Page introuvable, dans la langue consultée.
 *
 * `notFound()` ne transmet pas les paramètres de route : on relit donc la
 * langue dans l'en-tête posé par le middleware, comme le fait la mise en page
 * racine.
 */
export default async function Introuvable() {
  const entetes = await headers();
  const langue = entetes.get(ENTETE_LANGUE) ?? LANGUE_DEFAUT;
  const t = traducteur(langue);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-papier px-6 text-center">
      <LogoMuk className="h-8 w-auto" titre="MUK" />

      <p className="surtitre mt-12 text-accent">{t('erreur.code')}</p>
      <h1 className="massif mt-6 max-w-[16ch] text-[clamp(2.4rem,7vw,4.5rem)]">
        {t('erreur.titre')}{' '}
        <span className="romain lowercase tracking-normal">{t('erreur.titreItalique')}</span>
      </h1>
      <p className="mt-6 max-w-md text-encre-douce">{t('erreur.texte')}</p>

      <Link
        href={`/${langue}`}
        className="surtitre mt-10 border border-encre/25 px-8 py-4 transition-colors hover:bg-encre hover:text-papier"
      >
        {t('erreur.retour')}
      </Link>
    </main>
  );
}
