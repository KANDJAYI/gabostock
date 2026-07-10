"use client";

import { Field, FormSection, fieldInputClass } from "@/components/pro/form-kit";
import { ROUTES } from "@/lib/config/routes";
import { listProClients } from "@/lib/features/pro/clients/api";
import type { ProClient } from "@/lib/features/pro/clients/types";
import {
  createProDocument,
  getProDocumentWithLines,
  updateProDocument,
} from "@/lib/features/pro/documents/api";
import { DocumentPreview } from "@/components/pro/document-preview";
import type { ProDocumentA4Data } from "@/lib/features/pro/documents/pro-a4-types";
import {
  computeDocumentTotals,
  computeLineTotal,
} from "@/lib/features/pro/documents/totals";
import type { ProIssuer } from "@/lib/features/pro/issuer/types";
import {
  DEVIS_STATUS_OPTIONS,
  DOCUMENT_STATUS_LABELS,
  FACTURE_STATUS_OPTIONS,
  type ProDocumentFormInput,
  type ProDocumentKind,
  type ProDocumentLineInput,
  type ProDocumentStatus,
} from "@/lib/features/pro/documents/types";
import { getIssuer } from "@/lib/features/pro/issuer/api";
import { formatMoney, todayIso } from "@/lib/features/pro/format";
import { cn } from "@/lib/utils/cn";
import { AlertCircle, ArrowLeft, Eye, Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";

const EMPTY_LINE: ProDocumentLineInput = {
  description: "",
  quantity: 0,
  unit: "",
  unit_price: 0,
};

function emptyForm(kind: ProDocumentKind): ProDocumentFormInput {
  return {
    kind,
    client_id: null,
    client_name: "",
    client_address: "",
    client_email: "",
    client_phone: "",
    client_tax_id: "",
    status: "draft",
    issue_date: todayIso(),
    due_date: "",
    currency: "XOF",
    notes: "",
    discount: 0,
    vat_rate: 0,
    lines: [{ ...EMPTY_LINE }],
  };
}

export function DocumentEditor({
  kind,
  documentId,
}: {
  kind: ProDocumentKind;
  documentId: string; // "new" ou un uuid
}) {
  const router = useRouter();
  const isNew = documentId === "new";
  const [form, setForm] = useState<ProDocumentFormInput>(() =>
    emptyForm(kind),
  );
  const [clients, setClients] = useState<ProClient[]>([]);
  const [issuer, setIssuer] = useState<ProIssuer | null>(null);
  const [number, setNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const backHref = isDevisKind(kind)
    ? ROUTES.facturationDevis
    : ROUTES.facturationFactures;
  const statusOptions = isDevisKind(kind)
    ? DEVIS_STATUS_OPTIONS
    : FACTURE_STATUS_OPTIONS;

  useEffect(() => {
    (async () => {
      try {
        const [cls, iss] = await Promise.all([listProClients(), getIssuer()]);
        setClients(cls);
        setIssuer(iss);
        const issuer = iss;
        if (isNew) {
          setForm((f) => ({
            ...f,
            currency: issuer?.currency ?? "XOF",
            vat_rate: issuer?.default_vat_rate ?? 0,
          }));
        } else {
          const doc = await getProDocumentWithLines(documentId);
          if (!doc) {
            setError("Document introuvable.");
          } else {
            setNumber(doc.number);
            setForm({
              kind: doc.kind,
              client_id: doc.client_id,
              client_name: doc.client_name ?? "",
              client_address: doc.client_address ?? "",
              client_email: doc.client_email ?? "",
              client_phone: doc.client_phone ?? "",
              client_tax_id: doc.client_tax_id ?? "",
              status: doc.status,
              issue_date: doc.issue_date,
              due_date: doc.due_date ?? "",
              currency: doc.currency,
              notes: doc.notes ?? "",
              discount: doc.discount,
              vat_rate: doc.vat_rate,
              lines:
                doc.lines.length > 0
                  ? doc.lines.map((l) => ({
                      description: l.description,
                      quantity: l.quantity,
                      unit: l.unit,
                      unit_price: l.unit_price,
                    }))
                  : [{ ...EMPTY_LINE }],
            });
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur de chargement.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId, kind]);

  const totals = useMemo(
    () => computeDocumentTotals(form.lines, form.discount, form.vat_rate),
    [form.lines, form.discount, form.vat_rate],
  );

  const previewData = useMemo<ProDocumentA4Data>(
    () => ({
      kind: form.kind,
      number: number ?? (form.kind === "devis" ? "DEV-2026-—" : "FAC-2026-—"),
      issueDate: form.issue_date,
      dueDate: form.due_date || null,
      currency: form.currency,
      issuerName: issuer?.business_name ?? "",
      issuerAddress: issuer?.address ?? null,
      issuerPhone: issuer?.phone ?? null,
      issuerEmail: issuer?.email ?? null,
      issuerTaxId: issuer?.tax_id ?? null,
      legalMentions: issuer?.legal_mentions ?? null,
      logoUrl: issuer?.logo_url ?? null,
      clientName: form.client_name || null,
      clientAddress: form.client_address || null,
      clientEmail: form.client_email || null,
      clientPhone: form.client_phone || null,
      clientTaxId: form.client_tax_id || null,
      lines: form.lines
        .filter((l) => l.description.trim() !== "" || l.unit_price > 0)
        .map((l) => ({
          description: l.description,
          quantity: l.quantity,
          unit: l.unit,
          unitPrice: l.unit_price,
          total: computeLineTotal(l.quantity, l.unit_price),
        })),
      subtotal: totals.subtotal,
      discount: totals.discount,
      vatRate: form.vat_rate,
      vatAmount: totals.vatAmount,
      total: totals.total,
      notes: form.notes || null,
    }),
    [form, issuer, number, totals],
  );

  function setLine(i: number, patch: Partial<ProDocumentLineInput>) {
    setForm((f) => {
      const lines = f.lines.slice();
      lines[i] = { ...lines[i], ...patch };
      return { ...f, lines };
    });
  }
  function addLine() {
    setForm((f) => ({ ...f, lines: [...f.lines, { ...EMPTY_LINE }] }));
  }
  function removeLine(i: number) {
    setForm((f) => ({
      ...f,
      lines: f.lines.length > 1 ? f.lines.filter((_, j) => j !== i) : f.lines,
    }));
  }

  function pickClient(id: string) {
    if (!id) {
      setForm((f) => ({ ...f, client_id: null }));
      return;
    }
    const c = clients.find((x) => x.id === id);
    if (!c) return;
    setForm((f) => ({
      ...f,
      client_id: c.id,
      client_name: c.name,
      client_address: c.address ?? "",
      client_email: c.email ?? "",
      client_phone: c.phone ?? "",
      client_tax_id: c.tax_id ?? "",
    }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.client_name.trim()) {
      setError("Indiquez le client (choisissez-en un ou saisissez un nom).");
      return;
    }
    const hasLine = form.lines.some(
      (l) => l.description.trim() !== "" || l.unit_price > 0,
    );
    if (!hasLine) {
      setError("Ajoutez au moins une ligne.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (isNew) await createProDocument(form);
      else await updateProDocument(documentId, form);
      router.push(backHref);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <p className="py-10 text-center text-sm text-neutral-500">Chargement…</p>
    );
  }

  const kindLabel = isDevisKind(kind) ? "devis" : "facture";

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center gap-3">
        <Link
          href={backHref}
          className="rounded-lg p-1.5 text-neutral-500 hover:bg-fs-surface-container hover:text-fs-accent"
          aria-label="Retour"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight">
          {isNew ? `Nouveau ${kindLabel}` : `${number ?? ""}`}
        </h1>
      </div>

      {error ? (
        <div className="mb-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <p>{error}</p>
        </div>
      ) : null}

      {/* Client */}
      <FormSection
        title="À qui s'adresse ce document ?"
        subtitle="Choisissez un client existant, ou saisissez ses coordonnées."
        className="mb-4"
      >
        {clients.length > 0 ? (
          <Field
            label="Client enregistré"
            htmlFor="doc-client"
            hint="Sélectionnez pour remplir automatiquement les coordonnées ci-dessous."
            className="mb-3.5"
          >
            <select
              id="doc-client"
              className={fieldInputClass}
              value={form.client_id ?? ""}
              onChange={(e) => pickClient(e.target.value)}
            >
              <option value="">Saisir un nouveau client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        ) : null}
        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field label="Nom du client" required htmlFor="doc-cname">
            <input
              id="doc-cname"
              className={fieldInputClass}
              placeholder="Ex : Société Mbolo SARL"
              value={form.client_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  client_name: e.target.value,
                  client_id: null,
                })
              }
            />
          </Field>
          <Field label="Téléphone" htmlFor="doc-cphone">
            <input
              id="doc-cphone"
              className={fieldInputClass}
              type="tel"
              placeholder="Ex : +241 01 23 45 67"
              value={form.client_phone}
              onChange={(e) =>
                setForm({ ...form, client_phone: e.target.value })
              }
            />
          </Field>
          <Field label="Email" htmlFor="doc-cemail">
            <input
              id="doc-cemail"
              className={fieldInputClass}
              type="email"
              placeholder="Ex : achats@mbolo.ga"
              value={form.client_email}
              onChange={(e) =>
                setForm({ ...form, client_email: e.target.value })
              }
            />
          </Field>
          <Field label="N° fiscal du client" htmlFor="doc-ctax">
            <input
              id="doc-ctax"
              className={fieldInputClass}
              placeholder="Ex : NIF 7412589630"
              value={form.client_tax_id}
              onChange={(e) =>
                setForm({ ...form, client_tax_id: e.target.value })
              }
            />
          </Field>
        </div>
        <Field label="Adresse du client" htmlFor="doc-caddr" className="mt-3.5">
          <textarea
            id="doc-caddr"
            className={cn(fieldInputClass, "min-h-13 resize-y")}
            placeholder="Ex : Boulevard Triomphal, Libreville, Gabon"
            value={form.client_address}
            onChange={(e) =>
              setForm({ ...form, client_address: e.target.value })
            }
          />
        </Field>
      </FormSection>

      {/* Meta */}
      <FormSection title="Dates & statut" className="mb-4">
        <div className="grid gap-3.5 sm:grid-cols-3">
          <Field
            label="Date d'émission"
            required
            htmlFor="doc-issue"
            hint="Date figurant sur le document."
          >
            <input
              id="doc-issue"
              type="date"
              className={fieldInputClass}
              value={form.issue_date}
              onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
            />
          </Field>
          <Field
            label={isDevisKind(kind) ? "Valable jusqu'au" : "Date d'échéance"}
            htmlFor="doc-due"
            hint={
              isDevisKind(kind)
                ? "Fin de validité de l'offre."
                : "Date limite de paiement."
            }
          >
            <input
              id="doc-due"
              type="date"
              className={fieldInputClass}
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
          </Field>
          <Field
            label="Statut"
            htmlFor="doc-status"
            hint="Où en est ce document ?"
          >
            <select
              id="doc-status"
              className={fieldInputClass}
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as ProDocumentStatus,
                })
              }
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {DOCUMENT_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </FormSection>

      {/* Lignes */}
      <FormSection
        title="Prestations / articles"
        subtitle="Décrivez ce que vous facturez : une ligne par prestation ou article."
        className="mb-4"
      >
        {/* En-têtes de colonnes (bureau) */}
        <div className="mb-1.5 hidden grid-cols-12 gap-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-neutral-400 sm:grid">
          <span className="col-span-5">Désignation</span>
          <span className="col-span-2 text-center">Quantité</span>
          <span className="col-span-2 text-center">Unité</span>
          <span className="col-span-2 text-right">Prix unitaire</span>
          <span className="col-span-1" />
        </div>
        <div className="flex flex-col gap-2">
          {form.lines.map((line, i) => (
            <div
              key={i}
              className="grid grid-cols-12 items-center gap-2 rounded-xl bg-fs-surface-container/40 p-2"
            >
              <input
                className={cn(fieldInputClass, "col-span-12 sm:col-span-5")}
                placeholder="Ex : Conception du logo"
                value={line.description}
                onChange={(e) => setLine(i, { description: e.target.value })}
                aria-label={`Désignation ligne ${i + 1}`}
              />
              <input
                className={cn(fieldInputClass, "col-span-4 sm:col-span-2")}
                type="number"
                min={0}
                step="any"
                placeholder="1"
                value={line.quantity || ""}
                onChange={(e) =>
                  setLine(i, { quantity: Number(e.target.value) || 0 })
                }
                aria-label={`Quantité ligne ${i + 1}`}
              />
              <input
                className={cn(fieldInputClass, "col-span-3 sm:col-span-2")}
                placeholder="pièce"
                value={line.unit}
                onChange={(e) => setLine(i, { unit: e.target.value })}
                aria-label={`Unité ligne ${i + 1}`}
              />
              <input
                className={cn(fieldInputClass, "col-span-4 sm:col-span-2")}
                type="number"
                min={0}
                step="any"
                placeholder="0"
                value={line.unit_price || ""}
                onChange={(e) =>
                  setLine(i, { unit_price: Number(e.target.value) || 0 })
                }
                aria-label={`Prix unitaire ligne ${i + 1}`}
              />
              <button
                type="button"
                onClick={() => removeLine(i)}
                className="col-span-1 flex items-center justify-center rounded-lg py-2 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                aria-label={`Retirer la ligne ${i + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addLine}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-600 hover:border-fs-accent/40 hover:text-fs-accent"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Ajouter une ligne
        </button>
      </FormSection>

      {/* Totaux & réglages */}
      <FormSection title="Remise, TVA & total" className="mb-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-3.5">
            <Field
              label={`Remise (${form.currency || "montant"})`}
              htmlFor="doc-discount"
              hint="Réduction sur le sous-total. Laissez vide s'il n'y en a pas."
            >
              <input
                id="doc-discount"
                type="number"
                min={0}
                step="any"
                className={fieldInputClass}
                placeholder="0"
                value={form.discount || ""}
                onChange={(e) =>
                  setForm({ ...form, discount: Number(e.target.value) || 0 })
                }
              />
            </Field>
            <Field
              label="TVA (%)"
              htmlFor="doc-vat"
              hint="Taux de TVA appliqué. Laissez vide si non applicable."
            >
              <input
                id="doc-vat"
                type="number"
                min={0}
                step="0.1"
                className={fieldInputClass}
                placeholder="Ex : 18"
                value={form.vat_rate || ""}
                onChange={(e) =>
                  setForm({ ...form, vat_rate: Number(e.target.value) || 0 })
                }
              />
            </Field>
            <Field
              label="Devise"
              required
              htmlFor="doc-currency"
              hint="Reprise de votre profil ; modifiable pour ce document."
            >
              <input
                id="doc-currency"
                className={fieldInputClass}
                value={form.currency}
                onChange={(e) =>
                  setForm({ ...form, currency: e.target.value.toUpperCase() })
                }
                placeholder="Ex : XOF"
              />
            </Field>
          </div>
          <div className="flex flex-col justify-end gap-1.5 text-sm">
            <Row
              label="Sous-total"
              value={formatMoney(totals.subtotal, form.currency)}
            />
            {totals.discount > 0 ? (
              <Row
                label="Remise"
                value={`− ${formatMoney(totals.discount, form.currency)}`}
              />
            ) : null}
            {form.vat_rate > 0 ? (
              <Row
                label={`TVA (${form.vat_rate} %)`}
                value={formatMoney(totals.vatAmount, form.currency)}
              />
            ) : null}
            <div className="mt-1 flex items-center justify-between rounded-lg bg-fs-accent px-3 py-2.5 font-bold text-white">
              <span>{form.vat_rate > 0 ? "Total TTC" : "Total"}</span>
              <span>{formatMoney(totals.total, form.currency)}</span>
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection title="Notes" className="mb-4">
        <Field
          label="Message affiché sur le document"
          htmlFor="doc-notes"
          hint="Conditions, délais, remerciements… Visible par le client."
        >
          <textarea
            id="doc-notes"
            className={cn(fieldInputClass, "min-h-16 resize-y")}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Ex : Acompte de 40 % à la commande. Merci de votre confiance."
          />
        </Field>
      </FormSection>

      <div className="sticky bottom-16 z-10 flex flex-wrap justify-end gap-2 sm:bottom-0">
        <Link
          href={backHref}
          className="rounded-lg border border-black/[0.08] bg-fs-card px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-fs-surface-container"
        >
          Annuler
        </Link>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-fs-accent/30 bg-fs-card px-4 py-2.5 text-sm font-semibold text-fs-accent hover:bg-fs-accent/5"
        >
          <Eye className="h-4 w-4" aria-hidden />
          Aperçu
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center rounded-lg bg-fs-accent px-6 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      {showPreview ? (
        <div className="fixed inset-0 z-[70] flex flex-col bg-black/50 p-0 sm:p-6">
          <div className="mx-auto flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-none bg-fs-surface sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-black/[0.06] bg-fs-card px-4 py-3">
              <h2 className="flex items-center gap-2 text-sm font-bold">
                <Eye className="h-4 w-4 text-fs-accent" aria-hidden />
                Aperçu — {isDevisKind(kind) ? "devis" : "facture"}
              </h2>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-fs-surface-container"
                aria-label="Fermer l'aperçu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <DocumentPreview data={previewData} />
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}

function isDevisKind(kind: ProDocumentKind): boolean {
  return kind === "devis";
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-black/[0.05] pb-1 text-neutral-600">
      <span>{label}</span>
      <span className="font-medium text-fs-text">{value}</span>
    </div>
  );
}
