"use client";

import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const NAV = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#parcours", label: "Comment ça marche" },
  { href: "#metiers", label: "Métiers" },
  { href: "#faq", label: "FAQ" },
];

export type LandingHeaderVariant = "surface" | "heroDark";

export function LandingHeader({ variant = "surface" }: { variant?: LandingHeaderVariant }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

  const heroDark = variant === "heroDark";

  const mobileDrawer =
    mounted &&
    open &&
    createPortal(
      <>
        {/* Démarre sous le header sticky pour éviter le décal blanc/coupé */}
        <button
          type="button"
          aria-hidden
          tabIndex={-1}
          className="fixed inset-x-0 bottom-0 top-14 z-[100] cursor-default bg-neutral-950/45 backdrop-blur-[3px] sm:top-16 dark:bg-neutral-950/60"
          onClick={() => setOpen(false)}
        />

        <div
          id="landing-mobile-menu"
          className={cn(
            "fixed bottom-0 right-0 top-14 z-[110] flex w-[min(20rem,calc(100vw-0.75rem))] flex-col rounded-l-[1.375rem]",
            "border-l border-neutral-200 bg-fs-card shadow-[0_25px_50px_-12px_rgba(0,0,0,0.28)] dark:border-neutral-600 dark:bg-fs-surface-container",
            "sm:top-16",
          )}
          style={{
            paddingBottom: `max(1rem, env(safe-area-inset-bottom))`,
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="flex shrink-0 flex-col px-5 pt-5 pb-3">
            <div className="flex items-start justify-between gap-3 border-b border-neutral-200 pb-4 dark:border-neutral-600">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-fs-on-surface-variant">
                  Menu
                </p>
                <p className="mt-1 text-[0.9375rem] leading-snug text-fs-text">
                  Sections et accès au compte
                </p>
              </div>
              <button
                type="button"
                className="fs-touch-target flex shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-fs-surface p-2 text-fs-text shadow-sm transition active:scale-[0.97] dark:border-neutral-600"
                aria-label="Fermer le menu"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5 shrink-0" aria-hidden />
              </button>
            </div>
          </div>

          <nav
            className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-5 pb-2"
            aria-label="Navigation mobile"
          >
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-3 text-[1.0625rem] font-medium leading-snug text-fs-text hover:bg-fs-surface-container active:bg-fs-surface-container"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}

            <hr className="my-4 shrink-0 border-neutral-200 dark:border-neutral-600" />

            <Link
              href={ROUTES.login}
              className="rounded-xl px-3 py-3 text-[1.0625rem] font-semibold text-fs-accent hover:bg-fs-accent/10"
              onClick={() => setOpen(false)}
            >
              Connexion
            </Link>
          </nav>

          <div className="mt-auto shrink-0 border-t border-neutral-100 px-5 pt-3 pb-[max(1rem,calc(env(safe-area-inset-bottom)+8px))] dark:border-neutral-700">
            <Link
              href={ROUTES.registerSelectActivity}
              className="flex w-full items-center justify-center rounded-2xl bg-fs-accent py-3.5 text-[1rem] font-semibold text-white shadow-lg shadow-fs-accent/20 transition hover:opacity-95 active:opacity-[0.93]"
              onClick={() => setOpen(false)}
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </>,
      document.body,
    );

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 backdrop-blur-md",
          heroDark
            ? "border-b border-white/10 bg-[#050A18]/95"
            : "border-b border-neutral-200/80 bg-fs-surface/90 dark:border-neutral-700/80",
        )}
      >
        <div className="mx-auto flex h-14 max-w-6xl min-w-0 items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-6 lg:px-8">
          <a
            href="#top"
            className={cn(
              "flex min-w-0 shrink-0 items-center gap-2 overflow-hidden no-underline",
              heroDark ? "text-white" : "text-fs-text",
            )}
            onClick={() => setOpen(false)}
          >
            <Image
              src="/logogabostock.png"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-lg object-contain"
              priority
            />
            <span className="truncate text-lg font-semibold tracking-tight sm:text-xl">
              <span className={heroDark ? "text-white" : "text-fs-text"}>Gabo</span>
              <span className="text-[var(--fs-brand-stock)]">Stock</span>
            </span>
          </a>

          <nav
            className="hidden min-w-0 items-center gap-1 md:flex md:flex-1 md:justify-center"
            aria-label="Navigation principale"
          >
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition",
                  heroDark
                    ? "text-neutral-400 hover:bg-white/10 hover:text-white"
                    : "text-fs-on-surface-variant hover:bg-fs-surface-container hover:text-fs-text",
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              href={ROUTES.login}
              className={cn(
                "hidden shrink-0 rounded-lg px-3 py-2 text-sm font-medium md:inline-flex",
                heroDark
                  ? "text-[#60a5fa] hover:bg-white/10 hover:text-[#93c5fd]"
                  : "text-fs-accent hover:bg-fs-surface-container",
              )}
            >
              Connexion
            </Link>
            <Link
              href={ROUTES.registerSelectActivity}
              className={cn(
                "inline-flex max-w-[min(12rem,calc(100vw-9.5rem))] min-w-0 shrink items-center justify-center truncate rounded-xl px-2 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-92 sm:max-w-none sm:overflow-visible sm:whitespace-normal sm:px-4 sm:text-sm",
                heroDark
                  ? "bg-gradient-to-r from-[#34C759] via-[#34d67a] to-[#007AFF] shadow-lg shadow-[rgba(0,122,255,0.42)]"
                  : "bg-fs-accent",
              )}
              title="Créer un compte"
            >
              {/* Libellé court sur mobile pour laisser la place au burger */}
              <span className="md:hidden">Compte</span>
              <span className="hidden md:inline">Créer un compte</span>
            </Link>
            <button
              type="button"
              className={cn(
                "fs-touch-target ml-0.5 flex shrink-0 items-center justify-center rounded-lg border p-2 md:hidden",
                heroDark
                  ? "border-white/30 bg-white/10 text-white hover:bg-white/15"
                  : "border-neutral-200 bg-fs-card text-fs-text dark:border-neutral-600",
              )}
              aria-expanded={open}
              aria-controls="landing-mobile-menu"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5 shrink-0" aria-hidden /> : <Menu className="h-5 w-5 shrink-0" aria-hidden />}
            </button>
          </div>
        </div>
      </header>

      {mobileDrawer}
    </>
  );
}
