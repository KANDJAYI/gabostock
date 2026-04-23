import { escapeCsv } from "@/lib/utils/csv";
import type { ProExportSheet } from "@/lib/utils/excel-pro-export";
import type { Customer } from "./types";

export function customersToCsv(rows: Customer[]): string {
  const header = ["Nom", "Type", "Téléphone", "Email", "Adresse", "Notes"];
  const lines = rows.map((c) =>
    [
      c.name,
      c.type === "company" ? "Entreprise" : "Particulier",
      c.phone ?? "",
      c.email ?? "",
      c.address ?? "",
      c.notes ?? "",
    ].map(escapeCsv),
  );

  return [header.map(escapeCsv).join(","), ...lines.map((l) => l.join(","))].join(
    "\n",
  );
}

const CUSTOMER_HEADER_LABELS = [
  "Nom",
  "Type",
  "Téléphone",
  "Email",
  "Adresse",
  "Notes",
];

export function customersToProSheet(
  rows: Customer[],
  meta: { subtitle: string },
): ProExportSheet {
  const data = rows.map((c) => [
    c.name,
    c.type === "company" ? "Entreprise" : "Particulier",
    c.phone ?? "",
    c.email ?? "",
    c.address ?? "",
    c.notes ?? "",
  ]);
  return {
    name: "Clients",
    reportTitle: "Export clients — Gabostock",
    subtitle: meta.subtitle,
    headers: CUSTOMER_HEADER_LABELS,
    rows: data,
  };
}

