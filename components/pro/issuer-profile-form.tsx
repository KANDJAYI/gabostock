"use client";

import { authSimpleFieldClass } from "@/components/auth/auth-page-shell";
import {
  getIssuer,
  uploadIssuerLogo,
  upsertIssuer,
} from "@/lib/features/pro/issuer/api";
import type { ProIssuerFormInput } from "@/lib/features/pro/issuer/types";
import { cn } from "@/lib/utils/cn";
import { AlertCircle, Check, Image as ImageIcon, UserCog } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

const EMPTY: ProIssuerFormInput = {
  business_name: "",
  address: "",
  phone: "",
  email: "",
  tax_id: "",
  currency: "XOF",
  default_vat_rate: 0,
  legal_mentions: "",
};

export function IssuerProfileForm() {
  const [form, setForm] = useState<ProIssuerFormInput>(EMPTY);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const issuer = await getIssuer();
        if (issuer) {
          setForm({
            business_name: issuer.business_name ?? "",
            address: issuer.address ?? "",
            phone: issuer.phone ?? "",
            email: issuer.email ?? "",
            tax_id: issuer.tax_id ?? "",
            currency: issuer.currency ?? "XOF",
            default_vat_rate: issuer.default_vat_rate ?? 0,
            legal_mentions: issuer.legal_mentions ?? "",
          });
          setLogoUrl(issuer.logo_url);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur de chargement.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await upsertIssuer(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }

  async function onPickLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      // Sauvegarde d'abord les champs pour garantir l'existence de la ligne émetteur.
      await upsertIssuer(form);
      const url = await uploadIssuerLogo(file);
      setLogoUrl(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Téléversement impossible.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (loading) {
    return (
      <p className="py-10 text-center text-sm text-neutral-500">Chargement…</p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 flex items-center gap-2 text-xl font-bold tracking-tight">
        <UserCog className="h-5 w-5 text-fs-accent" aria-hidden />
        Profil émetteur
      </h1>
      <p className="mb-5 text-sm text-neutral-500">
        Ces informations apparaissent en en-tête de vos devis et factures.
      </p>

      {error ? (
        <div className="mb-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <p>{error}</p>
        </div>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-4 rounded-2xl border border-black/[0.06] bg-fs-card p-5"
      >
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-fs-surface-container">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Logo"
                className="h-full w-full object-contain"
              />
            ) : (
              <ImageIcon className="h-7 w-7 text-neutral-400" aria-hidden />
            )}
          </div>
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onPickLogo}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:border-fs-accent/30 hover:text-fs-accent disabled:opacity-60"
            >
              {uploading ? "Téléversement…" : "Changer le logo"}
            </button>
            <p className="mt-1 text-xs text-neutral-500">PNG ou JPG.</p>
          </div>
        </div>

        <Field label="Nom commercial / votre nom">
          <input
            className={authSimpleFieldClass}
            value={form.business_name}
            onChange={(e) =>
              setForm({ ...form, business_name: e.target.value })
            }
            placeholder="Ex : Studio Kofi Design"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Téléphone">
            <input
              className={authSimpleFieldClass}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>
          <Field label="Email">
            <input
              className={authSimpleFieldClass}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
        </div>

        <Field label="Adresse">
          <textarea
            className={cn(authSimpleFieldClass, "min-h-[64px] resize-y")}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="N° fiscal / RCCM">
            <input
              className={authSimpleFieldClass}
              value={form.tax_id}
              onChange={(e) => setForm({ ...form, tax_id: e.target.value })}
            />
          </Field>
          <Field label="Devise">
            <input
              className={authSimpleFieldClass}
              value={form.currency}
              onChange={(e) =>
                setForm({ ...form, currency: e.target.value.toUpperCase() })
              }
              placeholder="XOF"
            />
          </Field>
          <Field label="TVA par défaut (%)">
            <input
              className={authSimpleFieldClass}
              type="number"
              min={0}
              step="0.1"
              value={form.default_vat_rate}
              onChange={(e) =>
                setForm({
                  ...form,
                  default_vat_rate: Number(e.target.value) || 0,
                })
              }
            />
          </Field>
        </div>

        <Field label="Mentions légales / pied de page">
          <textarea
            className={cn(authSimpleFieldClass, "min-h-[64px] resize-y")}
            value={form.legal_mentions}
            onChange={(e) =>
              setForm({ ...form, legal_mentions: e.target.value })
            }
            placeholder="Conditions de paiement, IBAN, mentions obligatoires…"
          />
        </Field>

        <div className="flex items-center justify-end gap-3">
          {saved ? (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600">
              <Check className="h-4 w-4" /> Enregistré
            </span>
          ) : null}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-lg bg-fs-accent px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-neutral-500">
        {label}
      </span>
      {children}
    </label>
  );
}
