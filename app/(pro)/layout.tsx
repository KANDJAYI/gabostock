import { ProShell } from "@/components/pro/pro-shell";
import { isSoloAccount } from "@/lib/auth/resolve-landing";
import { hasSupabaseConfig } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function ProLayout({ children }: { children: ReactNode }) {
  if (!hasSupabaseConfig()) redirect("/setup");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  // Espace réservé aux comptes solo ; un compte gestion commerciale repart au dashboard.
  if (!(await isSoloAccount(supabase, user.id))) redirect("/dashboard");

  return <ProShell userEmail={user.email ?? null}>{children}</ProShell>;
}
