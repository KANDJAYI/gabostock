-- Suppression Stripe: on retire les colonnes et index liés à Stripe.

DROP INDEX IF EXISTS public.idx_company_subscriptions_stripe;

ALTER TABLE public.company_subscriptions
  DROP COLUMN IF EXISTS stripe_customer_id,
  DROP COLUMN IF EXISTS stripe_subscription_id;

