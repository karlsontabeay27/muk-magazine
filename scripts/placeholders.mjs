/**
 * Génère les visuels de remplacement de la démo (SVG, donc quelques Ko chacun).
 *
 * Ce sont des compositions abstraites dans la palette du site : elles tiennent
 * la maquette tant que Marilyse n'a pas envoyé ses photos, sans donner
 * l'illusion d'un vrai shooting. À supprimer une fois le vrai contenu en place.
 *
 *   node scripts/placeholders.mjs
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';

const SORTIE = path.join(process.cwd(), 'public', 'placeholders');

const PALETTES = [
  ['#e9d9d3', '#b99668', '#14110f'],
  ['#f2ece5', '#8a8078', '#0b0a09'],
  ['#e4d3ba', '#b99668', '#4a423b'],
  ['#dfe3e0', '#8a9a92', '#14110f'],
  ['#f0e2dd', '#c9a227', '#241d18'],
  ['#e6e2dc', '#a08a72', '#101010'],
];

/** Trame fine : évite l'aspect « aplat de couleur » des dégradés SVG. */
const GRAIN = `
  <filter id="grain">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" result="bruit" />
    <feColorMatrix in="bruit" type="saturate" values="0" />
    <feComponentTransfer><feFuncA type="linear" slope="0.055" /></feComponentTransfer>
  </filter>`;

function composition(index, largeur, hauteur) {
  const [clair, accent, sombre] = PALETTES[index % PALETTES.length];
  const variante = index % 3;

  const formes =
    variante === 0
      ? // Colonne verticale décentrée + arc : silhouette de mannequin stylisée
        `<rect x="${largeur * 0.34}" y="0" width="${largeur * 0.32}" height="${hauteur}" fill="${accent}" opacity="0.55" />
         <circle cx="${largeur * 0.5}" cy="${hauteur * 0.34}" r="${largeur * 0.17}" fill="${sombre}" opacity="0.82" />
         <rect x="${largeur * 0.42}" y="${hauteur * 0.46}" width="${largeur * 0.16}" height="${hauteur * 0.46}" fill="${sombre}" opacity="0.82" />`
      : variante === 1
        ? // Bandes horizontales : color blocking éditorial
          `<rect x="0" y="${hauteur * 0.18}" width="${largeur}" height="${hauteur * 0.24}" fill="${accent}" opacity="0.7" />
           <rect x="0" y="${hauteur * 0.62}" width="${largeur}" height="${hauteur * 0.08}" fill="${sombre}" opacity="0.85" />
           <circle cx="${largeur * 0.72}" cy="${hauteur * 0.52}" r="${largeur * 0.2}" fill="${sombre}" opacity="0.16" />`
        : // Arche : la citation visuelle des shootings « couloir »
          `<path d="M ${largeur * 0.22} ${hauteur} L ${largeur * 0.22} ${hauteur * 0.42}
                    A ${largeur * 0.28} ${largeur * 0.28} 0 0 1 ${largeur * 0.78} ${hauteur * 0.42}
                    L ${largeur * 0.78} ${hauteur} Z" fill="${sombre}" opacity="0.86" />
           <circle cx="${largeur * 0.5}" cy="${hauteur * 0.44}" r="${largeur * 0.13}" fill="${accent}" opacity="0.9" />`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${largeur} ${hauteur}" width="${largeur}" height="${hauteur}" role="img" aria-label="Visuel éditorial de démonstration">
  <defs>
    <linearGradient id="fond" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0%" stop-color="${clair}" />
      <stop offset="100%" stop-color="${clair}" stop-opacity="0.72" />
    </linearGradient>${GRAIN}
  </defs>
  <rect width="${largeur}" height="${hauteur}" fill="url(#fond)" />
  ${formes}
  <rect width="${largeur}" height="${hauteur}" filter="url(#grain)" opacity="0.9" />
</svg>`;
}

await fs.mkdir(SORTIE, { recursive: true });

// 9 visuels portrait pour la grille + 3 paysages pour les grands formats.
const fichiers = [];
for (let i = 0; i < 9; i += 1) {
  const nom = `editorial-${i + 1}.svg`;
  await fs.writeFile(path.join(SORTIE, nom), composition(i, 900, 1200), 'utf8');
  fichiers.push(nom);
}
for (let i = 0; i < 3; i += 1) {
  const nom = `large-${i + 1}.svg`;
  await fs.writeFile(path.join(SORTIE, nom), composition(i + 2, 1600, 900), 'utf8');
  fichiers.push(nom);
}

console.log(`${fichiers.length} visuels écrits dans public/placeholders/`);
