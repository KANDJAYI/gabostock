"use client";

import { FsCard, FsPage, FsScreenHeader, fsInputClass } from "@/components/ui/fs-screen-primitives";
import { NoAccessScreen } from "@/components/permissions/no-access-screen";
import { usePermissions } from "@/lib/features/permissions/use-permissions";
import { isPharmacyBusinessTypeSlug } from "@/lib/features/pharmacy/is-pharmacy";
import { listProducts } from "@/lib/features/products/api";
import type { ProductItem } from "@/lib/features/products/types";
import {
  deletePharmacyBatch,
  listPharmacyBatches,
  upsertPharmacyBatch,
} from "@/lib/features/pharmacy/batches/api";
import { queryKeys } from "@/lib/query/query-keys";
import { messageFromUnknownError, toast } from "@/lib/toast";
import { cn } from "@/lib/utils/cn";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { MdAdd, MdDeleteOutline, MdLocalPharmacy } from "react-icons/md";

type FormState = {
  productId: string;
  lotNumber: string;
  expiresOn: string;
  manufacturer: string;
  drugCategory: string;
  dosage: string;
  form: string;
  prescriptionRequired: boolean;
  quantity: string;
  notes: string;
};

function initForm(): FormState {
  return {
    productId: "",
    lotNumber: "",
    expiresOn: "",
    manufacturer: "",
    drugCategory: "",
    dosage: "",
    form: "",
    prescriptionRequired: false,
    quantity: "0",
    notes: "",
  };
}

export function PharmacyBatchesScreen() {
  const qc = useQueryClient();
  const { data: ctx, isLoading, isError } = usePermissions();
  const isPharmacy = isPharmacyBusinessTypeSlug(ctx?.businessTypeSlug);
  const companyId = ctx?.companyId ?? "";
  const storeId = ctx?.storeId ?? null;

  const [form, setForm] = useState<FormState>(() => initForm());

  const productsQ = useQuery({
    queryKey: queryKeys.products(companyId),
    queryFn: () => listProducts(companyId),
    enabled: Boolean(companyId) && isPharmacy,
  });

  const batchesQ = useQuery({
    queryKey: ["pharmacy", "batches", storeId] as const,
    queryFn: () => listPharmacyBatches({ storeId: storeId! }),
    enabled: Boolean(storeId) && isPharmacy,
    staleTime: 15_000,
  });

  const products = (productsQ.data ?? []).filter((p) => p.is_active !== false);
  const productNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of products) m.set(p.id, p.name);
    return m;
  }, [products]);

  const addMut = useMutation({
    mutationFn: async () => {
      if (!companyId) throw new Error("Entreprise manquante.");
      if (!storeId) throw new Error("Choisissez une boutique.");
      const lotNumber = form.lotNumber.trim();
      if (!form.productId) throw new Error("Sélectionnez un produit.");
      if (!lotNumber) throw new Error("Numéro de lot requis.");
      const q = Math.max(0, Math.trunc(Number(form.quantity)));
      if (!Number.isFinite(q)) throw new Error("Quantité invalide.");

      await upsertPharmacyBatch({
        companyId,
        storeId,
        productId: form.productId,
        lotNumber,
        expiresOn: form.expiresOn.trim() || null,
        manufacturer: form.manufacturer.trim() || null,
        drugCategory: form.drugCategory.trim() || null,
        dosage: form.dosage.trim() || null,
        form: form.form.trim() || null,
        prescriptionRequired: form.prescriptionRequired,
        quantity: q,
        notes: form.notes.trim() || null,
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["pharmacy", "batches", storeId] });
      toast.success("Lot enregistré");
      setForm(initForm());
    },
    onError: (e) => toast.error(messageFromUnknownError(e)),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => deletePharmacyBatch(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["pharmacy", "batches", storeId] });
      toast.success("Lot supprimé");
    },
    onError: (e) => toast.error(messageFromUnknownError(e)),
  });

  if (isLoading) return null;
  if (isError) return <NoAccessScreen />;
  if (!ctx?.companyId) return <NoAccessScreen />;
  if (!isPharmacy) return <NoAccessScreen />;

  return (
    <FsPage className="flex flex-col">
      <FsScreenHeader
        title="Lots (Pharmacie)"
        subtitle="Gestion des numéros de lot, quantités et dates d’expiration"
        titleClassName="min-[900px]:text-2xl min-[900px]:font-bold min-[900px]:tracking-tight"
        subtitleClassName="text-neutral-600 min-[900px]:text-base"
      />

      {!storeId ? (
        <FsCard padding="p-6" className="mt-3">
          <p className="text-sm text-neutral-700">
            Sélectionnez une boutique dans le menu pour gérer les lots.
          </p>
        </FsCard>
      ) : (
        <>
          <FsCard padding="p-5" className="mt-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-fs-accent/12 text-fs-accent">
                <MdLocalPharmacy className="h-6 w-6" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-semibold text-fs-text">Ajouter / mettre à jour un lot</h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Unicité par boutique + produit + numéro de lot. Un nouvel enregistrement avec le
                  même lot met à jour la quantité et les informations.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 min-[860px]:grid-cols-3">
              <label className="block min-w-0">
                <span className="mb-1 block text-xs font-medium text-neutral-600">Produit</span>
                <select
                  value={form.productId}
                  onChange={(e) => setForm((s) => ({ ...s, productId: e.target.value }))}
                  className={fsInputClass()}
                >
                  <option value="">—</option>
                  {products.map((p: ProductItem) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-neutral-600">Numéro de lot *</span>
                <input
                  value={form.lotNumber}
                  onChange={(e) => setForm((s) => ({ ...s, lotNumber: e.target.value }))}
                  className={fsInputClass()}
                  placeholder="Ex: LOT-2026-001"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-neutral-600">Quantité</span>
                <input
                  value={form.quantity}
                  onChange={(e) => setForm((s) => ({ ...s, quantity: e.target.value }))}
                  className={fsInputClass()}
                  inputMode="numeric"
                  placeholder="0"
                />
              </label>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 min-[860px]:grid-cols-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-neutral-600">Expiration</span>
                <input
                  type="date"
                  value={form.expiresOn}
                  onChange={(e) => setForm((s) => ({ ...s, expiresOn: e.target.value }))}
                  className={fsInputClass()}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-neutral-600">Fabricant</span>
                <input
                  value={form.manufacturer}
                  onChange={(e) => setForm((s) => ({ ...s, manufacturer: e.target.value }))}
                  className={fsInputClass()}
                  placeholder="Ex: Sanofi"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-neutral-600">Catégorie</span>
                <input
                  value={form.drugCategory}
                  onChange={(e) => setForm((s) => ({ ...s, drugCategory: e.target.value }))}
                  className={fsInputClass()}
                  placeholder="Ex: Antibiotique"
                />
              </label>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 min-[860px]:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-neutral-600">Dosage</span>
                <input
                  value={form.dosage}
                  onChange={(e) => setForm((s) => ({ ...s, dosage: e.target.value }))}
                  className={fsInputClass()}
                  placeholder="Ex: 500 mg"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-neutral-600">Forme</span>
                <input
                  value={form.form}
                  onChange={(e) => setForm((s) => ({ ...s, form: e.target.value }))}
                  className={fsInputClass()}
                  placeholder="Ex: Comprimé"
                />
              </label>
            </div>

            <label className="mt-3 flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.prescriptionRequired}
                onChange={(e) =>
                  setForm((s) => ({ ...s, prescriptionRequired: e.target.checked }))
                }
                className="h-4 w-4 rounded border-black/[0.2] text-fs-accent focus:ring-fs-accent"
              />
              <span className="text-sm text-fs-text">Prescription obligatoire</span>
            </label>

            <label className="mt-3 block">
              <span className="mb-1 block text-xs font-medium text-neutral-600">Notes</span>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
                rows={2}
                className={fsInputClass("min-h-[4.5rem] resize-y")}
              />
            </label>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                disabled={addMut.isPending}
                onClick={() => addMut.mutate()}
                className={cn(
                  "fs-touch-target inline-flex items-center justify-center gap-2 rounded-xl bg-fs-accent px-4 py-2.5 text-sm font-semibold text-white",
                  addMut.isPending && "opacity-60",
                )}
              >
                <MdAdd className="h-5 w-5" aria-hidden />
                Enregistrer
              </button>
            </div>
          </FsCard>

          <FsCard padding="p-0" className="mt-4 overflow-hidden">
            <div className="border-b border-black/[0.06] p-4 sm:p-5">
              <h2 className="text-base font-semibold text-fs-text">Lots existants</h2>
              <p className="mt-1 text-sm text-neutral-600">
                {batchesQ.data?.length ? `${batchesQ.data.length} lot(s)` : "Aucun lot"}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-black/[0.06] bg-fs-surface-container/80">
                    <th className="px-4 py-3 font-semibold text-fs-text">Produit</th>
                    <th className="px-3 py-3 font-semibold text-fs-text">Lot</th>
                    <th className="px-3 py-3 font-semibold text-fs-text">Expiration</th>
                    <th className="px-3 py-3 text-right font-semibold text-fs-text">Qté</th>
                    <th className="px-4 py-3 font-semibold text-fs-text">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(batchesQ.data ?? []).map((b) => {
                    const productName =
                      productNameById.get(b.product_id) ??
                      (Array.isArray(b.product) ? b.product[0]?.name : b.product?.name) ??
                      "—";
                    return (
                      <tr key={b.id} className="border-b border-black/[0.04]">
                        <td className="max-w-[320px] px-4 py-2 font-medium text-fs-text">
                          {productName}
                        </td>
                        <td className="px-3 py-2 text-neutral-800">{b.lot_number}</td>
                        <td className="px-3 py-2 text-neutral-700">{b.expires_on ?? "—"}</td>
                        <td className="px-3 py-2 text-right font-semibold tabular-nums text-neutral-900">
                          {b.quantity}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (!confirm("Supprimer ce lot ?")) return;
                              delMut.mutate(b.id);
                            }}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                            aria-label="Supprimer"
                          >
                            <MdDeleteOutline className="h-5 w-5" aria-hidden />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </FsCard>
        </>
      )}
    </FsPage>
  );
}

