import { escapeCsv } from "@/lib/utils/csv";
import type { ProExportSheet } from "@/lib/utils/excel-pro-export";
import type { PurchaseListItem } from "./types";

const PUR_HEAD = [
  "Date",
  "Boutique",
  "Fournisseur",
  "Référence",
  "Statut",
  "Total",
];

export function purchasesToProSheet(
  rows: PurchaseListItem[],
  meta: { subtitle: string },
): ProExportSheet {
  return {
    name: "Achats",
    reportTitle: "Export des commandes d’achat — Gabostock",
    subtitle: meta.subtitle,
    headers: PUR_HEAD,
    rows: rows.map((r) => [
      new Date(r.createdAt).toLocaleString("fr-FR"),
      r.storeName,
      r.supplierName,
      r.reference ?? "",
      r.status,
      r.total,
    ]),
    numberColumnIndexes: [5],
  };
}

export function purchasesToCsv(rows: PurchaseListItem[]): string {
  const lines = rows.map((r) =>
    [
      new Date(r.createdAt).toLocaleString("fr-FR"),
      r.storeName,
      r.supplierName,
      r.reference ?? "",
      r.status,
      String(r.total),
    ].map(escapeCsv),
  );

  return [PUR_HEAD.map(escapeCsv).join(","), ...lines.map((l) => l.join(","))].join(
    "\n",
  );
}

