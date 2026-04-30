"use client";

import { createClient } from "@/lib/supabase/client";
import { mapSupabaseError } from "@/lib/supabase/map-error";
import type {
  CompanySubscriptionDto,
  SubscriptionPageData,
  SubscriptionPlanDto,
} from "./types";

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

export async function fetchSubscriptionPageData(companyId: string): Promise<SubscriptionPageData> {
  const supabase = createClient();

  const [plansRes, subRes, companyRes, storesRes, membersRes] = await Promise.all([
    supabase.from("subscription_plans").select("*").eq("is_active", true).order("price_cents", { ascending: true }),
    supabase
      .from("company_subscriptions")
      .select(
        "id, status, plan_id, current_period_start, current_period_end, cancel_at_period_end, stripe_customer_id, stripe_subscription_id",
      )
      .eq("company_id", companyId)
      .maybeSingle(),
    supabase.from("companies").select("name, store_quota").eq("id", companyId).single(),
    supabase.from("stores").select("id", { count: "exact", head: true }).eq("company_id", companyId),
    supabase
      .from("user_company_roles")
      .select("user_id", { count: "exact", head: true })
      .eq("company_id", companyId)
      .eq("is_active", true),
  ]);

  if (plansRes.error) throw mapSupabaseError(plansRes.error);
  if (companyRes.error) throw mapSupabaseError(companyRes.error);
  if (storesRes.error) throw mapSupabaseError(storesRes.error);
  if (membersRes.error) throw mapSupabaseError(membersRes.error);
  if (subRes.error) throw mapSupabaseError(subRes.error);

  const plans = (plansRes.data ?? []).map((r) => mapPlan(r as Record<string, unknown>));
  const plansById = new Map(plans.map((p) => [p.id, p]));

  const companyRow = companyRes.data as { name?: string; store_quota?: unknown } | null;
  const companyName = String(companyRow?.name ?? "—");
  const storeQuotaPlatform = Math.max(1, toNum(companyRow?.store_quota));

  let subscription: CompanySubscriptionDto | null = null;
  if (subRes.data && !subRes.error) {
    const s = subRes.data as Record<string, unknown>;
    subscription = {
      id: String(s.id ?? ""),
      status: String(s.status ?? ""),
      planId: String(s.plan_id ?? ""),
      currentPeriodStart: s.current_period_start != null ? String(s.current_period_start) : null,
      currentPeriodEnd: s.current_period_end != null ? String(s.current_period_end) : null,
      cancelAtPeriodEnd: s.cancel_at_period_end === true,
      stripeCustomerId: s.stripe_customer_id != null ? String(s.stripe_customer_id) : null,
      stripeSubscriptionId: s.stripe_subscription_id != null ? String(s.stripe_subscription_id) : null,
    };
  }

  let currentPlan: SubscriptionPlanDto | null = subscription
    ? plansById.get(subscription.planId) ?? null
    : null;
  if (!currentPlan) {
    currentPlan = plans.find((p) => p.slug === "free") ?? plans[0] ?? null;
  }

  return {
    companyName,
    storeQuotaPlatform,
    storeCount: storesRes.count ?? 0,
    activeMemberCount: membersRes.count ?? 0,
    plans,
    subscription,
    currentPlan,
  };
}
