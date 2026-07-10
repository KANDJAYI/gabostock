"use client";

import { createClient } from "@/lib/supabase/client";
import type { ProClient, ProClientFormInput } from "./types";

const FIELDS =
  "id, user_id, name, type, email, phone, address, tax_id, notes, created_at, updated_at";

async function currentUserId(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Session expirée. Reconnectez-vous.");
  return user.id;
}

/** Carnet de clients du compte courant (RLS scope l'accès). */
export async function listProClients(): Promise<ProClient[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pro_clients")
    .select(FIELDS)
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ProClient[];
}

function toPayload(input: ProClientFormInput) {
  return {
    name: input.name.trim(),
    type: input.type,
    email: input.email.trim() || null,
    phone: input.phone.trim() || null,
    address: input.address.trim() || null,
    tax_id: input.tax_id.trim() || null,
    notes: input.notes.trim() || null,
  };
}

export async function createProClient(
  input: ProClientFormInput,
): Promise<string> {
  const userId = await currentUserId();
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pro_clients")
    .insert({ user_id: userId, ...toPayload(input) })
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export async function updateProClient(
  id: string,
  input: ProClientFormInput,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("pro_clients")
    .update({ ...toPayload(input), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteProClient(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("pro_clients").delete().eq("id", id);
  if (error) throw error;
}
