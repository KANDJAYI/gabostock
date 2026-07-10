import type { InvoiceA4Data } from "@/lib/features/invoices/invoice-a4-types";
import type { ReportsPageData } from "@/lib/features/dashboard/types";
import type { ReceiptTicketData } from "@/lib/features/receipt/receipt-ticket-types";
import type {
  ProDocA4Line,
  ProDocumentA4Data,
} from "@/lib/features/pro/documents/pro-a4-types";

export function parseInvoiceA4Payload(json: unknown): InvoiceA4Data {
  if (!json || typeof json !== "object") throw new Error("Corps JSON invalide");
  const o = json as Record<string, unknown>;
  const ds = o.date;
  const date = new Date(typeof ds === "string" ? ds : String(ds));
  if (Number.isNaN(date.getTime())) throw new Error("date invalide");
  let logoBytes: Uint8Array | null = null;
  const lb = o.logoBytes;
  if (typeof lb === "string" && lb.length > 0) {
    logoBytes = Uint8Array.from(Buffer.from(lb, "base64"));
  }
  const { date: _d, logoBytes: _l, ...rest } = o;
  return {
    ...(rest as Omit<InvoiceA4Data, "date" | "logoBytes">),
    date,
    logoBytes,
  };
}

export function parseReceiptThermalPayload(json: unknown): ReceiptTicketData {
  if (!json || typeof json !== "object") throw new Error("Corps JSON invalide");
  const o = json as Record<string, unknown>;
  const date = new Date(typeof o.date === "string" ? o.date : String(o.date));
  if (Number.isNaN(date.getTime())) throw new Error("date invalide");
  const { date: _d, ...rest } = o;
  return { ...(rest as Omit<ReceiptTicketData, "date">), date };
}

/** Valide le payload d'un devis/facture « Pro » (`ProDocumentA4Data`). */
export function parseProDocumentA4Payload(json: unknown): ProDocumentA4Data {
  if (!json || typeof json !== "object") throw new Error("Corps JSON invalide");
  const o = json as Record<string, unknown>;
  const kind = o.kind === "devis" ? "devis" : "facture";
  const num = (n: unknown): number => {
    const v = typeof n === "number" ? n : Number(n);
    return Number.isFinite(v) ? v : 0;
  };
  const str = (s: unknown): string => (typeof s === "string" ? s : "");
  const strOrNull = (s: unknown): string | null =>
    typeof s === "string" && s.length > 0 ? s : null;

  const rawLines = Array.isArray(o.lines) ? o.lines : [];
  const lines: ProDocA4Line[] = rawLines.map((l) => {
    const li = (l ?? {}) as Record<string, unknown>;
    return {
      description: str(li.description),
      quantity: num(li.quantity),
      unit: str(li.unit),
      unitPrice: num(li.unitPrice),
      total: num(li.total),
    };
  });

  return {
    kind,
    number: str(o.number),
    issueDate: str(o.issueDate),
    dueDate: strOrNull(o.dueDate),
    currency: str(o.currency) || "XOF",
    issuerName: str(o.issuerName),
    issuerAddress: strOrNull(o.issuerAddress),
    issuerPhone: strOrNull(o.issuerPhone),
    issuerEmail: strOrNull(o.issuerEmail),
    issuerTaxId: strOrNull(o.issuerTaxId),
    legalMentions: strOrNull(o.legalMentions),
    logoUrl: strOrNull(o.logoUrl),
    clientName: strOrNull(o.clientName),
    clientAddress: strOrNull(o.clientAddress),
    clientEmail: strOrNull(o.clientEmail),
    clientPhone: strOrNull(o.clientPhone),
    clientTaxId: strOrNull(o.clientTaxId),
    lines,
    subtotal: num(o.subtotal),
    discount: num(o.discount),
    vatRate: num(o.vatRate),
    vatAmount: num(o.vatAmount),
    total: num(o.total),
    notes: strOrNull(o.notes),
  };
}

export function parseReportsPayload(json: unknown): {
  data: ReportsPageData;
  meta: { title: string; subtitle: string };
} {
  if (!json || typeof json !== "object") throw new Error("Corps JSON invalide");
  const o = json as Record<string, unknown>;
  if (!o.data || typeof o.data !== "object") throw new Error("data manquant");
  if (!o.meta || typeof o.meta !== "object") throw new Error("meta manquant");
  const meta = o.meta as { title?: unknown; subtitle?: unknown };
  return {
    data: o.data as ReportsPageData,
    meta: {
      title: String(meta.title ?? ""),
      subtitle: String(meta.subtitle ?? ""),
    },
  };
}
