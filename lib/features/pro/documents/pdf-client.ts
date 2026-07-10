"use client";

import type { ProIssuer } from "../issuer/types";
import type { ProDocumentA4Data } from "./pro-a4-types";
import type { ProDocumentWithLines } from "./types";

/** Assemble le payload PDF à partir d'un document et du profil émetteur. */
export function buildProDocumentA4Data(
  doc: ProDocumentWithLines,
  issuer: ProIssuer | null,
): ProDocumentA4Data {
  return {
    kind: doc.kind,
    number: doc.number,
    issueDate: doc.issue_date,
    dueDate: doc.due_date,
    currency: doc.currency,
    issuerName: issuer?.business_name ?? "",
    issuerAddress: issuer?.address ?? null,
    issuerPhone: issuer?.phone ?? null,
    issuerEmail: issuer?.email ?? null,
    issuerTaxId: issuer?.tax_id ?? null,
    legalMentions: issuer?.legal_mentions ?? null,
    logoUrl: issuer?.logo_url ?? null,
    clientName: doc.client_name,
    clientAddress: doc.client_address,
    clientEmail: doc.client_email,
    clientPhone: doc.client_phone,
    clientTaxId: doc.client_tax_id,
    lines: doc.lines.map((l) => ({
      description: l.description,
      quantity: l.quantity,
      unit: l.unit,
      unitPrice: l.unit_price,
      total: l.line_total,
    })),
    subtotal: doc.subtotal,
    discount: doc.discount,
    vatRate: doc.vat_rate,
    vatAmount: doc.vat_amount,
    total: doc.total,
    notes: doc.notes,
  };
}

/** POST le payload et renvoie le PDF (Blob). Mirroir de `fetchInvoicePdfBlob`. */
export async function fetchProDocumentPdfBlob(
  data: ProDocumentA4Data,
): Promise<Blob> {
  const res = await fetch("/api/pdf/pro-document", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const t = await res.text();
    let msg = t;
    try {
      const j = JSON.parse(t) as { error?: string };
      if (j.error) msg = j.error;
    } catch {
      /* texte brut */
    }
    throw new Error(msg || `Échec PDF (${res.status})`);
  }
  return res.blob();
}
