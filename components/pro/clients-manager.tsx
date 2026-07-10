"use client";

import {
  createProClient,
  deleteProClient,
  listProClients,
  updateProClient,
} from "@/lib/features/pro/clients/api";
import type {
  ProClient,
  ProClientFormInput,
  ProClientType,
} from "@/lib/features/pro/clients/types";
import { authSimpleFieldClass } from "@/components/auth/auth-page-shell";
import { cn } from "@/lib/utils/cn";
import { AlertCircle, Pencil, Plus, Trash2, Users, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

const EMPTY: ProClientFormInput = {
  name: "",
  type: "individual",
  email: "",
  phone: "",
  address: "",
  tax_id: "",
  notes: "",
};

function toForm(c: ProClient): ProClientFormInput {
  return {
    name: c.name,
    type: c.type,
    email: c.email ?? "",
    phone: c.phone ?? "",
    address: c.address ?? "",
    tax_id: c.tax_id ?? "",
    notes: c.notes ?? "",
  };
}

export function ClientsManager() {
  const [clients, setClients] = useState<ProClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ProClient | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProClientFormInput>(EMPTY);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      setClients(await listProClients());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setShowForm(true);
  }
  function openEdit(c: ProClient) {
    setEditing(c);
    setForm(toForm(c));
    setShowForm(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (form.name.trim().length < 2) {
      setError("Le nom du client est requis.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (editing) await updateProClient(editing.id, form);
      else await createProClient(form);
      setShowForm(false);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(c: ProClient) {
    if (!confirm(`Supprimer le client « ${c.name} » ?`)) return;
    try {
      await deleteProClient(c.id);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Suppression impossible.");
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <Users className="h-5 w-5 text-fs-accent" aria-hidden />
          Clients
        </h1>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-1.5 rounded-lg bg-fs-accent px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-95"
        >
          <Plus className="h-4 w-4" aria-hidden />
          Nouveau client
        </button>
      </div>

      {error ? (
        <div className="mb-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <p>{error}</p>
        </div>
      ) : null}

      {loading ? (
        <p className="py-10 text-center text-sm text-neutral-500">Chargement…</p>
      ) : clients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-fs-card py-12 text-center">
          <p className="text-sm text-neutral-600">
            Aucun client pour l&apos;instant.
          </p>
          <button
            type="button"
            onClick={openNew}
            className="mt-3 text-sm font-semibold text-fs-accent hover:underline"
          >
            Ajouter votre premier client
          </button>
        </div>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {clients.map((c) => (
            <li
              key={c.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-black/[0.06] bg-fs-card p-3.5"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{c.name}</p>
                <p className="text-xs text-neutral-500">
                  {c.type === "company" ? "Entreprise" : "Particulier"}
                  {c.phone ? ` · ${c.phone}` : ""}
                </p>
                {c.email ? (
                  <p className="truncate text-xs text-neutral-500">{c.email}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(c)}
                  className="rounded-lg p-1.5 text-neutral-500 hover:bg-fs-surface-container hover:text-fs-accent"
                  aria-label="Modifier"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(c)}
                  className="rounded-lg p-1.5 text-neutral-500 hover:bg-red-50 hover:text-red-600"
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-t-2xl bg-fs-card p-5 shadow-xl sm:rounded-2xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {editing ? "Modifier le client" : "Nouveau client"}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-1 text-neutral-500 hover:bg-fs-surface-container"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={onSubmit} className="flex flex-col gap-2.5">
              <input
                className={authSimpleFieldClass}
                placeholder="Nom / raison sociale *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                autoFocus
              />
              <div className="flex gap-2">
                {(["individual", "company"] as ProClientType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={cn(
                      "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      form.type === t
                        ? "border-fs-accent bg-fs-accent/10 text-fs-accent"
                        : "border-neutral-200 text-neutral-600",
                    )}
                  >
                    {t === "individual" ? "Particulier" : "Entreprise"}
                  </button>
                ))}
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <input
                  className={authSimpleFieldClass}
                  placeholder="Téléphone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <input
                  className={authSimpleFieldClass}
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <textarea
                className={cn(authSimpleFieldClass, "min-h-[64px] resize-y")}
                placeholder="Adresse"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
              <input
                className={authSimpleFieldClass}
                placeholder="N° fiscal / RCCM (entreprise)"
                value={form.tax_id}
                onChange={(e) => setForm({ ...form, tax_id: e.target.value })}
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-fs-surface-container"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center rounded-lg bg-fs-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
