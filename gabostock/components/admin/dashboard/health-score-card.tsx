"use client";

import { AdminCard } from "@/components/admin/admin-page-header";

export function HealthScoreCard({
  score,
  companiesSaleToday,
  storesSellingToday,
  auditTouchesTodayApprox,
  syncHints,
  critical24h,
}: {
  score: number;
  companiesSaleToday: number;
  storesSellingToday: number;
  auditTouchesTodayApprox: number;
  syncHints: number;
  critical24h: number;
}) {
  const tone =
    score >= 75 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-600";
  return (
    <AdminCard>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Santé plateforme</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">
            Synthèse : activité, abonnements, erreurs app (agrégée, indicatif).
          </p>
        </div>
        <div className={`text-5xl font-black tabular-nums leading-none ${tone}`}>{score}</div>
      </div>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-100 bg-slate-50/90 p-3 dark:border-neutral-700 dark:bg-neutral-900/50">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Entreprises actives · ventes aujourd’hui</dt>
          <dd className="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-white">{companiesSaleToday}</dd>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/90 p-3 dark:border-neutral-700 dark:bg-neutral-900/50">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Boutiques · ventes aujourd’hui</dt>
          <dd className="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-white">{storesSellingToday}</dd>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/90 p-3 dark:border-neutral-700 dark:bg-neutral-900/50">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Évènements audit (UTC · jour)</dt>
          <dd className="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-white">{auditTouchesTodayApprox}</dd>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/90 p-3 dark:border-neutral-700 dark:bg-neutral-900/50">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Indices « synchro » (audit)</dt>
          <dd className="mt-1 text-xl font-bold tabular-nums text-slate-900 dark:text-white">{syncHints}</dd>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/90 p-3 dark:border-neutral-700 dark:bg-neutral-900/50">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Erreurs critiques / bloquantes 24 h</dt>
          <dd className="mt-1 text-xl font-bold tabular-nums text-red-700 dark:text-red-400">{critical24h}</dd>
        </div>
      </dl>
    </AdminCard>
  );
}
