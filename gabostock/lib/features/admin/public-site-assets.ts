"use client";

import { createClient } from "@/lib/supabase/client";

// Reuse existing public bucket to avoid manual setup.
const BUCKET = "store-logos";

export async function uploadPublicSiteImage(params: {
  key: string;
  file: File;
}): Promise<string> {
  const supabase = createClient();
  const ext = params.file.name.includes(".") ? params.file.name.split(".").pop() || "jpg" : "jpg";
  const safeKey = params.key.replace(/[^a-zA-Z0-9_-]/g, "_");
  const path = `public-site/${safeKey}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, params.file, {
    contentType: params.file.type || "image/jpeg",
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

