/**
 * Authentification de l'admin — volontairement minimale : un seul compte,
 * celui de la rédaction. Le mot de passe vit dans la variable d'environnement
 * ADMIN_PASSWORD, jamais dans le code ni en base.
 *
 * La session est un cookie httpOnly signé en HMAC-SHA256 (Web Crypto, donc
 * compatible avec le middleware qui tourne sur l'edge runtime de Vercel).
 */
const NOM_COOKIE = 'muk_session';
const DUREE_SECONDES = 60 * 60 * 12; // 12 h

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) {
    throw new Error(
      'SESSION_SECRET manquant. Copiez .env.example vers .env.local et renseignez-le.',
    );
  }
  return s;
}

function b64url(octets) {
  return btoa(String.fromCharCode(...new Uint8Array(octets)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function signer(charge) {
  const cle = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    cle,
    new TextEncoder().encode(charge),
  );
  return b64url(signature);
}

/** Fabrique la valeur du cookie de session : "<expiration>.<signature>". */
export async function creerJeton() {
  const expiration = String(Date.now() + DUREE_SECONDES * 1000);
  return `${expiration}.${await signer(expiration)}`;
}

/** Comparaison à durée constante — même logique que motDePasseCorrect ci-dessous. */
function egaliteConstante(a, b) {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  let diff = ea.length ^ eb.length;
  for (let i = 0; i < Math.max(ea.length, eb.length); i += 1) {
    diff |= (ea[i] ?? 0) ^ (eb[i] ?? 0);
  }
  return diff === 0;
}

/** Vérifie signature ET fraîcheur. Retourne un booléen, jamais d'exception. */
export async function jetonValide(jeton) {
  try {
    if (!jeton) return false;
    const [expiration, signature] = String(jeton).split('.');
    if (!expiration || !signature) return false;
    if (Number(expiration) < Date.now()) return false;
    // Comparaison à temps constant : une chaîne, même signée, ne doit jamais
    // se valider plus vite ou plus lentement selon où elle diverge.
    return egaliteConstante(await signer(expiration), signature);
  } catch {
    return false;
  }
}

/** Comparaison à durée constante : évite de fuiter le mot de passe au chrono. */
export function motDePasseCorrect(saisi) {
  const attendu = process.env.ADMIN_PASSWORD ?? '';
  const a = new TextEncoder().encode(String(saisi ?? ''));
  const b = new TextEncoder().encode(attendu);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  }
  return attendu.length > 0 && diff === 0;
}

export const COOKIE = { nom: NOM_COOKIE, dureeSecondes: DUREE_SECONDES };
