"use client";

import { RevenueChart } from "@/components/pro/revenue-chart";
import { StatusBadge } from "@/components/pro/status-badge";
import { ROUTES } from "@/lib/config/routes";
import {
  PERIOD_OPTIONS,
  PERIOD_RANGE_LABEL,
  computeKpis,
  periodStart,
  revenueBuckets,
  type StatPeriod,
} from "@/lib/features/pro/analytics";
import { listProDocuments } from "@/lib/features/pro/documents/api";
import type { ProDocument } from "@/lib/features/pro/documents/types";
import { getIssuer } from "@/lib/features/pro/issuer/api";
import { formatDateFr, formatMoney } from "@/lib/features/pro/format";
import { cn } from "@/lib/utils/cn";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  FileText,
  ReceiptText,
  Sparkles,
  TrendingUp,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export function FacturationHome() {
  const [devis, setDevis] = useState<ProDocument[]>([]);
  const [factures, setFactures] = useState<ProDocument[]>([]);
  const [issuerName, setIssuerName] = useState<string | null>(null);
  const [currency, setCurrency] = useState("XOF");
  const [needsProfile, setNeedsProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<StatPeriod>("month");

  useEffect(() => {
    (async () => {
      try {
        const [d, f, iss] = await Promise.all([
          listProDocuments("devis"),
          listProDocuments("facture"),
          getIssuer(),
        ]);
        setDevis(d);
        setFactures(f);
        setIssuerName(iss?.business_name ?? null);
        setCurrency(iss?.currency ?? "XOF");
        setNeedsProfile(!iss?.business_name?.trim());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const { kpis, buckets } = useMemo(() => {
    const start = periodStart(period);
    return {
      kpis: computeKpis(devis, factures, start),
      buckets: revenueBuckets(factures, period),
    };
  }, [devis, factures, period]);

  const recent = useMemo(
    () =>
      [...devis, ...factures]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 6),
    [devis, factures],
  );

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Bonjour{issuerName ? `, ${issuerName}` : ""} 👋
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Vue d&apos;ensemble de votre activité de facturation.
          </p>
        </div>
        <Link
          href={ROUTES.facturationApercu}
          className="inline-flex items-center gap-1.5 rounded-lg border border-fs-accent/25 bg-fs-accent/5 px-3 py-1.5 text-sm font-semibold text-fs-accent transition-colors hover:bg-fs-accent/10"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          Voir un exemple
        </Link>
      </div>

      {needsProfile && !loading ? (
        <Link
          href={ROUTES.facturationProfil}
          className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 hover:bg-amber-100"
        >
          <span>
            Complétez votre <b>profil émetteur</b> (nom, logo, coordonnées) pour
            des documents professionnels.
          </span>
          <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
        </Link>
      ) : null}

      {/* Sélecteur de période */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-neutral-700">Statistiques</h2>
        <div className="inline-flex rounded-xl border border-black/[0.08] bg-fs-card p-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPeriod(opt.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors",
                period === opt.value
                  ? "bg-fs-accent text-white"
                  : "text-neutral-600 hover:text-fs-accent",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tuiles KPI */}
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={Wallet}
          tone="emerald"
          label="Encaissé"
          value={formatMoney(kpis.revenue, currency)}
          caption="Factures payées"
          loading={loading}
        />
        <StatTile
          icon={TrendingUp}
          tone="accent"
          label="Facturé"
          value={formatMoney(kpis.invoiced, currency)}
          caption={`${kpis.invoiceCount} facture${kpis.invoiceCount > 1 ? "s" : ""}`}
          loading={loading}
        />
        <StatTile
          icon={Clock}
          tone="amber"
          label="En attente"
          value={formatMoney(kpis.pending, currency)}
          caption="Reste à encaisser"
          loading={loading}
        />
        <StatTile
          icon={BadgeCheck}
          tone="violet"
          label="Devis en cours"
          value={formatMoney(kpis.quotesValue, currency)}
          caption={`${kpis.quotesCount} devis`}
          loading={loading}
        />
      </div>

      {/* Graphique */}
      <div className="mt-3 rounded-2xl border border-black/[0.06] bg-fs-card p-4 sm:p-5">
        <div className="mb-1 flex items-baseline justify-between gap-3">
          <h3 className="text-sm font-bold text-fs-text">Montant facturé</h3>
          <span className="text-xs font-medium text-neutral-400">
            {PERIOD_RANGE_LABEL[period]}
          </span>
        </div>
        <RevenueChart data={buckets} currency={currency} />
      </div>

      {/* Actions rapides */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickCard
          href={`${ROUTES.facturationDevis}/new`}
          icon={FileText}
          title="Nouveau devis"
          subtitle={`${devis.length} au total`}
        />
        <QuickCard
          href={`${ROUTES.facturationFactures}/new`}
          icon={ReceiptText}
          title="Nouvelle facture"
          subtitle={`${factures.length} au total`}
        />
        <QuickCard
          href={ROUTES.facturationClients}
          icon={Users}
          title="Clients"
          subtitle="Carnet d'adresses"
        />
        <QuickCard
          href={ROUTES.facturationProfil}
          icon={UserCog}
          title="Profil émetteur"
          subtitle="Logo & coordonnées"
        />
      </div>

      {/* Récents */}
      <div className="mt-7">
        <h2 className="mb-3 text-sm font-bold text-neutral-700">
          Documents récents
        </h2>
        {loading ? (
          <p className="py-8 text-center text-sm text-neutral-500">Chargement…</p>
        ) : recent.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-fs-card py-10 text-center text-sm text-neutral-600">
            Rien pour l&apos;instant — créez votre premier devis ou facture.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {recent.map((doc) => {
              const href = `${
                doc.kind === "devis"
                  ? ROUTES.facturationDevis
                  : ROUTES.facturationFactures
              }/${doc.id}`;
              return (
                <li key={doc.id}>
                  <Link
                    href={href}
                    className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.06] bg-fs-card p-3.5 hover:border-fs-accent/30"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-fs-accent/10 text-fs-accent">
                        {doc.kind === "devis" ? (
                          <FileText className="h-4 w-4" />
                        ) : (
                          <ReceiptText className="h-4 w-4" />
                        )}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{doc.number}</span>
                          <StatusBadge status={doc.status} />
                        </div>
                        <p className="truncate text-xs text-neutral-500">
                          {doc.client_name || "Sans client"} ·{" "}
                          {formatDateFr(doc.issue_date)}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 font-bold">
                      {formatMoney(doc.total, doc.currency)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

const TONES: Record<string, string> = {
  accent: "bg-fs-accent/10 text-fs-accent",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  violet: "bg-violet-50 text-violet-600",
};

function StatTile({
  icon: Icon,
  tone,
  label,
  value,
  caption,
  loading,
}: {
  icon: typeof Wallet;
  tone: keyof typeof TONES | string;
  label: string;
  value: string;
  caption: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-fs-card p-4">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            TONES[tone] ?? TONES.accent,
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
          {label}
        </span>
      </div>
      <p className="mt-2.5 truncate text-xl font-bold tabular-nums text-fs-text">
        {loading ? "…" : value}
      </p>
      <p className="mt-0.5 text-xs text-neutral-500">{caption}</p>
    </div>
  );
}

function QuickCard({
  href,
  icon: Icon,
  title,
  subtitle,
}: {
  href: string;
  icon: typeof FileText;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-black/[0.06] bg-fs-card p-4 transition-colors hover:border-fs-accent/30"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-fs-accent/10 text-fs-accent">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <p className="mt-3 font-semibold">{title}</p>
      <p className="text-xs text-neutral-500">{subtitle}</p>
    </Link>
  );
}
