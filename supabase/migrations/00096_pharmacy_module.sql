-- Module Pharmacie (additif) — lots + expirations + champs produit optionnels.
-- Objectif: supporter l'activité "pharmacie" sans impacter les autres domaines.

-- ========== 1) Champs produits optionnels (ne cassent aucun domaine) ==========
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS pharmacy_lot_number TEXT NULL,
  ADD COLUMN IF NOT EXISTS pharmacy_expiration_date DATE NULL,
  ADD COLUMN IF NOT EXISTS pharmacy_laboratory TEXT NULL,
  ADD COLUMN IF NOT EXISTS pharmacy_drug_category TEXT NULL,
  ADD COLUMN IF NOT EXISTS pharmacy_prescription_required BOOLEAN NULL,
  ADD COLUMN IF NOT EXISTS pharmacy_dosage TEXT NULL,
  ADD COLUMN IF NOT EXISTS pharmacy_form TEXT NULL;

COMMENT ON COLUMN public.products.pharmacy_lot_number IS 'Pharmacie: numéro de lot (optionnel, champ produit).';
COMMENT ON COLUMN public.products.pharmacy_expiration_date IS 'Pharmacie: date expiration (optionnel, champ produit).';
COMMENT ON COLUMN public.products.pharmacy_laboratory IS 'Pharmacie: laboratoire / fabricant (optionnel).';
COMMENT ON COLUMN public.products.pharmacy_drug_category IS 'Pharmacie: catégorie médicament (optionnel).';
COMMENT ON COLUMN public.products.pharmacy_prescription_required IS 'Pharmacie: prescription obligatoire (optionnel).';
COMMENT ON COLUMN public.products.pharmacy_dosage IS 'Pharmacie: dosage (optionnel).';
COMMENT ON COLUMN public.products.pharmacy_form IS 'Pharmacie: forme pharmaceutique (optionnel).';

-- ========== 2) Table lots (batch/lot) — stock par lot, expirations ==========
CREATE TABLE IF NOT EXISTS public.pharmacy_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  lot_number TEXT NOT NULL,
  expires_on DATE NULL,
  manufacturer TEXT NULL,
  drug_category TEXT NULL,
  prescription_required BOOLEAN NULL,
  dosage TEXT NULL,
  form TEXT NULL,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(store_id, product_id, lot_number)
);

COMMENT ON TABLE public.pharmacy_batches IS 'Pharmacie: lots (numéro de lot, expiration, quantité) par produit et boutique.';
COMMENT ON COLUMN public.pharmacy_batches.quantity IS 'Quantité disponible pour ce lot (bouteille/boîte/etc).';

CREATE INDEX IF NOT EXISTS idx_pharmacy_batches_company ON public.pharmacy_batches(company_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_batches_store ON public.pharmacy_batches(store_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_batches_product ON public.pharmacy_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_batches_expires ON public.pharmacy_batches(expires_on) WHERE expires_on IS NOT NULL;

DROP TRIGGER IF EXISTS set_updated_at ON public.pharmacy_batches;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.pharmacy_batches
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- ========== 3) RLS (aligné au schéma existant) ==========
ALTER TABLE public.pharmacy_batches ENABLE ROW LEVEL SECURITY;

-- Lecture/écriture limitée aux entreprises du user + accès boutique (store-scoped), ou super-admin.
CREATE POLICY "pharmacy_batches_all" ON public.pharmacy_batches FOR ALL USING (
  is_super_admin() OR (
    company_id IN (SELECT * FROM current_user_company_ids())
    AND store_id IN (SELECT * FROM current_user_store_ids(company_id))
  )
);

