-- Essai gratuit par défaut: 7 jours pour chaque entreprise.
-- Crée automatiquement une ligne `company_subscriptions` lors de la création d'une entreprise.

CREATE OR REPLACE FUNCTION public.ensure_company_default_trial_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan_id uuid;
BEGIN
  -- Choisit le plan gratuit s'il existe, sinon le premier plan actif.
  SELECT id
  INTO v_plan_id
  FROM public.subscription_plans
  WHERE slug = 'free'
  LIMIT 1;

  IF v_plan_id IS NULL THEN
    SELECT id
    INTO v_plan_id
    FROM public.subscription_plans
    WHERE is_active = true
    ORDER BY price_cents ASC
    LIMIT 1;
  END IF;

  -- Si aucun plan n'existe encore, ne bloque pas la création d'entreprise.
  IF v_plan_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Insère l'abonnement d'essai si absent.
  INSERT INTO public.company_subscriptions (
    company_id,
    plan_id,
    status,
    current_period_start,
    current_period_end,
    cancel_at_period_end
  )
  VALUES (
    NEW.id,
    v_plan_id,
    'trialing',
    now(),
    now() + interval '7 days',
    false
  )
  ON CONFLICT (company_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_company_default_trial_subscription ON public.companies;

CREATE TRIGGER trg_company_default_trial_subscription
AFTER INSERT ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.ensure_company_default_trial_subscription();

