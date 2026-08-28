/**
 * Diagnostic de la connexion Supabase.
 *
 *   npm run supabase:verifier
 *
 * À lancer juste après avoir renseigné les clés : il dit exactement ce qui
 * manque plutôt que de laisser l'application échouer en pleine page.
 */
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

// Node ne lit pas .env.local tout seul : on le charge à la main pour que le
// script fonctionne hors du serveur Next.
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
      // fichier absent : on passe au suivant
    }
  }
}

const ok = (m) => console.log(`  ✓ ${m}`);
const ko = (m) => console.log(`  ✗ ${m}`);

await chargerEnv();

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\nVérification Supabase\n');

console.log('Variables d’environnement');
if (!URL || !CLE) {
  ko('NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être renseignées dans .env.local.');
  console.log('\n  L’application reste en mode démonstration (data/articles.json).\n');
  process.exit(1);
}
ok(`URL : ${URL}`);

// Supabase a deux générations de clés :
//   - l'ancienne, un JWT dont la charge utile porte le rôle (anon / service_role) ;
//   - la nouvelle (2025), préfixée sb_publishable_ ou sb_secret_.
// On accepte les deux, mais on refuse la clé publique : elle est bridée par les
// politiques RLS et l'application ne pourrait ni écrire ni lire les brouillons.
const AIDE_CLE =
  '    Project Settings → API Keys → clé « secret » (sb_secret_…),\n' +
  '    ou « service_role » si votre projet utilise encore les clés JWT.\n';

if (CLE.startsWith('sb_secret_')) {
  ok('Clé secrète reconnue (nouveau format)');
} else if (CLE.startsWith('sb_publishable_')) {
  ko('C’est la clé PUBLIQUE (sb_publishable_…), pas la clé secrète.');
  console.log(AIDE_CLE);
  process.exit(1);
} else if (CLE.split('.').length === 3) {
  try {
    const charge = JSON.parse(Buffer.from(CLE.split('.')[1], 'base64').toString());
    if (charge.role === 'service_role') {
      ok('Clé service_role reconnue (ancien format JWT)');
    } else {
      ko(`Cette clé a le rôle « ${charge.role} », pas « service_role ».`);
      console.log(AIDE_CLE);
      process.exit(1);
    }
  } catch {
    ko('Clé illisible : le JWT est mal formé.');
    console.log(AIDE_CLE);
    process.exit(1);
  }
} else {
  ko('Format de clé non reconnu.');
  console.log(AIDE_CLE);
  process.exit(1);
}

const supabase = createClient(URL, CLE, { auth: { persistSession: false } });

console.log('\nTable « contenus »');
const { count, error: erreurTable } = await supabase
  .from('contenus')
  .select('*', { count: 'exact', head: true });

if (erreurTable) {
  ko(erreurTable.message);
  console.log('    Avez-vous exécuté supabase/schema.sql dans le SQL Editor ?\n');
  process.exit(1);
}
ok(`Accessible — ${count} article(s) en base`);

console.log('\nStockage « medias »');
const { data: buckets, error: erreurBuckets } = await supabase.storage.listBuckets();
if (erreurBuckets) {
  ko(erreurBuckets.message);
  process.exit(1);
}
const bucket = buckets.find((b) => b.name === 'medias');
if (!bucket) {
  ko('Bucket « medias » introuvable — relancez supabase/schema.sql.');
  process.exit(1);
}
ok(`Présent, ${bucket.public ? 'public en lecture' : 'PRIVÉ (les photos ne s’afficheront pas)'}`);

console.log('\nTout est en place. Relancez npm run dev.\n');
