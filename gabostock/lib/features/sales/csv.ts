import type { ProExportSheet } from "@/lib/utils/excel-pro-export";
import type { SaleItem } from "./types";
import { escapeCsv } from "@/lib/utils/csv";
import { saleSellerLabel, saleStoreLabel } from "./sale-display";

export function salesToCsv(
  sales: SaleItem[],
  stores: { id: string; name: string }[] = [],
): string {
  const headers = [
    "numero",
    "date",
    "boutique",
    "vente_par",
    "client",
    "statut",
    "sous_total",
    "remise",
    "tva",
    "total",
  ];
  const rows = sales.map((s) => {
    const date = s.created_at?.slice(0, 19) ?? "";
    return [
      escapeCsv(s.sale_number ?? ""),
      escapeCsv(date),
      escapeCsv(saleStoreLabel(s, stores)),
      escapeCsv(saleSellerLabel(s)),
      escapeCsv(s.customer?.name ?? ""),
      escapeCsv(s.status ?? ""),
      String(s.subtotal ?? 0),
      String(s.discount ?? 0),
      String(s.tax ?? 0),
      String(s.total ?? 0),
    ].join(",");
  });
  return [headers.join(","), ...rows].join("\n");
}

const SALE_HEADER_LABELS = [
  "N°",
  "Date",
  "Boutique",
  "Vendeur",
  "Client",
  "Statut",
  "Sous-total",
  "Remise",
  "TVA",
  "Total",
];

export function salesToProSheet(
  sales: SaleItem[],
  stores: { id: string; name: string }[],
  meta: { subtitle: string },
): ProExportSheet {
  const rows = sales.map<((string | number)[])>((s) => {
    const date = s.created_at?.slice(0, 19) ?? "";
    return [
      s.sale_number ?? "",
      date,
      saleStoreLabel(s, stores),
      saleSellerLabel(s),
      s.customer?.name ?? "",
      s.status ?? "",
      s.subtotal ?? 0,
      s.discount ?? 0,
      s.tax ?? 0,
      s.total ?? 0,
    ];
  });
  return {
    name: "Ventes",
    reportTitle: "Export des ventes — Gabostock",
    subtitle: meta.subtitle,
    headers: SALE_HEADER_LABELS,
    rows,
    numberColumnIndexes: [6, 7, 8, 9],
  };
}
