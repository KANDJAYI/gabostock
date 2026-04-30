-- Même correctif que 00091 (certains déploiements n'ont pas appliqué 00091).
-- Les triggers d'audit insèrent des lignes pendant un CASCADE de suppression d'entreprise ; une FK
-- stricte sur audit_logs.company_id peut provoquer 409 (insert/update en conflit avec la contrainte).
ALTER TABLE IF EXISTS public.audit_logs
  DROP CONSTRAINT IF EXISTS audit_logs_company_id_fkey,
  DROP CONSTRAINT IF EXISTS audit_logs_store_id_fkey,
  DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;

-- Nettoyage explicite des logs avant suppression = moins d'historique orphelin + ordre contrôlé.
CREATE OR REPLACE FUNCTION public.admin_delete_company(p_company_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Non authentifié';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true) THEN
    RAISE EXCEPTION 'Réservé au super admin';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.companies WHERE id = p_company_id) THEN
    RAISE EXCEPTION 'Entreprise introuvable' USING ERRCODE = 'P0002';
  END IF;
  DELETE FROM public.audit_logs WHERE company_id = p_company_id;
  DELETE FROM public.companies WHERE id = p_company_id;
END;
$$;

COMMENT ON FUNCTION public.admin_delete_company IS
'Super admin: purge audit_logs ciblés puis suppression entreprise (CASCADE, RLS contourné).';
