"use client";

import type { ProDocumentA4Data } from "@/lib/features/pro/documents/pro-a4-types";
import { renderProDocumentA4Html } from "@/lib/server/pdf/pro-document-a4-html";
import { cn } from "@/lib/utils/cn";
import { useEffect, useMemo, useRef, useState } from "react";

// A4 @ 96 dpi (mêmes dimensions que le viewport PDF côté serveur).
const A4_W = 794;
const A4_H = 1123;

/**
 * Aperçu A4 d'un devis / facture — rend **exactement le même HTML que le PDF**
 * (`renderProDocumentA4Html`, pur, sans dépendance serveur) dans un iframe isolé,
 * mis à l'échelle pour tenir dans son conteneur. Source de vérité unique.
 */
export function DocumentPreview({
  data,
  className,
}: {
  data: ProDocumentA4Data;
  className?: string;
}) {
  const html = useMemo(() => renderProDocumentA4Html(data), [data]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      if (w > 0) setScale(Math.min(1, w / A4_W));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className={cn("w-full", className)}>
      <div
        className="relative mx-auto overflow-hidden rounded-xl bg-white shadow-[0_10px_40px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.08]"
        style={{
          width: scale > 0 ? A4_W * scale : "100%",
          height: scale > 0 ? A4_H * scale : A4_H,
        }}
      >
        {scale > 0 ? (
          <iframe
            title="Aperçu du document"
            srcDoc={html}
            scrolling="no"
            width={A4_W}
            height={A4_H}
            className="pointer-events-none border-0"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
