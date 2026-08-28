/**
 * Détection de la configuration Supabase — source unique de vérité.
 *
 * Ce fichier existe parce que la règle a d'abord été écrite deux fois, dans
 * lib/db.js et lib/abonnes.js, avec deux niveaux d'exigence différents : les
 * contenus basculaient correctement en mode démonstration pendant que la
 * newsletter tentait quand même d'écrire dans Supabase, et échouait.
 */

/**
 * Supabase a deux générations de clés : les JWT historiques (rôle `anon` ou
 * `service_role` dans la charge utile) et le format introduit en 2025
 * (`sb_publishable_` / `sb_secret_`).
 *
 * On refuse explicitement la clé publique. Elle est bridée par les politiques
 * RLS : branchée côté serveur, l'application démarrerait puis échouerait à la
 * première lecture avec un message incompréhensible.
 */
export function cleSecretePlausible(cle) {
  if (!cle) return false;
  if (cle.startsWith('sb_secret_')) return true;
  if (cle.startsWith('sb_publishable_')) return false;

  const segments = cle.split('.');
  if (segments.length !== 3) return false;
  try {
    const charge = JSON.parse(Buffer.from(segments[1], 'base64').toString());
    return charge.role === 'service_role';
  } catch {
    return false;
  }
}

export const urlPresente = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

export const utiliseSupabase = () =>
  urlPresente() && cleSecretePlausible(process.env.SUPABASE_SERVICE_ROLE_KEY);

/** Client partagé, créé à la demande et une seule fois. */
let clientMemo = null;
export async function clientSupabase() {
  if (!clientMemo) {
    const { createClient } = await import('@supabase/supabase-js');
    clientMemo = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } },
    );
  }
  return clientMemo;
}
