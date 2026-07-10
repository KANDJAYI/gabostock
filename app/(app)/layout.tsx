import { AppShell } from "@/components/layout/app-shell";
import { AppRouteGuard } from "@/components/permissions/app-route-guard";
import { isSoloAccount } from "@/lib/auth/resolve-landing";
import { hasSupabaseConfig } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  if (!hasSupabaseConfig()) redirect("/setup");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  // Un compte solo (facturation) n'a pas accès à la gestion commerciale.
  if (await isSoloAccount(supabase, user.id)) redirect("/facturation");

  return (
    <AppShell userEmail={user.email}>
      <AppRouteGuard>{children}</AppRouteGuard>
    </AppShell>
  );
}