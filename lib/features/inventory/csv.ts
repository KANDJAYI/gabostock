import { escapeCsv } from "@/lib/utils/csv";
import type { ProExportSheet } from "@/lib/utils/excel-pro-export";
import type { InventoryRow } from "./types";

export function inventoryRowsToCsv(rows: InventoryRow[]): string {
  const header = [
    "Produit",
    "SKU",
    "Catégorie",
    "Marque",
    "Qté",
    "Unité",
    "Seuil",
    "Statut",
    "Achat",
    "Vente",
  ];

  const lines = rows.map((r) => {
    const statut = r.status === "out" ? "Rupture" : r.status === "low" ? "Alerte" : "OK";
    return [
      r.name,
      r.sku ?? "",
      r.categoryName ?? "",
      r.brandName ?? "",
      String(r.availableQuantity),
      r.unit,
      String(r.alertThreshold),
      statut,
      String(r.purchasePrice),
      String(r.salePrice),
    ].map(escapeCsv);
  });

  return [header.map(escapeCsv).join(","), ...lines.map((l) => l.join(","))].join("\n");
}

const INV_HEADER = [
  "Produit",
  "SKU",
  "Catégorie",
  "Marque",
  "Qté",
  "Unité",
  "Seuil",
  "Statut",
  "Achat",
  "Vente",
];

export function inventoryToProSheet(
  rows: InventoryRow[],
  meta: { subtitle: string },
): ProExportSheet {
  const data = rows.map<((string | number)[])>((r) => {
    const statut = r.status === "out" ? "Rupture" : r.status === "low" ? "Alerte" : "OK";
    return [
      r.name,
      r.sku ?? "",
      r.categoryName ?? "",
      r.brandName ?? "",
      r.availableQuantity,
      r.unit,
      r.alertThreshold,
      statut,
      r.purchasePrice,
      r.salePrice,
    ];
  });
  return {
    name: "Stock",
    reportTitle: "Export stock — Gabostock",
    subtitle: meta.subtitle,
    headers: INV_HEADER,
    rows: data,
    numberColumnIndexes: [4, 6, 8, 9],
    cellFillArgb: ({ row, colIndex }) => {
      if (colIndex !== 7) return undefined;
      const s = String(row[7] ?? "");
      if (s === "Rupture") return "FFFFE4E6";
      if (s === "Alerte") return "FFFEF3C7";
      if (s === "OK") return "FFDCFCE7";
      return undefined;
    },
  };
}

