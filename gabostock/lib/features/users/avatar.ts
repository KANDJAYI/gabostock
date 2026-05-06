"use client";

import { createClient } from "@/lib/supabase/client";

const AVATARS_BUCKET = "avatars";

export async function uploadMyAvatar(file: File): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
    error: uErr,
  } = await supabase.auth.getUser();
  if (uErr) throw uErr;
  if (!user) throw new Error("Utilisateur non connecté.");

  const ext = file.name.includes(".") ? file.name.split(".").pop() || "jpg" : "jpg";
  const path = `user/${user.id}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(AVATARS_BUCKET).upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function updateMyAvatarUrl(avatarUrl: string | null): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
    error: uErr,
  } = await supabase.auth.getUser();
  if (uErr) throw uErr;
  if (!user) throw new Error("Utilisateur non connecté.");

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);
  if (error) throw error;
}

