"use client";

import { DocumentPreview } from "@/components/pro/document-preview";
import { sampleDocumentA4Data } from "@/lib/features/pro/documents/sample";
import {
  downloadBlob,
} from "@/lib/features/pro/documents/share";
import { fetchProDocumentPdfBlob } from "@/lib/features/pro/documents/pdf-client";
import type { ProDocumentKind } from "@/lib/features/pro/documents/types";
import { cn } from "@/lib/utils/cn";
import { Download, FileText, ReceiptText, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

export function SamplePreview() {
  const [kind, setKind] = useState<ProDocumentKind>("facture");
  const [downloading, setDownloading] = useState(false);
  const data = useMemo(() => sampleDocumentA4Data(kind), [kind]);

  async function onDownload() {
    setDownloading(true);
    try {
      const blob = await fetchProDocumentPdfBlob(data);
      downloadBlob(blob, `exemple-${kind}.pdf`);
    } catch {
      /* silencieux — simple exemple */
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <Sparkles className="h-5 w-5 text-fs-accent" aria-hidden />
            Aperçu d&apos;exemple
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Voici le rendu — identique au PDF — d&apos;un document type.
          </p>
        </div>
        <button
          type="button"
          onClick={onDownload}
          disabled={downloading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-black/[0.08] bg-fs-card px-3 py-2 text-sm font-semibold text-neutral-700 hover:border-fs-accent/30 hover:text-fs-accent disabled:opacity-60"
        >
          <Download className="h-4 w-4" aria-hidden />
          {downloading ? "Génération…" : "Télécharger le PDF"}
        </button>
      </div>

      {/* Toggle Devis / Facture */}
      <div className="mb-5 inline-flex rounded-xl border border-black/[0.08] bg-fs-card p-1">
        <Toggle
          active={kind === "facture"}
          onClick={() => setKind("facture")}
          icon={ReceiptText}
          label="Facture"
        />
        <Toggle
          active={kind === "devis"}
          onClick={() => setKind("devis")}
          icon={FileText}
          label="Devis"
        />
      </div>

      <div className="mx-auto max-w-3xl">
        <DocumentPreview data={data} />
      </div>
    </div>
  );
}

function Toggle({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof FileText;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
        active
          ? "bg-fs-accent text-white"
          : "text-neutral-600 hover:text-fs-accent",
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {label}
    </button>
  );
}
