import type { Cell, Row, Worksheet } from "exceljs";

export type ProCellValue = string | number | null | undefined;

const HEADER_BG = "FF1E293B";
const HEADER_FONT = "FFFFFFFF";
const BORDER = "FFE2E8F0";
const ZEBRA = "FFF8FAFC";
const TITLE_TEXT = "FF0F172A";
const MUTED = "FF64748B";
const ORANGE_ACCENT = "FFFFEDD5";

function thinBorder() {
  return {
    top: { style: "thin" as const, color: { argb: BORDER } },
    left: { style: "thin" as const, color: { argb: BORDER } },
    bottom: { style: "thin" as const, color: { argb: BORDER } },
    right: { style: "thin" as const, color: { argb: BORDER } },
  };
}

function setCellValue(cell: Cell, v: ProCellValue) {
  if (v === null || v === undefined) {
    cell.value = "";
  } else if (typeof v === "number" && Number.isFinite(v)) {
    cell.value = v;
  } else {
    cell.value = String(v);
  }
}

function autoColumnWidths(sheet: Worksheet, colCount: number) {
  for (let c = 1; c <= colCount; c++) {
    const col = sheet.getColumn(c);
    let max = 10;
    col.eachCell({ includeEmpty: true }, (cell) => {
      const v = cell.value;
      if (v == null) return;
      const s = typeof v === "number" ? String(v) : String(v);
      if (s.length > max) max = s.length;
    });
    col.width = Math.min(52, max + 2.5);
  }
}

export type ProExportSheet = {
  /** Onglet (31 car. max) */
  name: string;
  /** Titre en haut de feuille */
  reportTitle: string;
  /** Sous-titre (souvent date) */
  subtitle?: string;
  headers: string[];
  rows: ProCellValue[][];
  /** Colonnes (index 0-based) alignées à droite (nombres) */
  numberColumnIndexes?: number[];
  /** Colonnes mises en évidence (fond très léger) */
  highlightColumnIndexes?: number[];
  /** Fond de cellule (ARGB sans préfixe logique) pour une cellule donnée */
  cellFillArgb?: (args: {
    row: ProCellValue[];
    rowIndex: number;
    colIndex: number;
  }) => string | undefined;
};

function applyDataRowStyle(
  row: Row,
  dataRow: ProCellValue[],
  dataRowIndex: number,
  colCount: number,
  numberColumnIndexes: Set<number>,
  highlightColumnIndexes: Set<number>,
  cellFillArgb: ProExportSheet["cellFillArgb"],
) {
  for (let c = 0; c < colCount; c++) {
    const cell = row.getCell(c + 1);
    const isZebra = dataRowIndex % 2 === 1;
    const baseFill = isZebra ? ZEBRA : "FFFFFFFF";
    const extra = cellFillArgb?.({
      row: dataRow,
      rowIndex: dataRowIndex,
      colIndex: c,
    });
    const hi = highlightColumnIndexes.has(c) ? ORANGE_ACCENT : undefined;
    const fill = extra ?? hi ?? baseFill;
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: fill },
    };
    cell.font = { name: "Calibri", size: 11, color: { argb: TITLE_TEXT } };
    cell.border = thinBorder();
    cell.alignment = {
      vertical: "middle",
      horizontal: numberColumnIndexes.has(c) ? "right" : "left",
      wrapText: true,
    };
  }
}

/**
 * Génère un classeur .xlsx « SaaS » : en-têtes sombres, bordures, zébrage, colonne figée, accents optionnels.
 */
export async function buildProWorkbook(
  sheets: ProExportSheet[],
) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Gabostock";
  wb.created = new Date();
  for (const spec of sheets) {
    const safeName = spec.name.replace(/[\\/*?:\[\]]/g, "-").slice(0, 31) || "Export";
    const ws = wb.addWorksheet(safeName);
    const numSet = new Set(spec.numberColumnIndexes ?? []);
    const hiSet = new Set(spec.highlightColumnIndexes ?? []);
    const colCount = Math.max(
      spec.headers.length,
      ...spec.rows.map((r) => r.length),
    );

    let y = 1;
    if (spec.reportTitle?.trim()) {
      const titleRow = ws.getRow(y);
      ws.mergeCells(y, 1, y, Math.max(1, colCount));
      const tcell = titleRow.getCell(1);
      tcell.value = spec.reportTitle;
      tcell.font = { name: "Calibri", size: 15, bold: true, color: { argb: TITLE_TEXT } };
      tcell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFFFFF" },
      };
      tcell.border = thinBorder();
      tcell.alignment = { vertical: "middle", horizontal: "left" };
      y += 1;
    }
    if (spec.subtitle) {
      const subRow = ws.getRow(y);
      ws.mergeCells(y, 1, y, Math.max(1, colCount));
      const sc = subRow.getCell(1);
      sc.value = spec.subtitle;
      sc.font = { name: "Calibri", size: 10, color: { argb: MUTED } };
      sc.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFAFAFA" },
      };
      sc.border = thinBorder();
      y += 1;
    }

    const headRowN = y;
    const headRow = ws.getRow(headRowN);
    for (let c = 0; c < spec.headers.length; c++) {
      const cell = headRow.getCell(c + 1);
      cell.value = spec.headers[c]!;
      cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: HEADER_FONT } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_BG } };
      cell.border = thinBorder();
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
    }
    y += 1;
    /* Lignes figées = titre + sous-titre + en-têtes (tout le bloc au-dessus des données) */
    ws.views = [
      { state: "frozen", ySplit: headRowN, activeCell: "A1", showGridLines: true },
    ];
    for (let i = 0; i < spec.rows.length; i++) {
      const r = spec.rows[i] ?? [];
      const outRow = ws.getRow(y + i);
      for (let c = 0; c < colCount; c++) {
        setCellValue(outRow.getCell(c + 1), r[c] ?? "");
      }
      applyDataRowStyle(
        outRow,
        r,
        i,
        colCount,
        numSet,
        hiSet,
        spec.cellFillArgb,
      );
    }
    autoColumnWidths(ws, colCount);
  }
  return wb;
}

export async function downloadProXlsx(
  fileBase: string,
  sheets: ProExportSheet[],
): Promise<void> {
  const safeBase = fileBase.replace(/[\\/]/g, "-");
  const wb = await buildProWorkbook(sheets);
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeBase}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
