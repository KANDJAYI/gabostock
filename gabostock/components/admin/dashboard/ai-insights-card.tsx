"use client";

import { MdAutoAwesome } from "react-icons/md";
import { AdminCard } from "@/components/admin/admin-page-header";

export function AiInsightsCard({ lines }: { lines: string[] }) {
  return (
    <AdminCard>
      <div className="flex items-center gap-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-100">
          <MdAutoAwesome className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Insights · lecture automatique</h3>
          <p className="text-xs text-slate-500 dark:text-neutral-500">
            Phrases synthétiques générées à partir des agrégats (pas un modèle tiers).
          </p>
        </div>
      </div>
      <ul className="mt-4 list-none space-y-2.5 text-sm leading-relaxed text-slate-800 dark:text-neutral-200">
        {lines.map((line, i) => (
          <li key={`ins-${i}-${line.slice(0, 24)}`} className="flex gap-2">
            <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500" aria-hidden />
            <span>{line}</span>
          </li>
        ))}
        {lines.length === 0 ? <li className="text-slate-600 dark:text-neutral-500">Synthèses indisponibles.</li> : null}
      </ul>
    </AdminCard>
  );
}
