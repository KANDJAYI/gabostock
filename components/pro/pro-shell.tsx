"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { MoreSheet } from "@/components/layout/more-sheet";
import {
  shellBottomNavBarClass,
  shellClockPillClass,
  shellMobileTabActiveClass,
  shellMobileTabInactiveClass,
  shellToolbarIconButtonClass,
  shellTopBarClass,
} from "@/components/layout/shell-chrome";
import { signOutAndRedirect } from "@/lib/auth/sign-out-client";
import { ROUTES } from "@/lib/config/routes";
import {
  PRO_MOBILE_PRIMARY,
  PRO_NAV_ITEMS,
} from "@/lib/features/pro/navigation";
import { useDesktopNav } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils/cn";
import {
  Clock3,
  LogOut,
  Menu,
  MoreHorizontal,
  PanelLeftOpen,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

const PRIMARY_SET = new Set<string>(PRO_MOBILE_PRIMARY);

export function ProShell({
  children,
  userEmail,
}: {
  children: ReactNode;
  userEmail: string | null;
}) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const isDesktop = useDesktopNav();

  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [clock, setClock] = useState("--:--:--");
  const [clockIso, setClockIso] = useState("");
  const [clockTitle, setClockTitle] = useState("Heure locale");

  useEffect(() => {
    const saved = localStorage.getItem("fs_sidebar_collapsed");
    setSidebarCollapsed(saved === "1");
  }, []);
  useEffect(() => {
    localStorage.setItem("fs_sidebar_collapsed", sidebarCollapsed ? "1" : "0");
  }, [sidebarCollapsed]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (isDesktop) setMobileNavOpen(false);
  }, [isDesktop]);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const locale =
        typeof navigator !== "undefined" && navigator.language
          ? navigator.language
          : "fr-FR";
      setClock(
        new Intl.DateTimeFormat(locale, {
          timeZone: tz,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(now),
      );
      setClockIso(now.toISOString());
      setClockTitle(`Heure locale · ${tz}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // Pas de scroll sur html/body : le contenu défile dans <main>.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = { h: html.style.overflow, b: body.style.overflow };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prev.h;
      body.style.overflow = prev.b;
    };
  }, []);

  function isActive(href: string): boolean {
    if (href === ROUTES.facturation) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const primaryMobile = useMemo(
    () =>
      PRO_MOBILE_PRIMARY.map((h) =>
        PRO_NAV_ITEMS.find((n) => n.href === h),
      ).filter(Boolean) as typeof PRO_NAV_ITEMS,
    [],
  );
  const moreSheetItems = useMemo(
    () => PRO_NAV_ITEMS.filter((i) => !PRIMARY_SET.has(i.href)),
    [],
  );

  return (
    <div className="flex h-dvh max-h-dvh min-h-dvh flex-col overflow-hidden bg-fs-surface text-fs-text">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {isDesktop ? (
          <AppSidebar
            collapsed={sidebarCollapsed}
            onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
            items={PRO_NAV_ITEMS}
            userEmail={userEmail}
            isActive={isActive}
            companyLogoUrl={null}
            brandHref={ROUTES.facturation}
          />
        ) : null}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {isDesktop ? (
            <header
              className={cn(
                "sticky top-0 z-40 flex h-[58px] shrink-0 items-center gap-2 px-3",
                shellTopBarClass,
              )}
            >
              <button
                type="button"
                onClick={() => setSidebarCollapsed((v) => !v)}
                className={shellToolbarIconButtonClass}
                aria-label={
                  sidebarCollapsed ? "Ouvrir le menu" : "Réduire le menu"
                }
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen className="h-5 w-5" aria-hidden />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden />
                )}
              </button>
              <div className="mx-auto min-w-0">
                <div className={shellClockPillClass} title={clockTitle}>
                  <Clock3
                    className="h-4 w-4 shrink-0 text-fs-accent"
                    aria-hidden
                  />
                  <time
                    dateTime={clockIso || undefined}
                    className="text-sm font-semibold tabular-nums text-fs-text"
                  >
                    {clock}
                  </time>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    void signOutAndRedirect(router, { redirectTo: "/login" })
                  }
                  className={shellToolbarIconButtonClass}
                  aria-label="Déconnexion"
                >
                  <LogOut className="h-5 w-5" aria-hidden />
                </button>
              </div>
            </header>
          ) : (
            <header
              className={cn(
                "sticky top-0 z-40 flex h-[58px] shrink-0 items-center justify-between gap-2",
                shellTopBarClass,
                "px-3 pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))]",
              )}
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <Link
                  href={ROUTES.facturation}
                  className="flex min-w-0 shrink items-center gap-2 rounded-2xl py-1 pr-2 outline-none transition-opacity hover:opacity-90"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--fs-accent)_14%,transparent)] ring-1 ring-[color-mix(in_srgb,var(--fs-accent)_22%,transparent)]"
                    aria-hidden
                  >
                    <Image
                      src="/logogabostock.png"
                      alt=""
                      width={22}
                      height={22}
                      className="h-[22px] w-[22px] object-contain"
                    />
                  </span>
                  <span className="min-w-0 text-base font-bold tracking-tight text-fs-text">
                    Facturation
                    <span className="text-[var(--fs-accent)]"> Pro</span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(true)}
                  className={shellToolbarIconButtonClass}
                  aria-label="Ouvrir le menu de navigation"
                  aria-expanded={mobileNavOpen}
                  aria-haspopup="dialog"
                >
                  <Menu className="h-5 w-5" strokeWidth={2} aria-hidden />
                </button>
              </div>
              <button
                type="button"
                onClick={() =>
                  void signOutAndRedirect(router, { redirectTo: "/login" })
                }
                className={shellToolbarIconButtonClass}
                aria-label="Déconnexion"
              >
                <LogOut className="h-5 w-5" aria-hidden />
              </button>
            </header>
          )}

          <main
            className={cn(
              "flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden",
              "max-[1023px]:pb-[calc(0.75rem+4.75rem+max(0.75rem,var(--fs-safe-bottom)))]",
            )}
          >
            <div className="mx-auto w-full max-w-6xl px-4 py-5">{children}</div>
          </main>

          {!isDesktop ? (
            <>
              <nav
                className={cn(
                  "fixed bottom-0 left-0 right-0 z-50 pt-2",
                  shellBottomNavBarClass,
                )}
                aria-label="Navigation principale"
              >
                <div className="mx-auto grid min-h-[56px] w-full max-w-lg grid-cols-4 items-stretch gap-1 pl-[max(0.5rem,env(safe-area-inset-left))] pr-[max(0.5rem,env(safe-area-inset-right))]">
                  {primaryMobile.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-[56px] min-w-0 touch-manipulation select-none flex-col items-center justify-center gap-1 rounded-2xl px-1.5 transition-[color,background-color,transform] duration-200 ease-out",
                          active
                            ? shellMobileTabActiveClass
                            : [
                                shellMobileTabInactiveClass,
                                "active:scale-[0.98] active:bg-black/[0.05] dark:active:bg-white/[0.07]",
                              ],
                        )}
                      >
                        <span
                          className={cn(
                            "flex items-center justify-center rounded-xl transition-colors duration-200",
                            active
                              ? "bg-[color-mix(in_srgb,var(--fs-accent)_18%,transparent)] p-1.5"
                              : "p-0.5",
                          )}
                          aria-hidden
                        >
                          <Icon
                            className={cn(
                              "size-6 shrink-0",
                              active ? "stroke-[2.5]" : "stroke-[2]",
                            )}
                          />
                        </span>
                        <span className="w-full truncate text-center text-[11px] font-semibold leading-none tracking-tight">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setMoreOpen(true)}
                    className={cn(
                      "flex min-h-[56px] min-w-0 touch-manipulation select-none flex-col items-center justify-center gap-1 rounded-2xl px-1.5 transition-[color,background-color,transform] duration-200 ease-out",
                      shellMobileTabInactiveClass,
                      "active:scale-[0.98] active:bg-black/[0.05] dark:active:bg-white/[0.07]",
                    )}
                    aria-label="Autres sections"
                  >
                    <span
                      className="flex items-center justify-center rounded-xl p-0.5"
                      aria-hidden
                    >
                      <MoreHorizontal className="size-6 shrink-0 stroke-2" />
                    </span>
                    <span className="w-full truncate text-center text-[11px] font-semibold leading-none tracking-tight">
                      Plus
                    </span>
                  </button>
                </div>
              </nav>
              <MoreSheet
                open={moreOpen}
                onClose={() => setMoreOpen(false)}
                items={moreSheetItems}
              />
            </>
          ) : null}

          {!isDesktop && mobileNavOpen ? (
            <div
              className="fixed inset-0 z-[60] lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navigation"
            >
              <button
                type="button"
                className="absolute inset-0 bg-black/50"
                aria-label="Fermer le menu"
                onClick={() => setMobileNavOpen(false)}
              />
              <div className="absolute left-0 top-0 flex h-full w-[min(100%,260px)] flex-col shadow-xl">
                <AppSidebar
                  variant="mobileDrawer"
                  collapsed={false}
                  onToggleCollapsed={() => {}}
                  items={PRO_NAV_ITEMS}
                  userEmail={userEmail}
                  isActive={isActive}
                  companyLogoUrl={null}
                  brandHref={ROUTES.facturation}
                  onNavigate={() => setMobileNavOpen(false)}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
