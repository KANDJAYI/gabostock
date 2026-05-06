"use client";

import { cn } from "@/lib/utils/cn";
import { useEffect, useRef, useState } from "react";

export function ScrollReveal({
  children,
  className,
  delayMs = 0,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion: reveal immediately.
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (prefersReducedMotion) {
      setVisible(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) io.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { root: null, threshold: 0.14, rootMargin: "0px 0px -12% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={cn("sr-reveal", visible && "is-visible", className)}
      style={{ ["--sr-delay" as unknown as string]: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}

