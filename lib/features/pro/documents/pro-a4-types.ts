/** Ligne d'un document pour le rendu PDF A4. */
export type ProDocA4Line = {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
};

/**
 * Données de rendu PDF A4 d'un devis / facture — **découplé** de la gestion
 * commerciale (`InvoiceA4Data`/`Store`). Envoyé tel quel à `/api/pdf/pro-document`.
 */
export type ProDocumentA4Data = {
  kind: "devis" | "facture";
  number: string;
  issueDate: string; // yyyy-mm-dd
  dueDate?: string | null;
  currency: string;

  // Émetteur
  issuerName: string;
  issuerAddress?: string | null;
  issuerPhone?: string | null;
  issuerEmail?: string | null;
  issuerTaxId?: string | null;
  legalMentions?: string | null;
  logoUrl?: string | null;

  // Client
  clientName?: string | null;
  clientAddress?: string | null;
  clientEmail?: string | null;
  clientPhone?: string | null;
  clientTaxId?: string | null;

  // Lignes & totaux
  lines: ProDocA4Line[];
  subtotal: number;
  discount: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  notes?: string | null;
};
