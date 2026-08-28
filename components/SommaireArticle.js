'use client';

import { useEffect, useState } from 'react';
import { traducteur } from '@/lib/i18n';

/**
 * Sommaire ancré de l'article (colonne de gauche, collant au défilement).
 *
 * Les ancres sont posées par lib/markdown.js sur les titres de niveau 2 ;
 * ici on ne fait que suivre celui qui est à l'écran pour le souligner.
 * Les liens restent de simples <a href="#..."> : ils fonctionnent sans JS
 * et sont copiables pour partager un passage précis.
 */
export default function SommaireArticle({ sommaire, langue = 'fr' }) {
  const t = traducteur(langue);
  const [actif, setActif] = useState(sommaire[0]?.id ?? null);

  useEffect(() => {
    if (sommaire.length === 0) return undefined;

    const observateur = new IntersectionObserver(
      (entrees) => {
        const visible = entrees
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActif(visible.target.id);
      },
      // Bande haute de l'écran : le titre actif est celui qu'on vient de passer.
      { rootMargin: '-15% 0px -70% 0px', threshold: 0 },
    );

    sommaire.forEach(({ id }) => {
      const cible = document.getElementById(id);
      if (cible) observateur.observe(cible);
    });

    return () => observateur.disconnect();
  }, [sommaire]);

  if (sommaire.length < 2) return null;

  return (
    <nav aria-label={t('article.sommaire')} className="lg:sticky lg:top-32">
      <p className="surtitre text-gris">{t('article.sommaire')}</p>
      <ul className="mt-6 space-y-3.5 border-l border-filet">
        {sommaire.map(({ id, titre }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={actif === id ? 'true' : undefined}
              className={[
                '-ml-px block border-l pl-5 text-sm font-light leading-snug transition-colors duration-300',
                actif === id
                  ? 'border-accent text-encre'
                  : 'border-transparent text-gris hover:text-encre-douce',
              ].join(' ')}
            >
              {titre}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
