import { trouverLangue } from '@/lib/i18n';

/**
 * Le fuseau est fixé sur Paris et le formatage se fait côté serveur : sans ça,
 * un lecteur à Montréal verrait une date décalée d'un jour et React signalerait
 * une différence entre le rendu serveur et le rendu client.
 */
const MEMO = new Map();

function formateur(langue, options) {
  const cle = langue + JSON.stringify(options);
  if (!MEMO.has(cle)) {
    MEMO.set(
      cle,
      new Intl.DateTimeFormat(trouverLangue(langue).intl, {
        ...options,
        timeZone: 'Europe/Paris',
      }),
    );
  }
  return MEMO.get(cle);
}

export function formaterDate(valeur, langue = 'fr') {
  if (!valeur) return '';
  return formateur(langue, { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(valeur),
  );
}

export function formaterDateCourte(valeur, langue = 'fr') {
  if (!valeur) return '';
  return formateur(langue, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(valeur),
  );
}

/** Valeur pour <input type="date"> : AAAA-MM-JJ. */
export function pourChampDate(valeur) {
  const d = valeur ? new Date(valeur) : new Date();
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}
