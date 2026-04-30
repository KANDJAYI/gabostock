-- Suppression définitive d'une entreprise par le super admin.
-- Le simple DELETE côté client casse sur les enregistrements enfants (RLS sans politique DELETE).
-- Cette RPC s'exécute en SECURITY DEFINER (rôle propriétaire) et applique correctement le CASCADE.
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
  DELETE FROM public.companies WHERE id = p_company_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_company(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.admin_delete_company(uuid) TO authenticated;

COMMENT ON FUNCTION public.admin_delete_company IS
'Super admin: suppression définitive d''une entreprise et de toutes les données liées (CASCADE, hors RLS client).';
