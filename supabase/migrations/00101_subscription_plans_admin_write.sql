-- Permet au super admin de créer/modifier les plans d'abonnement (prix, quotas, etc.).

-- Note: `subscription_plans_select` (is_active = true) reste pour les utilisateurs classiques.
-- Ici on ajoute des droits d'écriture pour `is_super_admin()`.

DROP POLICY IF EXISTS "subscription_plans_insert" ON public.subscription_plans;
DROP POLICY IF EXISTS "subscription_plans_update" ON public.subscription_plans;
DROP POLICY IF EXISTS "subscription_plans_delete" ON public.subscription_plans;

CREATE POLICY "subscription_plans_insert"
ON public.subscription_plans
FOR INSERT
WITH CHECK (is_super_admin());

CREATE POLICY "subscription_plans_update"
ON public.subscription_plans
FOR UPDATE
USING (is_super_admin());

CREATE POLICY "subscription_plans_delete"
ON public.subscription_plans
FOR DELETE
USING (is_super_admin());

