/** Données page Abonnement (tenant) — aligné `subscription_plans` + `company_subscriptions`. */

export type SubscriptionPlanDto = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  interval: "month" | "year";
  maxStores: number | null;
  maxUsers: number | null;
};

export type CompanySubscriptionDto = {
  id: string;
  status: string;
  planId: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
};

export type SubscriptionPageData = {
  companyName: string;
  storeQuotaPlatform: number;
  /** Compte actif des boutiques de l’entreprise */
  storeCount: number;
  /** Membres actifs (rôles) */
  activeMemberCount: number;
  plans: SubscriptionPlanDto[];
  subscription: CompanySubscriptionDto | null;
  currentPlan: SubscriptionPlanDto | null;
};
