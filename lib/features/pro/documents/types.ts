export type ProDocumentKind = "devis" | "facture";

export type ProDocumentStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "paid"
  | "cancelled";

/** Ligne persistée d'un document. */
export type ProDocumentLine = {
  id: string;
  document_id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  line_total: number;
  position: number;
};

/** Ligne saisie dans l'éditeur (avant calcul/persistance). */
export type ProDocumentLineInput = {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
};

export type ProDocument = {
  id: string;
  user_id: string;
  kind: ProDocumentKind;
  number: string;
  client_id: string | null;
  client_name: string | null;
  client_address: string | null;
  client_email: string | null;
  client_phone: string | null;
  client_tax_id: string | null;
  status: ProDocumentStatus;
  issue_date: string;
  due_date: string | null;
  currency: string;
  notes: string | null;
  subtotal: number;
  discount: number;
  vat_rate: number;
  vat_amount: number;
  total: number;
  converted_from_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ProDocumentWithLines = ProDocument & {
  lines: ProDocumentLine[];
};

/** Saisie de l'éditeur devis/facture. */
export type ProDocumentFormInput = {
  kind: ProDocumentKind;
  client_id: string | null;
  client_name: string;
  client_address: string;
  client_email: string;
  client_phone: string;
  client_tax_id: string;
  status: ProDocumentStatus;
  issue_date: string; // yyyy-mm-dd
  due_date: string; // yyyy-mm-dd | ""
  currency: string;
  notes: string;
  discount: number;
  vat_rate: number;
  lines: ProDocumentLineInput[];
};

export const DOCUMENT_STATUS_LABELS: Record<ProDocumentStatus, string> = {
  draft: "Brouillon",
  sent: "Envoyé",
  accepted: "Accepté",
  paid: "Payé",
  cancelled: "Annulé",
};

export const DEVIS_STATUS_OPTIONS: ProDocumentStatus[] = [
  "draft",
  "sent",
  "accepted",
  "cancelled",
];

export const FACTURE_STATUS_OPTIONS: ProDocumentStatus[] = [
  "draft",
  "sent",
  "paid",
  "cancelled",
];
