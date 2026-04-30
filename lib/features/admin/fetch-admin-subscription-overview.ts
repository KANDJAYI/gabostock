"use client";

import { createClient } from "@/lib/supabase/client";
import { mapSupabaseError } from "@/lib/supabase/map-error";
import type { CompanySubscriptionDto, SubscriptionPlanDto } from "@/lib/features/subscription/types";

function toNum(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function mapPlan(row: Record<string, unknown>): SubscriptionPlanDto {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    name: String(row.name ?? ""),
    description: row.description != null ? String(row.description) : null,
    priceCents: Math.max(0, toNum(row.price_cents)),
    currency: String(row.currency ?? "XOF"),
    interval: row.interval === "year" ? "year" : "month",
    maxStores: row.max_stores == null ? null : toNum(row.max_stores),
    maxUsers: row.max_users == null ? null : toNum(row.max_users),
  };
}

function mapSub(row: Record<string, unknown>): CompanySubscriptionDto {
  return {
    id: String(row.id ?? ""),
    status: String(row.status ?? ""),
    planId: String(row.plan_id ?? ""),
    currentPeriodStart: row.current_period_start != null ? String(row.current_period_start) : null,
    currentPeriodEnd: row.current_period_end != null ? String(row.current_period_end) : null,
    cancelAtPeriodEnd: row.cancel_at_period_end === true,
    stripeCustomerId: row.stripe_customer_id != null ? String(row.stripe_customer_id) : null,
    stripeSubscriptionId: row.stripe_subscription_id != null ? String(row.stripe_subscription_id) : null,
  };
}

export type AdminCompanySubscriptionRow = {
  companyId: string;
  companyName: string;
  companyIsActive: boolean;
  subscription: CompanySubscriptionDto | null;
  plan: SubscriptionPlanDto | null;
};

export type AdminSubscriptionOverview = {
  plans: SubscriptionPlanDto[];
  byCompany: AdminCompanySubscriptionRow[];
  countByStatus: Map<string, number>;
};

/**
 * Données Super Admin : offres publiées + abonnements toutes entreprises.
 */
export async function fetchAdminSubscriptionOverview(): Promise<AdminSubscriptionOverview> {
  const supabase = createClient();
  const [plansRes, subsRes, companiesRes] = await Promise.all([
    supabase.from("subscription_plans").select("*").order("price_cents", { ascending: true }),
    supabase
      .from("company_subscriptions")
      .select(
        "id, company_id, status, plan_id, current_period_start, current_period_end, cancel_at_period_end, stripe_customer_id, stripe_subscription_id",
      ),
    supabase.from("companies").select("id, name, is_active").order("name", { ascending: true }),
  ]);

  if (plansRes.error) throw mapSupabaseError(plansRes.error);
  if (subsRes.error) throw mapSupabaseError(subsRes.error);
  if (companiesRes.error) throw mapSupabaseError(companiesRes.error);

  const planRows = (plansRes.data ?? []) as Record<string, unknown>[];
  const allPlans = planRows.map(mapPlan);
  const activePlans = planRows.filter((r) => r.is_active === true).map(mapPlan);
  const plansById = new Map(allPlans.map((p) => [p.id, p]));

  const subs = (subsRes.data ?? []) as Record<string, unknown>[];
  const byCompany = new Map<string, Record<string, unknown>>();
  for (const s of subs) {
    const cid = s.company_id != null ? String(s.company_id) : "";
    if (!cid) continue;
    const cur = byCompany.get(cid);
    if (!cur) {
      byCompany.set(cid, s);
      continue;
    }
    const a = String(s.current_period_end ?? "");
    const b = String(cur.current_period_end ?? "");
    if (a > b) byCompany.set(cid, s);
  }

  const countByStatus = new Map<string, number>();
  for (const s of subs) {
    const st = String(s.status ?? "unknown");
    countByStatus.set(st, (countByStatus.get(st) ?? 0) + 1);
  }

  const companies = (companiesRes.data ?? []) as Array<{
    id: string;
    name: string | null;
    is_active?: boolean | null;
  }>;

  const byCompanyRows: AdminCompanySubscriptionRow[] = companies.map((c) => {
    const raw = byCompany.get(c.id);
    const subscription = raw ? mapSub(raw) : null;
    const plan = subscription ? plansById.get(subscription.planId) ?? null : null;
    return {
      companyId: c.id,
      companyName: String(c.name ?? "—"),
      companyIsActive: c.is_active === true,
      subscription,
      plan,
    };
  });

  return {
    plans: activePlans.length > 0 ? activePlans : allPlans,
    byCompany: byCompanyRows,
    countByStatus,
  };
}
