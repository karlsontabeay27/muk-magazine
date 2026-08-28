/**
 * Adaptateur de production : Postgres + Storage chez Supabase.
 *
 * On passe par la clé « service role », donc côté serveur uniquement (routes
 * d'API et composants serveur). Elle contourne les politiques RLS : elle ne
 * doit jamais fuiter vers le navigateur — d'où l'absence de préfixe
 * NEXT_PUBLIC_ sur SUPABASE_SERVICE_ROLE_KEY.
 *
 * Le schéma correspondant est dans supabase/schema.sql.
 */
import { createClient } from '@supabase/supabase-js';
import { normaliser } from '@/lib/article';
import { slugUnique } from '@/lib/slug';

const TABLE = 'contenus';
const BUCKET = 'medias';

let clientMemo = null;
function client() {
  if (!clientMemo) {
    clientMemo = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } },
    );
  }
  return clientMemo;
}

// Postgres est en snake_case, le reste de l'app en camelCase français.
function versApp(ligne) {
  if (!ligne) return null;
  return {
    id: ligne.id,
    langue: ligne.langue,
    groupeId: ligne.groupe_id,
    slug: ligne.slug,
    titre: ligne.titre,
    chapeau: ligne.chapeau,
    contenu: ligne.contenu,
    couverture: ligne.couverture,
    galerie: ligne.galerie ?? [],
    humeur: ligne.humeur,
    rubrique: ligne.rubrique,
    format: ligne.format,
    auteur: ligne.auteur,
    statut: ligne.statut,
    aLaUne: ligne.a_la_une,
    piecesTenue: ligne.pieces_tenue ?? [],
    datePublication: ligne.date_publication,
    dateCreation: ligne.date_creation,
    dateMaj: ligne.date_maj,
  };
}

function versBase(article) {
  return {
    langue: article.langue,
    titre: article.titre,
    chapeau: article.chapeau,
    contenu: article.contenu,
    couverture: article.couverture,
    galerie: article.galerie,
    humeur: article.humeur,
    rubrique: article.rubrique,
    format: article.format,
    auteur: article.auteur,
    statut: article.statut,
    a_la_une: article.aLaUne,
    pieces_tenue: article.piecesTenue,
    date_publication: article.datePublication,
  };
}

function verifier({ data, error }) {
  if (error) throw new Error(`Supabase : ${error.message}`);
  return data;
}

export async function listerArticles({ inclureBrouillons = false, langue = null } = {}) {
  let requete = client().from(TABLE).select('*').order('date_publication', { ascending: false });
  if (!inclureBrouillons) requete = requete.eq('statut', 'publie');
  if (langue) requete = requete.eq('langue', langue);
  return verifier(await requete).map(versApp);
}

export async function lireArticleParSlug(slug, langue = null) {
  let requete = client().from(TABLE).select('*').eq('slug', slug);
  if (langue) requete = requete.eq('langue', langue);
  return versApp(verifier(await requete.maybeSingle()));
}

/** Les autres langues d'un même contenu, pour le sélecteur de langue. */
export async function lireTraductions(groupeId, saufId = null) {
  if (!groupeId) return [];
  let requete = client().from(TABLE).select('*').eq('groupe_id', groupeId);
  if (saufId) requete = requete.neq('id', saufId);
  return verifier(await requete).map(versApp);
}

export async function lireArticle(id) {
  return versApp(
    verifier(await client().from(TABLE).select('*').eq('id', id).maybeSingle()),
  );
}

/** Slugs déjà pris **dans la même langue** : deux langues peuvent partager
    un slug, ce sont deux URL distinctes. */
async function slugsPris(langue, sauf) {
  let requete = client().from(TABLE).select('slug').eq('langue', langue);
  if (sauf) requete = requete.neq('id', sauf);
  return verifier(await requete).map((l) => l.slug);
}

export async function creerArticle(donnees) {
  const article = normaliser(donnees);
  const slug = slugUnique(article.titre, await slugsPris(article.langue));
  return versApp(
    verifier(
      await client()
        .from(TABLE)
        .insert({
          ...versBase(article),
          slug,
          // Un contenu sans groupe fonde le sien ; une traduction reprend
          // celui de son original.
          groupe_id: article.groupeId ?? crypto.randomUUID(),
        })
        .select()
        .single(),
    ),
  );
}

export async function majArticle(id, donnees) {
  const ancien = await lireArticle(id);
  if (!ancien) return null;

  const article = normaliser({ ...ancien, ...donnees });
  const slug =
    article.titre !== ancien.titre || article.langue !== ancien.langue
      ? slugUnique(article.titre, await slugsPris(article.langue, id))
      : ancien.slug;

  return versApp(
    verifier(
      await client()
        .from(TABLE)
        .update({ ...versBase(article), slug, date_maj: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single(),
    ),
  );
}

export async function supprimerArticle(id) {
  verifier(await client().from(TABLE).delete().eq('id', id));
  return true;
}

// L'extension est déduite du type MIME, déjà contrôlé par la route d'upload.
// Se fier au nom du fichier serait fragile : « photo » sans point donnerait
// « photo » comme extension, et un nom fourni par le navigateur n'est pas une
// source de vérité.
const EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
};

export async function televerserImage(fichier) {
  const extension = EXTENSIONS[fichier.type] ?? 'jpg';
  const chemin = `${new Date().getFullYear()}/${crypto.randomUUID()}.${extension}`;
  verifier(
    await client()
      .storage.from(BUCKET)
      .upload(chemin, fichier, {
        contentType: fichier.type || 'image/jpeg',
        cacheControl: '31536000',
      }),
  );
  return client().storage.from(BUCKET).getPublicUrl(chemin).data.publicUrl;
}

export async function supprimerImage(url) {
  const marqueur = `/${BUCKET}/`;
  const position = url.indexOf(marqueur);
  if (position === -1) return false;
  const chemin = url.slice(position + marqueur.length).split('?')[0];
  verifier(await client().storage.from(BUCKET).remove([chemin]));
  return true;
}
