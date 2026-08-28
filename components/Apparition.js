'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Fait apparaître son contenu quand il entre dans le viewport.
 *
 * Le contenu est rendu dès le serveur : sans JavaScript, ou si l'utilisateur
 * a demandé moins d'animations, il reste simplement visible (voir la règle
 * prefers-reduced-motion dans globals.css).
 */
export default function Apparition({ children, delai = 0, className = '', as: Balise = 'div' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const observateur = new IntersectionObserver(
      ([entree]) => {
        if (!entree.isIntersecting) return;
        setVisible(true);
        observateur.disconnect(); // une seule fois : pas de clignotement au retour
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    observateur.observe(element);
    return () => observateur.disconnect();
  }, []);

  return (
    <Balise
      ref={ref}
      className={`apparition ${className}`}
      data-visible={visible ? 'true' : 'false'}
      style={delai ? { transitionDelay: `${delai}ms` } : undefined}
    >
      {children}
    </Balise>
  );
}
