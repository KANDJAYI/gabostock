"use client";

import { createClient } from "@/lib/supabase/client";
import { computeDocumentTotals, computeLineTotal } from "./totals";
import type {
  ProDocument,
  ProDocumentFormInput,
  ProDocumentKind,
  ProDocumentLine,
  ProDocumentLineInput,
  ProDocumentStatus,
  ProDocumentWithLines,
} from "./types";

const DOC_FIELDS =
  "id, user_id, kind, number, client_id, client_name, client_address, client_email, client_phone, client_tax_id, status, issue_date, due_date, currency, notes, subtotal, discount, vat_rate, vat_amount, total, converted_from_id, created_at, updated_at";

const LINE_FIELDS =
  "id, document_id, description, quantity, unit, unit_price, line_total, position";

async function currentUserId(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Session expirée. Reconnectez-vous.");
  return user.id;
}

/** Liste des documents d'un type (devis|facture), du plus récent au plus ancien. */
export async function listProDocuments(
  kind: ProDocumentKind,
): Promise<ProDocument[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pro_documents")
    .select(DOC_FIELDS)
    .eq("kind", kind)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ProDocument[];
}

export async function getProDocumentWithLines(
  id: string,
): Promise<ProDocumentWithLines | null> {
  const supabase = createClient();
  const { data: doc, error } = await supabase
    .from("pro_documents")
    .select(DOC_FIELDS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!doc) return null;
  const { data: lines, error: lErr } = await supabase
    .from("pro_document_lines")
    .select(LINE_FIELDS)
    .eq("document_id", id)
    .order("position", { ascending: true });
  if (lErr) throw lErr;
  return {
    ...(doc as ProDocument),
    lines: (lines ?? []) as ProDocumentLine[],
  };
}

/** Prochain numéro (DEV-2026-001 / FAC-2026-001) via la RPC atomique. */
async function nextNumber(kind: ProDocumentKind): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("pro_next_number", {
    p_kind: kind,
  });
  if (error) throw error;
  return String(data);
}

function lineRows(documentId: string, lines: ProDocumentLineInput[]) {
  return lines
    .filter((l) => l.description.trim() !== "" || l.unit_price > 0)
    .map((l, i) => ({
      document_id: documentId,
      description: l.description.trim(),
      quantity: Number.isFinite(l.quantity) ? l.quantity : 0,
      unit: l.unit.trim(),
      unit_price: Number.isFinite(l.unit_price) ? l.unit_price : 0,
      line_total: computeLineTotal(l.quantity, l.unit_price),
      position: i,
    }));
}

function documentPayload(input: ProDocumentFormInput) {
  const totals = computeDocumentTotals(
    input.lines,
    input.discount,
    input.vat_rate,
  );
  return {
    client_id: input.client_id,
    client_name: input.client_name.trim() || null,
    client_address: input.client_address.trim() || null,
    client_email: input.client_email.trim() || null,
    client_phone: input.client_phone.trim() || null,
    client_tax_id: input.client_tax_id.trim() || null,
    status: input.status,
    issue_date: input.issue_date,
    due_date: input.due_date.trim() || null,
    currency: input.currency.trim() || "XOF",
    notes: input.notes.trim() || null,
    subtotal: totals.subtotal,
    discount: totals.discount,
    vat_rate: Number.isFinite(input.vat_rate) ? input.vat_rate : 0,
    vat_amount: totals.vatAmount,
    total: totals.total,
  };
}

export async function createProDocument(
  input: ProDocumentFormInput,
): Promise<string> {
  const userId = await currentUserId();
  const supabase = createClient();
  const number = await nextNumber(input.kind);

  const { data: doc, error } = await supabase
    .from("pro_documents")
    .insert({
      user_id: userId,
      kind: input.kind,
      number,
      ...documentPayload(input),
    })
    .select("id")
    .single();
  if (error) throw error;
  const docId = (doc as { id: string }).id;

  const rows = lineRows(docId, input.lines);
  if (rows.length > 0) {
    const { error: lErr } = await supabase
      .from("pro_document_lines")
      .insert(rows);
    if (lErr) {
      // Évite un document orphelin sans lignes si l'insertion échoue.
      await supabase.from("pro_documents").delete().eq("id", docId);
      throw lErr;
    }
  }
  return docId;
}

export async function updateProDocument(
  id: string,
  input: ProDocumentFormInput,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("pro_documents")
    .update({ ...documentPayload(input), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;

  // Remplace les lignes (supprime puis réinsère).
  const { error: delErr } = await supabase
    .from("pro_document_lines")
    .delete()
    .eq("document_id", id);
  if (delErr) throw delErr;
  const rows = lineRows(id, input.lines);
  if (rows.length > 0) {
    const { error: insErr } = await supabase
      .from("pro_document_lines")
      .insert(rows);
    if (insErr) throw insErr;
  }
}

export async function deleteProDocument(id: string): Promise<void> {
  const supabase = createClient();
  // Les lignes tombent via ON DELETE CASCADE.
  const { error } = await supabase.from("pro_documents").delete().eq("id", id);
  if (error) throw error;
}

export async function setProDocumentStatus(
  id: string,
  status: ProDocumentStatus,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("pro_documents")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

/**
 * Convertit un devis en facture : nouveau document `facture` (numéro FAC-…),
 * lignes copiées, `converted_from_id` renseigné, statut `draft`.
 * Marque le devis source comme `accepted`. Retourne l'id de la facture.
 */
export async function convertDevisToFacture(devisId: string): Promise<string> {
  const userId = await currentUserId();
  const supabase = createClient();
  const source = await getProDocumentWithLines(devisId);
  if (!source) throw new Error("Devis introuvable.");
  if (source.kind !== "devis") throw new Error("Ce document n'est pas un devis.");

  const number = await nextNumber("facture");
  const { data: doc, error } = await supabase
    .from("pro_documents")
    .insert({
      user_id: userId,
      kind: "facture",
      number,
      client_id: source.client_id,
      client_name: source.client_name,
      client_address: source.client_address,
      client_email: source.client_email,
      client_phone: source.client_phone,
      client_tax_id: source.client_tax_id,
      status: "draft",
      issue_date: new Date().toISOString().slice(0, 10),
      due_date: null,
      currency: source.currency,
      notes: source.notes,
      subtotal: source.subtotal,
      discount: source.discount,
      vat_rate: source.vat_rate,
      vat_amount: source.vat_amount,
      total: source.total,
      converted_from_id: source.id,
    })
    .select("id")
    .single();
  if (error) throw error;
  const factureId = (doc as { id: string }).id;

  const rows = source.lines.map((l, i) => ({
    document_id: factureId,
    description: l.description,
    quantity: l.quantity,
    unit: l.unit,
    unit_price: l.unit_price,
    line_total: l.line_total,
    position: i,
  }));
  if (rows.length > 0) {
    const { error: lErr } = await supabase
      .from("pro_document_lines")
      .insert(rows);
    if (lErr) {
      await supabase.from("pro_documents").delete().eq("id", factureId);
      throw lErr;
    }
  }

  // Le devis est désormais accepté (best-effort).
  await supabase
    .from("pro_documents")
    .update({ status: "accepted", updated_at: new Date().toISOString() })
    .eq("id", devisId);

  return factureId;
}
