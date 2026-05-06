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
import { LandingHeroMockupsComposition } from "./landing-hero-mockups";
import { LandingHeader } from "./landing-header";
import { LandingScrollEffects } from "./landing-scroll-effects";
import { LandingPartnersSection, type LandingPartner } from "./landing-partners-section";
import { createClient } from "@/lib/supabase/server";
import { ScrollReveal } from "./scroll-reveal";

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
    a: "Gabostock est une solution web de gestion de stock, de ventes et de dépôt. Elle remplace ou complète vos tableurs et vos carnets papier avec un outil unifié, accessible depuis un navigateur et installable comme application (PWA).",
  },
  {
    q: "Fonctionne-t-il sans connexion Internet ?",
    a: "L’application est conçue pour une utilisation hors ligne dans la mesure des capacités techniques du navigateur (PWA). Les données peuvent être mises à jour ensuite lorsque le réseau revient.",
  },
  {
    q: "Puis-je gérer plusieurs magasins ?",
    a: "Oui. Gabostock prend en charge plusieurs points de vente et des transferts pour répartir le stock là où vous en avez besoin.",
  },
  {
    q: "Comment accéder à mon compte ?",
    a: "Créez un compte ou connectez-vous depuis les pages prévues à cet effet. Un accès administrateur distinct existe pour l’administration plateforme selon votre profil.",
  },
  {
    q: "Où sont hébergées mes données ?",
    a: "Les données sont gérées via l’infrastructure projet (par ex. Supabase côté opérateur). Contactez votre responsable système ou l’éditeur pour le détail du déploiement et des engagements de disponibilité.",
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
        "min-h-dvh bg-fs-surface text-fs-text antialiased",
      )}
    >
      <LandingHeader variant="heroDark" logoSrc={landingLogoSrc ?? "/logogabostock.png"} />

      <main>
        {/* Bannière : fond + contenu + maquettes */}
        <section
          className="relative overflow-x-clip overflow-y-visible border-b border-white/[0.06] text-white"
          style={{ backgroundColor: LAN.bg }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 720px 520px at 8% 100%, color-mix(in srgb, ${LAN.blue} 40%, transparent), transparent 54%),
                radial-gradient(ellipse 640px 440px at 94% -4%, color-mix(in srgb, ${LAN.green} 36%, transparent), transparent 56%),
                radial-gradient(ellipse 820px 360px at 92% 100%, color-mix(in srgb, ${LAN.blue} 14%, transparent), transparent 58%),
                radial-gradient(ellipse 520px 480px at 88% 38%, rgba(45, 212, 191, 0.14), transparent 58%)`,
            }}
          />
          <LandingScrollEffects />

          <div className="relative mx-auto max-w-[90rem] px-4 pt-6 sm:px-6 sm:pt-8 lg:px-12 lg:pt-10">
            <div className="grid max-w-7xl items-center gap-12 pb-10 sm:gap-16 sm:pb-14 lg:mx-auto lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start lg:gap-12 lg:pb-[5.5rem] xl:max-w-none xl:gap-16">
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
                  <span className="block text-[clamp(2.25rem,5.5vw,3.75rem)] text-white">
                    {heroTitleLine1 ?? "Gérez mieux."}
                  </span>
                  <span className="mt-1 block bg-gradient-to-r from-[#34C759] to-[#007AFF] bg-clip-text text-[clamp(2.5rem,6vw,4.25rem)] text-transparent">
                    {heroTitleLine2 ?? "Gagnez plus."}
                  </span>
                </h1>
              </ScrollReveal>

              <ScrollReveal delayMs={160}>
                <p className="mt-7 max-w-[28.5rem] text-[1.0625rem] leading-[1.65] text-[#94a3b8] sm:text-[1.0625rem] xl:text-[1.09375rem]">
                  {heroDescription ?? (
                    <>
                      GaboStock vous aide à suivre vos{" "}
                      <strong className="font-semibold text-white">ventes</strong>, gérer vos stocks,
                      maîtriser vos dépenses et fidéliser vos clients. Tout ce dont vous avez besoin
                      pour développer votre activité, en un seul endroit.
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

            <div className="relative z-[1] min-w-0 lg:flex lg:justify-end lg:pl-2">
              <LandingHeroMockupsComposition logoSrc={landingLogoSrc ?? "/logogabostock.png"} />
            </div>
            </div>
          </div>
        </section>

        <GabostockDailyChallengesSection imageSrc={dailyChallengesImageSrc ?? "/landing/defis-commerce.png"} />

        <GabostockSolutionShowcaseSection
          imageSrc={solutionImageSrc ?? "/landing/solution-commerce.png"}
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
          className="scroll-mt-20 border-b border-neutral-200/80 bg-fs-surface-container/40 py-16 dark:border-neutral-700/80 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal>
              <div className="mx-auto max-w-2xl text-center">
                <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-fs-accent/25 bg-fs-accent/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-fs-accent">
                  Parcours
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--fs-brand-stock)]" aria-hidden />
                  Simple
                </div>
                <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-fs-text sm:text-4xl">
                  Comment{" "}
                  <span className="bg-gradient-to-r from-fs-accent to-[var(--fs-brand-stock)] bg-clip-text text-transparent">
                    ça marche
                  </span>
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-[1.03rem] leading-relaxed text-fs-on-surface-variant">
                  Trois étapes pour sortir du chaos des fichiers dispersés et retrouver une vision unique de votre activité.
                </p>
              </div>
            </ScrollReveal>

            <ol className="mt-12 grid gap-6 lg:grid-cols-3 lg:gap-8">
              {STEPS.map((s, idx) => (
                <ScrollReveal key={s.step} delayMs={idx * 90}>
                  <li className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-fs-card p-8 shadow-sm transition hover:border-fs-accent/30 hover:shadow-md dark:border-neutral-700">
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
                        <h3 className="text-lg font-bold leading-snug text-fs-text">{s.title}</h3>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-fs-on-surface-variant">
                          Étape {s.step}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-[0.98rem] leading-relaxed text-fs-on-surface-variant">
                      {s.body}
                    </p>
                  </li>
                </ScrollReveal>
              ))}
            </ol>
          </div>
        </section>

        {/* Métiers */}
        <section
          id="metiers"
          className="scroll-mt-20 border-b border-neutral-200/80 py-16 dark:border-neutral-700/80 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Adapté à votre façon de vendre
              </h2>
              <p className="mt-4 text-lg text-fs-on-surface-variant">
                Détaillants, réseaux de points de vente ou activité avec dépôt : les mêmes bases,
                scalées selon votre organisation.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {METIERS.map((m) => (
                <article
                  key={m.title}
                  className="rounded-2xl border border-neutral-200 bg-gradient-to-b from-fs-card to-fs-surface-low p-8 dark:border-neutral-700 dark:from-fs-card dark:to-fs-surface-container"
                >
                  <m.icon className="h-10 w-10 text-fs-accent" aria-hidden />
                  <h3 className="mt-5 text-xl font-semibold">{m.title}</h3>
                  <p className="mt-3 text-fs-on-surface-variant">{m.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Compliance / assurance */}
        <section className="border-b border-neutral-200/80 bg-fs-surface-container/40 py-16 dark:border-neutral-700/80 sm:py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
            <div>
              <div className="inline-flex rounded-full border border-fs-accent/30 bg-fs-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-fs-accent dark:bg-fs-accent/15">
                Fiabilité
              </div>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Une architecture pensée pour le terrain
              </h2>
              <p className="mt-4 text-lg text-fs-on-surface-variant">
                Sessions sécurisées, sauvegardes et synchronisation lorsque vous étiez coupé du
                réseau — pour que vos opérations de caisse et de stock restent votre priorité.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Contrôle des accès par profil utilisateur",
                  "PWA pour retrouver l’app comme une application native",
                  "Documentation d’aide intégrée à l’espace application",
                ].map((line) => (
                  <li key={line} className="flex gap-3 text-fs-on-surface-variant">
                    <ShieldCheck className="h-6 w-6 shrink-0 text-[var(--fs-brand-stock)]" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-fs-card p-8 shadow-xl dark:border-neutral-700">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-fs-accent text-white">
                  <FileText className="h-6 w-6" aria-hidden />
                </div>
                <div>
                  <p className="font-semibold text-fs-text">Facturation & traçabilité</p>
                  <p className="mt-2 text-sm text-fs-on-surface-variant">
                    Prévisualisation des documents et supports d’encaissement pour garder une trace
                    claire entre la vente et le back-office — selon les modules activés dans votre
                    déploiement.
                  </p>
                </div>
              </div>
              <hr className="my-6 border-neutral-200 dark:border-neutral-600" />
              <p className="text-sm leading-relaxed text-fs-on-surface-variant">
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
          className="scroll-mt-20 border-t border-neutral-200/80 bg-fs-surface-container/50 py-16 dark:border-neutral-700/80 sm:py-20"
        >
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-fs-accent/25 bg-fs-accent/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.08em] text-fs-accent">
                FAQ
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--fs-brand-stock)]" aria-hidden />
                Support
              </div>
              <h2 className="mt-5 text-balance text-3xl font-extrabold tracking-tight text-fs-text sm:text-4xl">
                Questions{" "}
                <span className="bg-gradient-to-r from-fs-accent to-[var(--fs-brand-stock)] bg-clip-text text-transparent">
                  fréquentes
                </span>
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-[1.03rem] leading-relaxed text-fs-on-surface-variant">
                Les réponses aux questions les plus courantes avant de créer votre compte.
              </p>
            </div>

            <div className="mt-10 space-y-3">
              {FAQ_ITEMS.map((item) => (
                <details
                  key={item.q}
                  className="group overflow-hidden rounded-2xl border border-neutral-200 bg-fs-card shadow-sm transition hover:border-fs-accent/30 hover:shadow-md dark:border-neutral-700 [&_summary::-webkit-details-marker]:hidden"
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
                        <span className="block font-semibold leading-snug text-fs-text transition group-hover:text-fs-accent">
                          {item.q}
                        </span>
                        <span className="mt-1 block text-xs text-fs-on-surface-variant">
                          Cliquez pour afficher la réponse
                        </span>
                      </span>
                    </span>

                    <span
                      className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 bg-fs-surface text-fs-accent transition group-open:rotate-45 dark:border-neutral-600"
                      aria-hidden
                      title="Ouvrir"
                    >
                      +
                    </span>
                  </summary>
                  <div className="border-t border-neutral-200 px-5 pb-5 pt-4 text-sm leading-relaxed text-fs-on-surface-variant dark:border-neutral-600">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="border-t border-neutral-200/80 bg-gradient-to-br from-fs-accent/[0.12] via-fs-surface to-[color-mix(in_oklab,var(--fs-brand-stock)_14%,var(--fs-surface))] py-16 dark:border-neutral-700/80 dark:from-fs-accent/[0.18] sm:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {finalCtaTitle ?? <>Prêt à structurer votre activité&nbsp;?</>}
            </h2>
            <p className="mt-4 text-lg text-fs-on-surface-variant">
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
                className="inline-flex w-full max-w-xs items-center justify-center rounded-2xl border border-neutral-300 bg-fs-card/90 px-8 py-4 text-base font-semibold backdrop-blur dark:border-neutral-600"
              >
                Connexion
              </Link>
            </div>
          </div>
        </section>

        <LandingPartnersSection partners={partners} title={partnersTitle} subtitle={partnersSubtitle} />
      </main>

      <footer className="border-t border-neutral-200/80 bg-fs-surface-container/60 dark:border-neutral-700/80">
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
                  <p className="text-lg font-extrabold tracking-tight text-fs-text">
                    <span>Gabo</span>
                    <span className="text-[var(--fs-brand-stock)]">Stock</span>
                  </p>
                  <p className="text-sm text-fs-on-surface-variant">
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
                  className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-fs-card px-4 py-2 text-sm font-semibold text-fs-text hover:bg-fs-surface-low dark:border-neutral-600"
                >
                  Connexion
                </Link>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-fs-text">Produit</p>
              <ul className="mt-4 space-y-2 text-sm">
                {[
                  { href: "#fonctionnalites", label: "Fonctionnalités" },
                  { href: "#parcours", label: "Comment ça marche" },
                  { href: "#metiers", label: "Métiers" },
                  { href: "#faq", label: "FAQ" },
                ].map((l) => (
                  <li key={l.href}>
                    <a className="text-fs-on-surface-variant hover:text-fs-accent" href={l.href}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-bold text-fs-text">Ressources</p>
              <ul className="mt-4 space-y-2 text-sm">
                {[
                  { href: "/login", label: "Accéder à mon compte" },
                  { href: "/register/select-activity", label: "Créer un espace" },
                  { href: "/setup", label: "Configuration" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link className="text-fs-on-surface-variant hover:text-fs-accent" href={l.href}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-sm font-bold text-fs-text">Contact</p>
              <div className="mt-4 space-y-2 text-sm text-fs-on-surface-variant">
                <p>Support & démo</p>
                <p className="text-xs">
                  Un besoin spécifique (multi-magasins, dépôt, impression) ? Écrivez-nous et on vous
                  guide.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-neutral-200/80 pt-6 text-xs text-fs-on-surface-variant dark:border-neutral-700/80 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} Gabostock. Tous droits réservés.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <a href="#top" className="hover:text-fs-accent">
                Retour en haut
              </a>
              <span className="hidden sm:inline">•</span>
              <span className="text-[color-mix(in_oklab,var(--fs-on-surface-variant)_88%,transparent)]">
                Construit pour le terrain.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
