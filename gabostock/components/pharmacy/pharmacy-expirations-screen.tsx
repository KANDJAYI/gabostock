"use client";

import { FsCard, FsFilterChip, FsPage, FsScreenHeader } from "@/components/ui/fs-screen-primitives";
import { NoAccessScreen } from "@/components/permissions/no-access-screen";
import { usePermissions } from "@/lib/features/permissions/use-permissions";
import { isPharmacyBusinessTypeSlug } from "@/lib/features/pharmacy/is-pharmacy";
import { listPharmacyBatches } from "@/lib/features/pharmacy/batches/api";
import { queryKeys } from "@/lib/query/query-keys";
import { cn } from "@/lib/utils/cn";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { MdAccessTime, MdErrorOutline, MdLocalPharmacy, MdWarningAmber } from "react-icons/md";

type ExpFilter = "all" | "expired" | "soon";

function toDateUtc(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

export function PharmacyExpirationsScreen() {
  const { data: ctx, isLoading, isError } = usePermissions();
  const isPharmacy = isPharmacyBusinessTypeSlug(ctx?.businessTypeSlug);
  const storeId = ctx?.storeId ?? null;
  const [filter, setFilter] = useState<ExpFilter>("all");
  const soonDays = 30;

  const batchesQ = useQuery({
    queryKey: ["pharmacy", "expirations", storeId] as const,
    queryFn: () => listPharmacyBatches({ storeId: storeId! }),
    enabled: Boolean(storeId) && isPharmacy,
    staleTime: 10_000,
  });

  const { expired, soon, all } = useMemo(() => {
    const rows = (batchesQ.data ?? []).filter((b) => b.quantity > 0 && b.expires_on);
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const soonLimit = new Date(today);
    soonLimit.setUTCDate(soonLimit.getUTCDate() + soonDays);

    const expired = rows.filter((b) => toDateUtc(b.expires_on!) < today);
    const soon = rows.filter((b) => {
      const d = toDateUtc(b.expires_on!);
      return d >= today && d <= soonLimit;
    });
    return { all: rows, expired, soon };
  }, [batchesQ.data]);

  const shown = filter === "expired" ? expired : filter === "soon" ? soon : all;

  if (isLoading) return null;
  if (isError) return <NoAccessScreen />;
  if (!ctx?.companyId) return <NoAccessScreen />;
  if (!isPharmacy) return <NoAccessScreen />;

  return (
    <FsPage className="flex flex-col">
      <FsScreenHeader
        title="Péremption (Pharmacie)"
        subtitle="Alertes produits expirés et expirant bientôt"
        titleClassName="min-[900px]:text-2xl min-[900px]:font-bold min-[900px]:tracking-tight"
        subtitleClassName="text-neutral-600 min-[900px]:text-base"
      />

      {!storeId ? (
        <FsCard padding="p-6" className="mt-3">
          <p className="text-sm text-neutral-700">
            Sélectionnez une boutique dans le menu pour voir les alertes de péremption.
          </p>
        </FsCard>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap gap-2">
            <FsFilterChip
              icon={MdLocalPharmacy}
              label={`Tous (${all.length})`}
              selected={filter === "all"}
              onClick={() => setFilter("all")}
            />
            <FsFilterChip
              icon={MdWarningAmber}
              label={`Expire bientôt (${soon.length})`}
              selected={filter === "soon"}
              onClick={() => setFilter("soon")}
            />
            <FsFilterChip
              icon={MdErrorOutline}
              label={`Expirés (${expired.length})`}
              selected={filter === "expired"}
              onClick={() => setFilter("expired")}
            />
          </div>

          <FsCard padding="p-0" className="mt-4 overflow-hidden">
            <div className="border-b border-black/[0.06] p-4 sm:p-5">
              <h2 className="text-base font-semibold text-fs-text">Alertes</h2>
              <p className="mt-1 text-sm text-neutral-600">
                {shown.length === 0 ? "Aucune alerte sur la sélection." : `${shown.length} lot(s)`}
              </p>
            </div>

            {shown.length === 0 ? (
              <div className="p-6 text-sm text-neutral-600">
                Astuce : ajoutez vos lots dans{" "}
                <span className="font-semibold text-fs-text">Lots (Pharmacie)</span> pour activer
                les alertes.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-black/[0.06] bg-fs-surface-container/80">
                      <th className="px-4 py-3 font-semibold text-fs-text">Produit</th>
                      <th className="px-3 py-3 font-semibold text-fs-text">Lot</th>
                      <th className="px-3 py-3 font-semibold text-fs-text">Expiration</th>
                      <th className="px-3 py-3 text-right font-semibold text-fs-text">Qté</th>
                      <th className="px-4 py-3 font-semibold text-fs-text">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((b) => {
                      const productName =
                        (Array.isArray(b.product) ? b.product[0]?.name : b.product?.name) ?? "—";
                      const isExpired = (() => {
                        if (!b.expires_on) return false;
                        const now = new Date();
                        const today = new Date(
                          Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
                        );
                        return toDateUtc(b.expires_on) < today;
                      })();
                      return (
                        <tr key={b.id} className="border-b border-black/[0.04]">
                          <td className="max-w-[340px] px-4 py-2 font-medium text-fs-text">
                            {productName}
                          </td>
                          <td className="px-3 py-2 text-neutral-800">{b.lot_number}</td>
                          <td className="px-3 py-2 text-neutral-700">{b.expires_on}</td>
                          <td className="px-3 py-2 text-right font-semibold tabular-nums text-neutral-900">
                            {b.quantity}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                                isExpired
                                  ? "bg-red-50 text-red-700"
                                  : "bg-amber-50 text-amber-800",
                              )}
                            >
                              <MdAccessTime className="h-4 w-4" aria-hidden />
                              {isExpired ? "Expiré" : "Expire bientôt"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </FsCard>
        </>
      )}
    </FsPage>
  );
}

