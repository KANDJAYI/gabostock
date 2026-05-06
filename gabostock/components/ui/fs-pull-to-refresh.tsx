"use client";

import { cn } from "@/lib/utils/cn";
import { useEffect, useRef, useState } from "react";
import { MdRefresh } from "react-icons/md";

const THRESHOLD_PX = 56;

/**
 * Position de scroll : le shell (`app-shell`) fait défiler `<main>`, pas `window`.
 * Si on lit seulement `window.scrollY`, il reste à 0 et chaque `touchmove` avec dy>0
 * appelle `preventDefault()` → scroll tactile bloqué sur mobile.
 */
function getAppScrollTop(): number {
  if (typeof document === "undefined") return 0;
  const main = document.querySelector("main");
  if (main) return main.scrollTop;
  return (
    window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0
  );
}

/**
 * Pull-to-refresh tactile (mobile), proche de `RefreshIndicator` Flutter.
 * S’active lorsque le conteneur de scroll de l’app est en haut (scrollTop ≈ 0).
 */
export function FsPullToRefresh({
  onRefresh,
  children,
  className,
  disabled,
}: {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const tracking = useRef(false);
  const pullAmt = useRef(0);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    if (disabled) return;

    const onTouchStart = (e: TouchEvent) => {
      if (getAppScrollTop() > 2) return;
      tracking.current = true;
      startY.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!tracking.current) return;
      if (getAppScrollTop() > 2) {
        tracking.current = false;
        pullAmt.current = 0;
        setPull(0);
        return;
      }
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0) {
        e.preventDefault();
        const p = Math.min(dy * 0.4, 80);
        pullAmt.current = p;
        setPull(p);
      }
    };

    const onTouchEnd = () => {
      if (!tracking.current) {
        tracking.current = false;
        return;
      }
      tracking.current = false;
      const shouldRun = pullAmt.current >= THRESHOLD_PX;
      pullAmt.current = 0;
      setPull(0);
      if (!shouldRun) return;
      setRefreshing(true);
      void (async () => {
        try {
          await onRefreshRef.current();
        } finally {
          setRefreshing(false);
        }
      })();
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [disabled]);

  const showBar = pull > 0 || refreshing;
  const height = refreshing ? 48 : pull;

  return (
    <div className={cn("relative", className)}>
      <div
        className="pointer-events-none fixed left-0 right-0 top-0 z-[30] flex justify-center overflow-hidden transition-[height] duration-150"
        style={{ height: showBar ? height : 0 }}
        aria-hidden
      >
        <div className="flex items-end pb-1 pt-2">
          {refreshing ? (
            <div
              className="h-7 w-7 animate-spin rounded-full border-2 border-fs-accent border-t-transparent"
              aria-label="Actualisation"
            />
          ) : (
            <MdRefresh
              className="h-7 w-7 text-fs-accent transition-transform duration-150"
              style={{ transform: `rotate(${Math.min(pull * 2.5, 180)}deg)`, opacity: 0.4 + pull / 160 }}
              aria-hidden
            />
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
