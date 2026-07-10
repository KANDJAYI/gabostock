/**
 * Rendu HTML A4 d'un devis / facture pour l'espace « Facturation Pro » (comptes solo).
 * Autonome — ne dépend ni de `Store` ni de `InvoiceA4Data`.
 */
import type {
  ProDocA4Line,
  ProDocumentA4Data,
} from "@/lib/features/pro/documents/pro-a4-types";
import { escapeHtml } from "./escape-html";

const ACCENT = "#1f6feb";

/** Nombre → « 1 234 » (espaces insécables) + code devise. */
function money(value: number, currency: string): string {
  const n = Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;
  const hasDecimals = Math.abs(n % 1) > 0.001;
  const numPart = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })
    .format(n)
    .replace(/[   ]/g, " ");
  return `${numPart} ${escapeHtml(currency)}`;
}

function qty(value: number): string {
  const n = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 3 })
    .format(n)
    .replace(/[   ]/g, " ");
}

/** yyyy-mm-dd → dd/mm/yyyy. */
function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return escapeHtml(iso);
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function tx(s: string | null | undefined): string {
  return escapeHtml((s ?? "").trim());
}

function multiline(s: string | null | undefined): string {
  return tx(s)
    .split(/\r\n|\n|\r/)
    .filter((l) => l.length > 0)
    .join("<br/>");
}

function issuerBlock(data: ProDocumentA4Data): string {
  const parts: string[] = [];
  parts.push(`<div class="iss-name">${tx(data.issuerName) || "Émetteur"}</div>`);
  if (data.issuerAddress?.trim())
    parts.push(`<div class="iss-line">${multiline(data.issuerAddress)}</div>`);
  const contact: string[] = [];
  if (data.issuerPhone?.trim()) contact.push(tx(data.issuerPhone));
  if (data.issuerEmail?.trim()) contact.push(tx(data.issuerEmail));
  if (contact.length)
    parts.push(`<div class="iss-line">${contact.join(" · ")}</div>`);
  if (data.issuerTaxId?.trim())
    parts.push(`<div class="iss-line">N° ${tx(data.issuerTaxId)}</div>`);

  const logo = data.logoUrl?.trim()
    ? `<img class="iss-logo" src="${escapeHtml(data.logoUrl)}" alt="" />`
    : "";
  return `<div class="issuer">${logo}<div class="iss-txt">${parts.join("")}</div></div>`;
}

function clientBlock(data: ProDocumentA4Data): string {
  const hasClient =
    data.clientName ||
    data.clientAddress ||
    data.clientEmail ||
    data.clientPhone ||
    data.clientTaxId;
  if (!hasClient) return "";
  const inner: string[] = [`<div class="cli-title">Client</div>`];
  if (data.clientName?.trim())
    inner.push(`<div class="cli-name">${tx(data.clientName)}</div>`);
  if (data.clientAddress?.trim())
    inner.push(`<div class="cli-line">${multiline(data.clientAddress)}</div>`);
  if (data.clientPhone?.trim())
    inner.push(`<div class="cli-line">${tx(data.clientPhone)}</div>`);
  if (data.clientEmail?.trim())
    inner.push(`<div class="cli-line">${tx(data.clientEmail)}</div>`);
  if (data.clientTaxId?.trim())
    inner.push(`<div class="cli-line">N° ${tx(data.clientTaxId)}</div>`);
  return `<div class="cli-box">${inner.join("")}</div>`;
}

function row(line: ProDocA4Line, i: number, currency: string): string {
  return `<tr>
    <td class="c-num">${i + 1}</td>
    <td class="c-desc">${tx(line.description)}</td>
    <td class="c-qty">${qty(line.quantity)}</td>
    <td class="c-unit">${tx(line.unit)}</td>
    <td class="c-price">${money(line.unitPrice, currency)}</td>
    <td class="c-tot">${money(line.total, currency)}</td>
  </tr>`;
}

function totalsBlock(data: ProDocumentA4Data): string {
  const c = data.currency;
  const rows: string[] = [];
  rows.push(
    `<div class="tt-line"><span>Sous-total</span><span>${money(data.subtotal, c)}</span></div>`,
  );
  if (data.discount > 0) {
    rows.push(
      `<div class="tt-line"><span>Remise</span><span>− ${money(data.discount, c)}</span></div>`,
    );
  }
  if (data.vatRate > 0) {
    rows.push(
      `<div class="tt-line"><span>TVA (${qty(data.vatRate)} %)</span><span>${money(data.vatAmount, c)}</span></div>`,
    );
  }
  const totalLabel = data.vatRate > 0 ? "Total TTC" : "Total";
  rows.push(
    `<div class="tt-total"><span>${totalLabel}</span><span>${money(data.total, c)}</span></div>`,
  );
  return `<div class="tt-wrap">${rows.join("")}</div>`;
}

export function renderProDocumentA4Html(data: ProDocumentA4Data): string {
  const isDevis = data.kind === "devis";
  const title = isDevis ? "DEVIS" : "FACTURE";
  const dueLabel = isDevis ? "Valable jusqu'au" : "Échéance";

  const rows = data.lines.map((l, i) => row(l, i, data.currency)).join("");
  const notes = data.notes?.trim()
    ? `<div class="notes"><div class="notes-t">Notes</div><div class="notes-b">${multiline(data.notes)}</div></div>`
    : "";
  const legal = data.legalMentions?.trim()
    ? `<div class="legal">${multiline(data.legalMentions)}</div>`
    : "";
  const dueLine = data.dueDate?.trim()
    ? `<div class="meta-line"><span>${dueLabel}</span><b>${formatDate(data.dueDate)}</b></div>`
    : "";

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: Helvetica, Arial, "DejaVu Sans", sans-serif;
    font-size: 11px;
    color: #1a1a1a;
    padding: 8px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .top { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; }
  .issuer { display: flex; align-items: flex-start; gap: 12px; max-width: 60%; }
  .iss-logo { width: 64px; height: 64px; object-fit: contain; display: block; }
  .iss-name { font-size: 16px; font-weight: 700; color: ${ACCENT}; line-height: 1.2; }
  .iss-line { font-size: 10.5px; color: #333; margin-top: 2px; line-height: 1.35; }
  .doc-meta { text-align: right; min-width: 190px; }
  .doc-title {
    display: inline-block; font-size: 22px; font-weight: 800; letter-spacing: 2px;
    color: #fff; background: ${ACCENT}; padding: 6px 16px; border-radius: 6px;
  }
  .doc-num { margin-top: 8px; font-size: 13px; font-weight: 700; }
  .meta-line { display: flex; justify-content: flex-end; gap: 8px; font-size: 10.5px; color: #444; margin-top: 3px; }
  .meta-line b { color: #1a1a1a; }
  .parties { display: flex; justify-content: flex-end; margin-top: 22px; }
  .cli-box {
    border: 1px solid #d5d9e0; border-radius: 6px; padding: 10px 12px;
    min-width: 220px; max-width: 320px; background: #f7f9fc;
  }
  .cli-title { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: ${ACCENT}; font-weight: 700; margin-bottom: 4px; }
  .cli-name { font-size: 12.5px; font-weight: 700; }
  .cli-line { font-size: 10.5px; color: #333; margin-top: 2px; line-height: 1.35; }
  table.doc { width: 100%; border-collapse: collapse; margin-top: 22px; table-layout: fixed; }
  table.doc colgroup .w-num { width: 5%; }
  table.doc thead th {
    background: ${ACCENT}; color: #fff; font-size: 10.5px; font-weight: 700;
    padding: 7px 8px; text-align: left; -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  table.doc thead th.r, table.doc td.r { text-align: right; }
  table.doc thead th.c, table.doc td.c { text-align: center; }
  table.doc tbody td { padding: 6px 8px; font-size: 10.5px; border-bottom: 1px solid #e6e9ee; vertical-align: top; line-height: 1.35; word-wrap: break-word; }
  .c-num { text-align: center; color: #888; }
  .c-desc { text-align: left; }
  .c-qty, .c-unit { text-align: center; }
  .c-price, .c-tot { text-align: right; white-space: nowrap; }
  .bottom { display: flex; justify-content: space-between; gap: 24px; margin-top: 16px; align-items: flex-start; }
  .notes { flex: 1; max-width: 55%; }
  .notes-t { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #888; font-weight: 700; margin-bottom: 3px; }
  .notes-b { font-size: 10.5px; color: #333; line-height: 1.4; }
  .tt-wrap { width: 260px; margin-left: auto; }
  .tt-line { display: flex; justify-content: space-between; padding: 4px 0; font-size: 11px; border-bottom: 1px solid #eef1f5; }
  .tt-total {
    display: flex; justify-content: space-between; margin-top: 6px; padding: 9px 12px;
    background: ${ACCENT}; color: #fff; border-radius: 6px; font-size: 13px; font-weight: 800;
  }
  .legal { margin-top: 28px; padding-top: 8px; border-top: 1px solid #e6e9ee; font-size: 9px; color: #777; line-height: 1.4; }
</style></head><body>
  <div class="top">
    ${issuerBlock(data)}
    <div class="doc-meta">
      <div class="doc-title">${title}</div>
      <div class="doc-num">${tx(data.number)}</div>
      <div class="meta-line"><span>Date</span><b>${formatDate(data.issueDate)}</b></div>
      ${dueLine}
    </div>
  </div>
  <div class="parties">${clientBlock(data)}</div>
  <table class="doc">
    <colgroup>
      <col class="w-num" /><col style="width:44%" /><col style="width:11%" />
      <col style="width:10%" /><col style="width:15%" /><col style="width:15%" />
    </colgroup>
    <thead><tr>
      <th class="c">N°</th><th>Désignation</th><th class="c">Qté</th>
      <th class="c">Unité</th><th class="r">Prix unit.</th><th class="r">Total</th>
    </tr></thead>
    <tbody>${rows || `<tr><td colspan="6" style="text-align:center;color:#999;padding:16px">Aucune ligne</td></tr>`}</tbody>
  </table>
  <div class="bottom">
    ${notes || "<div></div>"}
    ${totalsBlock(data)}
  </div>
  ${legal}
</body></html>`;
}
