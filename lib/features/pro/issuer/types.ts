/** Profil « émetteur » d'un compte solo — coordonnées imprimées sur devis/factures. */
export type ProIssuer = {
  user_id: string;
  business_name: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  tax_id: string | null;
  logo_url: string | null;
  currency: string;
  default_vat_rate: number;
  legal_mentions: string | null;
  created_at: string;
  updated_at: string;
};

export type ProIssuerFormInput = {
  business_name: string;
  address: string;
  phone: string;
  email: string;
  tax_id: string;
  currency: string;
  default_vat_rate: number;
  legal_mentions: string;
};
