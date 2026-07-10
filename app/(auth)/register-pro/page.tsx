import { RegisterProForm } from "@/components/auth/register-pro-form";
import { resolveLandingForUser } from "@/lib/auth/resolve-landing";
import { hasSupabaseConfig } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RegisterProPage() {
  if (!hasSupabaseConfig()) redirect("/setup");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(await resolveLandingForUser(supabase, user.id));

  return <RegisterProForm />;
}
