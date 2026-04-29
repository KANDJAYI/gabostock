"use client";

import { cn } from "@/lib/utils/cn";
import type { NavItem } from "@/lib/config/navigation";
import { ChevronLeft, Menu, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function navInitials(email: string): string {
  const local = email.split("@")[0]?.trim() ?? "";
  if (!local) return "?";
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase().slice(0, 2);
  }
  return local.slice(0, 2).toUpperCase();
}

type AppSidebarProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  items: NavItem[];
  userEmail?: string | null;
  isActive: (href: string) => boolean;
  /** `companies.logo_url` — même idée que `AppShell` Flutter (logo au-dessus du menu). */
  companyLogoUrl?: string | null;
  /**
   * Tiroir plein écran (mobile) : pas de mode réduit, fermeture au clic lien.
   */
  variant?: "default" | "mobileDrawer";
  /** Appelé après navigation (ex. fermer le drawer). */
  onNavigate?: () => void;
};

export function AppSidebar({
  collapsed,
  onToggleCollapsed,
  items,
  userEmail,
  isActive,
  companyLogoUrl,
  variant = "default",
  onNavigate,
}: AppSidebarProps) {
  const [brandLogoErr, setBrandLogoErr] = useState(false);
  const isDrawer = variant === "mobileDrawer";
  const effectiveCollapsed = isDrawer ? false : collapsed;
  useEffect(() => {
    setBrandLogoErr(false);
  }, [companyLogoUrl]);

  return (
    <aside
      className={cn(
        isDrawer
          ? "flex h-full min-h-0 w-full max-w-none shrink-0 flex-col"
          : cn(
              "sticky top-0 z-30 flex h-dvh max-h-dvh min-h-0 shrink-0 flex-col self-start",
              "transition-[width] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)]",
              effectiveCollapsed ? "w-[58px]" : "w-[204px]",
            ),
        "border-r border-[color-mix(in_srgb,var(--fs-accent)_16%,transparent)] dark:border-white/[0.08]",
        "bg-fs-sidebar-surface shadow-[inset_-1px_0_0_0_rgba(0,0,0,0.04)] dark:shadow-[inset_-1px_0_0_0_rgba(0,0,0,0.2)]",
      )}
      aria-label="Navigation"
    >
      {/* Voile chaud : renforce l’orange tendre (évite l’effet « barre blanche ») */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[color-mix(in_srgb,var(--fs-accent)_24%,#fff)]/45 via-transparent to-[color-mix(in_srgb,var(--fs-accent)_14%,var(--fs-surface))] dark:from-[color-mix(in_srgb,var(--fs-accent)_14%,transparent)] dark:via-transparent dark:to-transparent"
        aria-hidden
      />

      <div
        className={cn(
          "relative z-[1] flex h-[58px] shrink-0 items-center border-b border-[color-mix(in_srgb,var(--fs-accent)_18%,transparent)] dark:border-white/[0.08]",
          effectiveCollapsed ? "justify-center px-2" : "gap-3 px-4",
        )}
      >
        <Link
          href="/dashboard"
          className={cn(
            "flex min-w-0 items-center rounded-2xl outline-none transition-[transform,box-shadow] duration-200",
            "focus-visible:ring-2 focus-visible:ring-[var(--fs-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--fs-sidebar-surface)]",
            effectiveCollapsed ? "justify-center p-1.5" : "gap-3 p-1 pr-2",
          )}
          title={effectiveCollapsed ? "Gabostock — Tableau de bord" : undefined}
          onClick={() => onNavigate?.()}
        >
          <span
            className={cn(
              "flex shrink-0 items-center justify-center",
              companyLogoUrl && !brandLogoErr
                ? cn(
                    "rounded-none bg-transparent p-0 ring-0",
                    "h-10 w-10",
                  )
                : cn(
                    "overflow-hidden rounded-xl bg-[color-mix(in_srgb,var(--fs-accent)_8%,var(--fs-surface-container))]",
                    "ring-1 ring-[color-mix(in_srgb,var(--fs-accent)_20%,transparent)] dark:ring-white/[0.08]",
                    "h-10 w-10",
                  ),
            )}
            aria-hidden
          >
            {companyLogoUrl && !brandLogoErr ? (
              <img
                src={companyLogoUrl}
                alt=""
                className="h-full w-full object-contain object-center"
                onError={() => setBrandLogoErr(true)}
              />
            ) : (
              <img
                src="/logogabostock.png"
                alt=""
                className="h-full w-full object-contain object-center p-0.5"
              />
            )}
          </span>
          {!effectiveCollapsed ? (
            <span className="min-w-0 font-bold tracking-tight">
              <span className="text-[var(--fs-accent)]">Gabo</span>
              <span className="text-[var(--fs-brand-stock)]">Stock</span>
            </span>
          ) : null}
        </Link>
      </div>

      <nav
        className={cn(
          "relative z-[1] flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden",
          "py-3 [scrollbar-gutter:stable]",
          effectiveCollapsed ? "px-1" : "px-2.5",
        )}
        aria-label="Sections de l’application"
      >
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={effectiveCollapsed ? item.label : undefined}
              onClick={() => onNavigate?.()}
              className={cn(
                "group/nav relative flex items-center rounded-2xl text-[13px] font-semibold leading-tight tracking-tight",
                "outline-none transition-[color,background-color,transform,box-shadow] duration-200 ease-out",
                "focus-visible:ring-2 focus-visible:ring-[var(--fs-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-fs-sidebar-surface",
                effectiveCollapsed ? "justify-center px-0 py-2" : "gap-3 px-3 py-2.5",
                active
                  ? [
                      "bg-[color-mix(in_srgb,var(--fs-accent)_20%,transparent)] text-[var(--fs-accent)]",
                      "shadow-[0_1px_2px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.4)]",
                      "dark:shadow-[0_1px_3px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]",
                    ]
                  : [
                      "text-[var(--fs-text)] hover:bg-[color-mix(in_srgb,var(--fs-accent)_14%,transparent)]",
                      "active:scale-[0.99] dark:text-neutral-100 dark:hover:bg-white/[0.08] dark:hover:text-white",
                    ],
              )}
            >
              {active ? (
                <span
                  className="absolute left-0 top-1/2 h-[60%] w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--fs-accent)] shadow-[2px_0_8px_color-mix(in_srgb,var(--fs-accent)_45%,transparent)]"
                  aria-hidden
                />
              ) : null}
              <span
                className={cn(
                  "flex shrink-0 items-center justify-center transition-colors duration-200",
                  active
                    ? "bg-[color-mix(in_srgb,var(--fs-accent)_22%,transparent)] text-[var(--fs-accent)]"
                    : "bg-[color-mix(in_srgb,var(--fs-accent)_9%,transparent)] text-black group-hover/nav:bg-[color-mix(in_srgb,var(--fs-accent)_16%,transparent)] group-hover/nav:text-[var(--fs-text)] dark:bg-white/[0.07] dark:text-neutral-100 dark:group-hover/nav:bg-white/[0.11] dark:group-hover/nav:text-white",
                  effectiveCollapsed
                    ? "h-10 w-10 rounded-2xl"
                    : "h-9 w-9 rounded-xl",
                )}
                aria-hidden
              >
                <Icon
                  className={cn(
                    "shrink-0",
                    effectiveCollapsed ? "h-6 w-6" : "h-5 w-5",
                  )}
                  strokeWidth={active ? 2.25 : 2}
                />
              </span>
              {!effectiveCollapsed ? (
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="relative z-[1] mt-auto space-y-2 border-t border-[color-mix(in_srgb,var(--fs-accent)_15%,transparent)] p-2.5 dark:border-white/[0.08]">
        {isDrawer ? (
          <button
            type="button"
            onClick={() => onNavigate?.()}
            aria-label="Fermer le menu"
            className={cn(
              "group/drawer-close flex w-full items-center justify-between gap-3 rounded-full px-4 py-3",
              "bg-fs-sidebar-surface-elevated text-fs-text",
              "shadow-[0_2px_10px_rgba(0,0,0,0.07)]",
              "transition-[transform,background-color,box-shadow] duration-200",
              "hover:bg-[color-mix(in_srgb,var(--fs-accent)_22%,var(--fs-surface-container))] hover:shadow-[0_3px_12px_rgba(0,0,0,0.08)] active:scale-[0.98]",
              "dark:bg-white/[0.09] dark:shadow-[0_2px_14px_rgba(0,0,0,0.35)] dark:hover:bg-white/[0.12]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fs-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-fs-sidebar-surface",
            )}
          >
            <span className="flex items-center gap-2.5">
              <Menu
                className="h-6 w-6 shrink-0 text-[var(--fs-accent)]"
                strokeWidth={2.15}
                aria-hidden
              />
              <span className="text-sm font-bold tracking-tight text-neutral-800 dark:text-neutral-100">
                Menu
              </span>
            </span>
            <ChevronLeft
              className="h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-300 group-hover/drawer-close:-translate-x-0.5 dark:text-neutral-500"
              aria-hidden
            />
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className={cn(
              "group/collapse flex w-full items-center rounded-2xl border border-[color-mix(in_srgb,var(--fs-accent)_20%,transparent)] bg-fs-sidebar-surface-elevated/90 text-fs-on-surface-variant",
              "shadow-sm transition-[color,background-color,transform,border-color] duration-200",
              "hover:border-[color-mix(in_srgb,var(--fs-accent)_30%,transparent)] hover:bg-[color-mix(in_srgb,var(--fs-accent)_14%,var(--fs-surface-container))] hover:text-fs-text",
              "active:scale-[0.98] dark:border-white/[0.1] dark:bg-white/[0.05] dark:hover:border-white/[0.14] dark:hover:bg-white/[0.08]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fs-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-fs-sidebar-surface",
              effectiveCollapsed ? "justify-center p-2.5" : "justify-between gap-2 px-3 py-2.5",
            )}
            title={effectiveCollapsed ? "Agrandir le menu" : "Réduire le menu"}
          >
            {effectiveCollapsed ? (
              <PanelLeftOpen
                className="h-6 w-6 shrink-0 text-[var(--fs-accent)]"
                strokeWidth={2.15}
                aria-hidden
              />
            ) : (
              <>
                <span className="flex items-center gap-2 text-xs font-semibold">
                  <Menu
                    className="h-5 w-5 shrink-0 text-[var(--fs-accent)]"
                    strokeWidth={2.1}
                    aria-hidden
                  />
                  Menu
                </span>
                <ChevronLeft
                  className="h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-300 group-hover/collapse:-translate-x-0.5"
                  aria-hidden
                />
              </>
            )}
          </button>
        )}

        {userEmail ? (
          <div
            className={cn(
              "rounded-2xl border border-[color-mix(in_srgb,var(--fs-accent)_14%,transparent)] bg-[color-mix(in_srgb,var(--fs-accent)_8%,var(--fs-surface-low))] px-2.5 py-2 dark:border-white/[0.07] dark:bg-white/[0.05]",
              effectiveCollapsed && "flex justify-center border-0 bg-transparent p-0",
            )}
          >
            {!effectiveCollapsed ? (
              <div className="flex items-center gap-2.5">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--fs-accent)_12%,transparent)] text-[10px] font-bold tabular-nums text-[var(--fs-accent)] ring-1 ring-[color-mix(in_srgb,var(--fs-accent)_20%,transparent)]"
                  aria-hidden
                >
                  {navInitials(userEmail)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    Compte
                  </p>
                  <p className="truncate text-xs font-medium text-fs-text">{userEmail}</p>
                </div>
              </div>
            ) : (
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--fs-accent)_12%,transparent)] text-[10px] font-bold tabular-nums text-[var(--fs-accent)] ring-1 ring-[color-mix(in_srgb,var(--fs-accent)_20%,transparent)]"
                title={userEmail}
              >
                {navInitials(userEmail)}
              </span>
            )}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
