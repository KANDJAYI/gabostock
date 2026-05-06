-- Pharmacie: champs fournisseurs (laboratoires / grossistes) optionnels.
-- Additif: colonnes NULL pour compatibilité autres domaines.

ALTER TABLE public.suppliers
  ADD COLUMN IF NOT EXISTS pharmacy_license_number TEXT NULL,
  ADD COLUMN IF NOT EXISTS pharmacy_regulatory_id TEXT NULL,
  ADD COLUMN IF NOT EXISTS pharmacy_is_manufacturer BOOLEAN NULL,
  ADD COLUMN IF NOT EXISTS pharmacy_cold_chain_supported BOOLEAN NULL,
  ADD COLUMN IF NOT EXISTS pharmacy_payment_terms_days INTEGER NULL CHECK (pharmacy_payment_terms_days IS NULL OR pharmacy_payment_terms_days >= 0);

COMMENT ON COLUMN public.suppliers.pharmacy_license_number IS 'Pharmacie: numéro d’agrément / licence (optionnel).';
COMMENT ON COLUMN public.suppliers.pharmacy_regulatory_id IS 'Pharmacie: identifiant règlementaire / registre (optionnel).';
COMMENT ON COLUMN public.suppliers.pharmacy_is_manufacturer IS 'Pharmacie: fabricant/laboratoire (optionnel).';
COMMENT ON COLUMN public.suppliers.pharmacy_cold_chain_supported IS 'Pharmacie: support chaîne du froid (optionnel).';
COMMENT ON COLUMN public.suppliers.pharmacy_payment_terms_days IS 'Pharmacie: délais de paiement en jours (optionnel).';

