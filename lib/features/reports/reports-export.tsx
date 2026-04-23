"use client";

import type { ReportsPageData } from "@/lib/features/dashboard/types";
import { reportsPageToProSheets } from "@/lib/features/reports/csv";
import { fetchReportsPdfBlob } from "@/lib/features/pdf/pdf-api-client";
import { downloadProXlsx } from "@/lib/utils/excel-pro-export";

export async function downloadReportsPdfBlob(
  data: ReportsPageData,
  meta: { title: string; subtitle: string },
): Promise<Blob> {
  return fetchReportsPdfBlob(data, meta);
}

export function downloadReportsPdf(
  data: ReportsPageData,
  meta: { title: string; subtitle: string },
): void {
  void downloadReportsPdfBlob(data, meta).then((blob) => {
    const name = `rapports_${new Date().toISOString().slice(0, 10)}.pdf`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  });
}

export async function downloadReportsExcel(
  data: ReportsPageData,
  meta: { subtitle: string },
): Promise<void> {
  const name = `rapports_${new Date().toISOString().slice(0, 10)}`;
  await downloadProXlsx(name, reportsPageToProSheets(data, meta));
}
