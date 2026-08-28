'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Logo from '@/components/Logo';
import SelecteurLangue from '@/components/SelecteurLangue';
import { traducteur } from '@/lib/i18n';

/**
 * Bandeau de navigation.
 *
 * Toujours opaque, jamais transparent sur l'image : sur un média on doit
 * pouvoir passer d'une rubrique à l'autre sans chercher le menu. Un filet
 * apparaît au défilement pour détacher le bandeau du contenu.
 *
 * Le descripteur du logo suit la rubrique consultée — c'est la mécanique de
 * marque arrêtée avec le client, pas une décoration.
 */
export default function Entete({ langue, rubriques = [], descripteur = 'magazine', liensLangue }) {
  const chemin = usePathname();
  const t = traducteur(langue);
  const [defile, setDefile] = useState(false);
  const [menuOuvert, setMenuOuvert] = useState(false);

  useEffect(() => {
    const auScroll = () => setDefile(window.scrollY > 8);
    auScroll();
    window.addEventListener('scroll', auScroll, { passive: true });
    return () => window.removeEventListener('scroll', auScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOuvert ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOuvert]);

  // Fermer le menu quand la navigation aboutit.
  useEffect(() => setMenuOuvert(false), [chemin]);

  const lien = (suite = '') => `/${langue}${suite}`;

  return (
    <header
      className={[
        'sticky top-0 z-50 bg-papier transition-shadow duration-300',
        defile || menuOuvert ? 'shadow-[0_1px_0_0_var(--color-filet)]' : '',
      ].join(' ')}
    >
      <div className="contenu flex items-center justify-between gap-6 py-4">
        <Link href={lien()} aria-label="MUK" className="shrink-0">
          <Logo descripteur={descripteur} />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label={t('nav.rubriques')}>
          {rubriques.map((r) => {
            const href = lien(`/${r.id}`);
            const actif = chemin === href;
            return (
              <Link
                key={r.id}
                href={href}
                aria-current={actif ? 'page' : undefined}
                className={[
                  'surtitre border-b-2 py-1 transition-colors',
                  actif
                    ? 'border-accent text-encre'
                    : 'border-transparent text-gris hover:border-encre hover:text-encre',
                ].join(' ')}
              >
                {langue === 'en' ? r.nomEn : r.nom}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <SelecteurLangue langue={langue} liens={liensLangue} />

          <Link
            href={lien('#newsletter')}
            className="surtitre hidden bg-encre px-5 py-3 text-papier transition-colors hover:bg-accent sm:block"
          >
            {t('nav.newsletter')}
          </Link>

          <button
            type="button"
            className="flex flex-col items-end gap-[5px] p-2 lg:hidden"
            onClick={() => setMenuOuvert((o) => !o)}
            aria-expanded={menuOuvert}
            aria-label={menuOuvert ? t('nav.fermerMenu') : t('nav.ouvrirMenu')}
          >
            <span
              className={`block h-[2px] bg-encre transition-all duration-300 ${menuOuvert ? 'w-6 translate-y-[7px] rotate-45' : 'w-6'}`}
            />
            <span
              className={`block h-[2px] bg-encre transition-all duration-300 ${menuOuvert ? 'w-6 -translate-y-[7px] -rotate-45' : 'w-4'}`}
            />
          </button>
        </div>
      </div>

      {/* Panneau mobile : les rubriques en très grand, comme un sommaire. */}
      <div
        className={[
          'overflow-hidden border-t border-filet transition-[max-height,opacity] duration-400 lg:hidden',
          menuOuvert ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0',
        ].join(' ')}
      >
        <nav className="contenu flex flex-col py-4" aria-label={t('nav.rubriques')}>
          {rubriques.map((r) => (
            <Link
              key={r.id}
              href={lien(`/${r.id}`)}
              className="titre flex items-baseline justify-between gap-4 border-b border-filet py-4 text-3xl last:border-0"
            >
              {langue === 'en' ? r.nomEn : r.nom}
              <span className="romain shrink-0 text-base text-gris">
                {(langue === 'en' ? r.resumeEn : r.resume).split(',')[0]}
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
