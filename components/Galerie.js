'use client';

import { useCallback, useEffect, useState } from 'react';
import { traducteur } from '@/lib/i18n';

/**
 * Galerie photo de l'article + visionneuse plein écran.
 *
 * Navigation au clavier (flèches, Échap) et fermeture au clic sur le fond :
 * une lectrice sur ordinateur n'a jamais besoin de viser un petit bouton.
 */
export default function Galerie({ images, titre, langue = 'fr' }) {
  const t = traducteur(langue);
  const [ouverte, setOuverte] = useState(null);

  const fermer = useCallback(() => setOuverte(null), []);
  const precedente = useCallback(
    () => setOuverte((i) => (i === null ? null : (i - 1 + images.length) % images.length)),
    [images.length],
  );
  const suivante = useCallback(
    () => setOuverte((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (ouverte === null) return undefined;

    const auClavier = (e) => {
      if (e.key === 'Escape') fermer();
      if (e.key === 'ArrowLeft') precedente();
      if (e.key === 'ArrowRight') suivante();
    };

    document.addEventListener('keydown', auClavier);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', auClavier);
      document.body.style.overflow = '';
    };
  }, [ouverte, fermer, precedente, suivante]);

  if (!images || images.length === 0) return null;

  return (
    <section id="galerie" className="scroll-mt-28">
      <p className="surtitre text-accent">{t('article.galerie')}</p>
      <div className="filet mt-5" />

      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        {images.map((src, index) => (
          <button
            key={src}
            type="button"
            onClick={() => setOuverte(index)}
            className="group relative aspect-[3/4] overflow-hidden bg-papier-casse"
            aria-label={t('galerie.agrandir', { n: index + 1, total: images.length })}
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-[1200ms] ease-muk group-hover:scale-105"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-encre/0 transition-colors duration-500 group-hover:bg-encre/15"
            />
          </button>
        ))}
      </div>

      {ouverte !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Photo ${ouverte + 1} sur ${images.length} — ${titre}`}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-encre/96 p-4 md:p-10"
          onClick={fermer}
        >
          <img
            src={images[ouverte]}
            alt=""
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            type="button"
            onClick={fermer}
            className="surtitre absolute right-5 top-5 p-3 text-papier/70 transition-colors hover:text-papier"
          >
            {t('galerie.fermer')}
          </button>

          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  precedente();
                }}
                className="absolute left-3 p-5 text-3xl text-papier/60 transition-colors hover:text-papier md:left-8"
                aria-label={t('galerie.precedente')}
              >
                ←
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  suivante();
                }}
                className="absolute right-3 p-5 text-3xl text-papier/60 transition-colors hover:text-papier md:right-8"
                aria-label={t('galerie.suivante')}
              >
                →
              </button>
              <p className="surtitre absolute bottom-6 left-1/2 -translate-x-1/2 text-papier/50">
                {ouverte + 1} / {images.length}
              </p>
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
