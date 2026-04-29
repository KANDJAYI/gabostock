import { GabostockLanding } from "@/components/landing/gabostock-landing";
import { hasSupabaseConfig } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gabostock — Gestion de stock, ventes & dépôt",
  description:
    "Centralisez inventaire, caisse, créances et entrepôt. Application web offline-first (PWA) pour boutiques et réseaux de points de vente. Créez un compte ou connectez-vous.",
  openGraph: {
    title: "Gabostock — Stock, ventes & dépôt en un seul outil",
    description:
      "Pilotez votre commerce depuis le navigateur avec Gabostock : stock, POS, créances et entrepôt.",
    type: "website",
  },
};

export default async function Home() {
  if (!hasSupabaseConfig()) redirect("/setup");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_super_admin")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.is_super_admin) redirect("/admin");
    redirect("/dashboard");
  }
  return <GabostockLanding />;
}
