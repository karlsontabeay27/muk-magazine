import { listerArticles } from '@/lib/db';
import { rubriquesVivantes } from '@/lib/rubriques';
import { CODES } from '@/lib/i18n';
import { SITE_URL as SITE } from '@/lib/site';

// Sans ça, Next fige le plan du site au moment du build : un contenu publié
// après le déploiement n'y apparaîtrait jamais.
export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const entrees = [];

  for (const langue of CODES) {
    const contenus = await listerArticles({ langue });

    entrees.push({
      url: `${SITE}/${langue}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    });

    // Seules les rubriques nourries dans cette langue : les autres renvoient
    // 404, les déclarer ici enverrait Google dans le mur.
    for (const r of rubriquesVivantes(contenus)) {
      entrees.push({
        url: `${SITE}/${langue}/${r.id}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      });
    }

    for (const c of contenus) {
      entrees.push({
        url: `${SITE}/${langue}/article/${c.slug}`,
        lastModified: new Date(c.dateMaj ?? c.datePublication),
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }

    for (const page of ['mentions-legales', 'confidentialite']) {
      entrees.push({
        url: `${SITE}/${langue}/${page}`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.2,
      });
    }
  }

  return entrees;
}
