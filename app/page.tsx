import { GabostockLanding } from "@/components/landing/gabostock-landing";
import { hasSupabaseConfig } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const SEO_TITLE =
  "Gabostock — Logiciel de gestion de stock, caisse & ventes au Gabon | Libreville, Port-Gentil";

const SEO_DESCRIPTION =
  "Gabostock est le logiciel de gestion de stock, point de vente (POS) et facturation FCFA pensé pour les commerces, boutiques, supermarchés et pharmacies au Gabon : Libreville, Port-Gentil, Franceville, Owendo, Akanda, Oyem, Lambaréné. Application web et mobile, hors ligne, multi-magasins. Essai gratuit.";

const SEO_KEYWORDS = [
  "logiciel de gestion de stock Gabon",
  "logiciel de caisse Gabon",
  "POS Gabon",
  "point de vente Libreville",
  "logiciel de facturation Gabon",
  "facturation FCFA",
  "gestion stock boutique Gabon",
  "gestion supermarché Libreville",
  "logiciel pharmacie Gabon",
  "gestion magasin Port-Gentil",
  "gestion entrepôt Gabon",
  "inventaire Gabon",
  "logiciel commerce Libreville",
  "application caisse Gabon",
  "Gabostock",
  "GaboStock",
  "SaaS Gabon",
  "logiciel commerce Franceville",
  "gestion ventes Owendo",
  "logiciel boutique Oyem",
];

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  applicationName: "Gabostock",
  category: "business",
  authors: [{ name: "Gabostock", url: siteUrl }],
  creator: "Gabostock",
  publisher: "Gabostock",
  alternates: {
    canonical: "/",
    languages: {
      "fr-GA": "/",
      fr: "/",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    siteName: "Gabostock",
    title: "Gabostock — Logiciel de gestion de stock & caisse au Gabon",
    description:
      "Pilotez votre commerce au Gabon avec Gabostock : stock multi-magasins, caisse (POS), facturation FCFA, créances et entrepôt. Essai gratuit, fonctionne hors ligne.",
    url: "/",
    locale: "fr_GA",
    alternateLocale: ["fr_FR", "fr_CM", "fr_CG", "fr_CI", "fr_SN"],
    images: [
      {
        url: "/logogabostock.png",
        width: 1024,
        height: 1024,
        alt: "Gabostock — logiciel de gestion de stock et de caisse au Gabon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gabostock — Gestion de stock & caisse au Gabon",
    description:
      "Logiciel de stock, POS et facturation FCFA pour les commerces au Gabon. Multi-magasins, hors ligne, essai gratuit.",
    images: ["/logogabostock.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  other: {
    "geo.region": "GA",
    "geo.country": "Gabon",
    "geo.placename": "Libreville",
    "geo.position": "0.4162;9.4673",
    ICBM: "0.4162, 9.4673",
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
