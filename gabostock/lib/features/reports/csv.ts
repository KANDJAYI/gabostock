import { escapeCsv } from "@/lib/utils/csv";
import type { DashboardData, ReportsPageData } from "@/lib/features/dashboard/types";
import type { ProExportSheet } from "@/lib/utils/excel-pro-export";

/** Même contenu qu’un ancien export CSV, pour Excel ou CSV texte. */
function reportsPageFlatMatrix(
  data: ReportsPageData,
): (string | number)[][] {
  const rows: (string | number)[][] = [];
  rows.push(["Section", "Indicateur", "Valeur"]);
  rows.push(["Synthèse", "CA ventes", data.salesSummary.totalAmount]);
  rows.push(["Synthèse", "Nb ventes", data.salesSummary.count]);
  rows.push(["Synthèse", "Articles vendus", data.salesSummary.itemsSold]);
  rows.push(["Synthèse", "Marge", data.salesSummary.margin]);
  rows.push(["Synthèse", "Taux marge %", data.marginRatePercent]);
  rows.push(["Synthèse", "Panier moyen", data.ticketAverage]);
  rows.push(["Synthèse", "Achats", data.purchasesSummary.totalAmount]);
  rows.push(["Synthèse", "Nb commandes achats", data.purchasesSummary.count]);
  rows.push(["Synthèse", "Valeur stock", data.stockValue.totalValue]);
  rows.push(["Synthèse", "Nb produits stock", data.stockValue.productCount]);
  rows.push(["Synthèse", "Alertes stock (périmètre)", data.lowStockCount]);

  rows.push(["Top produits", "Produit", "CA", "Qté", "Marge"]);
  for (const p of data.topProducts) {
    rows.push([
      "Top produits",
      p.productName,
      p.revenue,
      p.quantitySold,
      p.margin,
    ]);
  }
  rows.push(["Moins vendus", "Produit", "CA", "Qté", "Marge"]);
  for (const p of data.leastProducts) {
    rows.push([
      "Moins vendus",
      p.productName,
      p.revenue,
      p.quantitySold,
      p.margin,
    ]);
  }
  rows.push(["Catégories", "Catégorie", "CA", "Qté"]);
  for (const c of data.salesByCategory) {
    rows.push(["Catégories", c.categoryName, c.revenue, c.quantity]);
  }
  rows.push(["Ventes par jour", "Date", "CA", "Nb ventes"]);
  for (const d of data.salesByDay) {
    rows.push(["Ventes par jour", d.date, d.total, d.count]);
  }
  if (data.stockReport) {
    rows.push(["Stock boutique", "Entrées (mouv.)", data.stockReport.entries]);
    rows.push(["Stock boutique", "Sorties (mouv.)", data.stockReport.exits]);
    rows.push(["Stock boutique", "Net", data.stockReport.net]);
    rows.push(["Stock boutique", "Produits en stock", data.stockReport.currentStockCount]);
  }
  return rows;
}

const SECTION_TINT: Record<string, string> = {
  Section: "FFF1F5F9",
  Synthèse: "FFFFF7ED",
  "Top produits": "FFFFEDD5",
  "Moins vendus": "FFFEE2E2",
  Catégories: "FFECFDF5",
  "Ventes par jour": "FFFFEDD5",
  "Stock boutique": "FFFFEDD5",
};

export function reportsPageToFlatProSheet(
  data: ReportsPageData,
  meta: { subtitle: string },
): ProExportSheet {
  const matrix = reportsPageFlatMatrix(data);
  const maxCol = Math.max(1, ...matrix.map((r) => r.length));
  const pad = (r: (string | number)[]) => {
    const o = [...r];
    while (o.length < maxCol) o.push("");
    return o;
  };
  const padded = matrix.map(pad);
  const headers = padded[0]!.map((c, i) => String(c ?? "") || `Colonne ${i + 1}`);
  const rows = padded.slice(1);
  return {
    name: "Données (vue 1 onglet)",
    reportTitle: "Rapports — export consolidé (Gabostock)",
    subtitle: meta.subtitle,
    headers,
    rows,
    cellFillArgb: ({ row, colIndex }) => {
      if (colIndex !== 0) return undefined;
      const a = String(row[0] ?? "");
      return SECTION_TINT[a] ?? "FFFFFFFF";
    },
  };
}

function reportsPageFlatMatrixString(data: ReportsPageData): string[][] {
  return reportsPageFlatMatrix(data).map((r) => r.map((c) => String(c)));
}

export function reportsPageToCsv(data: ReportsPageData): string {
  return reportsPageFlatMatrixString(data)
    .map((r) => r.map(escapeCsv).join(","))
    .join("\n");
}

export function reportsToCsv(data: DashboardData): string {
  const rows: string[][] = [];

  rows.push(["Section", "Indicateur", "Valeur"]);
  rows.push(["Synthèse", "CA ventes", String(data.salesSummary.totalAmount)]);
  rows.push(["Synthèse", "Nb ventes", String(data.salesSummary.count)]);
  rows.push(["Synthèse", "Articles vendus", String(data.salesSummary.itemsSold)]);
  rows.push(["Synthèse", "Marge", String(data.salesSummary.margin)]);
  rows.push(["Synthèse", "Panier moyen", String(data.ticketAverage)]);
  rows.push(["Synthèse", "Achats", String(data.purchasesSummary.totalAmount)]);
  rows.push(["Synthèse", "Valeur stock", String(data.stockValue.totalValue)]);
  rows.push(["Synthèse", "Alertes stock", String(data.lowStockCount)]);

  rows.push(["Top produits", "Produit", "CA", "Qté", "Marge"]);
  for (const p of data.topProducts) {
    rows.push([
      "Top produits",
      p.productName,
      String(p.revenue),
      String(p.quantitySold),
      String(p.margin),
    ]);
  }

  rows.push(["Catégories", "Catégorie", "CA", "Qté"]);
  for (const c of data.salesByCategory) {
    rows.push(["Catégories", c.categoryName, String(c.revenue), String(c.quantity)]);
  }

  rows.push(["Ventes par jour", "Date", "CA", "Nb ventes"]);
  for (const d of data.salesByDay) {
    rows.push(["Ventes par jour", d.date, String(d.total), String(d.count)]);
  }

  return rows.map((r) => r.map((v) => escapeCsv(v)).join(",")).join("\n");
}

export function reportsPageToProSheets(
  data: ReportsPageData,
  meta: { subtitle: string },
): ProExportSheet[] {
  const sheets: ProExportSheet[] = [];

  sheets.push({
    name: "Synthèse",
    reportTitle: "Rapports d’activité — Gabostock",
    subtitle: meta.subtitle,
    headers: ["Indicateur", "Valeur"],
    rows: [
      ["CA ventes", data.salesSummary.totalAmount],
      ["Nb ventes", data.salesSummary.count],
      ["Articles vendus", data.salesSummary.itemsSold],
      ["Marge", data.salesSummary.margin],
      ["Taux marge %", data.marginRatePercent],
      ["Panier moyen", data.ticketAverage],
      ["Achats", data.purchasesSummary.totalAmount],
      ["Nb commandes achats", data.purchasesSummary.count],
      ["Valeur stock", data.stockValue.totalValue],
      ["Nb produits en stock", data.stockValue.productCount],
      ["Alertes stock (périmètre)", data.lowStockCount],
    ],
    numberColumnIndexes: [1],
  });

  sheets.push({
    name: "Top produits",
    reportTitle: "Top produits",
    subtitle: meta.subtitle,
    headers: ["Produit", "Qté vendue", "CA", "Marge"],
    rows: data.topProducts.map((p) => [
      p.productName,
      p.quantitySold,
      p.revenue,
      p.margin,
    ]),
    numberColumnIndexes: [1, 2, 3],
  });

  sheets.push({
    name: "Moins vendus",
    reportTitle: "Moins vendus",
    subtitle: meta.subtitle,
    headers: ["Produit", "Qté vendue", "CA", "Marge"],
    rows: data.leastProducts.map((p) => [
      p.productName,
      p.quantitySold,
      p.revenue,
      p.margin,
    ]),
    numberColumnIndexes: [1, 2, 3],
  });

  sheets.push({
    name: "Catégories",
    reportTitle: "Ventes par catégorie",
    subtitle: meta.subtitle,
    headers: ["Catégorie", "CA", "Qté"],
    rows: data.salesByCategory.map((c) => [c.categoryName, c.revenue, c.quantity]),
    numberColumnIndexes: [1, 2],
  });

  sheets.push({
    name: "CA par jour",
    reportTitle: "Chiffre d’affaires par jour",
    subtitle: meta.subtitle,
    headers: ["Date", "CA", "Nb ventes"],
    rows: data.salesByDay.map((d) => [d.date, d.total, d.count]),
    numberColumnIndexes: [1, 2],
  });

  if (data.stockReport) {
    sheets.push({
      name: "Stock boutique",
      reportTitle: "Mouvements stock (boutique)",
      subtitle: meta.subtitle,
      headers: ["Indicateur", "Valeur"],
      rows: [
        ["Entrées (mouvements)", data.stockReport.entries],
        ["Sorties (mouvements)", data.stockReport.exits],
        ["Net", data.stockReport.net],
        ["Produits en stock", data.stockReport.currentStockCount],
      ],
      numberColumnIndexes: [1],
    });
  }

  return sheets;
}
