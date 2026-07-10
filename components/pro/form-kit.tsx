"use client";

import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

/** Champ de saisie soigné (bordure douce, focus accent) — commun à l'espace facturation. */
export const fieldInputClass = cn(
  "w-full rounded-xl border border-black/[0.1] bg-fs-card px-3.5 py-2.5 text-[15px] text-fs-text shadow-[0_1px_2px_rgba(0,0,0,0.03)] outline-none transition-all",
  "placeholder:text-neutral-400",
  "focus:border-fs-accent focus:ring-2 focus:ring-fs-accent/20",
  "dark:border-white/[0.1] dark:bg-white/[0.03]",
);

/**
 * Enveloppe de champ « ultra claire » : libellé explicite, marqueur requis/optionnel,
 * et texte d'aide sous le champ pour que l'utilisateur sache toujours quoi saisir.
 */
export function Field({
  label,
  hint,
  required,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: ReactNode;
  required?: boolean;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("block", className)}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-fs-text"
      >
        <span>{label}</span>
        {required ? (
          <span className="text-fs-accent" aria-hidden>
            *
          </span>
        ) : (
          <span className="text-[11px] font-normal text-neutral-400">
            facultatif
          </span>
        )}
      </label>
      {children}
      {hint ? (
        <p className="mt-1.5 text-[12px] leading-snug text-neutral-500">{hint}</p>
      ) : null}
    </div>
  );
}

/** Section encadrée avec titre + sous-titre (regroupe des champs par thème). */
export function FormSection({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-black/[0.06] bg-fs-card p-4 sm:p-5",
        className,
      )}
    >
      <div className="mb-3.5">
        <h2 className="text-sm font-bold text-fs-text">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 text-[12px] text-neutral-500">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
