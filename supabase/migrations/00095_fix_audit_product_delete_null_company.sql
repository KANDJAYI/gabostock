-- Lors d’un DELETE produit (ex. CASCADE suppression entreprise), un audit avec company_id pointant
-- vers l’entreprise peut violer la FK si la contrainte est encore stricte, ou subtilités d’ordre.
-- On enregistre l’id entreprise dans old_data et on laisse company_id NULL sur la ligne d’audit.
CREATE OR REPLACE FUNCTION public.audit_trigger_product()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (company_id, user_id, action, entity_type, entity_id, new_data)
    VALUES (
      NEW.company_id,
      auth.uid(),
      'product.create',
      'product',
      NEW.id,
      jsonb_build_object('name', NEW.name, 'sku', NEW.sku)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (company_id, user_id, action, entity_type, entity_id, old_data, new_data)
    VALUES (
      NEW.company_id,
      auth.uid(),
      CASE WHEN NEW.deleted_at IS NOT NULL AND (OLD.deleted_at IS NULL OR OLD.deleted_at IS DISTINCT FROM NEW.deleted_at) THEN 'product.delete' ELSE 'product.update' END,
      'product',
      NEW.id,
      jsonb_build_object('name', OLD.name, 'sku', OLD.sku),
      jsonb_build_object('name', NEW.name, 'sku', NEW.sku)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (company_id, user_id, action, entity_type, entity_id, old_data)
    VALUES (
      NULL,
      auth.uid(),
      'product.delete',
      'product',
      OLD.id,
      jsonb_build_object('name', OLD.name, 'sku', OLD.sku, 'company_id', OLD.company_id)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

COMMENT ON FUNCTION public.audit_trigger_product IS
'Audit produits : en DELETE, company_id NULL (FK-safe) — company_id conservé dans old_data.';
