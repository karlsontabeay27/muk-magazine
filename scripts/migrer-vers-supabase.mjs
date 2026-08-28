/**
 * Transfère le contenu du mode démonstration vers Supabase.
 *
 *   npm run supabase:migrer
 *
 * Reprend les articles de data/articles.json et téléverse au passage les
 * photos de public/uploads/ vers le bucket « medias », en réécrivant les URL
 * dans les articles. Les visuels de démonstration (public/placeholders/) sont
 * laissés tels quels : ils sont livrés avec le projet et restent servis par
 * Next, donc rien à copier.
 *
 * Le script est refusé si la table contient déjà des articles : on ne veut pas
 * dupliquer le contenu d'un blog en cours.
 */
import { createClient } from '@supabase/supabase-js';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

async function chargerEnv() {
  for (const nom of ['.env.local', '.env']) {
    try {
      const contenu = await readFile(path.join(process.cwd(), nom), 'utf8');
      for (const ligne of contenu.split(/\r?\n/)) {
        const trouve = ligne.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (!trouve) continue;
        const [, cle, valeur] = trouve;
        if (process.env[cle] === undefined) {
          process.env[cle] = valeur.replace(/^["']|["']$/g, '');
        }
      }
    } catch {
      // fichier absent
    }
  }
}

const TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
};

await chargerEnv();

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !CLE) {
  console.error('Clés Supabase absentes de .env.local. Lancez d’abord npm run supabase:verifier.');
  process.exit(1);
}

const supabase = createClient(URL, CLE, { auth: { persistSession: false } });

// --- Garde-fou : la table doit être vide ---------------------------------
const { count, error: erreurCompte } = await supabase
  .from('contenus')
  .select('*', { count: 'exact', head: true });

if (erreurCompte) {
  console.error(`Lecture de la table impossible : ${erreurCompte.message}`);
  process.exit(1);
}
if (count > 0) {
  console.error(
    `La table contient déjà ${count} article(s). Migration annulée pour ne rien dupliquer.\n` +
      'Videz la table dans Supabase si vous voulez vraiment repartir de zéro.',
  );
  process.exit(1);
}

// --- Lecture du contenu local --------------------------------------------
let articles;
try {
  articles = JSON.parse(await readFile(path.join(process.cwd(), 'data', 'articles.json'), 'utf8'));
} catch {
  console.error('data/articles.json est introuvable — rien à migrer.');
  process.exit(1);
}

// --- Téléversement des photos locales ------------------------------------
const DOSSIER = path.join(process.cwd(), 'public', 'uploads');
const correspondances = new Map(); // /uploads/x.jpg -> URL publique Supabase

let fichiers = [];
try {
  fichiers = (await readdir(DOSSIER)).filter((f) => TYPES[path.extname(f).toLowerCase()]);
} catch {
  // dossier absent : aucune photo téléversée depuis l'admin
}

for (const nom of fichiers) {
  const extension = path.extname(nom).toLowerCase();
  const cible = `${new Date().getFullYear()}/${crypto.randomUUID()}${extension}`;
  const octets = await readFile(path.join(DOSSIER, nom));

  const { error } = await supabase.storage.from('medias').upload(cible, octets, {
    contentType: TYPES[extension],
    cacheControl: '31536000',
  });

  if (error) {
    console.error(`  ✗ ${nom} : ${error.message}`);
    continue;
  }

  const publique = supabase.storage.from('medias').getPublicUrl(cible).data.publicUrl;
  correspondances.set(`/uploads/${nom}`, publique);
  console.log(`  ✓ ${nom}`);
}

const reecrire = (url) => (url ? (correspondances.get(url) ?? url) : url);

// --- Insertion des articles ----------------------------------------------
const lignes = articles.map((a) => ({
  slug: a.slug,
  titre: a.titre,
  chapeau: a.chapeau,
  contenu: a.contenu,
  couverture: reecrire(a.couverture),
  galerie: (a.galerie ?? []).map(reecrire),
  humeur: a.humeur,
  categorie: a.categorie,
  statut: a.statut,
  ootd: a.ootd,
  ootd_pieces: a.ootdPieces ?? [],
  date_publication: a.datePublication,
  date_creation: a.dateCreation,
  date_maj: a.dateMaj,
}));

const { error: erreurInsertion } = await supabase.from('contenus').insert(lignes);
if (erreurInsertion) {
  console.error(`\nInsertion échouée : ${erreurInsertion.message}`);
  process.exit(1);
}

console.log(
  `\n${lignes.length} article(s) et ${correspondances.size} photo(s) transférés vers Supabase.\n` +
    'Relancez npm run dev : l’application lit désormais la base.\n',
);
