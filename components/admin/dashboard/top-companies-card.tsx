"use client";

import type { AdminTopCompanyRow } from "@/lib/features/admin/dashboard-types";
import { AdminCard } from "@/components/admin/admin-page-header";
import { VerticalBarsGroup } from "@/components/admin/dashboard/dashboard-charts";

const BAR = "#b45309";

export function TopCompaniesCard({
  title,
  rows,
  valueFormat,
  signedColors,
}: {
  title: string;
  rows: AdminTopCompanyRow[];
  valueFormat: (v: number) => string;
  /** Croissance % avec barres vertes / rouges */
  signedColors?: { positive: string; negative: string };
}) {
  const slice = rows.slice(0, 10);
  const items = slice.map((r) => ({
    id: `${r.companyId}-${title}`,
    label: r.companyName,
    value: toFinite(r.value),
  }));

  const max = (() => {
    if (slice.length === 0) return 1;
    if (signedColors) {
      return Math.max(1e-9, ...items.map((i) => Math.abs(i.value)));
    }
    return Math.max(1e-9, ...items.map((i) => Math.max(0, i.value)));
  })();

  const fmt = (n: number) => valueFormat(n);

  return (
    <AdminCard>
      <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
      <div className="mt-4">
        {items.length > 0 ? (
          <VerticalBarsGroup
            items={items}
            max={max}
            color={BAR}
            valueFormat={fmt}
            valueColorPositive={signedColors?.positive}
            valueColorNegative={signedColors?.negative}
          />
        ) : (
          <p className="text-sm text-slate-500 dark:text-neutral-500">Aucune donnée avec les filtres actuels.</p>
        )}
      </div>
    </AdminCard>
  );
}

function toFinite(n: number): number {
  return Number.isFinite(n) ? n : 0;
}
