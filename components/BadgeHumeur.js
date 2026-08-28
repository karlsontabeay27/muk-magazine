'use client';

import { useCallback, useState } from 'react';
import { trouverHumeur } from '@/lib/moods';

const TAILLES = {
  petit: 'h-11 w-11 text-2xl',
  moyen: 'h-[4.25rem] w-[4.25rem] text-[2rem]',
  grand: 'h-24 w-24 text-5xl',
  signature: 'h-28 w-28 text-6xl md:h-40 md:w-40 md:text-7xl',
};

/**
 * Pastille bitmoji.
 *
 * Facultative par contenu : sans humeur choisie, le composant ne rend rien du
 * tout. Sur un média culturel le badge accompagne les contenus personnels —
 * tenue du jour, tribune — pas les reportages.
 *
 * Si le fichier manque, on bascule sur l'emoji de repli plutôt que d'afficher
 * une image cassée. L'erreur de chargement pouvant survenir avant
 * l'hydratation, on vérifie aussi l'état réel de la balise au montage.
 */
export default function BadgeHumeur({ humeur, taille = 'moyen', className = '', decoratif = false }) {
  const h = trouverHumeur(humeur);
  const [imageKo, setImageKo] = useState(false);

  const auMontage = useCallback((noeud) => {
    if (noeud && noeud.complete && noeud.naturalWidth === 0) setImageKo(true);
  }, []);

  if (!h) return null;

  const afficheImage = Boolean(h.image) && !imageKo;

  return (
    <span
      className={[
        TAILLES[taille] ?? TAILLES.moyen,
        'inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full',
        'bg-papier ring-1 ring-encre/15',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      title={h.label}
      {...(decoratif
        ? { 'aria-hidden': 'true' }
        : { role: 'img', 'aria-label': `Humeur : ${h.label}` })}
    >
      {afficheImage ? (
        <img
          ref={auMontage}
          src={h.image}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
          style={{ transform: `scale(${h.zoom ?? 1}) translateY(${h.decalage ?? '0%'})` }}
          onError={() => setImageKo(true)}
        />
      ) : (
        <span aria-hidden="true" className="leading-none">
          {h.emoji}
        </span>
      )}
    </span>
  );
}
