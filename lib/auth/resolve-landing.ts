import type { SupabaseClient } from "@supabase/supabase-js";

/** Page d'atterrissage post-connexion selon le type de compte. */
export const LANDING_SOLO = "/facturation";
export const LANDING_BUSINESS = "/dashboard";

/**
 * Résout la destination après authentification à partir de `profiles.account_type`.
 * - `solo`     → espace Facturation Pro (`/facturation`)
 * - sinon      → gestion commerciale (`/dashboard`)
 */
export async function resolveLandingForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", userId)
    .maybeSingle();
  const accountType = (data as { account_type?: string } | null)?.account_type;
  return accountType === "solo" ? LANDING_SOLO : LANDING_BUSINESS;
}

/** Vrai si le compte est de type `solo` (espace facturation). */
export async function isSoloAccount(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", userId)
    .maybeSingle();
  return (data as { account_type?: string } | null)?.account_type === "solo";
}
