"use client";

import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { cn } from "@/lib/utils/cn";
import { AdminCard } from "@/components/admin/admin-page-header";

export function KpiCard({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: IconType;
  label: string;
  value: string;
  subtitle?: string | null;
  color: string;
}) {
  return (
    <AdminCard padding="p-4" className="!shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}18` }}
        >
          <Icon className="h-5 w-5" style={{ color }} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-neutral-400">{label}</p>
          <p className="mt-0.5 truncate text-lg font-bold text-slate-900 dark:text-white">{value}</p>
          {subtitle ? <p className="mt-0.5 text-[11px] text-slate-500 dark:text-neutral-500">{subtitle}</p> : null}
        </div>
      </div>
    </AdminCard>
  );
}

export function KpiGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6", className)}>{children}</div>;
}
