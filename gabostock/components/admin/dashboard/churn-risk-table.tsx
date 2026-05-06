"use client";

import type { AdminCompanyScoreRow } from "@/lib/features/admin/dashboard-types";
import { AdminCard } from "@/components/admin/admin-page-header";

export function ChurnRiskTable({ rows }: { rows: AdminCompanyScoreRow[] }) {
  return (
    <AdminCard className="overflow-x-auto">
      <h3 className="text-base font-bold text-slate-900 dark:text-white">Risque de churn</h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-neutral-500">
        Indicateur combiné — inactivité commerciale, statut abonnement, fenêtre d&apos;échéance (heuristique).
      </p>
      <table className="mt-4 w-full min-w-[640px] border-collapse text-left text-sm">
        <thead className="border-b border-neutral-200 text-xs uppercase tracking-wide text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
          <tr>
            <th className="py-2 pr-3 font-semibold">Entreprise</th>
            <th className="py-2 pr-3 font-semibold">Risque /100</th>
            <th className="py-2 pr-3 font-semibold">Vent · période</th>
            <th className="py-2 font-semibold">Contexte</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`churn-${r.companyId}`} className="border-b border-neutral-100 dark:border-neutral-800">
              <td className="max-w-[200px] py-2.5 pr-3 font-semibold text-slate-900 dark:text-white">{r.companyName}</td>
              <td className="py-2 pr-3 tabular-nums text-red-800 dark:text-red-300">{Math.round(r.churnRisk)}</td>
              <td className="py-2 pr-3 tabular-nums text-neutral-700 dark:text-neutral-300">{r.salesCount}</td>
              <td className="py-2 text-xs text-neutral-600 dark:text-neutral-400">{r.lastActivityHint}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 ? <p className="mt-2 text-sm text-slate-500">Aucun score calculé.</p> : null}
    </AdminCard>
  );
}
