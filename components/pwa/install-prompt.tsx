"use client";

import { cn } from "@/lib/utils/cn";
import { Z } from "@/lib/config/z-index";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { MdClose, MdDownload } from "react-icons/md";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "pwa_install_prompt_dismissed_at";
const DISMISS_FOR_DAYS = 7;

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia?.("(display-mode: standalone)")?.matches ?? false;
  // iOS
  const iosStandalone = (navigator as unknown as { standalone?: boolean }).standalone === true;
  return mq || iosStandalone;
}

function isLikelyIosSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const isIos = /iPhone|iPad|iPod/i.test(ua);
  const isWebkit = /WebKit/i.test(ua);
  const isCriOS = /CriOS/i.test(ua);
  const isFxiOS = /FxiOS/i.test(ua);
  return isIos && isWebkit && !isCriOS && !isFxiOS;
}

function recentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const t = Number(raw);
    if (!Number.isFinite(t)) return false;
    const days = (Date.now() - t) / (1000 * 60 * 60 * 24);
    return days < DISMISS_FOR_DAYS;
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

/** Message éphémère d’installation (PWA). */
export function InstallPrompt() {
  const [mounted, setMounted] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  const iosHint = useMemo(() => isLikelyIosSafari(), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isStandalone()) return;
    if (recentlyDismissed()) return;

    const onBip = (e: Event) => {
      // Chrome/Edge Android/Desktop
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBip as EventListener);
    return () => window.removeEventListener("beforeinstallprompt", onBip as EventListener);
  }, []);

  useEffect(() => {
    if (isStandalone()) setVisible(false);
  }, []);

  async function onInstall() {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        setVisible(false);
        setDeferred(null);
      } else {
        markDismissed();
        setVisible(false);
      }
    } catch {
      // ignore
    }
  }

  function onClose() {
    markDismissed();
    setVisible(false);
  }

  const show = visible && !isStandalone() && (!recentlyDismissed());
  if (!show) return null;

  const layer = (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6"
      style={{ zIndex: Z.toast + 1, bottom: "auto" }}
    >
      <div
        className={cn(
          "pointer-events-auto mx-auto flex w-full max-w-xl items-start gap-3 rounded-2xl border border-black/10 bg-fs-card px-4 py-3 shadow-2xl",
          "dark:border-white/10",
        )}
        role="status"
        aria-live="polite"
      >
        <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fs-surface-container text-fs-accent">
          <MdDownload className="h-6 w-6" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-fs-text">Installer Gabostock ?</p>
          <p className="mt-0.5 text-[13px] leading-snug text-neutral-600 dark:text-neutral-300">
            {iosHint
              ? "Sur iPhone/iPad : Partager → Sur l’écran d’accueil."
              : "Accédez plus vite, en plein écran, et gardez l’app sur votre téléphone."}
          </p>
          {deferred ? (
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onInstall}
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-fs-accent px-4 text-sm font-semibold text-white"
              >
                Installer
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-10 items-center justify-center rounded-xl border border-black/10 bg-fs-card px-4 text-sm font-semibold text-neutral-700 dark:border-white/10 dark:text-neutral-200"
              >
                Plus tard
              </button>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="fs-touch-target inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-neutral-600 hover:bg-black/5 dark:text-neutral-300 dark:hover:bg-white/10"
          aria-label="Fermer"
        >
          <MdClose className="h-6 w-6" aria-hidden />
        </button>
      </div>
    </div>
  );

  if (!mounted || typeof document === "undefined") return null;
  return createPortal(layer, document.body);
}

