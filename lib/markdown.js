import { slugifier } from '@/lib/slug';

/**
 * Mini-rendu éditorial : Marilyse écrit en texte simple dans l'admin, on
 * accepte un sous-ensemble de Markdown volontairement réduit (titres, citation,
 * gras, italique, liens, séparateur). Tout est échappé avant reconstruction :
 * aucun HTML saisi dans l'admin n'est exécuté.
 */
function echapper(texte) {
  return texte
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function enligne(texte) {
  return echapper(texte)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(
      /\[([^\]]+)\]\(([^)\s]+)\)/g,
      (_, libelle, url) =>
        // On n'autorise que http(s) et les ancres internes : pas de javascript:
        /^(https?:\/\/|\/|#)/i.test(url)
          ? `<a href="${url}">${libelle}</a>`
          : libelle,
    );
}

/**
 * @returns {{ html: string, sommaire: {id: string, titre: string}[] }}
 * Le sommaire alimente la navigation ancrée de la page article.
 */
export function rendreArticle(contenu) {
  const lignes = String(contenu ?? '').split(/\r?\n/);
  const sommaire = [];
  const sortie = [];
  let paragraphe = [];

  const viderParagraphe = () => {
    if (paragraphe.length === 0) return;
    sortie.push(`<p>${enligne(paragraphe.join(' '))}</p>`);
    paragraphe = [];
  };

  for (const ligne of lignes) {
    const l = ligne.trim();

    if (l === '') {
      viderParagraphe();
      continue;
    }
    if (l === '---') {
      viderParagraphe();
      sortie.push('<hr />');
      continue;
    }

    const titre2 = l.match(/^##\s+(.*)$/);
    if (titre2) {
      viderParagraphe();
      const titre = titre2[1].trim();
      const id = slugifier(titre);
      sommaire.push({ id, titre });
      sortie.push(`<h2 id="${id}">${enligne(titre)}</h2>`);
      continue;
    }

    const titre3 = l.match(/^###\s+(.*)$/);
    if (titre3) {
      viderParagraphe();
      sortie.push(`<h3>${enligne(titre3[1].trim())}</h3>`);
      continue;
    }

    const citation = l.match(/^>\s?(.*)$/);
    if (citation) {
      viderParagraphe();
      sortie.push(`<blockquote>${enligne(citation[1].trim())}</blockquote>`);
      continue;
    }

    paragraphe.push(l);
  }
  viderParagraphe();

  return { html: sortie.join('\n'), sommaire };
}

/** Durée de lecture affichée sous le chapeau (≈ 200 mots/minute). */
export function tempsDeLecture(contenu) {
  const mots = String(contenu ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(mots / 200));
}
