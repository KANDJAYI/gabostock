"use client";

import type { AdminPeriodPreset } from "@/lib/features/admin/dashboard-types";

const PRESETS: { id: AdminPeriodPreset; label: string }[] = [
  { id: "today", label: "Aujourd’hui" },
  { id: "7d", label: "7 j" },
  { id: "30d", label: "30 j" },
  { id: "month", label: "Mois" },
  { id: "year", label: "Année" },
  { id: "custom", label: "Perso." },
];

export function DashboardFiltersBar({
  preset,
  onPreset,
  companyId,
  onCompanyId,
  companies,
  storeId,
  onStoreId,
  stores,
  subscriptionStatus,
  onSubscriptionStatus,
  city,
  onCity,
  customFrom,
  customTo,
  onCustomRange,
}: {
  preset: AdminPeriodPreset;
  onPreset: (v: AdminPeriodPreset) => void;
  companyId: string;
  onCompanyId: (v: string) => void;
  companies: Array<{ id: string; name: string }>;
  storeId: string;
  onStoreId: (v: string) => void;
  stores: Array<{ id: string; name: string }>;
  subscriptionStatus: string;
  onSubscriptionStatus: (v: string) => void;
  city: string;
  onCity: (v: string) => void;
  customFrom: string;
  customTo: string;
  onCustomRange: (from: string, to: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-fs-card via-white to-fs-surface px-4 py-4 shadow-sm dark:border-neutral-700 dark:from-neutral-900 dark:to-neutral-950">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
        Filtres globaux plateforme
      </p>
      <div className="mt-3 flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-end">
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onPreset(p.id)}
              className={`rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                preset === p.id
                  ? "bg-[var(--fs-palette-primary)] text-white shadow-md"
                  : "border border-black/[0.08] bg-fs-card text-slate-800 hover:bg-slate-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {preset === "custom" ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-2 dark:border-neutral-800 xl:border-0 xl:pt-0">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Du</label>
            <input
              type="date"
              value={customFrom.slice(0, 10)}
              onChange={(e) => onCustomRange(e.target.value, customTo)}
              className="rounded-lg border border-black/[0.1] px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-950"
            />
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Au</label>
            <input
              type="date"
              value={customTo.slice(0, 10)}
              onChange={(e) => onCustomRange(customFrom, e.target.value)}
              className="rounded-lg border border-black/[0.1] px-2 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-950"
            />
          </div>
        ) : null}

        <div className="grid w-full gap-3 min-[560px]:grid-cols-2 xl:ml-auto xl:max-w-4xl xl:grid-cols-4 xl:gap-2">
          <label className="flex min-w-0 flex-col gap-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Entreprise
            <select
              value={companyId}
              onChange={(e) => onCompanyId(e.target.value)}
              className="rounded-xl border border-black/[0.1] px-3 py-2 text-sm font-medium dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
            >
              <option value="">Toutes</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Boutique
            <select
              value={storeId}
              onChange={(e) => onStoreId(e.target.value)}
              className="rounded-xl border border-black/[0.1] px-3 py-2 text-sm font-medium dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
            >
              <option value="">Toutes</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Statut abonnement
            <select
              value={subscriptionStatus}
              onChange={(e) => onSubscriptionStatus(e.target.value)}
              className="rounded-xl border border-black/[0.1] px-3 py-2 text-sm font-medium dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
            >
              <option value="">Tous</option>
              <option value="trialing">Essai</option>
              <option value="active">Actif</option>
              <option value="past_due">Impayé</option>
              <option value="canceled">Résilié</option>
              <option value="expired">Expiré</option>
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-1 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Ville (adresse boutique)
            <input
              value={city}
              onChange={(e) => onCity(e.target.value)}
              placeholder="Recherche…"
              className="rounded-xl border border-black/[0.1] px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
