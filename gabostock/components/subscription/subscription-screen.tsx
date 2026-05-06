"use client";

import {
  FsCard,
  FsPage,
  FsScreenHeader,
} from "@/components/ui/fs-screen-primitives";
import { ROUTES } from "@/lib/config/routes";
import { P } from "@/lib/constants/permissions";
import { useAppContext } from "@/lib/features/common/app-context";
import { fetchSubscriptionPageData } from "@/lib/features/subscription/fetch-subscription-page";
import type { SubscriptionPlanDto } from "@/lib/features/subscription/types";
import { usePermissions } from "@/lib/features/permissions/use-permissions";
import { queryKeys } from "@/lib/query/query-keys";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  CircleHelp,
  CreditCard,
  Gem,
  HeadphonesIcon,
  Lock,
  Mail,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  MdCardMembership,
  MdCheck,
  MdClose,
  MdLock,
  MdPhone,
  MdStorefront,
  MdTrendingUp,
} from "react-icons/md";

function fmtStatusFr(s: string): string {
  const x = String(s ?? "").toLowerCase();
  if (x === "active") return "Actif";
  if (x === "trialing") return "Essai gratuit";
  if (x === "past_due") return "Impayé — action requise";
  if (x === "canceled" || x === "cancelled") return "Résiliation programmée / résilié";
  if (x === "expired") return "Expiré";
  return s || "—";
}

function fmtDateFr(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "long",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

function intervalLabel(interval: "month" | "year"): string {
  return interval === "year" ? "an" : "mois";
}

function formatPlanPrice(plan: SubscriptionPlanDto): string {
  if (plan.priceCents <= 0) return "Gratuit";
  const main = plan.priceCents / 100;
  return `${formatCurrency(main)} / ${intervalLabel(plan.interval)}`;
}

function pctUsed(current: number, cap: number | null): number {
  if (cap == null || cap <= 0) return 0;
  return Math.min(100, Math.round((current / cap) * 100));
}

/** Anneau circulaire de progression · usage (accessibilité : texte équivalent hors SVG). */
function ProgressRing({
  label,
  value,
  cap,
  sub,
}: {
  label: string;
  value: number;
  cap: number | null;
  sub?: string;
}) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const p = cap != null && cap > 0 ? Math.min(1, value / cap) : 0;
  const offset = c * (1 - p);

  const capTxt = cap == null ? "Illimité" : String(cap);
  const desc = `${value} utilisé(es) · plafond ${capTxt}`;
  const strokeColor =
    cap != null && value > cap ? "#ef4444" : p > 0.9 ? "#f59e0b" : "var(--fs-accent, var(--fs-palette-primary))";

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <span className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">{label}</span>
      <div className="relative h-36 w-36" aria-label={desc}>
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden>
          <circle className="stroke-neutral-200 dark:stroke-neutral-700" cx="60" cy="60" fill="none" r={r} strokeWidth="10" />
          <circle
            className="transition-[stroke-dashoffset] duration-500"
            style={{ stroke: strokeColor }}
            cx="60"
            cy="60"
            fill="none"
            r={r}
            strokeWidth="10"
            strokeDasharray={c}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black tabular-nums text-fs-text">{value}</span>
          <span className="text-[11px] text-neutral-500">
            {" / "}
            {cap == null ? "∞" : cap}
          </span>
        </div>
      </div>
      {sub ? <p className="max-w-[200px] text-[11px] leading-snug text-neutral-600 dark:text-neutral-400">{sub}</p> : null}
    </div>
  );
}

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "Comment fonctionne la facturation ?",
    a: "Les montants affichés sont ceux des offres publiées dans Gabostock. La facturation réelle peut passer par Stripe — le portail client s’ouvre dès qu’un compte Stripe est lié à votre entreprise.",
  },
  {
    q: "Que se passe-t-il si je dépasse les limites ?",
    a: "La plateforme peut appliquer un quota de boutiques (paramétré par l’administrateur Gabostock) en plus des limites du plan. Demandez une extension ou une offre supérieure avant d’être bloqué.",
  },
  {
    q: "Puis-je annuler à tout moment ?",
    a: "Selon votre mode de paiement, l’annulation peut être gérée depuis le portail Stripe ou en contactant l’équipe commerciale. Le statut « résiliation en fin de période » est indiqué sur cette page.",
  },
  {
    q: "Les prédictions IA sont-elles incluses ?",
    a: "L’accès au module IA dépend de votre offre et des options activées par Gabostock pour votre compte (visible dans les Prédictions IA).",
  },
  {
    q: "Où télécharger mes factures ?",
    a: "Dès que la facturation en ligne sera branchée, vos factures apparaîtront ici ou dans le portail Stripe. En attendant, recevez vos justificatifs via le support.",
  },
];

/** Comparaison synthétique (échelle par prix — du plus accessible au plus complet). */
function FeatureMatrix({ plans }: { plans: SubscriptionPlanDto[] }) {
  const sorted = [...plans].sort((a, b) => a.priceCents - b.priceCents);
  const n = sorted.length;
  const rows: { label: string; ok: (rank: number) => boolean }[] = [
    { label: "Base POS · produits · stock · achats", ok: () => true },
    { label: "Réseau & multi-points (quota selon offre)", ok: (rank) => rank > 0 || n === 1 },
    {
      label: "Modules étendus (dépôt, automatisations, rapports riches)",
      ok: (rank) => (n <= 2 ? rank >= 1 : rank >= Math.max(1, n - 2)),
    },
    { label: "Accompagnement & facturation prioritaire", ok: (rank) => n > 1 && rank === n - 1 },
  ];

  return (
    <div className="overflow-x-auto rounded-2xl border border-black/[0.06] dark:border-white/10">
      <table className="min-w-[640px] w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50/90 dark:border-neutral-800 dark:bg-neutral-900/70">
            <th className="px-4 py-3 font-bold text-fs-text">Fonctionnalité</th>
            {sorted.map((p) => (
              <th key={p.id} className="px-4 py-3 font-bold text-fs-text">
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={row.label} className={cn("border-b border-neutral-100 dark:border-neutral-800", ri % 2 === 0 ? "" : "bg-fs-surface/40")}>
              <td className="px-4 py-3 font-medium text-neutral-700 dark:text-neutral-300">{row.label}</td>
              {sorted.map((p, rank) => {
                const ok = row.ok(rank);
                return (
                  <td key={p.id} className="px-4 py-3 text-center">
                    {ok ? (
                      <MdCheck className="mx-auto inline h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-label="Inclus" />
                    ) : (
                      <MdClose className="mx-auto inline h-5 w-5 text-neutral-300 dark:text-neutral-600" aria-label="Non inclus" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SubscriptionScreen() {
  const ctx = useAppContext();
  const { hasPermission, helpers, isLoading: permLoading } = usePermissions();
  const companyId = ctx.data?.companyId ?? "";
  const companyNameCtx = ctx.data?.companyName ?? "";
  const canSettings = hasPermission(P.settingsManage);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const q = useQuery({
    queryKey: queryKeys.subscriptionPage(companyId),
    queryFn: () => fetchSubscriptionPageData(companyId),
    enabled: Boolean(companyId) && canSettings,
    staleTime: 45_000,
  });

  const effData = q.data;

  const effectiveCapStores = useMemo(() => {
    if (!effData?.currentPlan) return effData?.storeQuotaPlatform ?? null;
    const pl = effData.currentPlan.maxStores;
    if (pl == null) return effData.storeQuotaPlatform;
    return Math.min(pl, effData.storeQuotaPlatform);
  }, [effData]);

  const effectiveCapUsers = useMemo(() => {
    if (!effData?.currentPlan) return null;
    return effData.currentPlan.maxUsers;
  }, [effData]);

  if (permLoading || ctx.isLoading) {
    return (
      <FsPage className="min-[900px]:px-8 min-[900px]:py-7">
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-fs-accent border-t-transparent" />
        </div>
      </FsPage>
    );
  }

  if (helpers?.isCashier) {
    return (
      <FsPage className="min-[900px]:px-8 min-[900px]:py-7">
        <FsScreenHeader title="Abonnement" subtitle="Facturation & plan Gabostock" />
        <FsCard padding="p-8" className="mt-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <MdLock className="h-12 w-12 text-neutral-500" aria-hidden />
            <p className="text-sm font-medium text-neutral-600">Espace réservé aux comptes avec accès paramètres.</p>
            <Link href={ROUTES.sales} className="text-sm font-semibold text-fs-accent underline-offset-2 hover:underline">
              Retour aux ventes
            </Link>
          </div>
        </FsCard>
      </FsPage>
    );
  }

  if (!canSettings) {
    return (
      <FsPage className="min-[900px]:px-8 min-[900px]:py-7">
        <FsScreenHeader title="Abonnement" subtitle="Facturation & plan Gabostock" />
        <FsCard padding="p-8" className="mt-4">
          <div className="flex flex-col items-center gap-3 text-center">
            <Lock className="h-12 w-12 text-neutral-500" aria-hidden />
            <p className="text-sm font-medium text-neutral-600">Vous n&apos;avez pas accès à cette section.</p>
          </div>
        </FsCard>
      </FsPage>
    );
  }

  if (!companyId) {
    return (
      <FsPage className="min-[900px]:px-8 min-[900px]:py-7">
        <FsScreenHeader title="Abonnement" subtitle="Facturation & plan Gabostock" />
        <FsCard padding="p-8" className="mt-4">
          <p className="text-center text-sm text-neutral-600">Aucune entreprise associée.</p>
        </FsCard>
      </FsPage>
    );
  }

  if (q.isLoading || !effData) {
    return (
      <FsPage className="min-[900px]:px-8 min-[900px]:py-7">
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-fs-accent border-t-transparent" />
        </div>
      </FsPage>
    );
  }

  if (q.isError) {
    return (
      <FsPage className="min-[900px]:px-8 min-[900px]:py-7">
        <FsScreenHeader title="Abonnement" subtitle="Facturation & plan Gabostock" />
        <FsCard padding="p-6" className="mt-4 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">{(q.error as Error)?.message ?? "Chargement impossible."}</p>
        </FsCard>
      </FsPage>
    );
  }

  const d = effData;
  const sub = d.subscription;
  const planCurrent = d.currentPlan;
  return (
    <FsPage className="min-[900px]:px-8 min-[900px]:py-8">
      <div className="mx-auto max-w-6xl">
        <FsScreenHeader title="Centre d&apos;abonnement" subtitle="Plan, quotas et mise à niveau — Gabostock SaaS." />

        {/* Hero */}
        <div
          className={cn(
            "relative mt-7 overflow-hidden rounded-[28px] border border-black/[0.07] px-6 py-8 shadow-xl md:px-10 md:py-10",
            "bg-[linear-gradient(135deg,var(--fs-palette-chocolate)_0%,#14324a_45%,color-mix(in_srgb,var(--fs-palette-primary)_88%,black)_120%)]",
            "text-slate-100",
          )}
        >
          <div className="pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-fs-accent/20 blur-3xl" />

          <div className="relative flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0 space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/90">
                <Gem className="h-3.5 w-3.5" aria-hidden />
                {d.companyName || companyNameCtx}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-3xl font-black tracking-tight md:text-[2.1rem]">{planCurrent?.name ?? "Offre découverte"}</h2>
                {planCurrent?.slug === "free" ? (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white/95">Starter</span>
                ) : (
                  <span className="rounded-full bg-emerald-500/95 px-3 py-1 text-xs font-bold text-white shadow-inner">Professionnel</span>
                )}
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-white/80">
                Pilotez votre activité avec des limites transparentes · comparez les offres puis contactez Gabostock pour une migration
                facturée.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {sub?.status ? (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-black/25 px-3 py-1.5 text-xs font-semibold">
                    <MdCardMembership className="h-4 w-4" aria-hidden />
                    {fmtStatusFr(sub.status)}
                  </span>
                ) : null}
                {sub?.currentPeriodEnd ? (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-black/25 px-3 py-1.5 text-xs font-semibold">
                    <MdCardMembership className="h-4 w-4" aria-hidden />
                    Prochain évènement&nbsp;: {fmtDateFr(sub.currentPeriodEnd)}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-black/25 px-3 py-1.5 text-xs">
                    Cycle : illimité (offre découverte)
                  </span>
                )}
                {sub?.cancelAtPeriodEnd ? (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/50 bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-100">
                    Résiliation prévue à l&apos;échéance
                  </span>
                ) : null}
              </div>
            </div>
            <div className="shrink-0 rounded-2xl border border-white/15 bg-black/25 p-5 text-right shadow-inner backdrop-blur-sm">
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/65">Synthèse</p>
              <p className="mt-3 text-xs text-white/80">Prix catalogue</p>
              <p className="mt-1 text-2xl font-black tabular-nums text-white">
                {planCurrent ? formatPlanPrice(planCurrent) : "—"}
              </p>
              <Link
                href={ROUTES.settings}
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-fs-accent underline-offset-4 hover:text-white hover:underline"
              >
                Paramètres généraux
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Consommation */}
        <FsCard padding="p-7" className="mt-10 border border-fs-accent/25 shadow-[0_20px_50px_-20px_color-mix(in_srgb,var(--fs-palette-primary)_45%,transparent)]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/[0.06] pb-6 dark:border-white/10">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-black text-fs-text md:text-xl">
                <MdStorefront className="h-7 w-7 text-fs-accent" aria-hidden />
                Vos quotas en temps réel
              </h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                Ces indicateurs reflètent votre périmètre actuel&nbsp;: nombre de boutiques et d&apos;utilisateurs actifs rattachés à{" "}
                <strong className="text-fs-text">{d.companyName}</strong>.
              </p>
            </div>
            <Link
              href={`${ROUTES.stores}?from=subscription`}
              className="inline-flex items-center gap-2 rounded-[12px] border border-fs-accent/35 bg-fs-accent/12 px-4 py-2.5 text-sm font-bold text-fs-accent hover:bg-fs-accent hover:text-white"
            >
              <MdTrendingUp className="h-5 w-5" aria-hidden />
              Ajuster vos boutiques
            </Link>
          </div>

          <div className="mx-auto mt-10 flex flex-col items-center justify-center gap-12 md:flex-row md:gap-20">
            <ProgressRing
              label="Boutiques utilisées"
              value={d.storeCount}
              cap={effectiveCapStores}
              sub={`Quota plateforme : ${d.storeQuotaPlatform} boutique(s)`}
            />
            <ProgressRing
              label="Membres actifs"
              value={d.activeMemberCount}
              cap={effectiveCapUsers}
              sub={
                effectiveCapUsers == null
                  ? "Utilisateurs : limite ouverte dans le catalogue"
                  : `${pctUsed(d.activeMemberCount, effectiveCapUsers)} % du quota plan`
              }
            />
          </div>
        </FsCard>

        {/* Catalogue de plans */}
        <div className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-4 px-1">
            <div>
              <h3 className="text-xl font-black text-fs-text md:text-2xl">Comparer les plans</h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Choisissez l&apos;offre qui accompagne votre croissance · migration via l&apos;équipe commerciale.</p>
            </div>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {d.plans.map((p) => {
              const active = Boolean(planCurrent?.id === p.id);
              return (
                <div
                  key={p.id}
                  className={cn(
                    "relative flex flex-col rounded-[22px] border p-6 shadow-md transition-[transform] hover:-translate-y-0.5",
                    active
                      ? "border-fs-accent bg-[linear-gradient(180deg,var(--fs-surface)_0%,color-mix(in_srgb,var(--fs-accent)_06%,transparent)_100%)] ring-2 ring-fs-accent/30"
                      : "border-black/[0.07] bg-fs-card hover:border-fs-accent/35 dark:border-white/10",
                  )}
                >
                  {active ? (
                    <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-fs-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                      <BadgeCheck className="h-4 w-4" />
                      Actuel
                    </span>
                  ) : null}
                  <p className="text-xs font-black uppercase tracking-widest text-neutral-500">{p.slug}</p>
                  <h4 className="mt-2 text-xl font-black text-fs-text">{p.name}</h4>
                  <p className="mt-2 min-h-[40px] text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{p.description ?? "—"}</p>
                  <div className="mt-6 text-3xl font-black tracking-tight text-fs-text">{formatPlanPrice(p)}</div>
                  <ul className="mt-6 space-y-3 text-sm font-medium">
                    <li className="flex gap-3">
                      <MdCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                      Boutiques incluses&nbsp;:{" "}
                      <span className="font-bold text-fs-text">{p.maxStores ?? "Sans limite pratique plan"}</span>
                    </li>
                    <li className="flex gap-3">
                      <MdCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                      Utilisateurs&nbsp;:{" "}
                      <span className="font-bold text-fs-text">{p.maxUsers ?? "Flexible"}</span>
                    </li>
                    <li className="flex gap-3">
                      <MdCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
                      Cycle : <span className="font-bold capitalize text-fs-text">{intervalLabel(p.interval)}</span>
                    </li>
                  </ul>
                  <div className="mt-auto pt-8">
                    {active ? (
                      <button
                        type="button"
                        disabled
                        className="w-full rounded-[14px] border border-black/[0.08] bg-fs-surface py-4 text-center text-sm font-bold text-neutral-500 dark:border-white/10"
                      >
                        Votre offre actuelle
                      </button>
                    ) : (
                      <Link
                        href={ROUTES.help}
                        className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-fs-accent py-4 text-sm font-bold text-white shadow-lg shadow-fs-accent/30 hover:bg-fs-accent/95"
                      >
                        <Sparkles className="h-5 w-5" aria-hidden />
                        Demander cette offre
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Portail paiement */}
        <FsCard padding="p-7" className="mt-14 border fs-border">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="min-w-0">
              <h3 className="flex items-center gap-2 text-lg font-black text-fs-text md:text-xl">
                <CreditCard className="h-6 w-6 text-fs-accent" aria-hidden />
                Portail paiement Stripe
              </h3>
              <p className="mt-2 max-w-xl text-sm text-neutral-600 dark:text-neutral-400">
                Lorsqu&apos;un compte Stripe est associé (&quot;stripe_customer_id&quot;) vous pourrez modifier votre carte, vos factures et l&apos;historique depuis le portail hébergé par Stripe —
                liaison côté infrastructure Gabostock.
              </p>
              <dl className="mt-6 space-y-2 text-[13px]">
                <div className="flex flex-wrap gap-2">
                  <dt className="font-bold text-fs-text">Compte Stripe :</dt>
                  <dd className="rounded-lg bg-fs-surface-container px-2 py-0.5 font-mono text-xs text-neutral-700 dark:text-neutral-300">
                    {sub?.stripeCustomerId ?? "non lié"}
                  </dd>
                </div>
                <div className="flex flex-wrap gap-2">
                  <dt className="font-bold text-fs-text">Abonnement Stripe :</dt>
                  <dd className="rounded-lg bg-fs-surface-container px-2 py-0.5 font-mono text-xs text-neutral-700 dark:text-neutral-300">
                    {sub?.stripeSubscriptionId ?? "aucun lien API"}
                  </dd>
                </div>
              </dl>
            </div>
            <button
              type="button"
              disabled={!sub?.stripeCustomerId}
              title={sub?.stripeCustomerId ? undefined : "Liaison Stripe requise côté plateforme."}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-[14px] px-6 py-3.5 text-sm font-bold shadow-sm",
                sub?.stripeCustomerId
                  ? "bg-fs-accent text-white hover:bg-fs-accent/95"
                  : "cursor-not-allowed bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500",
              )}
              onClick={() => {
                if (sub?.stripeCustomerId) {
                  alert("Ouverture du portail Stripe : branchez votre Edge Function / Billing pour activer cette action.");
                }
              }}
            >
              <Sparkles className="h-5 w-5" aria-hidden />
              Ouvrir le portail
            </button>
          </div>
        </FsCard>

        {/* Tableau fonctionnalités */}
        <section className="mt-14">
          <div className="mb-6 px-1">
            <h3 className="text-xl font-black text-fs-text md:text-2xl">Matrice fonctionnelle (résumée)</h3>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              Synthèse marketing — vérifiez toujours le détail métier avant signature.
            </p>
          </div>
          {d.plans.length > 0 ? <FeatureMatrix plans={d.plans} /> : (
            <p className="text-sm text-neutral-500">Plans non publiés en base pour le moment.</p>
          )}
        </section>

        {/* FAQ */}
        <section className="mt-14 rounded-[26px] border border-fs-accent/20 bg-fs-surface/80 px-6 py-8 dark:bg-neutral-950/40 md:px-10">
          <h3 className="flex items-center gap-3 text-xl font-black text-fs-text md:text-2xl">
            <CircleHelp className="h-8 w-8 text-fs-accent" aria-hidden />
            Questions fréquentes
          </h3>
          <div className="mt-8 space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const open = openFaq === idx;
              return (
                <div key={idx} className="overflow-hidden rounded-2xl border border-black/[0.06] bg-fs-card dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : idx)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-bold text-fs-text hover:bg-fs-accent/05"
                  >
                    {item.q}
                    <CalendarClock className={cn("h-5 w-5 shrink-0 text-fs-accent transition", open && "rotate-90")} />
                  </button>
                  {open ? <div className="border-t border-black/[0.05] px-5 py-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{item.a}</div> : null}
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA pied de page */}
        <div className="mt-16 flex flex-col items-center rounded-[26px] border border-black/[0.08] bg-gradient-to-br from-fs-card via-fs-card to-fs-surface px-6 py-12 text-center shadow-inner dark:border-white/10">
          <Gem className="h-14 w-14 text-fs-accent opacity-95" aria-hidden />
          <h3 className="mt-6 text-2xl font-black text-fs-text md:text-[1.85rem]">Besoin d&apos;aller plus loin ?</h3>
          <p className="mx-auto mt-3 max-w-lg text-sm text-neutral-600 dark:text-neutral-400">
            Un chargé Gabostock vous accompagne sur la facturation consolidée multi-boutiques, les intégrations API et vos options dépôt.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="mailto:contact@gabostock.com?subject=Offre Gabostock"
              className="inline-flex items-center gap-2 rounded-[14px] bg-fs-accent px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-fs-accent/30 hover:bg-fs-accent/95"
            >
              <Mail className="h-5 w-5" aria-hidden />
              Écrire au commercial
            </a>
            <Link
              href={ROUTES.help}
              className="inline-flex items-center gap-2 rounded-[14px] border border-fs-accent/35 bg-fs-card px-7 py-3.5 text-sm font-bold text-fs-accent hover:bg-fs-accent hover:text-white"
            >
              <HeadphonesIcon className="h-5 w-5" aria-hidden />
              Centre d&apos;aide
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-[13px] text-neutral-600 dark:text-neutral-400">
            <span className="inline-flex items-center gap-2">
              <MdPhone className="h-4 w-4 text-fs-accent" aria-hidden />
              Support téléphonique sur demande
            </span>
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-fs-accent" aria-hidden />
              IA & créances — options entreprise
            </span>
          </div>
        </div>

        {/* Mention légère */}
        <p className="mt-12 text-center text-[11px] leading-relaxed text-neutral-400 dark:text-neutral-600">
          Les montants TTC suivent la devise XOF configurée dans `subscription_plans`. Gabostock ne constitue pas un conseil juridique ni fiscal —
          vérifiez vos obligations locales.
        </p>
      </div>
    </FsPage>
  );
}
