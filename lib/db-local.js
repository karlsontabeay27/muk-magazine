/**
 * Adaptateur « démonstration » : les contenus vivent dans data/articles.json
 * et les photos dans /public/uploads. Zéro dépendance, zéro compte à créer.
 *
 * Ce n'est pas fait pour la production (pas de transactions, écritures
 * sérialisées à la main) : en prod c'est db-supabase qui répond.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { normaliser } from '@/lib/article';
import { slugUnique } from '@/lib/slug';

const FICHIER = path.join(process.cwd(), 'data', 'articles.json');
const DOSSIER_UPLOADS = path.join(process.cwd(), 'public', 'uploads');

// Les écritures se suivent à la queue leu leu : deux requêtes simultanées ne
// peuvent pas se marcher dessus sur le même fichier.
let file = Promise.resolve();
function enFile(travail) {
  const suivant = file.then(travail, travail);
  file = suivant.then(
    () => undefined,
    () => undefined,
  );
  return suivant;
}

async function lireTout() {
  try {
    return JSON.parse(await fs.readFile(FICHIER, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}

async function ecrireTout(contenus) {
  try {
    await fs.mkdir(path.dirname(FICHIER), { recursive: true });
    await fs.writeFile(FICHIER, `${JSON.stringify(contenus, null, 2)}\n`, 'utf8');
  } catch (e) {
    // EROFS sur Vercel signifie une seule chose : ce mode démo n'a rien à
    // faire là, Supabase n'a pas été détecté comme configuré (voir
    // lib/db.js). Un message clair ici plutôt qu'une trace Node.js opaque —
    // c'est cette confusion qui a rendu la panne du 12 septembre 2026 si
    // longue à diagnostiquer.
    if (e.code === 'EROFS') {
      throw new Error(
        'Écriture impossible : ce serveur tourne en lecture seule (Vercel), mais ' +
          'Supabase n’a pas été détecté comme configuré — l’application est donc ' +
          'restée en mode démonstration. Vérifiez NEXT_PUBLIC_SUPABASE_URL et ' +
          'SUPABASE_SERVICE_ROLE_KEY sur Vercel, puis redéployez.',
      );
    }
    throw e;
  }
}

const trierParDate = (contenus) =>
  [...contenus].sort((a, b) => new Date(b.datePublication) - new Date(a.datePublication));

/**
 * Les slugs ne sont uniques qu'à l'intérieur d'une langue : « paris-la-nuit »
 * peut coexister en français et en anglais, ce sont deux URL distinctes.
 */
const slugsDeLaLangue = (contenus, langue, saufId = null) =>
  contenus.filter((c) => c.langue === langue && c.id !== saufId).map((c) => c.slug);

export async function listerArticles({ inclureBrouillons = false, langue = null } = {}) {
  let contenus = trierParDate(await lireTout());
  if (!inclureBrouillons) contenus = contenus.filter((c) => c.statut === 'publie');
  if (langue) contenus = contenus.filter((c) => c.langue === langue);
  return contenus;
}

export async function lireArticleParSlug(slug, langue = null) {
  const contenus = await lireTout();
  return (
    contenus.find((c) => c.slug === slug && (!langue || c.langue === langue)) ?? null
  );
}

export async function lireArticle(id) {
  return (await lireTout()).find((c) => c.id === id) ?? null;
}

/** Les autres langues d'un même contenu, pour le sélecteur de langue. */
export async function lireTraductions(groupeId, saufId = null) {
  if (!groupeId) return [];
  const contenus = await lireTout();
  return contenus.filter((c) => c.groupeId === groupeId && c.id !== saufId);
}

export async function creerArticle(donnees) {
  return enFile(async () => {
    const contenus = await lireTout();
    const maintenant = new Date().toISOString();
    const { groupeId, ...champs } = normaliser(donnees);

    const contenu = {
      id: crypto.randomUUID(),
      // Un contenu sans groupe fonde le sien : ses futures traductions le
      // rejoindront en reprenant cet identifiant.
      groupeId: groupeId ?? crypto.randomUUID(),
      slug: slugUnique(champs.titre, slugsDeLaLangue(contenus, champs.langue)),
      ...champs,
      dateCreation: maintenant,
      dateMaj: maintenant,
    };

    await ecrireTout([contenu, ...contenus]);
    return contenu;
  });
}

export async function majArticle(id, donnees) {
  return enFile(async () => {
    const contenus = await lireTout();
    const index = contenus.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const ancien = contenus[index];
    const champs = normaliser({ ...ancien, ...donnees });

    // Le slug ne bouge qu'en cas de renommage : les liens déjà partagés
    // survivent. Il change aussi si le contenu change de langue.
    const slug =
      champs.titre !== ancien.titre || champs.langue !== ancien.langue
        ? slugUnique(champs.titre, slugsDeLaLangue(contenus, champs.langue, id))
        : ancien.slug;

    const contenu = {
      ...ancien,
      ...champs,
      groupeId: champs.groupeId ?? ancien.groupeId,
      slug,
      dateMaj: new Date().toISOString(),
    };
    contenus[index] = contenu;
    await ecrireTout(contenus);
    return contenu;
  });
}

export async function supprimerArticle(id) {
  return enFile(async () => {
    const contenus = await lireTout();
    const restants = contenus.filter((c) => c.id !== id);
    if (restants.length === contenus.length) return false;
    await ecrireTout(restants);
    return true;
  });
}

export async function televerserImage(fichier) {
  try {
    await fs.mkdir(DOSSIER_UPLOADS, { recursive: true });
    const extension = (path.extname(fichier.name) || '.jpg').toLowerCase();
    const nom = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}${extension}`;
    const octets = Buffer.from(await fichier.arrayBuffer());
    await fs.writeFile(path.join(DOSSIER_UPLOADS, nom), octets);
    return `/uploads/${nom}`;
  } catch (e) {
    // Même repère qu'ecrireTout ci-dessus : voir ce commentaire pour le contexte.
    if (e.code === 'EROFS') {
      throw new Error(
        'Téléversement impossible : ce serveur tourne en lecture seule (Vercel), mais ' +
          'Supabase n’a pas été détecté comme configuré — l’application est donc ' +
          'restée en mode démonstration. Vérifiez NEXT_PUBLIC_SUPABASE_URL et ' +
          'SUPABASE_SERVICE_ROLE_KEY sur Vercel, puis redéployez.',
      );
    }
    throw e;
  }
}

export async function supprimerImage(url) {
  // On ne touche qu'à ce qu'on a écrit soi-même : les visuels livrés avec le
  // projet et les URL externes restent en place.
  if (!url?.startsWith('/uploads/')) return false;
  try {
    await fs.unlink(path.join(DOSSIER_UPLOADS, path.basename(url)));
    return true;
  } catch {
    return false;
  }
}
