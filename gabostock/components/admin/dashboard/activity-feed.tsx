"use client";

import type { AdminDashboardActivityItem } from "@/lib/features/admin/dashboard-types";
import { AdminCard } from "@/components/admin/admin-page-header";

function kindBadge(k: AdminDashboardActivityItem["kind"]): string {
  switch (k) {
    case "sale":
      return "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100";
    case "product":
      return "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-100";
    case "subscription":
      return "border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-100";
    case "error":
      return "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100";
    default:
      return "border-neutral-200 bg-neutral-50 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100";
  }
}

export function ActivityFeed({ items }: { items: AdminDashboardActivityItem[] }) {
  const sorted = [...items].sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, 42);
  return (
    <AdminCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Activité temps réel (audit récent)</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-neutral-500">
            Derniers évènements enrichis depuis le journal d&apos;audit Gabostock.
          </p>
        </div>
      </div>
      <div className="relative mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
        <div aria-hidden className="pointer-events-none absolute left-[11px] top-3 bottom-2 w-px bg-slate-200 dark:bg-neutral-700" />
        {sorted.map((ev) => (
          <article key={ev.id} className="relative flex gap-3 pl-1">
            <span
              className={`mt-1.5 inline-block h-3 w-3 shrink-0 rounded-full border-2 border-white dark:border-fs-surface dark:bg-fs-surface ${kindBadge(ev.kind)}`}
              style={{ marginLeft: 1 }}
              aria-hidden
            />
            <div className="min-w-0 flex-1 rounded-xl border border-black/[0.06] bg-fs-card px-3 py-2 dark:border-neutral-800">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{ev.title}</span>
                <time dateTime={ev.at} className="text-[11px] text-slate-500 dark:text-neutral-500">
                  {new Date(ev.at).toLocaleString("fr-FR")}
                </time>
              </div>
              {ev.detail ? (
                <p className="mt-1 truncate text-[13px] text-slate-600 dark:text-neutral-400" title={ev.detail}>
                  {ev.detail}
                </p>
              ) : null}
            </div>
          </article>
        ))}
        {sorted.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-neutral-500">Pas d&apos;évènements audit récupérés.</p>
        ) : null}
      </div>
    </AdminCard>
  );
}
