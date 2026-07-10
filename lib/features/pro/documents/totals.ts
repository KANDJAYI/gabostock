import type { ProDocumentLineInput } from "./types";

function safe(n: number): number {
  return Number.isFinite(n) ? n : 0;
}

/** Total d'une ligne = quantité × prix unitaire (arrondi à 2 décimales). */
export function computeLineTotal(quantity: number, unitPrice: number): number {
  return Math.round(safe(quantity) * safe(unitPrice) * 100) / 100;
}

export type DocumentTotals = {
  subtotal: number;
  discount: number;
  vatAmount: number;
  total: number;
};

/**
 * Calcule les totaux d'un document.
 * - `subtotal` = somme des lignes
 * - base taxable = max(0, subtotal − remise)
 * - `vatAmount` = base × (vat_rate / 100)
 * - `total` = base + TVA
 */
export function computeDocumentTotals(
  lines: ProDocumentLineInput[],
  discount: number,
  vatRate: number,
): DocumentTotals {
  const subtotal =
    Math.round(
      lines.reduce(
        (sum, l) => sum + computeLineTotal(l.quantity, l.unit_price),
        0,
      ) * 100,
    ) / 100;
  const d = Math.max(0, safe(discount));
  const base = Math.max(0, subtotal - d);
  const vatAmount = Math.round(base * (safe(vatRate) / 100) * 100) / 100;
  const total = Math.round((base + vatAmount) * 100) / 100;
  return { subtotal, discount: d, vatAmount, total };
}
