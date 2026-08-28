/** Transforme « Les tailleurs de l'été » en « les-tailleurs-de-l-ete ». */
export function slugifier(texte) {
  return String(texte ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // retire les accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Garantit l'unicité du slug face à une liste de slugs déjà pris. */
export function slugUnique(base, slugsPris) {
  const racine = slugifier(base) || 'article';
  if (!slugsPris.includes(racine)) return racine;
  let n = 2;
  while (slugsPris.includes(`${racine}-${n}`)) n += 1;
  return `${racine}-${n}`;
}
