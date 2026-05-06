"use client";

import { cn } from "@/lib/utils/cn";
import { useEffect, useRef } from "react";

function clamp01(value: number) {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

/**
 * Scroll effect "absolute" for the landing hero:
 * - Updates CSS variables on the container based on scroll progress.
 * - Uses rAF to avoid scroll jank.
 */
export function LandingScrollEffects({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    let rafId = 0;

    const update = () => {
      rafId = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;

      // progress ~0 when hero enters viewport, ~1 when it leaves.
      const progress = clamp01((vh - rect.top) / (rect.height + vh));
      el.style.setProperty("--landing-scroll-progress", String(progress));
      // Pre-compute units (avoid calc multiplication quirks).
      el.style.setProperty("--landing-scroll-d1", `${progress * 64}px`);
      el.style.setProperty("--landing-scroll-d2", `${progress * -84}px`);
      el.style.setProperty("--landing-scroll-d3", `${progress * 28}px`);
      el.style.setProperty("--landing-scroll-s1", String(1 + progress * 0.12));
      el.style.setProperty("--landing-scroll-s2", String(1 + progress * 0.16));
      el.style.setProperty("--landing-scroll-o1", String(0.72 - progress * 0.22));
      el.style.setProperty("--landing-scroll-o2", String(0.66 - progress * 0.26));
    };

    const schedule = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 z-0", className)}
      style={{
        // defaults (in case JS is disabled)
        ["--landing-scroll-progress" as unknown as string]: 0,
        ["--landing-scroll-d1" as unknown as string]: "0px",
        ["--landing-scroll-d2" as unknown as string]: "0px",
        ["--landing-scroll-d3" as unknown as string]: "0px",
        ["--landing-scroll-s1" as unknown as string]: 1,
        ["--landing-scroll-s2" as unknown as string]: 1,
        ["--landing-scroll-o1" as unknown as string]: 0.72,
        ["--landing-scroll-o2" as unknown as string]: 0.66,
      }}
    >
      {/* Floating blobs */}
      <div
        className="absolute left-[-10%] top-[10%] h-[360px] w-[360px] rounded-full blur-[60px]"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(0,122,255,0.7), rgba(0,0,0,0) 64%)",
          transform:
            "translate3d(0, var(--landing-scroll-d1), 0) scale(var(--landing-scroll-s1))",
          opacity: "var(--landing-scroll-o1)",
        }}
      />
      <div
        className="absolute right-[-12%] top-[28%] h-[420px] w-[420px] rounded-full blur-[70px]"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, rgba(52,199,89,0.65), rgba(0,0,0,0) 66%)",
          transform:
            "translate3d(0, var(--landing-scroll-d2), 0) scale(var(--landing-scroll-s2))",
          opacity: "var(--landing-scroll-o2)",
        }}
      />

      {/* Subtle "grain" highlight that drifts */}
      <div
        className="absolute inset-0 opacity-[0.28]"
        style={{
          background:
            "radial-gradient(ellipse 1200px 620px at 50% 20%, rgba(255,255,255,0.08), transparent 60%)",
          transform: "translate3d(0, var(--landing-scroll-d3), 0)",
        }}
      />
    </div>
  );
}

