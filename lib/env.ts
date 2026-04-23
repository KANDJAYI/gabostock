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
