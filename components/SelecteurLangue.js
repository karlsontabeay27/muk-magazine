'use client';

import Link from 'next/link';
import { LANGUES } from '@/lib/i18n';

/**
 * Bascule entre les langues.
 *
 * `liens` associe chaque code de langue à l'URL correspondante. Sur une page
 * d'article, cette URL est celle de la traduction si elle existe ; sinon on
 * renvoie vers l'accueil de l'autre langue plutôt que vers une page
 * inexistante. C'est la page appelante qui décide, parce qu'elle seule sait
 * si la traduction a été publiée.
 *
 * Une langue sans destination est affichée mais désactivée : le lecteur voit
 * que l'autre version existe en principe, sans tomber sur une 404.
 */
export default function SelecteurLangue({ langue, liens, className = '' }) {
  return (
    <div
      className={`flex items-center gap-1 ${className}`}
      role="group"
      aria-label="Langue"
    >
      {LANGUES.map((l, index) => {
        const actif = l.code === langue;
        const href = liens?.[l.code];

        const classes = [
          'surtitre px-2 py-1 transition-colors',
          actif ? 'text-encre' : 'text-gris hover:text-encre',
        ].join(' ');

        return (
          <span key={l.code} className="flex items-center">
            {index > 0 ? (
              <span aria-hidden="true" className="text-gris-faible">
                /
              </span>
            ) : null}

            {actif || !href ? (
              <span
                className={`${classes} ${!actif && !href ? 'cursor-not-allowed opacity-40' : ''}`}
                aria-current={actif ? 'true' : undefined}
                title={actif ? undefined : `${l.nom} — pas encore disponible ici`}
              >
                {l.court}
              </span>
            ) : (
              <Link href={href} hrefLang={l.htmlLang} className={classes} title={l.nom}>
                {l.court}
              </Link>
            )}
          </span>
        );
      })}
    </div>
  );
}
