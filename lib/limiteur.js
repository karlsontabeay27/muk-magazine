import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Limiteur de débit partagé entre toutes les instances serverless, via
 * Upstash Redis (API REST — utilisable sans connexion persistante, donc
 * adaptée à un environnement serverless comme Vercel).
 *
 * Avant ce module, les deux routes qui en avaient besoin (connexion admin,
 * inscription newsletter) comptaient dans un `Map()` en mémoire — invisible
 * d'une instance Vercel à l'autre : un cold start ou une deuxième instance en
 * parallèle repartait de zéro, ce qui rendait la limite presque sans effet
 * une fois déployé.
 *
 * Sans les deux variables d'environnement, on retombe sur un compteur en
 * mémoire — correct pour développer en local, mais qui ne protège pas
 * réellement une fois déployé. On le signale une fois au démarrage.
 * Marche à suivre : README.md § Anti-forçage brutal.
 */
const configure = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
);

if (!configure) {
  console.warn(
    '[MUK] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN absentes : limiteur de',
  );
  console.warn(
    '      débit en mémoire seulement, sans effet réel entre plusieurs instances',
  );
  console.warn('      Vercel. Voir README.md § Anti-forçage brutal.');
}

const redis = configure
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Un limiteur Upstash par (préfixe, plafond, fenêtre) — construit une fois,
// réutilisé ensuite : le constructeur n'a pas à être appelé à chaque requête.
const limiteursPartages = new Map();

function limiteurPartage(prefixe, max, fenetreSecondes) {
  const cle = `${prefixe}:${max}:${fenetreSecondes}`;
  if (!limiteursPartages.has(cle)) {
    limiteursPartages.set(
      cle,
      new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(max, `${fenetreSecondes} s`),
        prefix: `muk:${prefixe}`,
      }),
    );
  }
  return limiteursPartages.get(cle);
}

// --- Repli local, seulement utilisé si Upstash n'est pas configuré ---------
const compteursLocaux = new Map();

function verifierLocal(identifiant, max, fenetreSecondes) {
  const maintenant = Date.now();
  const fenetreMs = fenetreSecondes * 1000;
  const historique = (compteursLocaux.get(identifiant) ?? []).filter(
    (t) => maintenant - t < fenetreMs,
  );
  if (historique.length >= max) return false;
  historique.push(maintenant);
  compteursLocaux.set(identifiant, historique);
  return true;
}

/**
 * Vérifie ET compte cette tentative. Un seul appel par requête : la
 * vérification et l'incrémentation sont atomiques côté Upstash.
 *
 * @returns {Promise<boolean>} true si la requête doit être bloquée (trop de tentatives)
 */
export async function tropDeTentatives(prefixe, identifiant, max, fenetreSecondes) {
  if (redis) {
    const { success } = await limiteurPartage(prefixe, max, fenetreSecondes).limit(identifiant);
    return !success;
  }
  return !verifierLocal(`${prefixe}:${identifiant}`, max, fenetreSecondes);
}

/**
 * À appeler après un succès (ex. mot de passe correct) : efface l'historique
 * d'échecs de cet identifiant, pour qu'une série d'essais ratés suivie d'une
 * réussite ne bloque pas la prochaine connexion légitime.
 */
export async function reinitialiserTentatives(prefixe, identifiant, max, fenetreSecondes) {
  if (redis) {
    await limiteurPartage(prefixe, max, fenetreSecondes).resetUsedTokens(identifiant);
    return;
  }
  compteursLocaux.delete(`${prefixe}:${identifiant}`);
}
