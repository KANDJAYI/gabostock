"use client";

import { FsCard, FsSectionLabel, fsInputClass } from "@/components/ui/fs-screen-primitives";
import { cn } from "@/lib/utils/cn";
import type { RoleOption } from "@/lib/features/users/types";
import { useEffect, useState } from "react";
import { MdClose, MdPersonAdd } from "react-icons/md";

export function CreateUserDialog({
  open,
  onClose,
  roles,
  stores,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  roles: RoleOption[];
  stores: Array<{ id: string; name: string }>;
  onCreate: (payload: {
    email: string;
    password: string;
    fullName: string;
    roleSlug: string;
    storeIds: string[];
  }) => Promise<void> | void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [roleSlug, setRoleSlug] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storeIds, setStoreIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setEmail("");
    setPassword("");
    setFullName("");
    setRoleSlug(roles[0]?.slug ?? "store_manager");
    setStoreIds([]);
    setBusy(false);
    setError(null);
  }, [open, roles]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[70] flex justify-center bg-black/40",
        "items-end pb-[env(safe-area-inset-bottom,0px)] pt-14 sm:items-center sm:px-4 sm:pb-4 sm:pt-4 sm:backdrop-blur-[2px]",
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Nouveau utilisateur"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <FsCard
        className={cn(
          "relative grid min-h-0 w-full max-w-lg grid-rows-[minmax(0,1fr)_auto] overflow-hidden",
          "max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-bottom,0px)-2rem))]",
          "rounded-b-none rounded-t-[1.35rem] sm:rounded-[1rem]",
          "shadow-[0_-8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_-12px_40px_rgba(0,0,0,0.45)] sm:shadow-lg",
        )}
        padding="p-0"
      >
        <div
          className={cn(
            "min-h-0 min-w-0 overflow-y-auto overscroll-y-contain px-4 pb-4 pt-4",
            "sm:px-6 sm:pb-5 sm:pt-6",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 pr-1">
              <p className="text-[11px] font-semibold text-neutral-600 sm:text-xs">Nouvel utilisateur</p>
              <p className="mt-0.5 text-base font-bold leading-snug text-fs-text sm:text-sm">
                Créer un compte entreprise
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-xl border border-black/[0.08] bg-fs-card text-neutral-700 active:opacity-85 dark:border-white/10 dark:bg-fs-surface-container"
              aria-label="Fermer"
            >
              <MdClose className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-6 md:gap-y-4">
            <div className="min-w-0 md:col-span-2">
              <FsSectionLabel>Nom complet</FsSectionLabel>
              <input
                className={cn(fsInputClass(), "mt-1.5")}
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="min-w-0 md:col-span-2">
              <FsSectionLabel>Email</FsSectionLabel>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                className={cn(fsInputClass(), "mt-1.5 break-words")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="min-w-0">
              <FsSectionLabel>Mot de passe</FsSectionLabel>
              <input
                type="password"
                autoComplete="new-password"
                className={cn(fsInputClass(), "mt-1.5")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="min-w-0">
              <FsSectionLabel>Rôle</FsSectionLabel>
              <select
                className={cn(fsInputClass(), "mt-1.5")}
                value={roleSlug}
                onChange={(e) => setRoleSlug(e.target.value)}
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.slug}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="mt-4 text-[13px] leading-relaxed text-neutral-600 sm:text-xs">
            L&apos;utilisateur pourra se connecter avec son email et son mot de passe.
            Communiquez-les de façon sécurisée.
          </p>

          {stores.length > 0 ? (
            <div className="mt-4">
              <FsSectionLabel>Boutiques (au moins une)</FsSectionLabel>
              <div className="mt-2 flex flex-wrap gap-2">
                {stores.map((s) => {
                  const selected = storeIds.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() =>
                        setStoreIds((prev) =>
                          selected ? prev.filter((id) => id !== s.id) : [...prev, s.id],
                        )
                      }
                      className={cn(
                        "fs-touch-target max-w-full min-h-[44px] touch-manipulation rounded-full border px-3 py-2 text-left text-xs font-semibold leading-snug",
                        selected
                          ? "border-fs-accent/30 bg-[color-mix(in_srgb,var(--fs-accent)_20%,transparent)] text-fs-accent"
                          : "border-black/[0.08] bg-fs-card text-neutral-800 dark:bg-fs-surface-container dark:text-fs-text",
                      )}
                    >
                      <span className="line-clamp-2">{s.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {error ? (
            <p className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold leading-snug text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </p>
          ) : null}
        </div>

        <div
          className={cn(
            "min-w-0 border-t border-black/[0.06] bg-fs-card px-4 pb-[max(0.875rem,env(safe-area-inset-bottom,0px))] pt-3 sm:px-6 sm:rounded-b-2xl dark:border-white/[0.07] dark:bg-fs-surface-low/90",
          )}
        >
          <div className="flex flex-col gap-3 md:flex-row md:justify-end md:gap-3">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "fs-touch-target w-full touch-manipulation rounded-[10px] border border-black/[0.08] bg-fs-card text-sm font-semibold text-neutral-800 md:order-1 md:w-auto md:min-w-[7.5rem] dark:border-white/[0.1]",
              )}
              disabled={busy}
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={async () => {
                setError(null);
                if (!email.trim() || !password || !roleSlug) {
                  setError("Email, mot de passe et rôle requis.");
                  return;
                }
                if (stores.length > 0 && storeIds.length === 0) {
                  setError("Choisissez au moins une boutique.");
                  return;
                }
                if (password.length < 6) {
                  setError("Mot de passe minimum 6 caractères.");
                  return;
                }
                try {
                  setBusy(true);
                  await onCreate({
                    email: email.trim(),
                    password,
                    fullName: fullName.trim(),
                    roleSlug,
                    storeIds,
                  });
                  onClose();
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Création impossible.");
                } finally {
                  setBusy(false);
                }
              }}
              disabled={busy}
              className={cn(
                "fs-touch-target flex w-full touch-manipulation items-center justify-center gap-2 rounded-[10px] bg-fs-accent px-4 py-3 text-sm font-semibold leading-snug text-white shadow-sm md:order-2 md:w-auto md:min-h-0 md:min-w-0 md:flex-initial md:px-6",
              )}
            >
              <MdPersonAdd className="h-5 w-5 shrink-0 md:h-[18px] md:w-[18px]" aria-hidden />
              <span className="text-center leading-snug">
                <span className="md:hidden">Créer le compte</span>
                <span className="hidden md:inline">
                  Créer et communiquer les identifiants
                </span>
              </span>
            </button>
          </div>
        </div>
      </FsCard>
    </div>
  );
}

