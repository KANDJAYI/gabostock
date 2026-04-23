"use client";

import { signOutAndRedirect } from "@/lib/auth/sign-out-client";
import { cn } from "@/lib/utils/cn";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  MdAutoAwesome,
  MdBarChart,
  MdBugReport,
  MdBusiness,
  MdDashboard,
  MdHistory,
  MdLogout,
  MdMenu,
  MdMessage,
  MdPeople,
  MdSettings,
  MdShield,
  MdStore,
  MdTune,
} from "react-icons/md";

const NAV = [
  { href: "/admin", label: "Tableau", icon: MdDashboard, exact: true },
  { href: "/admin/companies", label: "Entreprises", icon: MdBusiness },
  { href: "/admin/fonctionnalites", label: "Fonctionnalités", icon: MdTune },
  { href: "/admin/stores", label: "Boutiques", icon: MdStore },
  { href: "/admin/users", label: "Utilisateurs", icon: MdPeople },
  { href: "/admin/audit", label: "Journal d'audit", icon: MdHistory },
  { href: "/admin/app-errors", label: "Erreurs App", icon: MdBugReport },
  { href: "/admin/messages", label: "Messages", icon: MdMessage },
  { href: "/admin/ai", label: "IA", icon: MdAutoAwesome },
  { href: "/admin/reports", label: "Rapports", icon: MdBarChart },
  { href: "/admin/settings", label: "Paramètres", icon: MdSettings },
] as const;

function navActive(pathname: string, href: string, exact: boolean): boolean {
  if (exact) return pathname === href || pathname === `${href}/`;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function signOut() {
    await signOutAndRedirect(router, { queryClient });
  }

  const NavBody = () => (
    <>
      <div className="border-b border-white/10 px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--fs-palette-terracotta)_42%,transparent)] bg-[color-mix(in_srgb,var(--fs-palette-terracotta)_22%,transparent)]">
            <MdShield className="h-6 w-6 text-[var(--fs-palette-terracotta)]" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-extrabold tracking-tight text-slate-100">Plateforme</p>
            <p className="text-[13px] font-semibold text-slate-400">Super Admin</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {NAV.map((item) => {
          const active = navActive(pathname, item.href, "exact" in item && item.exact === true);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setDrawerOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                active ? "text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
              )}
              style={
                active
                  ? {
                      backgroundColor: "color-mix(in srgb, var(--fs-palette-terracotta) 14%, transparent)",
                      borderLeft: "3px solid var(--fs-palette-terracotta)",
                    }
                  : undefined
              }
            >
              <Icon
                className={cn("h-4 w-4 shrink-0", active && "text-[var(--fs-palette-terracotta)]")}
                aria-hidden
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={() => void signOut()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-500/10"
        >
          <MdLogout className="h-4 w-4 shrink-0" aria-hidden />
          Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-dvh flex-col bg-fs-surface text-fs-text md:flex-row">
      <aside className="sticky top-0 hidden h-dvh w-[204px] shrink-0 flex-col bg-[var(--fs-palette-chocolate)] md:flex">
        <NavBody />
      </aside>

      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-black/[0.08] bg-fs-surface px-3 md:hidden">
        <button
          type="button"
          className="rounded-lg p-2 text-fs-text hover:bg-fs-surface-container"
          aria-label="Menu"
          onClick={() => setDrawerOpen(true)}
        >
          <MdMenu className="h-6 w-6" />
        </button>
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--fs-palette-terracotta)_18%,transparent)]">
            <MdShield className="h-5 w-5 text-[var(--fs-palette-terracotta)]" />
          </div>
          <span className="truncate text-sm font-bold text-fs-text">Super Admin</span>
        </div>
      </header>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Fermer"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-[min(100%,280px)] flex-col bg-[var(--fs-palette-chocolate)] shadow-xl">
            <NavBody />
          </div>
        </div>
      ) : null}

      <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
