import { escapeCsv } from "@/lib/utils/csv";
import type { ProExportSheet } from "@/lib/utils/excel-pro-export";
import type { Supplier } from "./types";

const SUP_HEAD = ["Nom", "Contact", "Téléphone", "Email", "Adresse", "Notes"];

export function suppliersToProSheet(
  rows: Supplier[],
  meta: { subtitle: string },
): ProExportSheet {
  return {
    name: "Fournisseurs",
    reportTitle: "Export fournisseurs — Gabostock",
    subtitle: meta.subtitle,
    headers: SUP_HEAD,
    rows: rows.map((s) => [
      s.name,
      s.contact ?? "",
      s.phone ?? "",
      s.email ?? "",
      s.address ?? "",
      s.notes ?? "",
    ]),
  };
}

export function suppliersToCsv(rows: Supplier[]): string {
  const lines = rows.map((s) =>
    [
      s.name,
      s.contact ?? "",
      s.phone ?? "",
      s.email ?? "",
      s.address ?? "",
      s.notes ?? "",
    ].map(escapeCsv),
  );

  return [SUP_HEAD.map(escapeCsv).join(","), ...lines.map((l) => l.join(","))].join(
    "\n",
  );
}

