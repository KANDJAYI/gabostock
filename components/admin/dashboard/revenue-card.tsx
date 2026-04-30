"use client";

import { AdminCard } from "@/components/admin/admin-page-header";
import { formatCurrency } from "@/lib/utils/currency";

export function RevenueCard({
  mrr,
  arr,
  collected,
  expected,
  arrearsCompanies,
  renew7,
  trialsSoon,
}: {
  mrr: number;
  arr: number;
  collected: number;
  expected: number;
  arrearsCompanies: number;
  renew7: number;
  trialsSoon: number;
}) {
  return (
    <AdminCard>
      <h3 className="text-base font-bold text-slate-900 dark:text-white">
        Revenus Gabostock (estimation SaaS · hors paiements Stripe directs)
      </h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">
        Séparés du CA commerçants (ventes boutiques). Les encaissements réels suivent vos outils financiers Stripe / banque.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat label="MRR estimé" value={formatCurrency(mrr)} />
        <MiniStat label="ARR approximatif (MRR × 12)" value={formatCurrency(arr)} />
        <MiniStat label="Encaissé (pas suivi dans l&apos;app)" value={collected <= 0 ? "—" : formatCurrency(collected)} />
        <MiniStat label="Attendu (plans actifs)" value={formatCurrency(expected)} />
      </div>
      <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm dark:bg-neutral-900/60 sm:grid-cols-3">
        <div>
          <span className="text-neutral-600 dark:text-neutral-400">Employeurs en retard (past_due)</span>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{arrearsCompanies}</p>
        </div>
        <div>
          <span className="text-neutral-600 dark:text-neutral-400">À renouveler sous 7 jours</span>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{renew7}</p>
        </div>
        <div>
          <span className="text-neutral-600 dark:text-neutral-400">Essais expirent bientôt</span>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{trialsSoon}</p>
        </div>
      </div>
    </AdminCard>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-black/[0.06] bg-fs-card px-4 py-3 dark:border-neutral-700">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">{label}</p>
      <p className="mt-1 text-lg font-bold tabular-nums text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
