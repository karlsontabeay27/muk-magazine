import { promises as fs } from 'node:fs';
import path from 'node:path';
import { clientSupabase, utiliseSupabase } from '@/lib/supabase-config';

/**
 * Registre des inscrits à la newsletter.
 *
 * Le stockage suit le même principe que les contenus : fichier JSON en mode
 * démonstration, table Supabase dès que les clés sont renseignées.
 *
 * Ce module ne fait qu'enregistrer. L'envoi sera confié à un prestataire
 * (Brevo, Beehiiv) au lancement : la délivrabilité, la désinscription et la
 * conformité RGPD ne s'improvisent pas, et un serveur d'e-mails maison finit
 * systématiquement en spam.
 *
 * Reste à ajouter avant la mise en ligne : la confirmation par e-mail
 * (double opt-in), obligatoire pour une liste de diffusion en France.
 */
const FICHIER = path.join(process.cwd(), 'data', 'abonnes.json');
const TABLE = 'abonnes';

/** Validation volontairement simple : la vraie vérification est l'e-mail de confirmation. */
export function emailPlausible(valeur) {
  const email = String(valeur ?? '').trim();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

async function lireLocal() {
  try {
    return JSON.parse(await fs.readFile(FICHIER, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}

/**
 * @returns {'nouveau' | 'deja-inscrit'}
 * On ne dit jamais à l'appelant si l'adresse était déjà connue par un message
 * différent : ce serait un moyen de tester l'appartenance d'une adresse à la
 * liste. La distinction sert uniquement à ne pas créer de doublon.
 */
export async function inscrire(email, langue = 'fr') {
  const propre = String(email).trim().toLowerCase();
  const maintenant = new Date().toISOString();

  if (utiliseSupabase()) {
    const client = await clientSupabase();

    const { error } = await client
      .from(TABLE)
      .insert({ email: propre, langue, date_inscription: maintenant });

    // 23505 = violation de contrainte d'unicité : l'adresse est déjà là.
    if (error && error.code === '23505') return 'deja-inscrit';
    if (error) throw new Error(`Supabase : ${error.message}`);
    return 'nouveau';
  }

  const abonnes = await lireLocal();
  if (abonnes.some((a) => a.email === propre)) return 'deja-inscrit';

  abonnes.push({ email: propre, langue, dateInscription: maintenant, confirme: false });
  await fs.mkdir(path.dirname(FICHIER), { recursive: true });
  await fs.writeFile(FICHIER, `${JSON.stringify(abonnes, null, 2)}\n`, 'utf8');
  return 'nouveau';
}
