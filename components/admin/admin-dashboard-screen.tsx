"use client";

import { AdminCard, AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  adminGetSalesByCompany,
  adminGetSalesOverTime,
  adminGetStats,
} from "@/lib/features/admin/api";
import { formatCurrency } from "@/lib/utils/currency";
import { useQuery } from "@tanstack/react-query";
import {
  MdBusiness,
  MdCardMembership,
  MdPeople,
  MdShoppingCart,
  MdStore,
  MdTrendingUp,
} from "react-icons/md";

/** Aligné sur `app/globals.css` — palette Gabostock (KPI / graphiques admin). */
const PALETTE = {
  primary: "#f97316",
  forest: "#2f3a32",
  sage: "#545748",
  caramel: "#db9f75",
  terracotta: "#804012",
  chocolate: "#3e2411",
} as const;

function SimpleLineChart({
  data,
  maxY,
}: {
  data: { date: string; total: number }[];
  maxY: number;
}) {
  const w = 800;
  const h = 240;
  const pad = 8;
  const n = Math.max(data.length, 1);
  const my = maxY > 0 ? maxY : 1;
  const pts = data.map((d, i) => {
    const x = n <= 1 ? w / 2 : pad + (i / (n - 1)) * (w - pad * 2);
    const y = h - pad - (d.total / my) * (h - pad * 2);
    return `${x},${y}`;
  });
  const pathD = pts.length ? `M ${pts.join(" L ")}` : "";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-64 w-full max-w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={PALETTE.primary} stopOpacity="0.22" />
          <stop offset="100%" stopColor={PALETTE.primary} stopOpacity="0.03" />
        </linearGradient>
      </defs>
      {pathD ? (
        <>
          <path
            d={`${pathD} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`}
            fill="url(#lineFill)"
          />
          <path d={pathD} fill="none" stroke={PALETTE.primary} strokeWidth="2.5" />
        </>
      ) : null}
    </svg>
  );
}

function BarRow({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-24 shrink-0 truncate text-slate-600" title={label}>
        {label.length > 14 ? `${label.slice(0, 13)}…` : label}
      </span>
      <div className="h-6 min-w-0 flex-1 overflow-hidden rounded bg-slate-100">
        <div className="h-full rounded" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="w-20 shrink-0 text-right font-semibold text-slate-800">{value}</span>
    </div>
  );
}

export function AdminDashboardScreen() {
  const q = useQuery({
    queryKey: ["admin-dashboard"] as const,
    queryFn: async () => {
      const [stats, salesByCompany, salesOverTime] = await Promise.all([
        adminGetStats(),
        adminGetSalesByCompany(),
        adminGetSalesOverTime(30),
      ]);
      return { stats, salesByCompany, salesOverTime };
    },
  });

  if (q.isLoading || !q.data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[color-mix(in_srgb,var(--fs-palette-primary)_35%,transparent)] border-t-[var(--fs-palette-primary)]" />
      </div>
    );
  }

  if (q.isError) {
    return (
      <div className="p-8">
        <p className="text-sm font-semibold text-red-600">{(q.error as Error)?.message ?? "Erreur"}</p>
      </div>
    );
  }

  const { stats, salesByCompany, salesOverTime } = q.data;
  const maxLine = Math.max(...salesOverTime.map((d) => d.total), 1);
  const topCa = salesByCompany.slice(0, 10);
  const maxCa = Math.max(...topCa.map((x) => x.totalAmount), 1);
  const topSales = [...salesByCompany].sort((a, b) => b.salesCount - a.salesCount).slice(0, 10);
  const maxSc = Math.max(...topSales.map((x) => x.salesCount), 1);

  const kpis = [
    { icon: MdBusiness, label: "Entreprises", value: String(stats.companiesCount), color: PALETTE.terracotta },
    { icon: MdStore, label: "Boutiques", value: String(stats.storesCount), color: PALETTE.primary },
    { icon: MdPeople, label: "Utilisateurs", value: String(stats.usersCount), color: PALETTE.sage },
    { icon: MdCardMembership, label: "Abonnements actifs", value: String(stats.activeSubscriptionsCount), color: PALETTE.caramel },
    { icon: MdShoppingCart, label: "Ventes", value: String(stats.salesCount), color: PALETTE.forest },
    { icon: MdTrendingUp, label: "CA total", value: formatCurrency(stats.salesTotalAmount), color: PALETTE.chocolate },
  ];

  return (
    <div className="space-y-6 p-5 md:p-8">
      <AdminPageHeader
        title="Tableau de bord"
        description="Vue d'ensemble et statistiques avancées de la plateforme"
      />

      <div
        className="rounded-[20px] border border-slate-200/80 p-7 text-slate-100 shadow-md"
        style={{
          background: `linear-gradient(135deg, ${PALETTE.chocolate} 0%, ${PALETTE.forest} 48%, ${PALETTE.sage} 100%)`,
        }}
      >
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[color-mix(in_srgb,var(--fs-palette-caramel)_45%,transparent)] bg-[color-mix(in_srgb,var(--fs-palette-terracotta)_25%,transparent)]">
            <MdBusiness className="h-9 w-9 text-[var(--fs-palette-caramel)]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-100">Super Admin</h2>
            <p className="mt-1.5 max-w-xl text-sm text-slate-400">
              Tableau de bord plateforme — statistiques globales et pilotage.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <AdminCard key={k.label} padding="p-4" className="!shadow-sm">
            <div className="flex items-start gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${k.color}18` }}
              >
                <k.icon className="h-5 w-5" style={{ color: k.color }} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{k.label}</p>
                <p className="mt-0.5 truncate text-lg font-bold text-slate-900">{k.value}</p>
              </div>
            </div>
          </AdminCard>
        ))}
      </div>

      <AdminCard>
        <h3 className="text-base font-bold text-slate-900">Évolution du CA</h3>
        <p className="text-xs text-slate-500">30 derniers jours</p>
        <div className="mt-4 overflow-x-auto">
          <SimpleLineChart data={salesOverTime} maxY={maxLine} />
        </div>
      </AdminCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard>
          <h3 className="text-base font-bold text-slate-900">Top 10 entreprises par CA</h3>
          <div className="mt-4 space-y-2">
            {topCa.map((r) => (
              <BarRow
                key={r.companyId}
                label={r.companyName}
                value={Math.round(r.totalAmount)}
                max={maxCa}
                color={PALETTE.terracotta}
              />
            ))}
          </div>
        </AdminCard>
        <AdminCard>
          <h3 className="text-base font-bold text-slate-900">Top 10 par nombre de ventes</h3>
          <div className="mt-4 space-y-2">
            {topSales.map((r) => (
              <BarRow
                key={r.companyId}
                label={r.companyName}
                value={r.salesCount}
                max={maxSc}
                color={PALETTE.primary}
              />
            ))}
          </div>
        </AdminCard>
      </div>

      <AdminCard>
        <h3 className="text-base font-bold text-slate-900">Répartition du CA par jour</h3>
        <p className="text-xs text-slate-500">30 jours</p>
        <div className="mt-4 flex h-40 items-end gap-px overflow-x-auto">
          {salesOverTime.map((d) => {
            const mh = maxLine > 0 ? maxLine : 1;
            const hPct = (d.total / mh) * 100;
            return (
              <div
                key={d.date}
                className="flex min-w-[6px] flex-1 flex-col justify-end"
                title={`${d.date}: ${formatCurrency(d.total)}`}
              >
                <div
                  className="min-h-px w-full rounded-t bg-[color-mix(in_srgb,var(--fs-palette-primary)_78%,white)]"
                  style={{ height: `${Math.max(2, hPct)}%` }}
                />
              </div>
            );
          })}
        </div>
      </AdminCard>
    </div>
  );
}
