"use client";

import { AdminCard, AdminPageHeader } from "@/components/admin/admin-page-header";
import {
  adminDeleteCompanySubscription,
  adminNotifyCompanyOwners,
  adminUpdateSubscriptionPlan,
  adminUpsertCompanySubscription,
} from "@/lib/features/admin/api";
import { fetchAdminSubscriptionOverview } from "@/lib/features/admin/fetch-admin-subscription-overview";
import { queryKeys } from "@/lib/query/query-keys";
import type { SubscriptionPlanDto } from "@/lib/features/subscription/types";
import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils/cn";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

function centsFromPriceInput(v: string): number {
  const t = v.trim().replace(",", ".");
  if (!t) return 0;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

function priceInputFromCents(cents: number): string {
  const n = Number.isFinite(cents) ? cents : 0;
  return String(Math.round(n) / 100);
}

function isoToDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  // `datetime-local` veut "YYYY-MM-DDTHH:mm"
  const t = iso.trim();
  if (!t) return "";
  return t.slice(0, 16);
}

function dateInputToIso(v: string): string | null {
  const t = v.trim();
  if (!t) return null;
  // Interprété en local par `new Date()`, puis stocke ISO.
  const d = new Date(t);
  if (!Number.isFinite(d.getTime())) return null;
  return d.toISOString();
}

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
        status === "active" && "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
        status === "trialing" && "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
        (status === "past_due" || status === "expired") &&
          "bg-red-50 text-red-700 ring-1 ring-red-200",
        (status === "canceled" || status === "cancelled") &&
          "bg-slate-50 text-slate-700 ring-1 ring-slate-200",
      )}
    >
      {fmtStatusFr(status)}
    </span>
  );
}

function AdminSubscriptionManageDialog({
  open,
  onClose,
  company,
  plans,
}: {
  open: boolean;
  onClose: () => void;
  company: {
    companyId: string;
    companyName: string;
    subscription: { planId: string; status: string; currentPeriodStart: string | null; currentPeriodEnd: string | null; cancelAtPeriodEnd: boolean } | null;
  } | null;
  plans: SubscriptionPlanDto[];
}) {
  const qc = useQueryClient();
  const [planId, setPlanId] = useState("");
  const [status, setStatus] = useState<"trialing" | "active" | "past_due" | "canceled" | "expired">("active");
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [currentPeriodStart, setCurrentPeriodStart] = useState("");
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState("");
  const [notifyTitle, setNotifyTitle] = useState("Votre essai gratuit est terminé");
  const [notifyBody, setNotifyBody] = useState(
    "Bonjour,\n\nVotre essai gratuit d’une semaine est terminé. Merci de renouveler l’abonnement pour continuer à utiliser Gabostock.\n\nCordialement,\nSupport Gabostock",
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !company) return;
    const sub = company.subscription;
    setPlanId(sub?.planId ?? (plans[0]?.id ?? ""));
    const st = (sub?.status ?? "active").toLowerCase();
    setStatus(
      st === "trialing" || st === "past_due" || st === "canceled" || st === "expired"
        ? (st as typeof status)
        : "active",
    );
    setCancelAtPeriodEnd(sub?.cancelAtPeriodEnd === true);
    setCurrentPeriodStart(isoToDateInput(sub?.currentPeriodStart));
    setCurrentPeriodEnd(isoToDateInput(sub?.currentPeriodEnd));
    setNotifyTitle("Votre essai gratuit est terminé");
    setNotifyBody(
      `Bonjour ${company.companyName},\n\nVotre essai gratuit d’une semaine est terminé. Merci de renouveler l’abonnement pour continuer à utiliser Gabostock.\n\nCordialement,\nSupport Gabostock`,
    );
    setErrorMsg(null);
  }, [open, company, plans]);

  const save = useMutation({
    mutationFn: async () => {
      if (!company) return;
      const pid = planId.trim();
      if (!pid) throw new Error("Plan requis.");
      const startIso = dateInputToIso(currentPeriodStart);
      const endIso = dateInputToIso(currentPeriodEnd);
      if (startIso && endIso && startIso > endIso) {
        throw new Error("La date de début doit précéder la date de fin.");
      }
      await adminUpsertCompanySubscription({
        companyId: company.companyId,
        planId: pid,
        status,
        cancelAtPeriodEnd,
        currentPeriodStart: startIso,
        currentPeriodEnd: endIso,
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.adminSubscriptionOverview });
      onClose();
    },
    onError: (e) => setErrorMsg(e instanceof Error ? e.message : "Enregistrement impossible."),
  });

  const remove = useMutation({
    mutationFn: async () => {
      if (!company) return;
      await adminDeleteCompanySubscription(company.companyId);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.adminSubscriptionOverview });
      onClose();
    },
    onError: (e) => setErrorMsg(e instanceof Error ? e.message : "Suppression impossible."),
  });

  const notify = useMutation({
    mutationFn: async () => {
      if (!company) return 0;
      const title = notifyTitle.trim();
      if (!title) throw new Error("Titre requis.");
      const body = notifyBody.trim();
      return await adminNotifyCompanyOwners({
        companyId: company.companyId,
        title,
        body: body.length ? body : null,
        type: "subscription",
      });
    },
    onError: (e) => setErrorMsg(e instanceof Error ? e.message : "Envoi impossible."),
  });

  if (!open || !company) return null;

  const busy = save.isPending || remove.isPending || notify.isPending;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-6">
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Fermer" />
      <div
        className="relative z-10 w-full max-w-[620px] rounded-t-2xl border border-black/[0.08] bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
        aria-label="Gérer abonnement"
      >
        <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Entreprise
              </p>
              <h3 className="truncate text-lg font-bold text-slate-900">{company.companyName}</h3>
            </div>
            {company.subscription?.status ? <StatusPill status={company.subscription.status} /> : null}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Actions Super Admin: définir le plan, le statut et les dates. Paiement géré hors Stripe (cash / mobile money).
          </p>
        </div>

        <div className="max-h-[72vh] overflow-y-auto px-4 py-4 sm:px-6">
          {errorMsg ? (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {errorMsg}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Plan</span>
              <select
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                disabled={busy}
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {planPriceLine(p)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Statut</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                disabled={busy}
              >
                <option value="trialing">Essai</option>
                <option value="active">Actif</option>
                <option value="past_due">Impayé</option>
                <option value="expired">Expiré</option>
                <option value="canceled">Résilié</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Début période</span>
              <input
                type="datetime-local"
                value={currentPeriodStart}
                onChange={(e) => setCurrentPeriodStart(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                disabled={busy}
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">Fin période</span>
              <input
                type="datetime-local"
                value={currentPeriodEnd}
                onChange={(e) => setCurrentPeriodEnd(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                disabled={busy}
              />
            </label>

            <label className="flex items-center gap-2 pt-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={cancelAtPeriodEnd}
                onChange={(e) => setCancelAtPeriodEnd(e.target.checked)}
                disabled={busy}
              />
              <span className="text-sm text-slate-700">Résilier en fin de période</span>
            </label>

          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              disabled={busy}
              onClick={() => {
                const now = new Date();
                setCurrentPeriodStart(now.toISOString().slice(0, 16));
                const end = new Date(now);
                end.setDate(end.getDate() + 30);
                setCurrentPeriodEnd(end.toISOString().slice(0, 16));
                setStatus("active");
                setCancelAtPeriodEnd(false);
              }}
            >
              Activer 30 jours
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              disabled={busy}
              onClick={() => {
                setStatus("past_due");
              }}
            >
              Marquer impayé
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              disabled={busy}
              onClick={() => {
                setStatus("expired");
                setCancelAtPeriodEnd(true);
              }}
            >
              Expirer
            </button>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-bold text-slate-900">Notification aux propriétaires</p>
            <p className="mt-1 text-xs text-slate-600">
              Envoie un message dans l’espace Notifications des comptes <strong>owner</strong> de cette entreprise.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-600">Titre</span>
                <input
                  value={notifyTitle}
                  onChange={(e) => setNotifyTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  disabled={busy}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-600">Message</span>
                <textarea
                  value={notifyBody}
                  onChange={(e) => setNotifyBody(e.target.value)}
                  className="min-h-[110px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  disabled={busy}
                />
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  disabled={busy}
                  onClick={() => {
                    const now = new Date();
                    const endIso = dateInputToIso(currentPeriodEnd);
                    const isExpired = endIso != null && endIso < now.toISOString();
                    setNotifyTitle(
                      isExpired ? "Votre essai gratuit est terminé" : "Votre essai gratuit expire bientôt",
                    );
                  }}
                >
                  Adapter au statut
                </button>
                <button
                  type="button"
                  className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                  disabled={busy}
                  onClick={async () => {
                    setErrorMsg(null);
                    const n = await notify.mutateAsync();
                    setErrorMsg(n > 0 ? `Notification envoyée à ${n} owner(s).` : "Aucun owner trouvé.");
                  }}
                >
                  {notify.isPending ? "Envoi…" : "Envoyer"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <button
            type="button"
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            onClick={onClose}
            disabled={busy}
          >
            Annuler
          </button>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
              disabled={busy}
              onClick={() => void remove.mutateAsync()}
            >
              Supprimer le dossier
            </button>
            <button
              type="button"
              className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
              disabled={busy}
              onClick={() => {
                setErrorMsg(null);
                void save.mutateAsync();
              }}
            >
              {busy ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminSubscriptionScreen() {
  const [qFilter, setQFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const q = useQuery({
    queryKey: queryKeys.adminSubscriptionOverview,
    queryFn: fetchAdminSubscriptionOverview,
  });

  const nowIso = new Date().toISOString();
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
    return Object.entries(m)
      .map(([value, n]) => ({ value, n: Number(n) }))
      .sort((a, b) => a.value.localeCompare(b.value));
  }, [q.data?.countByStatus]);

  const trialsToHandle = useMemo(() => {
    const byCompany = q.data?.byCompany ?? [];
    const list = byCompany
      .map((r) => {
        const sub = r.subscription;
        if (!sub) return null;
        if (String(sub.status).toLowerCase() !== "trialing") return null;
        const endIso = sub.currentPeriodEnd ?? null;
        if (!endIso) return null;
        const isExpired = endIso < nowIso;
        // "bientôt" = 48h
        const soon =
          !isExpired &&
          endIso < new Date(Date.now() + 48 * 3600 * 1000).toISOString();
        if (!isExpired && !soon) return null;
        return {
          companyId: r.companyId,
          companyName: r.companyName,
          endIso,
          isExpired,
          soon,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x != null);
    list.sort((a, b) => a.endIso.localeCompare(b.endIso));
    return list;
  }, [q.data?.byCompany, nowIso]);

  const selectedCompany = useMemo(() => {
    if (!selectedCompanyId) return null;
    const byCompany = q.data?.byCompany ?? [];
    const r = byCompany.find((x) => x.companyId === selectedCompanyId);
    if (!r) return null;
    return {
      companyId: r.companyId,
      companyName: r.companyName,
      subscription: r.subscription,
    };
  }, [q.data?.byCompany, selectedCompanyId]);

  const selectedPlan = useMemo(() => {
    if (!selectedPlanId) return null;
    const plans = q.data?.plans ?? [];
    return plans.find((p) => p.id === selectedPlanId) ?? null;
  }, [q.data?.plans, selectedPlanId]);

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

  if (!q.data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  const d = q.data;

  // Dialog édition plan (prix, quotas, etc.)
  const qc = useQueryClient();
  const [planName, setPlanName] = useState("");
  const [planSlug, setPlanSlug] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [planInterval, setPlanInterval] = useState<"month" | "year">("month");
  const [planCurrency, setPlanCurrency] = useState("XAF");
  const [planMaxStores, setPlanMaxStores] = useState("");
  const [planMaxUsers, setPlanMaxUsers] = useState("");
  const [planIsActive, setPlanIsActive] = useState(true);
  const [planError, setPlanError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedPlan) return;
    setPlanName(selectedPlan.name);
    setPlanSlug(selectedPlan.slug);
    setPlanPrice(priceInputFromCents(selectedPlan.priceCents));
    setPlanInterval(selectedPlan.interval);
    setPlanCurrency(selectedPlan.currency || "XAF");
    setPlanMaxStores(selectedPlan.maxStores == null ? "" : String(selectedPlan.maxStores));
    setPlanMaxUsers(selectedPlan.maxUsers == null ? "" : String(selectedPlan.maxUsers));
    setPlanIsActive(true);
    setPlanError(null);
  }, [selectedPlan]);

  const savePlan = useMutation({
    mutationFn: async () => {
      if (!selectedPlan) return;
      const priceCents = centsFromPriceInput(planPrice);
      const maxStores =
        planMaxStores.trim() === "" ? null : Math.max(0, Math.round(Number(planMaxStores)));
      const maxUsers =
        planMaxUsers.trim() === "" ? null : Math.max(0, Math.round(Number(planMaxUsers)));
      await adminUpdateSubscriptionPlan({
        id: selectedPlan.id,
        name: planName.trim(),
        slug: planSlug.trim(),
        priceCents,
        interval: planInterval,
        currency: planCurrency.trim() || "XAF",
        maxStores,
        maxUsers,
        isActive: planIsActive,
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: queryKeys.adminSubscriptionOverview });
      setSelectedPlanId(null);
    },
    onError: (e) => setPlanError(e instanceof Error ? e.message : "Enregistrement impossible."),
  });

  return (
    <div className="space-y-6 p-5 md:p-8">
      <AdminSubscriptionManageDialog
        open={selectedCompanyId != null}
        onClose={() => setSelectedCompanyId(null)}
        company={selectedCompany}
        plans={d.plans}
      />

      {selectedPlan ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-6">
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setSelectedPlanId(null)}
            aria-label="Fermer"
          />
          <div
            className="relative z-10 w-full max-w-[640px] rounded-t-2xl border border-black/[0.08] bg-white shadow-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal
            aria-label="Modifier plan"
          >
            <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
              <h3 className="text-lg font-bold text-slate-900">Modifier le plan</h3>
              <p className="mt-1 text-xs text-slate-500">
                Le Super Admin définit le prix. Paiement: espèces / mobile money.
              </p>
            </div>
            <div className="px-4 py-4 sm:px-6">
              {planError ? (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {planError}
                </div>
              ) : null}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">Nom</span>
                  <input
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">Slug</span>
                  <input
                    value={planSlug}
                    onChange={(e) => setPlanSlug(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">Prix</span>
                  <input
                    value={planPrice}
                    onChange={(e) => setPlanPrice(e.target.value)}
                    inputMode="decimal"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Ex: 5000"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">Intervalle</span>
                  <select
                    value={planInterval}
                    onChange={(e) => setPlanInterval(e.target.value as "month" | "year")}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="month">Mois</option>
                    <option value="year">An</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">Devise</span>
                  <input
                    value={planCurrency}
                    onChange={(e) => setPlanCurrency(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="XAF"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">Boutiques max</span>
                  <input
                    value={planMaxStores}
                    onChange={(e) => setPlanMaxStores(e.target.value)}
                    inputMode="numeric"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="(vide = illimité)"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-slate-600">Utilisateurs max</span>
                  <input
                    value={planMaxUsers}
                    onChange={(e) => setPlanMaxUsers(e.target.value)}
                    inputMode="numeric"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="(vide = illimité)"
                  />
                </label>
                <label className="flex items-center gap-2 pt-2 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={planIsActive}
                    onChange={(e) => setPlanIsActive(e.target.checked)}
                  />
                  <span className="text-sm text-slate-700">Plan actif</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-200 px-4 py-3 sm:px-6">
              <button
                type="button"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                onClick={() => setSelectedPlanId(null)}
                disabled={savePlan.isPending}
              >
                Annuler
              </button>
              <button
                type="button"
                className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
                onClick={() => void savePlan.mutateAsync()}
                disabled={savePlan.isPending}
              >
                {savePlan.isPending ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <AdminPageHeader
          title="Abonnements"
          description="Catalogue d’offres, abonnements et synthèse par entreprise — réservé Super Admin."
        />
        <Link
          href="/admin"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-orange-600 hover:underline"
        >
          Tableau de bord plateforme
          <MdOpenInNew className="h-4 w-4" />
        </Link>
      </div>

      {Object.keys(d.countByStatus ?? {}).length > 0 ? (
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

      {trialsToHandle.length > 0 ? (
        <AdminCard>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Essais à traiter</h2>
              <p className="mt-1 text-xs text-slate-500">
                Essais gratuits expirés ou qui expirent bientôt (≤ 48h). Cliquez “Gérer” pour notifier.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-200">
              {trialsToHandle.length} alerte(s)
            </span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-[680px] w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-600">
                <tr>
                  <th className="p-3">Entreprise</th>
                  <th className="p-3">Échéance</th>
                  <th className="p-3">État</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {trialsToHandle.slice(0, 10).map((t) => (
                  <tr key={t.companyId} className="border-b border-slate-100">
                    <td className="p-3 font-medium text-slate-900">{t.companyName}</td>
                    <td className="p-3 font-mono text-xs text-slate-700">{t.endIso.slice(0, 16)}</td>
                    <td className="p-3">
                      {t.isExpired ? (
                        <span className="text-red-700 font-semibold">Expiré</span>
                      ) : (
                        <span className="text-amber-700 font-semibold">Expire bientôt</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        onClick={() => setSelectedCompanyId(t.companyId)}
                      >
                        Gérer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {trialsToHandle.length > 10 ? (
              <p className="mt-2 text-xs text-slate-500">
                {trialsToHandle.length - 10} autre(s) essai(s) à traiter (affichés dans le tableau complet).
              </p>
            ) : null}
          </div>
        </AdminCard>
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
                <th className="p-3 text-right">Actions</th>
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
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      onClick={() => setSelectedPlanId(p.id)}
                    >
                      Modifier prix
                    </button>
                  </td>
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
            <p className="mt-1 text-xs text-slate-500">Offre, statut et échéance. Paiement cash / mobile money.</p>
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
                <th className="p-3 text-right">Actions</th>
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
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        onClick={() => setSelectedCompanyId(r.companyId)}
                      >
                        Gérer
                      </button>
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
