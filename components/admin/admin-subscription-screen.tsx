"use client";

import { AdminCard, AdminPageHeader } from "@/components/admin/admin-page-header";
import { fetchAdminSubscriptionOverview } from "@/lib/features/admin/fetch-admin-subscription-overview";
import { queryKeys } from "@/lib/query/query-keys";
import type { SubscriptionPlanDto } from "@/lib/features/subscription/types";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MdOpenInNew } from "react-icons/md";

function fmtStatusFr(s: string): string {
  const x = String(s ?? "").toLowerCase();
  if (x === "active") return "Actif";
  if (x === "trialing") return "Essai";
  if (x === "past_due") return "Impayé";
  if (x === "canceled" || x === "cancelled") return "Résilié / fin de période";
  if (x === "expired") return "Expiré";
  return s || "—";
}

function intervalFr(interval: "month" | "year") {
  return interval === "year" ? "an" : "mois";
}

function planPriceLine(plan: SubscriptionPlanDto) {
  if (plan.priceCents <= 0) return "Gratuit";
  return `${formatCurrency(plan.priceCents / 100)} / ${intervalFr(plan.interval)}`;
}

function shortId(id: string | null) {
  if (id == null || id === "") return "—";
  const t = id.trim();
  if (t.length <= 16) return t;
  return `${t.slice(0, 8)}…${t.slice(-4)}`;
}

export function AdminSubscriptionScreen() {
  const [qFilter, setQFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const q = useQuery({
    queryKey: queryKeys.adminSubscriptionOverview,
    queryFn: fetchAdminSubscriptionOverview,
  });

  const rows = useMemo(() => {
    const list = q.data?.byCompany ?? [];
    const t = qFilter.trim().toLowerCase();
    return list.filter((r) => {
      if (t && !r.companyName.toLowerCase().includes(t)) return false;
      if (statusFilter) {
        const st = r.subscription?.status ?? "";
        if (st !== statusFilter) return false;
      }
      return true;
    });
  }, [q.data?.byCompany, qFilter, statusFilter]);

  const statusOptions = useMemo(() => {
    const m = q.data?.countByStatus;
    if (!m) return [] as { value: string; n: number }[];
    return [...m.entries()]
      .map(([value, n]) => ({ value, n }))
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [q.data?.countByStatus]);

  if (q.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (q.isError) {
    return (
      <div className="p-8">
        <p className="text-sm font-medium text-red-600">{(q.error as Error)?.message ?? "Erreur"}</p>
      </div>
    );
  }

  const d = q.data!;

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <AdminPageHeader
          title="Abonnements"
          description="Catalogue d’offres, abonnements liés (Stripe) et synthèse par entreprise — réservé Super Admin."
        />
        <Link
          href="/admin"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-orange-600 hover:underline"
        >
          Tableau de bord plateforme
          <MdOpenInNew className="h-4 w-4" />
        </Link>
      </div>

      {d.countByStatus.size > 0 ? (
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(({ value, n }) => (
            <span
              key={value}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700"
            >
              {fmtStatusFr(value)} <span className="tabular-nums text-slate-500">({n})</span>
            </span>
          ))}
        </div>
      ) : null}

      <AdminCard>
        <h2 className="text-base font-bold text-slate-900">Offres publiées (actives)</h2>
        <p className="mt-1 text-xs text-slate-500">
          Même source que côté marchand — alignement facturation & quotas boutiques / utilisateurs.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[640px] w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-600">
              <tr>
                <th className="p-3">Nom</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Prix</th>
                <th className="p-3">Boutiques max</th>
                <th className="p-3">Utilisateurs max</th>
              </tr>
            </thead>
            <tbody>
              {d.plans.map((p) => (
                <tr key={p.id} className="border-b border-slate-100">
                  <td className="p-3 font-medium text-slate-900">{p.name}</td>
                  <td className="p-3 font-mono text-xs text-slate-600">{p.slug}</td>
                  <td className="p-3 tabular-nums text-slate-800">{planPriceLine(p)}</td>
                  <td className="p-3 tabular-nums text-slate-600">{p.maxStores == null ? "∞" : p.maxStores}</td>
                  <td className="p-3 tabular-nums text-slate-600">{p.maxUsers == null ? "∞" : p.maxUsers}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {d.plans.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">Aucune offre active. Vérifiez `subscription_plans`.</p>
          ) : null}
        </div>
      </AdminCard>

      <AdminCard padding="p-0" className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Abonnements par entreprise</h2>
            <p className="mt-1 text-xs text-slate-500">Statut Stripe, offre, échéance, identifiants techniques.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="search"
              value={qFilter}
              onChange={(e) => setQFilter(e.target.value)}
              placeholder="Rechercher une entreprise…"
              className="w-full min-w-0 rounded-lg border border-slate-200 px-3 py-2 text-sm sm:w-56"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Tous les statuts</option>
              {statusOptions.map(({ value }) => (
                <option key={value} value={value}>
                  {fmtStatusFr(value)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-600">
              <tr>
                <th className="p-3">Entreprise</th>
                <th className="p-3">Société</th>
                <th className="p-3">Offre</th>
                <th className="p-3">Statut abonnement</th>
                <th className="p-3">Fin période</th>
                <th className="p-3">Résil. en fin période</th>
                <th className="p-3">Client Stripe</th>
                <th className="p-3">Abonnement Stripe</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const sub = r.subscription;
                const end = sub?.currentPeriodEnd;
                const endFr =
                  end == null
                    ? "—"
                    : (() => {
                        try {
                          return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(end));
                        } catch {
                          return end.slice(0, 10);
                        }
                      })();
                return (
                  <tr key={r.companyId} className="border-b border-slate-100">
                    <td className="p-3 font-medium text-slate-900">
                      <Link className="text-orange-700 hover:underline" href="/admin/companies">
                        {r.companyName}
                      </Link>
                    </td>
                    <td className="p-3">
                      <span className={r.companyIsActive ? "text-emerald-600" : "text-slate-500"}>
                        {r.companyIsActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="p-3 text-slate-800">{r.plan?.name ?? (sub ? "—" : "Aucun")}</td>
                    <td className="p-3">
                      {sub ? (
                        <span
                          className={cn(
                            "font-medium",
                            sub.status === "active" && "text-emerald-700",
                            sub.status === "trialing" && "text-amber-700",
                            (sub.status === "past_due" || sub.status === "expired") && "text-red-600",
                          )}
                        >
                          {fmtStatusFr(sub.status)}
                        </span>
                      ) : (
                        <span className="text-slate-500">Aucun dossier</span>
                      )}
                    </td>
                    <td className="p-3 tabular-nums text-slate-700">{sub ? endFr : "—"}</td>
                    <td className="p-3 text-slate-600">{sub?.cancelAtPeriodEnd ? "Oui" : "—"}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-600" title={sub?.stripeCustomerId ?? undefined}>
                      {shortId(sub?.stripeCustomerId ?? null)}
                    </td>
                    <td
                      className="p-3 font-mono text-[11px] text-slate-600"
                      title={sub?.stripeSubscriptionId ?? undefined}
                    >
                      {shortId(sub?.stripeSubscriptionId ?? null)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">Aucun résultat avec ce filtre.</p>
        ) : null}
      </AdminCard>

      <p className="text-xs text-slate-500">
        Le centre d’abonnement <strong> marchand</strong> (plan & quotas par société) reste accessible côté app à{" "}
        <code className="rounded bg-slate-100 px-1">/subscription</code> — cette page ne le remplace pas, elle
        l’oriente côté pilotage central.
      </p>
    </div>
  );
}
