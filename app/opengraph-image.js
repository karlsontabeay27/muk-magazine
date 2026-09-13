import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';

/**
 * Image de partage par défaut (Open Graph + Twitter, qui retombe sur og:image
 * en l'absence de twitter-image).
 *
 * Next ne l'utilise que là où la page ne fournit pas déjà la sienne — un
 * article avec couverture garde la sienne, l'accueil et les rubriques (qui
 * n'en déclarent pas) récupèrent celle-ci.
 *
 * `runtime: 'nodejs'` plutôt que le edge par défaut : il faut lire le SVG du
 * logo sur disque, et il est entièrement vectorisé (y compris le mot
 * « magazine ») donc aucune police à charger.
 */
export const runtime = 'nodejs';
export const alt = 'MUK — média culturel générationnel, bilingue';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const svg = (
    await readFile(path.join(process.cwd(), 'public/marque/muk-magazine.svg'), 'utf8')
  ).replace(/currentColor/g, '#f5f5f3');
  const logo = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0b',
        }}
      >
        <img src={logo} width={760} height={132} alt="" />
      </div>
    ),
    { ...size },
  );
}
