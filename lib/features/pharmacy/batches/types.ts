export type PharmacyBatchRow = {
  id: string;
  company_id: string;
  store_id: string;
  product_id: string;
  lot_number: string;
  expires_on: string | null; // YYYY-MM-DD
  manufacturer: string | null;
  drug_category: string | null;
  prescription_required: boolean | null;
  dosage: string | null;
  form: string | null;
  quantity: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  product?: { name?: string } | { name?: string }[] | null;
};

export type PharmacyExpirySummary = {
  productId: string;
  earliestExpiresOn: string | null;
  expiredCount: number;
  expiringSoonCount: number;
};

