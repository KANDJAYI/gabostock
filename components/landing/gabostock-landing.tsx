import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils/cn";
import { landingInter } from "./landing-font";
import { LAN } from "./landing-apple-tokens";
import {
  ArrowRight,
  Building2,
  FileText,
  Headphones,
  LineChart,
  Package,
  Play,
  Printer,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Star,
  Store,
  Truck,
  User,
  Users,
  Wallet,
} from "lucide-react";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { GabostockDailyChallengesSection } from "./gabostock-daily-challenges-section";
import { GabostockSolutionShowcaseSection } from "./gabostock-solution-showcase-section";
import { LandingHeader } from "./landing-header";
import { LandingPricingSection } from "./landing-pricing-section";
import { LandingScrollEffects } from "./landing-scroll-effects";
import { LandingPartnersSection, type LandingPartner } from "./landing-partners-section";
import { LandingStructuredData } from "./landing-structured-data";
import { createClient } from "@/lib/supabase/server";
import { ScrollReveal } from "./scroll-reveal";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

/** Villes du Gabon ciblées pour le SEO local — visible + JSON-LD `areaServed`. */
const GABON_CITIES = [
  "Libreville",
  "Port-Gentil",
  "Franceville",
  "Owendo",
  "Akanda",
  "Oyem",
  "Lambaréné",
  "Mouila",
  "Tchibanga",
  "Koulamoutou",
  "Makokou",
  "Bitam",
] as const;

/** Maquette fonctionnalités (7 colonnes × cartes navy + pastilles couleur façon keynote). */
const SHOWCASE_FEATURES = [
  {
    icon: ShoppingCart,
    tint: "#007AFF",
    title: "Suivi des ventes",
    body: "Enregistrez chaque vente, suivez vos encaissements et anticipez la trésorerie en temps réel.",
  },
  {
    icon: Package,
    tint: "#34C759",
    title: "Gestion des stocks",
    body: "Quantités par magasin ou dépôt, seuils et alertes pour éviter les ruptures et le surstock.",
  },
  {
    icon: User,
    tint: "#FF9500",
    title: "Crédits clients",
    body: "Solde créances et échéances clairs pour vos ventes à crédit sans perdre la trace des montants.",
  },
  {
    icon: Wallet,
    tint: "#AF52DE",
    title: "Dépenses",
    body: "Centralisez les sorties pour analyser vos coûts et garder vos marges sous contrôle.",
  },
  {
    icon: Users,
    tint: "#007AFF",
    title: "Gestion des employés",
    body: "Comptes, rôles et habilitations adaptés aux postes pour séparer ventes, stock et admin.",
  },
  {
    icon: LineChart,
    tint: "#34C759",
    title: "Rapports & Analyses",
    body: "Indicateurs structurés et exports pour prendre vos décisions sur des chiffres fiables.",
  },
  {
    icon: Printer,
    tint: "#FFD60A",
    title: "Tickets & Factures",
    body: "Documents et impressions alignés sur vos flux de vente et votre matériel habituel.",
  },
] as const;

const STEPS = [
  {
    step: "1",
    title: "Créez votre espace",
    body: "Choisissez votre type d’activité et inscrivez votre entreprise en quelques minutes.",
  },
  {
    step: "2",
    title: "Paramétrez magasins & dépôt",
    body: "Ajoutez vos points de vente, importez ou créez vos articles et fixez vos règles de stock.",
  },
  {
    step: "3",
    title: "Vendez et pilotez",
    body: "Encaissez au quotidien, consultez les rapports et ajustez votre inventaire en temps réel.",
  },
] as const;

const METIERS = [
  {
    icon: Store,
    title: "Commerce de détail",
    body: "Boutiques, épiceries, quincailleries — rotation rapide et vision claire des marges.",
  },
  {
    icon: Building2,
    title: "Multi-magasins",
    body: "Plusieurs caisses et entrepôts : une seule base de référence pour vos stocks.",
  },
  {
    icon: Truck,
    title: "Grossiste & dépôt",
    body: "Volumes plus importants, préparation et suivi des sorties vers les points de vente.",
  },
] as const;

const FAQ_ITEMS = [
  {
    q: "Qu’est-ce que Gabostock ?",
    a: "Gabostock est un logiciel de gestion de stock, de point de vente (caisse / POS) et de facturation FCFA conçu pour les commerces, boutiques, supermarchés, quincailleries et pharmacies au Gabon. C’est une application web et mobile (PWA), accessible à Libreville, Port-Gentil, Franceville et partout ailleurs au Gabon, qui remplace les cahiers papier et les fichiers Excel par un outil unique.",
  },
  {
    q: "Gabostock fonctionne-t-il sans Internet au Gabon ?",
    a: "Oui. Gabostock est conçu pour une utilisation hors ligne (PWA) — pratique en cas de coupure d’électricité ou de connexion instable au Gabon. Vos ventes et entrées de stock sont enregistrées localement sur l’appareil, puis synchronisées automatiquement quand le réseau revient.",
  },
  {
    q: "Puis-je gérer plusieurs magasins et un dépôt à Libreville et Port-Gentil ?",
    a: "Oui. Gabostock prend en charge plusieurs points de vente et un entrepôt central, avec transferts de stock entre les magasins. Vous pouvez piloter une boutique à Libreville, un magasin à Port-Gentil et un dépôt à Owendo depuis le même compte.",
  },
  {
    q: "Le logiciel gère-t-il les ventes en FCFA et les tickets de caisse ?",
    a: "Oui. Gabostock est entièrement adapté à la devise FCFA (XAF) : tickets de caisse, factures A4, créances clients, dépenses et rapports sont calculés et imprimés en francs CFA. Les imprimantes thermiques courantes au Gabon sont prises en charge.",
  },
  {
    q: "Existe-t-il un module spécifique pour les pharmacies au Gabon ?",
    a: "Oui. Le module Pharmacie permet de gérer les lots, les dates de péremption, les seuils d’alerte et la traçabilité des médicaments — adapté aux officines au Gabon.",
  },
  {
    q: "Comment créer un compte Gabostock ?",
    a: "Cliquez sur « Essayer gratuitement », choisissez votre type d’activité (commerce général, supermarché, pharmacie, grossiste…) et créez votre espace en quelques minutes. Vous pouvez ensuite ajouter vos magasins, importer vos produits et commencer à vendre.",
  },
  {
    q: "Où sont hébergées mes données ?",
    a: "Les données sont hébergées sur une infrastructure cloud sécurisée. Elles sont chiffrées en transit et en stockage, avec des sauvegardes régulières. L’accès est protégé par utilisateur et par rôle (admin, caissier, gestionnaire de stock).",
  },
] as const;

function parsePartners(raw: string | null | undefined): LandingPartner[] {
  const txt = (raw ?? "").trim();
  if (!txt) return [];
  try {
    const parsed = JSON.parse(txt) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((p) => {
        if (!p || typeof p !== "object") return null;
        const r = p as Record<string, unknown>;
        const name = String(r.name ?? "").trim();
        const logoSrc = String(r.logoSrc ?? "").trim();
        if (!name) return null;
        return { name, logoSrc: logoSrc || null };
      })
      .filter(Boolean) as LandingPartner[];
  } catch {
    return [];
  }
}

const FALLBACK_PARTNERS: LandingPartner[] = [
  { name: "Ramadan Telecom" },
  { name: "ELOF Multi Services" },
  { name: "Partenaire 3" },
];

export async function GabostockLanding() {
  let partners: LandingPartner[] = FALLBACK_PARTNERS;
  let landingLogoSrc: string | null = null;
  let dailyChallengesImageSrc: string | null = null;
  let solutionImageSrc: string | null = null;
  let heroBadgeLeft: string | null = null;
  let heroBadgeRight: string | null = null;
  let heroTitleLine1: string | null = null;
  let heroTitleLine2: string | null = null;
  let heroDescription: string | null = null;
  let heroPrimaryCtaLabel: string | null = null;
  let heroPrimaryCtaHref: string | null = null;
  let heroSecondaryCtaLabel: string | null = null;
  let heroSecondaryCtaHref: string | null = null;
  let finalCtaTitle: string | null = null;
  let finalCtaDescription: string | null = null;
  let partnersTitle: string | null = null;
  let partnersSubtitle: string | null = null;
  try {
    const supabase = await createClient();
    const { data: partnersRow } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "public_site_partners")
      .maybeSingle();
    const v = (partnersRow as { value?: string | null } | null)?.value ?? null;
    const parsed = parsePartners(v);
    if (parsed.length) partners = parsed;

    const { data: rows } = await supabase
      .from("platform_settings")
      .select("key, value")
      .in("key", [
        "public_site_hero_badge_left",
        "public_site_hero_badge_right",
        "public_site_hero_title_line1",
        "public_site_hero_title_line2",
        "public_site_hero_description",
        "public_site_hero_primary_cta_label",
        "public_site_hero_primary_cta_href",
        "public_site_hero_secondary_cta_label",
        "public_site_hero_secondary_cta_href",
        "public_site_final_cta_title",
        "public_site_final_cta_description",
        "public_site_partners_title",
        "public_site_partners_subtitle",
        "public_site_image_logo",
        "public_site_image_daily_challenges",
        "public_site_image_solution",
      ]);
    const map = new Map<string, string>();
    for (const r of (rows ?? []) as unknown[]) {
      const row = r as { key?: string; value?: string | null };
      if (row.key) map.set(row.key, String(row.value ?? ""));
    }
    const get = (k: string) => {
      const s = map.get(k);
      return s && s.trim() ? s.trim() : null;
    };
    heroBadgeLeft = get("public_site_hero_badge_left");
    heroBadgeRight = get("public_site_hero_badge_right");
    heroTitleLine1 = get("public_site_hero_title_line1");
    heroTitleLine2 = get("public_site_hero_title_line2");
    heroDescription = get("public_site_hero_description");
    heroPrimaryCtaLabel = get("public_site_hero_primary_cta_label");
    heroPrimaryCtaHref = get("public_site_hero_primary_cta_href");
    heroSecondaryCtaLabel = get("public_site_hero_secondary_cta_label");
    heroSecondaryCtaHref = get("public_site_hero_secondary_cta_href");
    finalCtaTitle = get("public_site_final_cta_title");
    finalCtaDescription = get("public_site_final_cta_description");
    partnersTitle = get("public_site_partners_title");
    partnersSubtitle = get("public_site_partners_subtitle");
    landingLogoSrc = get("public_site_image_logo");
    dailyChallengesImageSrc = get("public_site_image_daily_challenges");
    solutionImageSrc = get("public_site_image_solution");
  } catch {
    // fallback to hardcoded list when settings are unavailable
  }

  return (
    <div
      id="top"
      className={cn(
        landingInter.variable,
        landingInter.className,
        "min-h-dvh bg-[#050A18] text-white antialiased",
      )}
    >
      <LandingStructuredData
        siteUrl={SITE_URL}
        faqItems={FAQ_ITEMS}
        logoUrl={landingLogoSrc ?? "/logogabostock.png"}
      />

      <LandingHeader variant="heroDark" logoSrc={landingLogoSrc ?? "/logogabostock.png"} />

      <main>
        {/* Bannière : fond + contenu + maquettes */}
        <section
          className="relative overflow-x-clip overflow-y-visible border-b border-white/[0.06] text-white"
          style={{ backgroundColor: LAN.bg }}
        >
          <Image
            src="/landing/banner.png"
            alt=""
            fill
            priority
            className="pointer-events-none select-none object-cover object-center"
            sizes="100vw"
            aria-hidden
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(5,10,24,0.42) 0%, rgba(5,10,24,0.24) 42%, rgba(5,10,24,0.12) 62%, rgba(5,10,24,0.30) 100%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 720px 520px at 8% 100%, color-mix(in srgb, ${LAN.blue} 12%, transparent), transparent 58%),
                radial-gradient(ellipse 640px 440px at 94% -4%, color-mix(in srgb, ${LAN.green} 10%, transparent), transparent 60%),
                radial-gradient(ellipse 820px 360px at 92% 100%, color-mix(in srgb, ${LAN.blue} 5%, transparent), transparent 62%),
                radial-gradient(ellipse 520px 480px at 88% 38%, rgba(45, 212, 191, 0.04), transparent 62%)`,
            }}
          />
          <LandingScrollEffects />

          <div className="relative mx-auto max-w-[90rem] px-4 pt-6 sm:px-6 sm:pt-8 lg:px-12 lg:pt-10">
            <div className="mx-auto max-w-7xl pb-10 sm:pb-14 lg:pb-[5.5rem]">
            <div className="relative z-[2] max-w-xl lg:mx-0 lg:max-w-none xl:max-w-[min(38rem,calc(100%-1rem))]">
              <ScrollReveal>
                <div className="mb-8 inline-flex max-w-full flex-wrap items-center gap-x-2.5 gap-y-2 rounded-full border border-[#007AFF]/45 bg-black/40 px-4 py-2 text-[11px] font-extrabold uppercase leading-snug tracking-[0.07em] text-white/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm sm:text-[12px] sm:tracking-[0.065em]">
                  <Star
                    className="h-[15px] w-[15px] min-h-[15px] shrink-0 fill-[#007AFF] text-[#007AFF]"
                    aria-hidden
                  />
                  <span className="tracking-[0.038em] text-[#cce3ff]/[0.94]">
                    {(heroBadgeLeft ?? "LA SOLUTION TOUT-EN-UN POUR") + " "}
                  </span>
                  <span className="font-black tracking-[0.04em] text-[#34C759] drop-shadow-[0_0_20px_rgba(52,199,89,0.35)]">
                    {heroBadgeRight ?? "VOTRE COMMERCE"}
                  </span>
                </div>
              </ScrollReveal>

              <ScrollReveal delayMs={90}>
                <h1 className="text-balance font-extrabold leading-[1.06] tracking-[-0.02em]">
                  <span className="sr-only">
                    Gabostock — logiciel de gestion de stock, caisse et facturation FCFA pour les commerces au Gabon (Libreville, Port-Gentil, Franceville).{" "}
                  </span>
                  <span aria-hidden className="block text-[clamp(2.25rem,5.5vw,3.75rem)] text-white">
                    {heroTitleLine1 ?? "Gérez mieux."}
                  </span>
                  <span
                    aria-hidden
                    className="mt-1 block bg-gradient-to-r from-[#34C759] to-[#007AFF] bg-clip-text text-[clamp(2.5rem,6vw,4.25rem)] text-transparent"
                  >
                    {heroTitleLine2 ?? "Gagnez plus."}
                  </span>
                </h1>
              </ScrollReveal>

              <ScrollReveal delayMs={160}>
                <p className="mt-7 max-w-[28.5rem] text-[1.0625rem] leading-[1.65] text-white sm:text-[1.0625rem] xl:text-[1.09375rem]">
                  {heroDescription ?? (
                    <>
                      <strong className="font-semibold text-[#34C759]">Gabostock</strong> est le logiciel
                      tout-en-un des commerces{" "}
                      <strong className="font-semibold text-[#34C759]">au Gabon</strong> : suivez vos{" "}
                      <strong className="font-semibold text-[#34C759]">ventes</strong>, gérez votre{" "}
                      <strong className="font-semibold text-[#34C759]">stock</strong>, vos{" "}
                      <strong className="font-semibold text-[#34C759]">factures en FCFA</strong> et vos
                      crédits clients — à Libreville, Port-Gentil, Franceville et partout au Gabon.
                    </>
                  )}
                </p>
              </ScrollReveal>

              <ScrollReveal delayMs={230}>
                <div className="mt-10 flex flex-col gap-[0.9rem] sm:flex-row sm:flex-wrap sm:items-center">
                  <Link
                    href={heroPrimaryCtaHref ?? ROUTES.registerSelectActivity}
                    className="inline-flex min-h-[3.375rem] w-full max-w-[17.85rem] items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#34C759] to-[#007AFF] px-[1.85rem] py-[0.89rem] text-[1.0625rem] font-bold text-white shadow-[0_26px_64px_-14px_rgba(0,122,255,0.38)] transition hover:brightness-[1.03] active:brightness-[0.99] sm:w-auto"
                  >
                    {heroPrimaryCtaLabel ?? "Essayer gratuitement"}
                    <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
                  </Link>
                  <a
                    href={heroSecondaryCtaHref ?? "#fonctionnalites"}
                    className="inline-flex min-h-[3.375rem] w-full max-w-[15.25rem] items-center gap-3 rounded-full border border-white/22 bg-black/52 px-[1.35rem] py-[0.75rem] text-[1.0625rem] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md transition hover:border-white/34 hover:bg-black/62 sm:w-auto"
                  >
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#007AFF] shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]">
                      <Play className="relative left-[3px] h-6 w-6 shrink-0 stroke-white text-white" strokeWidth={2.4} aria-hidden />
                    </span>
                    {heroSecondaryCtaLabel ?? "Voir la démo"}
                  </a>
                </div>
              </ScrollReveal>

              <ul className="mt-12 grid gap-5 sm:grid-cols-3 sm:gap-5 lg:mt-14 lg:gap-6">
                {([
                  {
                    icon: ShieldCheck,
                    title: "Simple & Intuitif",
                    sub: "Prise en main rapide",
                    iconClass: "text-[#34C759]",
                    ringClass: "border-[#34C759]/52",
                  },
                  {
                    icon: Shield,
                    title: "Données sécurisées",
                    sub: "Sécurité & confidentialité",
                    iconClass: "text-[#34C759]",
                    ringClass: "border-[#34C759]/52",
                  },
                  {
                    icon: Headphones,
                    title: "Accessible partout",
                    sub: "Web, mobile & desktop",
                    iconClass: "text-[#007AFF]",
                    ringClass: "border-[#007AFF]/52",
                  },
                ] as const).map(({ icon: Ico, title, sub, iconClass, ringClass }) => (
                  <ScrollReveal key={title} delayMs={260}>
                    <li className="rounded-[14px] border border-white/[0.12] bg-white/[0.055] px-5 py-[1.125rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.048)] backdrop-blur-md">
                      <div className="flex items-start gap-[0.9rem]">
                        <span
                          className={cn(
                            "mt-px inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9375rem] border bg-transparent",
                            ringClass,
                          )}
                        >
                          <Ico className={cn(iconClass, "h-[1.3rem] w-[1.3rem]")} aria-hidden />
                        </span>
                        <div>
                          <p className="font-bold leading-snug tracking-tight text-white">{title}</p>
                          <p className="mt-[0.425rem] text-[0.86rem] leading-snug text-neutral-400">
                            {sub}
                          </p>
                        </div>
                      </div>
                    </li>
                  </ScrollReveal>
                ))}
              </ul>
            </div>
          </div>
          </div>
          <a
            href="https://wa.me/24174768044?text=Bonjour%20Gabostock%20%F0%9F%91%8B%2C%20je%20suis%20int%C3%A9ress%C3%A9(e)%20par%20votre%20logiciel%20de%20gestion%20de%20stock%20et%20de%20caisse.%20Pouvez-vous%20me%20donner%20plus%20d%E2%80%99informations%20%3F"
            target="_blank"
            rel="noreferrer"
            className="absolute bottom-4 right-4 z-[4] inline-flex items-center gap-2 rounded-full border border-[#34C759]/45 bg-[#34C759] px-4 py-3 text-sm font-bold text-white shadow-[0_20px_48px_-18px_rgba(52,199,89,0.85)] transition hover:brightness-105 active:brightness-95 sm:bottom-6 sm:right-6 lg:right-12"
            aria-label="Contacter Gabostock sur WhatsApp"
          >
            <svg
              viewBox="0 0 32 32"
              className="h-5 w-5 shrink-0"
              fill="currentColor"
              aria-hidden
            >
              <path d="M16.04 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.26.6 4.46 1.73 6.4L3.2 28.8l6.59-1.72a12.78 12.78 0 0 0 6.25 1.6h.01c7.06 0 12.8-5.74 12.8-12.8 0-3.42-1.33-6.63-3.75-9.05a12.7 12.7 0 0 0-9.05-3.63Zm0 23.36h-.01a10.6 10.6 0 0 1-5.41-1.48l-.39-.23-3.91 1.02 1.04-3.81-.25-.4a10.62 10.62 0 1 1 19.7-5.66c0 5.86-4.77 10.56-10.77 10.56Zm5.78-7.92c-.32-.16-1.87-.92-2.16-1.03-.29-.11-.5-.16-.71.16-.21.32-.81 1.02-.99 1.23-.18.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57a9.55 9.55 0 0 1-1.77-2.2c-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.55-.08-.16-.71-1.71-.97-2.34-.26-.62-.52-.54-.71-.54l-.6-.01c-.21 0-.55.08-.84.4-.29.32-1.1 1.08-1.1 2.63 0 1.55 1.13 3.05 1.29 3.27.16.21 2.22 3.4 5.39 4.77.75.32 1.34.51 1.8.66.76.24 1.45.21 2 .13.61-.09 1.87-.76 2.13-1.5.27-.74.27-1.37.19-1.5-.08-.13-.29-.21-.61-.37Z"/>
            </svg>
            <span>WhatsApp</span>
          </a>
        </section>

        <GabostockDailyChallengesSection imageSrc={dailyChallengesImageSrc ?? "/landing/probleme.png"} />

        <GabostockSolutionShowcaseSection
          imageSrc={solutionImageSrc ?? "/landing/solution.png"}
          logoSrc={landingLogoSrc ?? "/logogabostock.png"}
        />

        {/* Fonctionnalités — même fond navy, grille 7 cartes façon keynote */}
        <section
          id="fonctionnalites"
          className="scroll-mt-20 border-b border-white/[0.07] bg-[#050A18] pb-[4.875rem] pt-[4.875rem]"
        >
          <div className="mx-auto max-w-[95rem] px-4 py-6 sm:px-6 xl:px-12">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <h2 className="text-[1.785rem] font-bold tracking-tight text-white sm:text-4xl xl:text-[2.4375rem]">
                Tout ce dont vous avez besoin pour gérer{" "}
                <span className="bg-gradient-to-r from-[#007AFF] to-[#34C759] bg-clip-text font-extrabold text-transparent">
                  votre activité
                </span>
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-[1rem] leading-relaxed text-neutral-400 xl:text-[1.0625rem]">
                Unifier ventes, stock, équipe et analyse — les modules essentiels regroupés pour
                piloter votre boutique ou votre réseau.
              </p>
            </div>
            <div className="flex snap-x snap-mandatory gap-[1.0625rem] overflow-x-auto pb-[0.9375rem] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] min-[950px]:grid min-[950px]:grid-cols-7 min-[950px]:overflow-visible xl:gap-[1.25rem]">
              {SHOWCASE_FEATURES.map((f) => (
                <article
                  key={f.title}
                  className="group flex max-w-[calc(92vw_-_2rem)] min-w-[12.9375rem] shrink-0 snap-start flex-col rounded-[1.0925rem] border border-[#1f2b44]/93 bg-gradient-to-br from-[#0f182c] via-[#0f1526] to-[#0f1423] px-5 py-[1.375rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.058),0_46px_64px_-40px_rgba(0,0,0,.66)] backdrop-blur-sm transition hover:border-[#007AFF]/52 min-[950px]:min-w-0 min-[950px]:max-w-none lg:rounded-[14px]"
                >
                  <div
                    className="group/icon mb-[1.0875rem] inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${f.tint}30` }}
                  >
                    <f.icon
                      className="h-6 w-6 shrink-0"
                      style={{ color: f.tint } as CSSProperties}
                      strokeWidth={2}
                      aria-hidden
                    />
                  </div>
                  <h3 className="font-bold leading-snug tracking-[-0.016em] text-white">{f.title}</h3>
                  <p className="mt-3 flex-1 text-[0.84rem] leading-[1.55] text-neutral-400 sm:text-[0.9175rem]">
                    {f.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="parcours"
          className="relative scroll-mt-20 overflow-hidden border-b border-white/[0.08] bg-[#050A18] py-16 sm:py-20"
        >
          <Image
            src="/fonctionenement.png"
            alt=""
            fill
            sizes="100vw"
            className="pointer-events-none select-none object-cover object-center opacity-[0.72]"
            aria-hidden
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(5,10,24,0.42) 0%, rgba(5,10,24,0.24) 50%, rgba(5,10,24,0.52) 100%)",
            }}
          />
          <div className="relative z-[1] mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="mx-auto max-w-2xl text-center">
                <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-fs-accent/25 bg-fs-accent/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-fs-accent">
                  Parcours
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--fs-brand-stock)]" aria-hidden />
                  Simple
                </div>
                <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  Comment{" "}
                  <span className="bg-gradient-to-r from-fs-accent to-[var(--fs-brand-stock)] bg-clip-text text-transparent">
                    ça marche
                  </span>
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-[1.03rem] leading-relaxed text-white/70">
                  Trois étapes pour sortir du chaos des fichiers dispersés et retrouver une vision unique de votre activité.
                </p>
              </div>
            </ScrollReveal>

            <ol className="mt-12 grid gap-6 lg:grid-cols-3 lg:gap-8">
              {STEPS.map((s, idx) => (
                <ScrollReveal key={s.step} delayMs={idx * 90}>
                  <li className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a101f] p-8 shadow-[0_30px_60px_-45px_rgba(0,0,0,0.9)] transition hover:border-white/20">
                    <div
                      className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-[0.12] blur-2xl"
                      style={{
                        background:
                          "radial-gradient(circle at 30% 30%, var(--fs-accent), transparent 62%)",
                      }}
                      aria-hidden
                    />
                    <div className="flex items-center gap-4">
                      <span
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-base font-extrabold text-white shadow-sm"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--fs-accent), var(--fs-brand-stock))",
                        }}
                      >
                        {s.step}
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold leading-snug text-white">{s.title}</h3>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-white/60">
                          Étape {s.step}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-[0.98rem] leading-relaxed text-white/70">
                      {s.body}
                    </p>
                  </li>
                </ScrollReveal>
              ))}
            </ol>
          </div>
        </section>

        <LandingPricingSection />

        {/* Métiers */}
        <section
          id="metiers"
          className="relative scroll-mt-20 overflow-hidden border-b border-white/[0.08] bg-[#050A18] py-16 sm:py-20"
        >
          <Image
            src="/adcommerce.png"
            alt=""
            fill
            sizes="100vw"
            className="pointer-events-none select-none object-cover object-center"
            aria-hidden
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(5,10,24,0.22) 0%, rgba(5,10,24,0.08) 48%, rgba(5,10,24,0.32) 100%)",
            }}
          />
          <div className="relative z-[1] mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Adapté à votre façon de vendre
              </h2>
              <p className="mt-4 text-lg text-white/70">
                Détaillants, réseaux de points de vente ou activité avec dépôt : les mêmes bases,
                scalées selon votre organisation.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {METIERS.map((m) => (
                <article
                  key={m.title}
                  className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#0a101f] to-[#070d1a] p-8"
                >
                  <m.icon className="h-10 w-10 text-fs-accent" aria-hidden />
                  <h3 className="mt-5 text-xl font-semibold text-white">{m.title}</h3>
                  <p className="mt-3 text-white/70">{m.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Gabon — SEO local : villes & cas d’usage */}
        <section
          id="gabon"
          aria-labelledby="gabon-title"
          className="scroll-mt-20 border-b border-white/[0.08] bg-[#050A18] py-16 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="mx-auto max-w-3xl text-center">
                <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-fs-accent/25 bg-fs-accent/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-fs-accent">
                  <span aria-hidden>🇬🇦</span>
                  Pensé pour le Gabon
                </div>
                <h2
                  id="gabon-title"
                  className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
                >
                  Le logiciel de gestion de stock & caisse{" "}
                  <span className="bg-gradient-to-r from-fs-accent to-[var(--fs-brand-stock)] bg-clip-text text-transparent">
                    des commerces au Gabon
                  </span>
                </h2>
                <p className="mx-auto mt-4 max-w-3xl text-[1.03rem] leading-relaxed text-white/70">
                  Gabostock est utilisé par des boutiques, supermarchés, quincailleries, grossistes et
                  pharmacies à <strong>Libreville</strong>, <strong>Port-Gentil</strong>,{" "}
                  <strong>Franceville</strong>, <strong>Owendo</strong>, <strong>Akanda</strong>,{" "}
                  <strong>Oyem</strong> et partout ailleurs au Gabon. Factures en{" "}
                  <strong>francs CFA (FCFA)</strong>, tickets de caisse, créances, multi-magasins et
                  fonctionnement <strong>hors ligne</strong> pour s’adapter au terrain.
                </p>
              </div>
            </ScrollReveal>

            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <article className="rounded-2xl border border-white/10 bg-[#0a101f] p-6 shadow-[0_30px_60px_-45px_rgba(0,0,0,0.9)]">
                <h3 className="text-lg font-bold text-[#34C759]">Boutiques & supermarchés</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  Caisse rapide, codes-barres, tickets thermiques et suivi des stocks pour les
                  commerces à Libreville (Mont-Bouët, Akébé, Nzeng-Ayong) et Port-Gentil.
                </p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-[#0a101f] p-6 shadow-[0_30px_60px_-45px_rgba(0,0,0,0.9)]">
                <h3 className="text-lg font-bold text-[#34C759]">Pharmacies au Gabon</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  Module dédié : lots, dates de péremption, alertes et traçabilité — adapté aux
                  officines de Libreville, Port-Gentil et Franceville.
                </p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-[#0a101f] p-6 shadow-[0_30px_60px_-45px_rgba(0,0,0,0.9)]">
                <h3 className="text-lg font-bold text-[#34C759]">Grossistes & dépôts</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  Entrepôt central, transferts vers les points de vente, factures A4 en FCFA — pensé
                  pour les grossistes du Gabon.
                </p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-[#0a101f] p-6 shadow-[0_30px_60px_-45px_rgba(0,0,0,0.9)]">
                <h3 className="text-lg font-bold text-[#34C759]">Multi-magasins</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  Pilotez vos magasins de Libreville, Owendo, Akanda et Port-Gentil depuis un seul
                  compte, avec rôles par utilisateur (caissier, gestionnaire, admin).
                </p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-[#0a101f] p-6 shadow-[0_30px_60px_-45px_rgba(0,0,0,0.9)]">
                <h3 className="text-lg font-bold text-[#34C759]">Hors ligne & coupures</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  Conçu pour les réalités du Gabon : coupures de réseau ou d’électricité, votre caisse
                  continue de vendre et synchronise dès que la connexion revient.
                </p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-[#0a101f] p-6 shadow-[0_30px_60px_-45px_rgba(0,0,0,0.9)]">
                <h3 className="text-lg font-bold text-[#34C759]">FCFA & impressions</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  Devise XAF par défaut, tickets thermiques 58/80 mm et factures A4
                  professionnelles — prêts à imprimer sur le matériel courant au Gabon.
                </p>
              </article>
            </div>

            <div className="mt-10 rounded-2xl border border-white/10 bg-[#0a101f]/70 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-white/60">
                Disponible partout au Gabon
              </p>
              <ul className="mt-3 flex flex-wrap gap-2 text-sm text-white">
                {GABON_CITIES.map((city) => (
                  <li
                    key={city}
                    className="rounded-full border border-white/10 bg-[#0b1222] px-3 py-1"
                  >
                    Gabostock {city}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Compliance / assurance */}
        <section className="border-b border-white/[0.08] bg-[#050A18] py-16 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
            <div>
              <div className="inline-flex rounded-full border border-fs-accent/30 bg-fs-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-fs-accent dark:bg-fs-accent/15">
                Fiabilité
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Une architecture pensée pour le terrain
              </h2>
              <p className="mt-4 text-lg text-white/70">
                Sessions sécurisées, sauvegardes et synchronisation lorsque vous étiez coupé du
                réseau — pour que vos opérations de caisse et de stock restent votre priorité.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Contrôle des accès par profil utilisateur",
                  "PWA pour retrouver l’app comme une application native",
                  "Documentation d’aide intégrée à l’espace application",
                ].map((line) => (
                  <li key={line} className="flex gap-3 text-white/70">
                    <ShieldCheck className="h-6 w-6 shrink-0 text-[var(--fs-brand-stock)]" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#0a101f] p-8 shadow-[0_40px_80px_-60px_rgba(0,0,0,0.95)]">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-fs-accent text-white">
                  <FileText className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <p className="font-semibold text-white">Facturation & traçabilité</p>
                  <p className="mt-2 text-sm text-white/70">
                    Prévisualisation des documents et supports d’encaissement pour garder une trace
                    claire entre la vente et le back-office — selon les modules activés dans votre
                    déploiement.
                  </p>
                </div>
              </div>
              <hr className="my-6 border-white/10" />
              <p className="text-sm leading-relaxed text-white/70">
                Gabostock s’interface avec votre environnement réel : imprimantes, navigateurs récents
                et mobiles. Notre objectif est de réduire la friction entre votre métier et
                l’outil.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="scroll-mt-20 border-t border-white/[0.08] bg-[#050A18] py-16 sm:py-20"
        >
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-fs-accent/25 bg-fs-accent/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-fs-accent">
                FAQ
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--fs-brand-stock)]" aria-hidden />
                Support
              </div>
              <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Questions{" "}
                <span className="bg-gradient-to-r from-fs-accent to-[var(--fs-brand-stock)] bg-clip-text text-transparent">
                  fréquentes
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-[1.03rem] leading-relaxed text-white/70">
                Les réponses aux questions les plus courantes avant de créer votre compte.
              </p>
            </div>

            <div className="mt-10 space-y-3">
              {FAQ_ITEMS.map((item) => (
                <details
                  key={item.q}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0a101f] shadow-[0_30px_60px_-45px_rgba(0,0,0,0.9)] transition hover:border-white/20 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 text-left">
                    <span className="flex min-w-0 items-start gap-3">
                      <span
                        className="mt-0.5 h-6 w-1 rounded-full"
                        style={{
                          background:
                            "linear-gradient(180deg, var(--fs-accent), var(--fs-brand-stock))",
                        }}
                        aria-hidden
                      />
                      <span className="min-w-0">
                        <span className="block font-semibold leading-snug text-white transition group-hover:text-fs-accent">
                          {item.q}
                        </span>
                        <span className="mt-1 block text-xs text-white/55">
                          Cliquez pour afficher la réponse
                        </span>
                      </span>
                    </span>

                    <span
                      className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#0b1222] text-fs-accent transition group-open:rotate-45"
                      aria-hidden
                      title="Ouvrir"
                    >
                      +
                    </span>
                  </summary>
                  <div className="border-t border-white/10 px-5 pb-5 pt-4 text-sm leading-relaxed text-white/70">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="border-t border-white/[0.08] bg-[#050A18] py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {finalCtaTitle ?? <>Prêt à structurer votre activité&nbsp;?</>}
            </h2>
            <p className="mt-4 text-lg text-white/70">
              {finalCtaDescription ??
                "Rejoignez Gabostock : créez votre espace ou connectez-vous pour retrouver vos données."}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={ROUTES.registerSelectActivity}
                className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-fs-accent px-8 py-4 text-base font-semibold text-white shadow-lg shadow-fs-accent/30 transition hover:opacity-95 sm:w-auto"
              >
                Créer mon compte
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <Link
                href={ROUTES.login}
                className="inline-flex w-full max-w-xs items-center justify-center rounded-2xl border border-white/15 bg-[#0a101f] px-8 py-4 text-base font-semibold text-white/95 backdrop-blur hover:bg-[#0d162a]"
              >
                Connexion
              </Link>
            </div>
          </div>
        </section>

        <LandingPartnersSection partners={partners} title={partnersTitle} subtitle={partnersSubtitle} />
      </main>

      <footer className="border-t border-white/[0.08] bg-[#050A18]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Image
                  src={landingLogoSrc ?? "/logogabostock.png"}
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-xl object-contain"
                />
                <div className="min-w-0">
                  <p className="text-lg font-extrabold tracking-tight text-white">
                    <span>Gabo</span>
                    <span className="text-[var(--fs-brand-stock)]">Stock</span>
                  </p>
                  <p className="text-sm text-white/70">
                    Stock, ventes & dépôt — simple, rapide, fiable.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={ROUTES.registerSelectActivity}
                  className="inline-flex items-center justify-center rounded-xl bg-fs-accent px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-fs-accent/20 hover:opacity-95"
                >
                  Créer un compte
                </Link>
                <Link
                  href={ROUTES.login}
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-[#0a101f] px-4 py-2 text-sm font-semibold text-white/95 hover:bg-[#0d162a]"
                >
                  Connexion
                </Link>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-white">Produit</p>
              <ul className="mt-4 space-y-2 text-sm">
                {[
                  { href: "#fonctionnalites", label: "Fonctionnalités" },
                  { href: "#parcours", label: "Comment ça marche" },
                  { href: "#abonnement", label: "Abonnement" },
                  { href: "#metiers", label: "Métiers" },
                  { href: "#gabon", label: "Gabostock au Gabon" },
                  { href: "#faq", label: "FAQ" },
                ].map((l) => (
                  <li key={l.href}>
                    <a className="text-white/70 hover:text-fs-accent" href={l.href}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-bold text-white">Ressources</p>
              <ul className="mt-4 space-y-2 text-sm">
                {[
                  { href: "/login", label: "Accéder à mon compte" },
                  { href: "/register/select-activity", label: "Créer un espace" },
                  { href: "/setup", label: "Configuration" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link className="text-white/70 hover:text-fs-accent" href={l.href}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-bold text-white">Contact &amp; localisation</p>
              <address className="mt-4 space-y-2 text-sm not-italic text-white/70">
                <p className="font-semibold text-white">Gabostock</p>
                <p>
                  <span itemProp="addressLocality">Libreville</span>,{" "}
                  <span itemProp="addressCountry">Gabon</span> 🇬🇦
                </p>
                <p className="text-xs">
                  Support &amp; démo pour les commerces au Gabon — boutiques, supermarchés,
                  pharmacies, grossistes. Multi-magasins, FCFA, impression tickets &amp; factures.
                </p>
              </address>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} Gabostock. Tous droits réservés.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <a href="#top" className="hover:text-fs-accent">
                Retour en haut
              </a>
              <span className="hidden sm:inline">•</span>
              <span className="text-white/50">
                Construit pour le terrain.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
