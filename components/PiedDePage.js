import Link from 'next/link';
import { LogoMuk } from '@/components/Logo';
import { RUBRIQUES, nomRubrique } from '@/lib/rubriques';
import { traducteur } from '@/lib/i18n';

export default function PiedDePage({ langue, rubriques = RUBRIQUES }) {
  const t = traducteur(langue);
  const lien = (suite = '') => `/${langue}${suite}`;

  return (
    <footer className="border-t border-filet bg-papier">
      <div className="contenu py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-5">
            <LogoMuk className="h-10 w-auto" titre="MUK" />
            <p className="romain mt-6 max-w-sm text-xl leading-snug text-encre-douce">
              {t('pied.phrase')}
            </p>
          </div>

          <nav className="md:col-span-3" aria-label={t('pied.rubriques')}>
            <p className="surtitre text-gris">{t('pied.rubriques')}</p>
            <ul className="mt-6 space-y-3">
              {rubriques.map((r) => (
                <li key={r.id}>
                  <Link
                    href={lien(`/${r.id}`)}
                    className="text-encre-douce transition-colors hover:text-accent"
                  >
                    {nomRubrique(r, langue)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="md:col-span-2" aria-label={t('pied.leMedia')}>
            <p className="surtitre text-gris">{t('pied.leMedia')}</p>
            <ul className="mt-6 space-y-3">
              <li>
                <Link
                  href={lien('#newsletter')}
                  className="text-encre-douce transition-colors hover:text-accent"
                >
                  {t('nav.newsletter')}
                </Link>
              </li>
              <li>
                <Link
                  href={lien('/mentions-legales')}
                  className="text-encre-douce transition-colors hover:text-accent"
                >
                  {t('pied.mentions')}
                </Link>
              </li>
              <li>
                <Link
                  href={lien('/confidentialite')}
                  className="text-encre-douce transition-colors hover:text-accent"
                >
                  {t('pied.confidentialite')}
                </Link>
              </li>
            </ul>
          </nav>

          <nav className="md:col-span-2" aria-label={t('pied.suivre')}>
            <p className="surtitre text-gris">{t('pied.suivre')}</p>
            <ul className="mt-6 space-y-3">
              {/* À remplacer par les vrais comptes MUK. */}
              {['Instagram', 'TikTok', 'Spotify'].map((r) => (
                <li key={r}>
                  <span className="text-gris-faible">{r}</span>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-filet pt-8 text-xs text-gris md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} MUK. {t('pied.droits')}
          </p>
          {/* Le back-office n'est pas traduit : c'est l'outil de la rédaction,
              pas une page publique. Il reste donc hors du segment de langue. */}
          <Link href="/admin" className="surtitre transition-colors hover:text-accent">
            {t('pied.redaction')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
