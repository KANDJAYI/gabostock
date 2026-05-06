"use client";

import { createClient } from "@/lib/supabase/client";
import type { PharmacyBatchRow, PharmacyExpirySummary } from "./types";

function toNum(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function listPharmacyBatches(params: {
  storeId: string;
}): Promise<PharmacyBatchRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pharmacy_batches")
    .select(
      "id, company_id, store_id, product_id, lot_number, expires_on, manufacturer, drug_category, prescription_required, dosage, form, quantity, notes, created_at, updated_at, product:products(name)",
    )
    .eq("store_id", params.storeId)
    .order("expires_on", { ascending: true, nullsFirst: false })
    .order("lot_number", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => {
    const row = r as unknown as PharmacyBatchRow;
    return { ...row, quantity: Math.max(0, Math.trunc(toNum(row.quantity))) };
  });
}

export async function upsertPharmacyBatch(input: {
  companyId: string;
  storeId: string;
  productId: string;
  lotNumber: string;
  expiresOn?: string | null;
  manufacturer?: string | null;
  drugCategory?: string | null;
  prescriptionRequired?: boolean | null;
  dosage?: string | null;
  form?: string | null;
  quantity: number;
  notes?: string | null;
}): Promise<void> {
  const supabase = createClient();
  const payload = {
    company_id: input.companyId,
    store_id: input.storeId,
    product_id: input.productId,
    lot_number: input.lotNumber.trim(),
    expires_on: input.expiresOn?.trim() ? input.expiresOn.trim() : null,
    manufacturer: input.manufacturer?.trim() ? input.manufacturer.trim() : null,
    drug_category: input.drugCategory?.trim() ? input.drugCategory.trim() : null,
    prescription_required:
      typeof input.prescriptionRequired === "boolean"
        ? input.prescriptionRequired
        : null,
    dosage: input.dosage?.trim() ? input.dosage.trim() : null,
    form: input.form?.trim() ? input.form.trim() : null,
    quantity: Math.max(0, Math.trunc(input.quantity)),
    notes: input.notes?.trim() ? input.notes.trim() : null,
  };

  const { error } = await supabase
    .from("pharmacy_batches")
    .upsert(payload, { onConflict: "store_id,product_id,lot_number" });
  if (error) throw error;
}

export async function deletePharmacyBatch(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("pharmacy_batches").delete().eq("id", id);
  if (error) throw error;
}

export async function listStorePharmacyExpirySummary(params: {
  storeId: string;
  soonDays: number;
}): Promise<Map<string, PharmacyExpirySummary>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pharmacy_batches")
    .select("product_id, expires_on, quantity")
    .eq("store_id", params.storeId)
    .gt("quantity", 0);
  if (error) throw error;

  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const soon = new Date(today);
  soon.setUTCDate(soon.getUTCDate() + Math.max(0, Math.trunc(params.soonDays)));

  const byProduct = new Map<string, PharmacyExpirySummary>();
  for (const r of data ?? []) {
    const productId = String((r as { product_id?: unknown }).product_id ?? "");
    if (!productId) continue;
    const qty = Math.max(0, Math.trunc(toNum((r as { quantity?: unknown }).quantity)));
    if (qty <= 0) continue;
    const expiresOn = (r as { expires_on?: string | null }).expires_on ?? null;

    const curr =
      byProduct.get(productId) ??
      ({
        productId,
        earliestExpiresOn: null,
        expiredCount: 0,
        expiringSoonCount: 0,
      } satisfies PharmacyExpirySummary);

    if (expiresOn) {
      if (!curr.earliestExpiresOn || expiresOn < curr.earliestExpiresOn) {
        curr.earliestExpiresOn = expiresOn;
      }
      const expDate = new Date(`${expiresOn}T00:00:00.000Z`);
      if (expDate < today) curr.expiredCount += 1;
      else if (expDate <= soon) curr.expiringSoonCount += 1;
    }

    byProduct.set(productId, curr);
  }

  return byProduct;
}

