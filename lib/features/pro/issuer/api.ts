"use client";

import { createClient } from "@/lib/supabase/client";
import type { ProIssuer, ProIssuerFormInput } from "./types";

const FIELDS =
  "user_id, business_name, address, phone, email, tax_id, logo_url, currency, default_vat_rate, legal_mentions, created_at, updated_at";

const LOGO_BUCKET = "pro-logos";

async function currentUserId(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Session expirée. Reconnectez-vous.");
  return user.id;
}

/** Profil émetteur du compte courant (RLS scope l'accès). `null` si non initialisé. */
export async function getIssuer(): Promise<ProIssuer | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pro_issuer")
    .select(FIELDS)
    .maybeSingle();
  if (error) throw error;
  return (data as ProIssuer | null) ?? null;
}

export async function upsertIssuer(
  input: ProIssuerFormInput,
): Promise<void> {
  const userId = await currentUserId();
  const supabase = createClient();
  const payload = {
    user_id: userId,
    business_name: input.business_name.trim() || null,
    address: input.address.trim() || null,
    phone: input.phone.trim() || null,
    email: input.email.trim() || null,
    tax_id: input.tax_id.trim() || null,
    currency: input.currency.trim() || "XOF",
    default_vat_rate: Number.isFinite(input.default_vat_rate)
      ? input.default_vat_rate
      : 0,
    legal_mentions: input.legal_mentions.trim() || null,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase
    .from("pro_issuer")
    .upsert(payload, { onConflict: "user_id" });
  if (error) throw error;
}

/** Téléverse un logo dans le bucket `pro-logos` et enregistre son URL publique. */
export async function uploadIssuerLogo(file: File): Promise<string> {
  const userId = await currentUserId();
  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${userId}/logo-${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from(LOGO_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type || undefined });
  if (upErr) throw upErr;
  const { data } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(path);
  const url = data.publicUrl;
  const { error: updErr } = await supabase
    .from("pro_issuer")
    .update({ logo_url: url, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (updErr) throw updErr;
  return url;
}
