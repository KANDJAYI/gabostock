import type { ProExportSheet } from "@/lib/utils/excel-pro-export";

const HEAD = [
  "Référence",
  "Client",
  "Téléphone",
  "Date",
  "Boutique",
  "Total",
  "Encaissé",
  "Reste",
  "Échéance",
  "Statut",
  "Retard (j)",
  "Vendeur",
];

export function creditSalesRowsToProSheet(
  rows: (string | number)[][],
  meta: { subtitle: string },
): ProExportSheet {
  return {
    name: "Crédit ventes",
    reportTitle: "Export crédit client — Gabostock",
    subtitle: meta.subtitle,
    headers: HEAD,
    rows,
    numberColumnIndexes: [5, 6, 7, 10],
  };
}
