"use client";

import { StatusBadge } from "@/components/pro/status-badge";
import { ROUTES } from "@/lib/config/routes";
import {
  convertDevisToFacture,
  deleteProDocument,
  getProDocumentWithLines,
  listProDocuments,
} from "@/lib/features/pro/documents/api";
import {
  buildProDocumentA4Data,
  fetchProDocumentPdfBlob,
} from "@/lib/features/pro/documents/pdf-client";
import {
  buildShareMessage,
  downloadBlob,
  mailtoLink,
  pdfFilename,
  whatsappLink,
} from "@/lib/features/pro/documents/share";
import type {
  ProDocument,
  ProDocumentKind,
} from "@/lib/features/pro/documents/types";
import { getIssuer } from "@/lib/features/pro/issuer/api";
import type { ProIssuer } from "@/lib/features/pro/issuer/types";
import { formatDateFr, formatMoney } from "@/lib/features/pro/format";
import { cn } from "@/lib/utils/cn";
import {
  AlertCircle,
  ArrowRightLeft,
  Download,
  FileText,
  Mail,
  MessageCircle,
  Pencil,
  Plus,
  ReceiptText,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = { kind: ProDocumentKind };

export function DocumentsList({ kind }: Props) {
  const router = useRouter();
  const [docs, setDocs] = useState<ProDocument[]>([]);
  const [issuer, setIssuer] = useState<ProIssuer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const isDevis = kind === "devis";
  const title = isDevis ? "Devis" : "Factures";
  const Icon = isDevis ? FileText : ReceiptText;
  const newHref = `${isDevis ? ROUTES.facturationDevis : ROUTES.facturationFactures}/new`;

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const [list, iss] = await Promise.all([
        listProDocuments(kind),
        getIssuer(),
      ]);
      setDocs(list);
      setIssuer(iss);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  async function onDownload(doc: ProDocument) {
    setBusyId(doc.id);
    setError(null);
    try {
      const full = await getProDocumentWithLines(doc.id);
      if (!full) throw new Error("Document introuvable.");
      const blob = await fetchProDocumentPdfBlob(
        buildProDocumentA4Data(full, issuer),
      );
      downloadBlob(blob, pdfFilename(doc));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Génération PDF impossible.");
    } finally {
      setBusyId(null);
    }
  }

  function onEmail(doc: ProDocument) {
    const { subject, body } = buildShareMessage(doc, issuer?.business_name);
    window.location.href = mailtoLink(doc.client_email, subject, body);
  }

  function onWhatsapp(doc: ProDocument) {
    const { subject, body } = buildShareMessage(doc, issuer?.business_name);
    window.open(
      whatsappLink(doc.client_phone, `${subject}\n\n${body}`),
      "_blank",
      "noopener",
    );
  }

  async function onConvert(doc: ProDocument) {
    if (!confirm(`Convertir le devis ${doc.number} en facture ?`)) return;
    setBusyId(doc.id);
    try {
      const factureId = await convertDevisToFacture(doc.id);
      router.push(`${ROUTES.facturationFactures}/${factureId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion impossible.");
      setBusyId(null);
    }
  }

  async function onDelete(doc: ProDocument) {
    if (!confirm(`Supprimer ${doc.number} ? Cette action est définitive.`))
      return;
    setBusyId(doc.id);
    try {
      await deleteProDocument(doc.id);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Suppression impossible.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <Icon className="h-5 w-5 text-fs-accent" aria-hidden />
          {title}
        </h1>
        <Link
          href={newHref}
          className="inline-flex items-center gap-1.5 rounded-lg bg-fs-accent px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-95"
        >
          <Plus className="h-4 w-4" aria-hidden />
          {isDevis ? "Nouveau devis" : "Nouvelle facture"}
        </Link>
      </div>

      {error ? (
        <div className="mb-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <p>{error}</p>
        </div>
      ) : null}

      {loading ? (
        <p className="py-10 text-center text-sm text-neutral-500">Chargement…</p>
      ) : docs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-fs-card py-12 text-center">
          <p className="text-sm text-neutral-600">
            Aucun {isDevis ? "devis" : "facture"} pour l&apos;instant.
          </p>
          <Link
            href={newHref}
            className="mt-3 inline-block text-sm font-semibold text-fs-accent hover:underline"
          >
            {isDevis ? "Créer un devis" : "Créer une facture"}
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {docs.map((doc) => {
            const editHref = `${isDevis ? ROUTES.facturationDevis : ROUTES.facturationFactures}/${doc.id}`;
            const busy = busyId === doc.id;
            return (
              <li
                key={doc.id}
                className={cn(
                  "rounded-xl border border-black/[0.06] bg-fs-card p-3.5",
                  busy && "opacity-60",
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Link href={editHref} className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{doc.number}</span>
                      <StatusBadge status={doc.status} />
                    </div>
                    <p className="truncate text-xs text-neutral-500">
                      {doc.client_name || "Sans client"} ·{" "}
                      {formatDateFr(doc.issue_date)}
                    </p>
                  </Link>
                  <div className="text-right">
                    <p className="font-bold">
                      {formatMoney(doc.total, doc.currency)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-black/[0.05] pt-2.5">
                  <Action
                    href={editHref}
                    icon={Pencil}
                    label="Modifier"
                  />
                  <ActionBtn
                    onClick={() => onDownload(doc)}
                    icon={Download}
                    label="PDF"
                    disabled={busy}
                  />
                  <ActionBtn
                    onClick={() => onEmail(doc)}
                    icon={Mail}
                    label="Email"
                    disabled={busy}
                  />
                  <ActionBtn
                    onClick={() => onWhatsapp(doc)}
                    icon={MessageCircle}
                    label="WhatsApp"
                    disabled={busy}
                  />
                  {isDevis ? (
                    <ActionBtn
                      onClick={() => onConvert(doc)}
                      icon={ArrowRightLeft}
                      label="En facture"
                      disabled={busy}
                    />
                  ) : null}
                  <ActionBtn
                    onClick={() => onDelete(doc)}
                    icon={Trash2}
                    label="Supprimer"
                    disabled={busy}
                    danger
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const actionCls =
  "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-fs-surface-container hover:text-fs-accent";

function Action({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Pencil;
  label: string;
}) {
  return (
    <Link href={href} className={actionCls}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </Link>
  );
}

function ActionBtn({
  onClick,
  icon: Icon,
  label,
  disabled,
  danger,
}: {
  onClick: () => void;
  icon: typeof Pencil;
  label: string;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        actionCls,
        danger && "hover:bg-red-50 hover:text-red-600",
        disabled && "opacity-50",
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </button>
  );
}
