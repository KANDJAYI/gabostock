import { getSupabaseServiceRoleKeyFromEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { normalizeSupabaseUrl } from "@/lib/supabase/normalize-url";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Suppression définitive d’une entreprise — réservé au super admin.
 * En priorité : client **service_role** (ignore la RLS + CASCADE propre).
 * Sinon : RPC `admin_delete_company` (nécessite migrations audit / RPC à jour).
 */
export async function POST(req: Request) {
  let body: { companyId?: string };
  try {
    body = (await req.json()) as { companyId?: string };
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide" }, { status: 400 });
  }
  const companyId = typeof body.companyId === "string" ? body.companyId.trim() : "";
  if (!companyId) {
    return NextResponse.json({ error: "companyId requis" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("is_super_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (profErr) {
    return NextResponse.json({ error: profErr.message }, { status: 500 });
  }
  if (!profile?.is_super_admin) {
    return NextResponse.json({ error: "Réservé au super admin" }, { status: 403 });
  }

  const urlRaw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = getSupabaseServiceRoleKeyFromEnv();

  if (urlRaw && serviceKey) {
    const url = normalizeSupabaseUrl(urlRaw);
    const admin = createServiceClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: e1 } = await admin.from("audit_logs").delete().eq("company_id", companyId);
    if (e1) {
      return NextResponse.json(
        { error: `Pré-nettoyage audit : ${e1.message}` },
        { status: 409 },
      );
    }
    const { error: e2 } = await admin.from("companies").delete().eq("id", companyId);
    if (e2) {
      return NextResponse.json({ error: e2.message }, { status: 409 });
    }
    return NextResponse.json({ ok: true });
  }

  const { error: rpcErr } = await supabase.rpc("admin_delete_company", { p_company_id: companyId });
  if (rpcErr) {
    return NextResponse.json(
      {
        error: rpcErr.message,
        hint:
          "Si l’erreur parle d’audit_logs : ajoutez SUPABASE_SERVICE_ROLE_KEY (serveur) dans .env.local " +
          "ou appliquez les migrations 00091/00094/00095 (supabase db push).",
      },
      { status: 409 },
    );
  }
  return NextResponse.json({ ok: true });
}
