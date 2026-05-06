export type Supplier = {
  id: string;
  company_id: string;
  name: string;
  contact: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  /** ===== Pharmacie (optionnel) ===== */
  pharmacy_license_number?: string | null;
  pharmacy_regulatory_id?: string | null;
  pharmacy_is_manufacturer?: boolean | null;
  pharmacy_cold_chain_supported?: boolean | null;
  pharmacy_payment_terms_days?: number | null;
  created_at: string;
  updated_at: string;
};

export type SupplierFormInput = {
  name: string;
  contact?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  /** ===== Pharmacie (optionnel) ===== */
  pharmacyLicenseNumber?: string | null;
  pharmacyRegulatoryId?: string | null;
  pharmacyIsManufacturer?: boolean | null;
  pharmacyColdChainSupported?: boolean | null;
  pharmacyPaymentTermsDays?: number | null;
};

