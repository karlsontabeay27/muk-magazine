'use client';

import BadgeHumeur from '@/components/BadgeHumeur';
import { HUMEURS } from '@/lib/moods';

/**
 * Sélecteur de bitmoji.
 *
 * « Aucun » vient en premier et c'est le défaut : sur un média culturel, le
 * bitmoji accompagne les contenus personnels — tenue du jour, tribune — pas
 * les reportages. Le proposer sans l'imposer était la demande du client.
 *
 * Chaque pastille est le composant BadgeHumeur lui-même : ce qu'on voit ici
 * est exactement ce qui s'affichera sur la carte.
 */
export default function ChoixHumeur({ valeur, onChange }) {
  const options = [{ id: null, label: 'Aucun bitmoji' }, ...HUMEURS];

  return (
    <fieldset>
      <legend className="surtitre text-gris">Bitmoji (facultatif)</legend>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {options.map((h) => {
          const actif = (h.id ?? null) === (valeur ?? null);
          return (
            <button
              key={h.id ?? 'aucun'}
              type="button"
              onClick={() => onChange(h.id ?? null)}
              title={h.description ?? 'Ne rien afficher'}
              aria-pressed={actif}
              className={[
                'rounded-full transition-transform duration-200 hover:scale-105',
                actif ? 'ring-2 ring-accent ring-offset-2 ring-offset-papier' : '',
              ].join(' ')}
            >
              {h.id ? (
                <BadgeHumeur humeur={h.id} taille="petit" decoratif />
              ) : (
                <span
                  aria-hidden="true"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-encre/25 text-xs text-gris"
                >
                  ∅
                </span>
              )}
              <span className="sr-only">{h.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
