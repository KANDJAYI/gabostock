/**
 * Clé anon (publique, protégée par RLS). Préférez `NEXT_PUBLIC_SUPABASE_ANON_KEY` ;
 * `SUPABASE_ANON_KEY` est acceptée côté serveur et mappée côté client via `next.config.ts`.
 */
export function getSupabaseAnonKeyFromEnv(): string | undefined {
  const pub = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (pub) return pub;
  return process.env.SUPABASE_ANON_KEY?.trim();
}

export function hasSupabaseConfig(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && getSupabaseAnonKeyFromEnv()
  );
}

/**
 * Clé service_role — **uniquement serveur** (Route Handlers, jamais exposée au navigateur).
 * Permet des opérations admin (ex. suppression d’entreprise) qui contournent la RLS.
 */
export function getSupabaseServiceRoleKeyFromEnv(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
}
