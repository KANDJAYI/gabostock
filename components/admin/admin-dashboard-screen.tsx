"use client";

import { useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MdAutoGraph,
  MdBalance,
  MdBusiness,
  MdCardMembership,
  MdDangerous,
  MdGroups,
  MdInventory2,
  MdPercent,
  MdShoppingCart,
  MdStore,
  MdTrendingUp,
} from "react-icons/md";
import { AdminCard, AdminPageHeader } from "@/components/admin/admin-page-header";
import { adminFetchPlatformDashboard } from "@/lib/features/admin/dashboard-pack";
import { adminListCompanies, adminListStores } from "@/lib/features/admin/api";
import type { AdminDashboardFiltersInput, AdminPeriodPreset } from "@/lib/features/admin/dashboard-types";
import { formatCurrency } from "@/lib/utils/currency";
import { resolveAdminDashboardRange } from "@/lib/features/admin/dashboard-range";
import { toast } from "@/lib/toast";
import { KpiCard, KpiGrid } from "@/components/admin/dashboard/kpi-card";
import { HealthScoreCard } from "@/components/admin/dashboard/health-score-card";
import { RevenueCard } from "@/components/admin/dashboard/revenue-card";
import { AlertCard } from "@/components/admin/dashboard/alert-card";
import { ActivityFeed } from "@/components/admin/dashboard/activity-feed";
import { TopCompaniesCard } from "@/components/admin/dashboard/top-companies-card";
import { ChurnRiskTable } from "@/components/admin/dashboard/churn-risk-table";
import { AdoptionTable } from "@/components/admin/dashboard/adoption-table";
import { AiInsightsCard } from "@/components/admin/dashboard/ai-insights-card";
import { DashboardFiltersBar } from "@/components/admin/dashboard/dashboard-filters-bar";
import { QuickActionsBar } from "@/components/admin/dashboard/quick-actions-bar";
import {
  AdminCityRechart,
  AdminModuleUsageRechart,
  AdminPlatformBarChart,
  AdminSalesByDayRechart,
} from "@/components/admin/dashboard/admin-recharts-bars";

const KP = "#f97316";
const KP2 = "#2f3a32";
const KP3 = "#545748";
const KP4 = "#db9f75";

function yTickCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(Math.round(n));
}

function downloadDashboardCsv(summary: Record<string, string | number | undefined>) {
  try {
    const rows = [["Clé", "Valeur"], ...Object.entries(summary).map(([k, v]) => [k, String(v ?? "")])];
    const bom = "\uFEFF";
    const body = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob([bom + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gabostock-admin-dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  } catch {
    toast.error("Export CSV impossible.");
  }
}

export function AdminDashboardScreen() {
  const [preset, setPreset] = useState<AdminPeriodPreset>("30d");
  const [companyId, setCompanyId] = useState("");
  const [storeId, setStoreId] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("");
  const [city, setCity] = useState("");
  const todayStr = () => new Date().toISOString().slice(0, 10);
  const thirtyAgoStr = () => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return d.toISOString().slice(0, 10);
  };
  const [customFrom, setCustomFrom] = useState(thirtyAgoStr);
  const [customTo, setCustomTo] = useState(todayStr);

  const metaQ = useQuery({
    queryKey: ["admin-dashboard-meta-companies"],
    queryFn: async () => ({
      companies: await adminListCompanies(),
      stores: await adminListStores(),
    }),
  });

  const filterPayload = useMemo<AdminDashboardFiltersInput>(() => ({
    preset,
    customFrom,
    customTo,
    companyId: companyId || null,
    storeId: storeId || null,
    subscriptionStatus: subscriptionStatus || null,
    city: city.trim() || null,
  }), [preset, customFrom, customTo, companyId, storeId, subscriptionStatus, city]);

  const dashboardQ = useQuery({
    queryKey: ["admin-platform-dashboard", filterPayload],
    queryFn: () => adminFetchPlatformDashboard(filterPayload),
  });

  const storesForDropdown = useMemo(() => {
    const all = metaQ.data?.stores ?? [];
    if (!companyId) return all;
    return all.filter((s) => s.companyId === companyId);
  }, [metaQ.data?.stores, companyId]);

  const resolvedLabel =
    preset === "custom"
      ? resolveAdminDashboardRange("custom", customFrom, customTo).labelFr + ` (${customFrom} → ${customTo})`
      : dashboardQ.data?.resolved.labelFr ?? "";

  const onPresetPick = useCallback(
    (p: AdminPeriodPreset) => {
      setPreset(p);
      if (p === "custom") {
        setCustomFrom(thirtyAgoStr());
        setCustomTo(todayStr());
      }
      if (companyId === "" && storeId) setStoreId("");
    },
    [companyId, storeId],
  );

  const onCompanyChange = useCallback((id: string) => {
    setCompanyId(id);
    setStoreId("");
  }, []);

  if (dashboardQ.isLoading || !dashboardQ.data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8">
        <div className="h-11 w-11 animate-spin rounded-full border-2 border-[color-mix(in_srgb,var(--fs-palette-primary)_35%,transparent)] border-t-[var(--fs-palette-primary)]" />
      </div>
    );
  }

  if (dashboardQ.isError) {
    return (
      <div className="p-8">
        <p className="text-sm font-semibold text-red-600">{(dashboardQ.error as Error)?.message ?? "Erreur"}</p>
      </div>
    );
  }

  const d = dashboardQ.data;

  return (
    <div className="space-y-8 p-5 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <AdminPageHeader
          title="Super Admin Gabostock"
          description={`Pilotage plateforme — ${resolvedLabel}${d.filters.companyId ? " · filtres croisés" : ""}`}
        />
      </div>

      <QuickActionsBar
        onExportCsv={() => {
          if (!dashboardQ.data) return;
          const cur = dashboardQ.data;
          downloadDashboardCsv({
            résolu_label: resolvedLabel,
            entreprises_filtrées: cur.kpis.totalCompanies,
            ca_marchands_période: Math.round(cur.kpis.merchantCaTotal),
            mrr_gabostock: Math.round(cur.gasoStock.mrrEstimate),
            ventes: cur.kpis.salesCount,
            avertissements: cur.dataWarnings.join(" | ") || "(aucun)",
          });
        }}
      />

      {metaQ.data ? (
        <DashboardFiltersBar
          preset={preset}
          onPreset={onPresetPick}
          companyId={companyId}
          onCompanyId={onCompanyChange}
          companies={metaQ.data.companies.map((c) => ({ id: c.id, name: c.name }))}
          storeId={storeId}
          onStoreId={setStoreId}
          stores={storesForDropdown.map((s) => ({ id: s.id, name: s.name ?? s.code ?? "—" }))}
          subscriptionStatus={subscriptionStatus}
          onSubscriptionStatus={setSubscriptionStatus}
          city={city}
          onCity={setCity}
          customFrom={customFrom}
          customTo={customTo}
          onCustomRange={(from, to) => {
            setCustomFrom(from);
            setCustomTo(to);
          }}
        />
      ) : (
        <p className="text-sm text-slate-500">Chargement des listes filtres…</p>
      )}

      {d.dataWarnings.length > 0 ? (
        <div className="rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
          <span className="font-semibold">Note : </span>
          {d.dataWarnings.join(" · ")}
        </div>
      ) : null}

      <AdminCard padding="p-7" className="border-neutral-900/90 bg-[linear-gradient(135deg,var(--fs-palette-chocolate)_0%,#1c241d_52%,var(--fs-palette-forest)_160%)] text-slate-100 shadow-xl">
        <div className="flex flex-wrap items-start gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[color-mix(in_srgb,white_18%,transparent)] bg-[color-mix(in_srgb,white_10%,transparent)]">
            <MdAutoGraph className="h-9 w-9 text-[color-mix(in_srgb,var(--fs-palette-caramel)_92%,white)]" aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-black tracking-tight text-white">Gabostock Command Center</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
              Indicateurs hors ventes boutiques (droite) séparés des revenus plateforme (abonnements &amp; fonctionnalités)
              — alignés sur les tables Supabase existantes.
            </p>
          </div>
        </div>
      </AdminCard>

      <KpiGrid>
        <KpiCard icon={MdBusiness} label="Entreprises (filtrées)" value={String(d.kpis.totalCompanies)} color={KP4} />
        <KpiCard
          icon={MdInventory2}
          label="Entreprises actives"
          value={String(d.kpis.activeCompanies)}
          subtitle="Compte créé & flag actif"
          color={KP2}
        />
        <KpiCard icon={MdStore} label="Boutiques" value={String(d.kpis.stores)} color={KP} />
        <KpiCard icon={MdGroups} label="Utilisateurs (rôles)" value={String(d.kpis.users)} color={KP3} />
        <KpiCard icon={MdCardMembership} label="Abonnements actifs" value={String(d.kpis.activeSubscriptions)} color={KP4} />
        <KpiCard icon={MdTrendingUp} label="Essais (trialing)" value={String(d.kpis.trialingSubscriptions)} color={KP} />
        <KpiCard icon={MdDangerous} label="Abonnements expirés" value={String(d.kpis.expiredSubscriptions)} color="#b45309" />
        <KpiCard icon={MdShoppingCart} label="Nb ventes période" value={String(d.kpis.salesCount)} color={KP2} />
        <KpiCard icon={MdBalance} label="CA commercants · période" value={formatCurrency(d.kpis.merchantCaTotal)} color={KP2} />
        <KpiCard
          icon={MdTrendingUp}
          label="Gabostock · estimation MRR"
          value={formatCurrency(d.gasoStock.mrrEstimate)}
          subtitle="≠ caisse marchandes"
          color="#7c3aed"
        />
        <KpiCard icon={MdPercent} label="Taux d’activité" value={`${Math.round(d.kpis.activityRate * 100)}%`} color={KP} />
        <KpiCard
          icon={MdPercent}
          label="Couverture souscription"
          value={`${Math.round(d.kpis.subscriptionCoverageRate * 100)}%`}
          subtitle="% entreprises suivies ayant dossier souscription"
          color={KP3}
        />
      </KpiGrid>

      <div className="grid gap-6 xl:grid-cols-2">
        <HealthScoreCard
          score={d.health.score}
          companiesSaleToday={d.health.companiesActiveToday}
          storesSellingToday={d.health.storesSellingToday}
          auditTouchesTodayApprox={d.health.auditActiveUsersApprox}
          syncHints={d.health.syncEventsApprox}
          critical24h={d.health.criticalErrors24h}
        />
        <RevenueCard
          mrr={d.gasoStock.mrrEstimate}
          arr={d.gasoStock.arrEstimate}
          collected={d.gasoStock.collectedEstimate}
          expected={d.gasoStock.expectedFromPlansEstimate}
          arrearsCompanies={d.gasoStock.overdueCompanies}
          renew7={d.gasoStock.renewWithin7Days}
          trialsSoon={d.gasoStock.trialsExpiringSoon}
        />
      </div>

      <AiInsightsCard lines={d.aiInsights} />

      <AlertCard items={d.alerts} />

      <ActivityFeed items={d.activity} />

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Évolution du CA merchants (barres verticales)</h3>
          <p className="text-xs text-slate-500 dark:text-neutral-500">{resolvedLabel}</p>
          <div className="mt-1 overflow-x-auto">
            <AdminPlatformBarChart
              data={d.charts.caByDay.map((x) => ({ name: x.date.slice(5), value: x.total }))}
              barColor={KP}
              gridMode="both"
              yAllowDecimals
              yTickFormatter={yTickCompact}
              tooltipValueLabel="CA :"
              valueFormat={(n) => formatCurrency(n)}
              minTickGapX={10}
            />
          </div>
        </AdminCard>
        <AdminCard>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Ventes par jour</h3>
          <p className="text-xs text-slate-500 dark:text-neutral-500">{resolvedLabel}</p>
          <div className="mt-1 overflow-x-auto">
            <AdminSalesByDayRechart series={d.charts.salesCountByDay} />
          </div>
        </AdminCard>
      </div>

      <AdminCard>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Abonnements par statut · parc observé</h3>
        {d.charts.subscriptionsByStatus.length > 0 ? (
          <div className="mt-1 overflow-x-auto">
            <AdminPlatformBarChart
              data={d.charts.subscriptionsByStatus.map((s) => ({
                name: s.label || "—",
                value: s.value,
              }))}
              barColor="#7c3aed"
              gridMode="horizontal"
              yAllowDecimals={false}
              tooltipValueLabel="Abonnements :"
              valueFormat={(n) => String(Math.round(n))}
            />
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500 dark:text-neutral-500">
            Pas de données d&apos;abonnement lisibles ou filtre vide.
          </p>
        )}
      </AdminCard>

      <AdminCard>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Répartition par ville</h3>
        {d.charts.cityDistribution.length > 0 ? (
          <div className="mt-1 overflow-x-auto">
            <AdminCityRechart series={d.charts.cityDistribution} />
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Adresses boutiques vides sous les filtres actuels.</p>
        )}
      </AdminCard>

      <AdminCard>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Nouvelles entreprises · par jour (barres verticales)</h3>
        <div className="mt-1 overflow-x-auto">
          <AdminPlatformBarChart
            data={d.charts.newCompaniesByDay.map((x) => ({ name: x.date.slice(5), value: x.total }))}
            barColor={KP2}
            gridMode="both"
            yAllowDecimals={false}
            yTickFormatter={(n) => String(Math.round(n))}
            tooltipValueLabel="Nouvelles :"
            valueFormat={(n) => String(Math.round(n))}
            minTickGapX={10}
          />
        </div>
      </AdminCard>

      <AdminCard>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Modules les plus utilisés</h3>
        <div className="mt-1 overflow-x-auto">
          <AdminModuleUsageRechart series={d.charts.moduleUsage} />
        </div>
      </AdminCard>

      <div className="grid gap-6 xl:grid-cols-3">
        <TopCompaniesCard title="CA merchants · top" rows={d.tops.topByCa} valueFormat={(v) => formatCurrency(v)} />
        <TopCompaniesCard title="Nb ventes · top" rows={d.tops.topBySales} valueFormat={(v) => String(Math.round(v))} />
        <TopCompaniesCard title="Boutiques par entreprise · top" rows={d.tops.topByStoresCount} valueFormat={(v) => String(v)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TopCompaniesCard
          title="Croissance CA vs fenêtre précédente"
          rows={d.tops.topByGrowthPct}
          valueFormat={(v) => `${Math.round(v * 10) / 10}%`}
          signedColors={{ positive: "#16a34a", negative: "#dc2626" }}
        />
        <TopCompaniesCard title="À risque (priorité churn)" rows={d.tops.riskCompanies} valueFormat={(v) => `${v}/100`} />
      </div>

      <TopCompaniesCard
        title="Entreprises inactives (aucune vente sur la période)"
        rows={d.tops.inactiveCompanies}
        valueFormat={() => "0"}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <AdoptionTable rows={d.adoption} />
        <ChurnRiskTable rows={d.churn} />
      </div>

      {d.refs.previousPeriodMerchantCa != null ? (
        <AdminCard>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Comparaison période précédente (même durée)</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-neutral-400">
            CA merchants : {formatCurrency(d.refs.previousPeriodMerchantCa)} → {formatCurrency(d.kpis.merchantCaTotal)} ·
            Ventes : {d.refs.previousPeriodMerchantSales} → {d.kpis.salesCount}
          </p>
        </AdminCard>
      ) : null}
    </div>
  );
}
