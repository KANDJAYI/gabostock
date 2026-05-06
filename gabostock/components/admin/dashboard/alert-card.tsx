"use client";

import type { AdminDashboardAlertItem } from "@/lib/features/admin/dashboard-types";
import { AdminCard } from "@/components/admin/admin-page-header";
import { MdWarning, MdErrorOutline, MdInfoOutline } from "react-icons/md";

function IconFor({ severity }: { severity: AdminDashboardAlertItem["severity"] }) {
  switch (severity) {
    case "critical":
      return <MdErrorOutline className="h-5 w-5 text-red-600" aria-hidden />;
    case "warning":
      return <MdWarning className="h-5 w-5 text-amber-600" aria-hidden />;
    default:
      return <MdInfoOutline className="h-5 w-5 text-sky-600" aria-hidden />;
  }
}

export function AlertCard({ items }: { items: AdminDashboardAlertItem[] }) {
  if (items.length === 0) {
    return (
      <AdminCard>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Alertes intelligentes</h3>
        <p className="mt-3 text-sm text-slate-600 dark:text-neutral-400">Aucune alerte structurée sur les critères actuels.</p>
      </AdminCard>
    );
  }
  return (
    <AdminCard>
      <h3 className="text-base font-bold text-slate-900 dark:text-white">Alertes intelligentes</h3>
      <ul className="mt-4 space-y-2">
        {items.map((a) => (
          <li
            key={a.id}
            className="flex gap-3 rounded-xl border border-black/[0.06] bg-slate-50/90 px-3 py-2.5 dark:border-neutral-700 dark:bg-neutral-900/40"
          >
            <IconFor severity={a.severity} />
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-snug text-slate-900 dark:text-neutral-100">{a.title}</p>
              {a.detail ? <p className="mt-1 text-xs text-slate-600 dark:text-neutral-400">{a.detail}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </AdminCard>
  );
}
