/**
 * Super Admin — tableau de bord plateforme (agrégats + métadonnées).
 * Les clés reflètent le pilotage SaaS Gabostock (CA commercants ≠ revenus plateforme).
 */

export type AdminPeriodPreset =
  | "today"
  | "7d"
  | "30d"
  | "month"
  | "year"
  | "custom";

export type AdminDashboardFiltersInput = {
  preset: AdminPeriodPreset;
  customFrom?: string | null;
  customTo?: string | null;
  companyId?: string | null;
  storeId?: string | null;
  /** Vide = tous */
  subscriptionStatus?: string | null;
  /** Sous-chaîne recherchée dans l’adresse des boutiques */
  city?: string | null;
};

export type AdminDashboardResolvedRange = {
  from: Date;
  to: Date;
  fromIso: string;
  toIso: string;
  labelFr: string;
};

export type AdminDailyPoint = { date: string; total: number; count: number };
export type AdminCountByLabel = { label: string; value: number };

export type AdminDashboardActivityItem = {
  id: string;
  at: string;
  kind:
    | "sale"
    | "product"
    | "audit"
    | "subscription"
    | "error"
    | "stock_hint"
    | "sync_hint";
  title: string;
  detail?: string;
  companyId: string | null;
};

export type AdminDashboardAlertItem = {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  detail?: string;
  companyId?: string | null;
};

export type AdminCompanyScoreRow = {
  companyId: string;
  companyName: string;
  score: number;
  churnRisk: number;
  salesCount: number;
  productsDelta: number;
  lastActivityHint: string | null;
};

export type AdminTopCompanyRow = {
  companyId: string;
  companyName: string;
  value: number;
  secondary?: string | null;
};

export type AdminModuleUsageEstimate = {
  module: string;
  companiesUsing: number;
  /** 0–1 part du parc ayant au moins un signal */
  penetration: number;
};

export interface AdminPlatformDashboard {
  resolved: AdminDashboardResolvedRange;
  filters: AdminDashboardFiltersInput;
  dataWarnings: string[];
  kpis: {
    totalCompanies: number;
    activeCompanies: number;
    stores: number;
    users: number;
    activeSubscriptions: number;
    trialingSubscriptions: number;
    expiredSubscriptions: number;
    /** Ventes terminées dans la période */
    salesCount: number;
    /** Somme « total » des ventes merchants (≠ revenus Gabostock) */
    merchantCaTotal: number;
    /** Revenus plateforme : part récurrente du mois (estimation plan) — pas les encaissements Stripe */
    gasoStockRecurringEstimate: number;
    /** Ratio d’entreprises ayant eu au moins une vente / entreprises actives */
    activityRate: number;
    /** Part d’abonnés actifs + essai parmi entreprises suivies — indicateur générique plateforme */
    subscriptionCoverageRate: number;
  };
  gasoStock: {
    mrrEstimate: number;
    arrEstimate: number;
    /** Pas de paiement Stripe côté app — placeholders honnêtes */
    collectedEstimate: number;
    expectedFromPlansEstimate: number;
    overdueCompanies: number;
    renewWithin7Days: number;
    trialsExpiringSoon: number;
    pastDueCount: number;
  };
  health: {
    score: number;
    companiesActiveToday: number;
    storesSellingToday: number;
    auditActiveUsersApprox: number;
    syncEventsApprox: number;
    criticalErrors24h: number;
    warningErrors24h: number;
  };
  charts: {
    caByDay: AdminDailyPoint[];
    salesCountByDay: AdminDailyPoint[];
    /** Naissance des entreprises (created_at dans la fenêtre agrégée par jour) */
    newCompaniesByDay: AdminDailyPoint[];
    subscriptionsByStatus: AdminCountByLabel[];
    merchantsCaByCompany: AdminTopCompanyRow[];
    merchantsSalesCountByCompany: AdminTopCompanyRow[];
    cityDistribution: AdminCountByLabel[];
    moduleUsage: AdminModuleUsageEstimate[];
  };
  tops: {
    topByCa: AdminTopCompanyRow[];
    topBySales: AdminTopCompanyRow[];
    topByStoresCount: AdminTopCompanyRow[];
    topByGrowthPct: AdminTopCompanyRow[];
    inactiveCompanies: AdminTopCompanyRow[];
    riskCompanies: AdminTopCompanyRow[];
  };
  adoption: AdminCompanyScoreRow[];
  churn: AdminCompanyScoreRow[];
  alerts: AdminDashboardAlertItem[];
  activity: AdminDashboardActivityItem[];
  aiInsights: string[];
  /** Moyennes comparaisons périodes (croissance jour sur jour approximée) */
  refs: {
    previousPeriodMerchantCa?: number;
    previousPeriodMerchantSales?: number;
  };
}
