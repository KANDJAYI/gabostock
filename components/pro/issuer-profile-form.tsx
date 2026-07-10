"use client";

import { Field, fieldInputClass } from "@/components/pro/form-kit";
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

        <Field
          label="Nom commercial (ou votre nom)"
          required
          htmlFor="iss-name"
          hint="Affiché en gros en haut de chaque devis / facture."
        >
          <input
            id="iss-name"
            className={fieldInputClass}
            value={form.business_name}
            onChange={(e) =>
              setForm({ ...form, business_name: e.target.value })
            }
            placeholder="Ex : Atelier Kofi Design"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Téléphone"
            htmlFor="iss-phone"
            hint="Un moyen de vous joindre, imprimé sur le document."
          >
            <input
              id="iss-phone"
              className={fieldInputClass}
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Ex : +241 06 12 34 56"
            />
          </Field>
          <Field label="Email" htmlFor="iss-email">
            <input
              id="iss-email"
              className={fieldInputClass}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Ex : contact@kofidesign.ga"
            />
          </Field>
        </div>

        <Field
          label="Adresse"
          htmlFor="iss-address"
          hint="Votre adresse professionnelle (une ligne par retour à la ligne)."
        >
          <textarea
            id="iss-address"
            className={cn(fieldInputClass, "min-h-16 resize-y")}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Ex : Rue des Cocotiers, Libreville, Gabon"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="N° fiscal / RCCM"
            htmlFor="iss-tax"
            hint="Votre immatriculation légale."
          >
            <input
              id="iss-tax"
              className={fieldInputClass}
              value={form.tax_id}
              onChange={(e) => setForm({ ...form, tax_id: e.target.value })}
              placeholder="Ex : RCCM GA-LBV-2024-B-1234"
            />
          </Field>
          <Field
            label="Devise"
            required
            htmlFor="iss-currency"
            hint="Code de la monnaie utilisée par défaut."
          >
            <input
              id="iss-currency"
              className={fieldInputClass}
              value={form.currency}
              onChange={(e) =>
                setForm({ ...form, currency: e.target.value.toUpperCase() })
              }
              placeholder="Ex : XOF"
            />
          </Field>
          <Field
            label="TVA par défaut"
            htmlFor="iss-vat"
            hint="En %. Laissez vide si vous ne facturez pas de TVA."
          >
            <input
              id="iss-vat"
              className={fieldInputClass}
              type="number"
              min={0}
              step="0.1"
              value={form.default_vat_rate || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  default_vat_rate: Number(e.target.value) || 0,
                })
              }
              placeholder="Ex : 18"
            />
          </Field>
        </div>

        <Field
          label="Mentions légales / pied de page"
          htmlFor="iss-legal"
          hint="Conditions de paiement, IBAN, mentions obligatoires… Imprimé en bas du document."
        >
          <textarea
            id="iss-legal"
            className={cn(fieldInputClass, "min-h-16 resize-y")}
            value={form.legal_mentions}
            onChange={(e) =>
              setForm({ ...form, legal_mentions: e.target.value })
            }
            placeholder="Ex : Paiement à 30 jours. IBAN : GA21 4002 …"
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
