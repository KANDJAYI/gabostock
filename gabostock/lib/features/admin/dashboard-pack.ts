"use client";

/**
 * Agrégats Super Admin pour le tableau de bord plateforme.
 * Filtres appliqués en cohérence ; fallbacks si tables optionnelles vides.
 */

import { createClient } from "@/lib/supabase/client";
import { mapSupabaseError } from "@/lib/supabase/map-error";
import type {
  AdminCompanyScoreRow,
  AdminDailyPoint,
  AdminDashboardActivityItem,
  AdminDashboardAlertItem,
  AdminDashboardFiltersInput,
  AdminDashboardResolvedRange,
  AdminPlatformDashboard,
  AdminTopCompanyRow,
  AdminPeriodPreset,
} from "./dashboard-types";
import { resolveAdminDashboardRange } from "./dashboard-range";

function toNum(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function isoDay(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function previousSameLengthRange(range: AdminDashboardResolvedRange): AdminDashboardResolvedRange {
  const ms = range.to.getTime() - range.from.getTime();
  const prevTo = new Date(range.from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - ms);
  return {
    from: prevFrom,
    to: prevTo,
    fromIso: prevFrom.toISOString(),
    toIso: prevTo.toISOString(),
    labelFr: "Période précédente",
  };
}

function intersectTwo(a: Set<string>, b: Set<string>): Set<string> {
  const n = new Set<string>();
  for (const id of a) if (b.has(id)) n.add(id);
  return n;
}

async function paginateSales(
  supabase: ReturnType<typeof createClient>,
  fromIso: string,
  toIso: string,
): Promise<Array<{ company_id: string; store_id: string; total: number; created_at: string }>> {
  const out: Array<{ company_id: string; store_id: string; total: number; created_at: string }> =
    [];
  let offset = 0;
  const size = 2000;
  for (;;) {
    const { data, error } = await supabase
      .from("sales")
      .select("company_id, store_id, total, created_at")
      .eq("status", "completed")
      .gte("created_at", fromIso)
      .lte("created_at", toIso)
      .order("created_at", { ascending: true })
      .range(offset, offset + size - 1);
    if (error) throw mapSupabaseError(error);
    const rows = (data ?? []) as Array<{
      company_id?: string;
      store_id?: string;
      total?: unknown;
      created_at?: string;
    }>;
    for (const r of rows) {
      if (!r.company_id || !r.store_id) continue;
      out.push({
        company_id: String(r.company_id),
        store_id: String(r.store_id),
        total: toNum(r.total),
        created_at: String(r.created_at ?? ""),
      });
    }
    if (rows.length < size) break;
    offset += size;
  }
  return out;
}

function aggregateByDay(
  entries: Iterable<{ created_at: string; total: number }>,
): AdminDailyPoint[] {
  const byDayTot = new Map<string, number>();
  const byDayCt = new Map<string, number>();
  for (const p of entries) {
    const day = (p.created_at ?? "").slice(0, 10);
    if (!day) continue;
    const t = toNum(p.total);
    byDayTot.set(day, (byDayTot.get(day) ?? 0) + t);
    byDayCt.set(day, (byDayCt.get(day) ?? 0) + 1);
  }
  const days = [...byDayTot.keys()].sort();
  return days.map((date) => ({
    date,
    total: byDayTot.get(date) ?? 0,
    count: byDayCt.get(date) ?? 0,
  }));
}

function fillDailyGaps(series: AdminDailyPoint[], range: AdminDashboardResolvedRange): AdminDailyPoint[] {
  const map = new Map(series.map((p) => [p.date, p]));
  const out: AdminDailyPoint[] = [];
  for (let t = startOfDay(range.from).getTime(); t <= range.to.getTime(); t += 86400000) {
    const key = isoDay(new Date(t));
    const pt = map.get(key);
    out.push(pt ?? { date: key, total: 0, count: 0 });
  }
  return out;
}

function bucketCompanyCreatedDays(
  companies: Array<{ created_at: string | null }>,
  from: Date,
  to: Date,
): AdminDailyPoint[] {
  const map = new Map<string, number>();
  for (const c of companies) {
    const ca = c.created_at;
    if (!ca) continue;
    const d = new Date(ca);
    if (Number.isNaN(d.getTime()) || d < from || d > to) continue;
    const day = ca.slice(0, 10);
    map.set(day, (map.get(day) ?? 0) + 1);
  }
  const pts: AdminDailyPoint[] = [];
  for (let t = startOfDay(from).getTime(); t <= to.getTime(); t += 86400000) {
    const key = isoDay(new Date(t));
    const n = map.get(key) ?? 0;
    pts.push({ date: key, total: n, count: n });
  }
  return pts;
}

function estimateMRRFromSubs(
  subs: Array<{ status?: string | null; plan_id?: string | null }>,
  planById: Map<string, { price_cents: number; interval: string }>,
): number {
  let mrr = 0;
  for (const s of subs) {
    const st = String(s.status ?? "");
    if (st !== "active" && st !== "trialing") continue;
    const planId = s.plan_id != null ? String(s.plan_id) : "";
    const pl = planId ? planById.get(planId) : undefined;
    if (!pl) continue;
    const xof = Math.max(0, pl.price_cents) / 100;
    if (pl.interval === "year") mrr += xof / 12;
    else mrr += xof;
  }
  return mrr;
}

function buildAlertsPack(
  kpis: AdminPlatformDashboard["kpis"],
  gasoStock: AdminPlatformDashboard["gasoStock"],
  health: AdminPlatformDashboard["health"],
  inactive: AdminTopCompanyRow[],
): AdminDashboardAlertItem[] {
  const out: AdminDashboardAlertItem[] = [];
  let i = 0;
  if (kpis.expiredSubscriptions > 0)
    out.push({
      id: `e-${++i}`,
      severity: "warning",
      title: `${kpis.expiredSubscriptions} entreprise(s) avec abonnement expiré`,
    });
  if (gasoStock.trialsExpiringSoon > 0)
    out.push({
      id: `t-${++i}`,
      severity: "info",
      title: `${gasoStock.trialsExpiringSoon} essai(s) se terminent sous 7 jours`,
    });
  if (gasoStock.pastDueCount > 0)
    out.push({
      id: `p-${++i}`,
      severity: "critical",
      title: `${gasoStock.pastDueCount} abonnement(s) en retard (past_due)`,
    });
  if (health.criticalErrors24h >= 8)
    out.push({
      id: `c-${++i}`,
      severity: health.criticalErrors24h >= 20 ? "critical" : "warning",
      title: `${health.criticalErrors24h} erreurs critiques ou bloquantes (24 h)`,
    });
  inactive.slice(0, 8).forEach((r, j) =>
    out.push({
      id: `i-${++i}-${j}`,
      severity: "warning",
      title: `${r.companyName} — aucune vente visible sur cette fenêtre`,
      companyId: r.companyId,
    }),
  );
  return out.slice(0, 24);
}

function buildInsightsText(d: Omit<AdminPlatformDashboard, "aiInsights">): string[] {
  const lines: string[] = [];
  const topCa = d.charts.merchantsCaByCompany[0];
  if (topCa) {
    lines.push(
      `Le plus fort CA merchants sur cette période : ${topCa.companyName} (${Math.round(topCa.value).toLocaleString("fr-FR")}).`,
    );
  }
  const mod = [...d.charts.moduleUsage].sort((a, b) => b.companiesUsing - a.companiesUsing)[0];
  if (mod) lines.push(`Le signal « module Gabostock » le plus représenté : ${mod.module}.`);

  lines.push(
    `${d.kpis.activeSubscriptions + d.kpis.trialingSubscriptions} dossiers avec abonnement suivi ; ${d.health.criticalErrors24h} alerte(s) critique(s) erreurs app.`,
  );

  const g = d.tops.topByGrowthPct[0];
  if (g?.secondary)
    lines.push(`Croissance CA vs période précédente : ${g.companyName} (${g.secondary}).`);

  lines.push(`Indice santé plateforme : ${d.health.score}/100.`);

  if (d.tops.inactiveCompanies.length >= 3) {
    lines.push(
      `${d.tops.inactiveCompanies.length} entreprises sans vente sur cette fenêtre — relance commerciale possible.`,
    );
  }

  const risk = [...d.churn].sort((a, b) => b.churnRisk - a.churnRisk)[0];
  if (risk)
    lines.push(`Priorité risque churn : ${risk.companyName} (score approximatif ${Math.round(risk.churnRisk)}/100).`);

  lines.push(`Recommandation : croiser tableau « Risque churn » avec abonnements et CA merchants.`);

  return lines.slice(0, 8);
}

async function auditActivityFeed(
  supabase: ReturnType<typeof createClient>,
  warnings: string[],
): Promise<AdminDashboardActivityItem[]> {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, created_at, company_id, store_id, user_id, action, entity_type")
    .order("created_at", { ascending: false })
    .limit(80);
  if (error) {
    warnings.push("Journal audit : lecture partielle ou refusée.");
    return [];
  }
  const items: AdminDashboardActivityItem[] = [];
  for (const row of data ?? []) {
    const r = row as Record<string, unknown>;
    const action = String(r.action ?? "");
    const et = String(r.entity_type ?? "");
    let kind: AdminDashboardActivityItem["kind"] = "audit";
    let title = "Événement";
    const al = action.toLowerCase();
    if (al.includes("sale") || et === "sale") {
      kind = "sale";
      title = "Vente enregistrée";
    } else if (et === "product" || al.includes("product")) {
      kind = "product";
      title = al.includes("create") ? "Produit créé ou mis à jour" : "Événement produit";
    } else if (al.includes("print") || al.includes("ticket")) {
      title = "Impression / impression ticket";
      kind = "audit";
    }
    items.push({
      id: String(r.id ?? Math.random()),
      at: String(r.created_at ?? ""),
      kind,
      title,
      detail: `${action} · ${et}`.slice(0, 120),
      companyId: r.company_id != null ? String(r.company_id) : null,
    });
  }
  return items.slice(0, 40);
}

export async function adminFetchPlatformDashboard(
  filtersInput: AdminDashboardFiltersInput & { preset?: AdminPeriodPreset },
): Promise<AdminPlatformDashboard> {
  const preset = (filtersInput.preset ?? "30d") as AdminPeriodPreset;
  const resolved = resolveAdminDashboardRange(
    preset,
    filtersInput.customFrom,
    filtersInput.customTo,
  );
  const prev = previousSameLengthRange(resolved);
  const dataWarnings: string[] = [];

  const supabase = createClient();

  const [{ data: companiesRows, error: e1 }, { data: storesRows, error: e2 }, ucRes] =
    await Promise.all([
      supabase
        .from("companies")
        .select("id,name,is_active,warehouse_feature_enabled,ai_predictions_enabled,created_at"),
      supabase.from("stores").select("id,company_id,name,address,is_active,created_at"),
      supabase.from("user_company_roles").select("user_id,company_id"),
    ]);

  if (e1) throw mapSupabaseError(e1);
  if (e2) throw mapSupabaseError(e2);

  let plansById = new Map<string, { price_cents: number; interval: string }>();
  let subsRaw: Array<{
    company_id: string | null;
    plan_id?: string | null;
    status: string | null;
    current_period_end: string | null;
    cancel_at_period_end?: boolean;
  }> = [];

  try {
    const [{ data: plans }, { data: subs }] = await Promise.all([
      supabase.from("subscription_plans").select("id, price_cents, interval, slug, name"),
      supabase
        .from("company_subscriptions")
        .select("company_id, plan_id, status, current_period_end, cancel_at_period_end"),
    ]);
    for (const p of plans ?? []) {
      const row = p as Record<string, unknown>;
      plansById.set(String(row.id), {
        price_cents: Math.max(0, toNum(row.price_cents)),
        interval: String(row.interval ?? "month"),
      });
    }
    subsRaw = (subs ?? []) as typeof subsRaw;
  } catch {
    plansById = new Map();
    subsRaw = [];
    dataWarnings.push("Abonnements : données partiellement indisponibles.");
  }

  const companies = (companiesRows ?? []) as Array<{
    id: string;
    name: string | null;
    is_active?: boolean | null;
    warehouse_feature_enabled?: boolean | null;
    ai_predictions_enabled?: boolean | null;
    created_at: string | null;
  }>;

  const stores = (storesRows ?? []) as Array<{
    id: string;
    company_id: string;
    address: string | null;
    is_active?: boolean | null;
  }>;

  const companyById = new Map(companies.map((c) => [c.id, c]));

  let allowed = new Set(companies.map((c) => c.id));

  if (filtersInput.companyId) {
    allowed = new Set(allowed.has(filtersInput.companyId) ? [filtersInput.companyId] : []);
  }
  if (filtersInput.storeId) {
    const st = stores.find((s) => s.id === filtersInput.storeId);
    if (!st || !companyById.has(st.company_id)) allowed = new Set<string>();
    else allowed = intersectTwo(allowed, new Set([st.company_id]));
  }
  if (filtersInput.subscriptionStatus) {
    const match = new Set(
      subsRaw
        .filter((s) => String(s.status) === filtersInput.subscriptionStatus)
        .map((s) => String(s.company_id))
        .filter(Boolean),
    );
    allowed = intersectTwo(allowed, match);
  }

  if (filtersInput.city?.trim()) {
    const q = filtersInput.city.trim().toLowerCase();
    const fromStores = new Set(
      stores.filter((s) => (s.address ?? "").toLowerCase().includes(q)).map((s) => s.company_id),
    );
    allowed = intersectTwo(allowed, fromStores);
  }

  /** Compteur utilisateurs membres parmi sociétés autorisées */
  const ucRows = ucRes.error ? [] : (ucRes.data ?? []);
  if (ucRes.error) dataWarnings.push("Rôles utilisateurs : erreur lors du décompte global.");

  const userIds = new Set<string>();
  for (const ur of ucRows as Array<{ user_id?: string; company_id?: string }>) {
    const cid = ur.company_id != null ? String(ur.company_id) : "";
    if (!cid || !allowed.has(cid)) continue;
    if (ur.user_id) userIds.add(String(ur.user_id));
  }

  /** Ventes fenêtre courante + précédente (complètes) */
  let salesCurrent = await paginateSales(supabase, resolved.fromIso, resolved.toIso);
  let salesPrev = await paginateSales(supabase, prev.fromIso, prev.toIso);

  salesCurrent = salesCurrent.filter((s) => allowed.has(s.company_id));
  salesPrev = salesPrev.filter((s) => allowed.has(s.company_id));

  const subsFiltered = subsRaw.filter((s) => {
    const cid = s.company_id != null ? String(s.company_id) : "";
    return cid && allowed.has(cid);
  });

  /** Stats abonnements */
  let activeSubs = 0;
  let trialingSubs = 0;
  let expiredSubs = 0;
  let pastDue = 0;
  let renew7 = 0;
  let trialExpSoon = 0;

  const in7 = 7 * 86400000;
  const nowMs = Date.now();

  const statusCount = new Map<string, number>();
  for (const s of subsFiltered) {
    const st = String(s.status ?? "unknown");
    statusCount.set(st, (statusCount.get(st) ?? 0) + 1);
    if (st === "active") activeSubs += 1;
    if (st === "trialing") trialingSubs += 1;
    if (st === "expired") expiredSubs += 1;
    if (st === "past_due") pastDue += 1;

    const endMs = s.current_period_end ? new Date(String(s.current_period_end)).getTime() : NaN;
    if (Number.isFinite(endMs)) {
      if (endMs - nowMs > 0 && endMs - nowMs <= in7) renew7 += 1;
      if (st === "trialing" && endMs - nowMs > 0 && endMs - nowMs <= in7) trialExpSoon += 1;
    }
  }

  const mrrPlatform = estimateMRRFromSubs(
    subsFiltered.map((s) => ({
      status: s.status,
      plan_id: s.plan_id ?? null,
    })),
    plansById,
  );

  let merchantCa = 0;
  let merchantSalesCt = 0;
  const caByCompany = new Map<string, number>();
  const salesCtByCompany = new Map<string, number>();
  for (const s of salesCurrent) {
    merchantCa += s.total;
    merchantSalesCt += 1;
    caByCompany.set(s.company_id, (caByCompany.get(s.company_id) ?? 0) + s.total);
    salesCtByCompany.set(s.company_id, (salesCtByCompany.get(s.company_id) ?? 0) + 1);
  }

  let prevCa = 0;
  let prevSales = 0;
  for (const s of salesPrev) {
    prevCa += s.total;
    prevSales += 1;
  }

  const activeCompaniesFiltered = [...allowed].filter((id) => companyById.get(id)?.is_active !== false).length;
  const withSale = new Set<string>();
  for (const cid of allowed) if ((caByCompany.get(cid) ?? 0) > 0 || (salesCtByCompany.get(cid) ?? 0) > 0) withSale.add(cid);

  const totalCompaniesCounted = allowed.size;

  const activityRate =
    activeCompaniesFiltered > 0 ? withSale.size / activeCompaniesFiltered : 0;

  const subscriptionCoverageRate =
    totalCompaniesCounted > 0 ? Math.min(1, (activeSubs + trialingSubs) / totalCompaniesCounted) : 0;

  /** « Aujourd’hui » aligné UTC (cohérent avec timestamps Supabase). */
  const todayUtc = new Date().toISOString().slice(0, 10);

  const storesSellingTodaySet = new Set<string>();
  const companiesSaleTodaySet = new Set<string>();
  for (const s of salesCurrent) {
    const dayUtc = (s.created_at ?? "").slice(0, 10);
    if (dayUtc !== todayUtc) continue;
    storesSellingTodaySet.add(s.store_id);
    companiesSaleTodaySet.add(s.company_id);
  }
  const companiesSaleToday = companiesSaleTodaySet.size;

  /** Erreurs */
  let critErr24 = 0;
  let warnErr24 = 0;
  try {
    const since = new Date(Date.now() - 86400000).toISOString();
    const { data: errs } = await supabase
      .from("app_error_logs")
      .select("level")
      .gte("created_at", since);
    for (const e of errs ?? []) {
      const lvl = String((e as { level?: string }).level ?? "").toLowerCase();
      if (lvl === "critical" || lvl === "fatal") critErr24 += 1;
      else warnErr24 += 1;
    }
  } catch {
    /* ignore */
  }

  /** Estimation santé */
  let healthScore =
    50 +
    Math.min(25, activityRate * 25) +
    Math.min(15, subscriptionCoverageRate * 15);
  healthScore -= Math.min(25, critErr24 * 2 + warnErr24 * 0.05);
  healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

  /** Liste CA par société pour tops */
  const topCaRows: AdminTopCompanyRow[] = [...allowed]
    .map((id) => ({
      companyId: id,
      companyName: String(companyById.get(id)?.name ?? "—"),
      value: Math.round(caByCompany.get(id) ?? 0),
    }))
    .sort((a, b) => b.value - a.value);

  const topSalesRows: AdminTopCompanyRow[] = [...allowed]
    .map((id) => ({
      companyId: id,
      companyName: String(companyById.get(id)?.name ?? "—"),
      value: salesCtByCompany.get(id) ?? 0,
    }))
    .sort((a, b) => b.value - a.value);

  const storeCountByCompany = new Map<string, number>();
  for (const st of stores) {
    if (!allowed.has(st.company_id)) continue;
    storeCountByCompany.set(st.company_id, (storeCountByCompany.get(st.company_id) ?? 0) + 1);
  }

  const topByStores: AdminTopCompanyRow[] = [...allowed]
    .map((id) => ({
      companyId: id,
      companyName: String(companyById.get(id)?.name ?? "—"),
      value: storeCountByCompany.get(id) ?? 0,
    }))
    .sort((a, b) => b.value - a.value);

  const prevCaByCompany = new Map<string, number>();
  for (const s of salesPrev) {
    prevCaByCompany.set(s.company_id, (prevCaByCompany.get(s.company_id) ?? 0) + s.total);
  }

  /** Croissance % CA courant vs période précédente (même durée) */
  const growthRows: AdminTopCompanyRow[] = [...allowed]
    .map((id) => {
      const cur = caByCompany.get(id) ?? 0;
      const pr = prevCaByCompany.get(id) ?? 0;
      const pct = pr > 0 ? ((cur - pr) / pr) * 100 : cur > 0 ? 100 : 0;
      return {
        companyId: id,
        companyName: String(companyById.get(id)?.name ?? "—"),
        value: Math.round(pct * 10) / 10,
        secondary: `${Math.round(pr)} → ${Math.round(cur)}`,
      };
    })
    .sort((a, b) => b.value - a.value);

  const inactive: AdminTopCompanyRow[] = [...allowed]
    .filter((id) => (caByCompany.get(id) ?? 0) <= 0)
    .map((id) => ({
      companyId: id,
      companyName: String(companyById.get(id)?.name ?? "—"),
      value: 0,
    }))
    .sort((a, b) => a.companyName.localeCompare(b.companyName, "fr"));

  /** Répartition par ville : heuristique sur adresse (dernier segment après virgule ou segment contenant chiffre) */
  const cityMap = new Map<string, number>();
  for (const st of stores) {
    if (!allowed.has(st.company_id)) continue;
    const raw = (st.address ?? "").trim();
    if (!raw) continue;
    const parts = raw.split(",").map((x) => x.trim()).filter(Boolean);
    const label = parts.length >= 2 ? parts[parts.length - 1] : raw.slice(0, 40);
    cityMap.set(label, (cityMap.get(label) ?? 0) + 1);
  }
  const cityDistribution = [...cityMap.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 12);

  /** Modules */
  let depotEnabled = 0;
  let aiEnabled = 0;
  for (const id of allowed) {
    const c = companyById.get(id);
    if (!c) continue;
    if (c.warehouse_feature_enabled !== false) depotEnabled += 1;
    if (c.ai_predictions_enabled === true) aiEnabled += 1;
  }
  const n = Math.max(1, allowed.size);
  const moduleUsage = [
    { module: "Dépôt / entrepôt", companiesUsing: depotEnabled, penetration: depotEnabled / n },
    { module: "Prédictions IA", companiesUsing: aiEnabled, penetration: aiEnabled / n },
    { module: "POS / ventes", companiesUsing: withSale.size, penetration: withSale.size / n },
  ];

  /** Adoption & churn heuristiques */
  const adoption: AdminCompanyScoreRow[] = [];
  const churn: AdminCompanyScoreRow[] = [];

  for (const id of allowed) {
    const name = String(companyById.get(id)?.name ?? "—");
    const ca = caByCompany.get(id) ?? 0;
    const sc = salesCtByCompany.get(id) ?? 0;
    const stc = storeCountByCompany.get(id) ?? 0;
    const sub = subsFiltered.find((s) => String(s.company_id) === id);
    const st = sub ? String(sub.status ?? "") : "none";

    const dep = companyById.get(id)?.warehouse_feature_enabled !== false;
    let adoptionScore = Math.min(
      100,
      Math.round(
        Math.min(40, sc * 2) + Math.min(25, ca / 10000) + Math.min(15, stc * 3) + (dep ? 10 : 0),
      ),
    );

    let churnRisk = 0;
    if (sc === 0 && ca === 0) churnRisk += 35;
    if (st === "expired" || st === "canceled") churnRisk += 40;
    if (st === "past_due") churnRisk += 25;
    if (st === "trialing") churnRisk += 10;
    const end = sub?.current_period_end ? new Date(String(sub.current_period_end)).getTime() : NaN;
    if (Number.isFinite(end) && end - nowMs < 14 * 86400000 && end - nowMs > 0) churnRisk += 15;

    churnRisk = Math.min(100, Math.round(churnRisk));

    adoption.push({
      companyId: id,
      companyName: name,
      score: adoptionScore,
      churnRisk,
      salesCount: sc,
      productsDelta: 0,
      lastActivityHint: sc > 0 ? `${sc} vente(s) sur la période` : "Aucune vente",
    });

    churn.push({
      companyId: id,
      companyName: name,
      score: adoptionScore,
      churnRisk,
      salesCount: sc,
      productsDelta: 0,
      lastActivityHint: st || "—",
    });
  }

  adoption.sort((a, b) => b.score - a.score);
  churn.sort((a, b) => b.churnRisk - a.churnRisk);

  const riskCompanies: AdminTopCompanyRow[] = churn.slice(0, 15).map((r) => ({
    companyId: r.companyId,
    companyName: r.companyName,
    value: Math.round(r.churnRisk),
    secondary: r.lastActivityHint ?? undefined,
  }));

  const caSeries = fillDailyGaps(aggregateByDay(salesCurrent), resolved);
  const salesCountByDayFilled = fillDailyGaps(
    aggregateByDay(salesCurrent.map((s) => ({ created_at: s.created_at, total: 1 }))),
    resolved,
  );

  const newCompaniesInWindow = companies.filter((c) => allowed.has(c.id));
  const newCosByDay = bucketCompanyCreatedDays(
    newCompaniesInWindow,
    resolved.from,
    resolved.to,
  );

  const subscriptionsByStatus = [...statusCount.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const activity = await auditActivityFeed(supabase, dataWarnings);

  const dashNoInsight: Omit<AdminPlatformDashboard, "aiInsights"> = {
    resolved,
    filters: filtersInput,
    dataWarnings,
    kpis: {
      totalCompanies: totalCompaniesCounted,
      activeCompanies: activeCompaniesFiltered,
      stores: [...allowed].reduce((s, id) => s + (storeCountByCompany.get(id) ?? 0), 0),
      users: userIds.size,
      activeSubscriptions: activeSubs,
      trialingSubscriptions: trialingSubs,
      expiredSubscriptions: expiredSubs,
      salesCount: merchantSalesCt,
      merchantCaTotal: merchantCa,
      gasoStockRecurringEstimate: mrrPlatform,
      activityRate,
      subscriptionCoverageRate,
    },
    gasoStock: {
      mrrEstimate: mrrPlatform,
      arrEstimate: mrrPlatform * 12,
      collectedEstimate: 0,
      expectedFromPlansEstimate: mrrPlatform,
      overdueCompanies: pastDue,
      renewWithin7Days: renew7,
      trialsExpiringSoon: trialExpSoon,
      pastDueCount: pastDue,
    },
    health: {
      score: healthScore,
      companiesActiveToday: companiesSaleToday,
      storesSellingToday: storesSellingTodaySet.size,
      auditActiveUsersApprox: activity.filter((a) => a.at.slice(0, 10) === todayUtc).length,
      syncEventsApprox: activity.filter((a) => a.detail?.toLowerCase().includes("sync")).length,
      criticalErrors24h: critErr24,
      warningErrors24h: warnErr24,
    },
    charts: {
      caByDay: caSeries,
      salesCountByDay: salesCountByDayFilled,
      newCompaniesByDay: newCosByDay,
      subscriptionsByStatus,
      merchantsCaByCompany: topCaRows.slice(0, 12),
      merchantsSalesCountByCompany: topSalesRows.slice(0, 12),
      cityDistribution,
      moduleUsage,
    },
    tops: {
      topByCa: topCaRows.slice(0, 10),
      topBySales: topSalesRows.slice(0, 10),
      topByStoresCount: topByStores.slice(0, 10),
      topByGrowthPct: growthRows.slice(0, 10),
      inactiveCompanies: inactive.slice(0, 20),
      riskCompanies,
    },
    adoption: adoption.slice(0, 25),
    churn: churn.slice(0, 25),
    alerts: [],
    activity,
    refs: {
      previousPeriodMerchantCa: prevCa,
      previousPeriodMerchantSales: prevSales,
    },
  };

  const alerts = buildAlertsPack(dashNoInsight.kpis, dashNoInsight.gasoStock, dashNoInsight.health, inactive);

  const platform: AdminPlatformDashboard = {
    ...dashNoInsight,
    alerts,
    aiInsights: buildInsightsText({ ...dashNoInsight, alerts }),
  };

  return platform;
}

