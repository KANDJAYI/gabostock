import type { SupabaseClient } from "@supabase/supabase-js";

export type RegisterSoloInput = {
  fullName: string;
  email: string;
  password: string;
};

/**
 * Inscription d'un compte « solo » (espace Facturation Pro autonome).
 * Contrairement à {@link registerCompany}, ne crée ni société, ni magasin, ni rôles :
 * juste un profil `account_type = 'solo'` et une ligne `pro_issuer` vide à compléter.
 */
export async function registerSolo(
  supabase: SupabaseClient,
  input: RegisterSoloInput,
): Promise<{ userId: string }> {
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: { full_name: input.fullName.trim() },
    },
  });
  if (signUpError) throw signUpError;
  const user = authData.user;
  if (!user) throw new Error("Inscription échouée.");

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: input.fullName.trim(),
    account_type: "solo",
    is_super_admin: false,
    is_active: true,
  });
  if (profileError) throw profileError;

  // Ligne émetteur vide (best-effort) — l'utilisateur la complète ensuite dans /facturation/profil.
  const { error: issuerError } = await supabase
    .from("pro_issuer")
    .upsert({ user_id: user.id, business_name: input.fullName.trim() });
  if (issuerError) {
    // Non bloquant : la page profil créera la ligne au premier enregistrement.
    console.warn("[registerSolo] pro_issuer init:", issuerError.message);
  }

  return { userId: user.id };
}
