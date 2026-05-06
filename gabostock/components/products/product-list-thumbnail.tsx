"use client";

import { useEffect, useMemo, useState } from "react";
import { MdInventory2 } from "react-icons/md";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { firstProductImageUrl as firstProductImageUrlFromLib } from "@/lib/features/products/product-images";
import type { ProductItem } from "@/lib/features/products/types";
import { cn } from "@/lib/utils/cn";

export function firstProductImageUrl(p: ProductItem): string | null {
  return firstProductImageUrlFromLib(p);
}

/** Miniature 48×48 comme `_ProductListTile` (Flutter) — 1re image ou icône inventaire. */
export function ProductListThumbnail({
  imageUrl,
  allImageUrls,
  className,
}: {
  imageUrl: string | null;
  allImageUrls?: string[] | null;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const urls = useMemo(() => {
    const raw = (allImageUrls ?? []).filter(Boolean) as string[];
    const dedup = Array.from(new Set(raw));
    // fallback: si on n’a pas la liste, au moins l’image affichée
    if (dedup.length === 0 && imageUrl) return [imageUrl];
    return dedup;
  }, [allImageUrls, imageUrl]);

  useEffect(() => {
    setBroken(false);
  }, [imageUrl]);
  const showImg = Boolean(imageUrl) && !broken;
  const canPreview = urls.length > 0 && showImg;
  const isOpen = previewIndex != null;
  const currentUrl = isOpen ? urls[Math.min(urls.length - 1, Math.max(0, previewIndex))] : null;

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewIndex(null);
      if (e.key === "ArrowLeft") {
        setPreviewIndex((i) => {
          if (i == null) return i;
          return Math.max(0, i - 1);
        });
      }
      if (e.key === "ArrowRight") {
        setPreviewIndex((i) => {
          if (i == null) return i;
          return Math.min(urls.length - 1, i + 1);
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, urls.length]);

  return (
    <>
      {isOpen && currentUrl ? (
        <div
          className="fixed inset-0 z-[95] cursor-zoom-out bg-black/60 backdrop-blur-[2px]"
          onClick={() => setPreviewIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Aperçu image"
        >
          <div
            className="absolute left-1/2 top-1/2 w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-white/15 bg-black/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentUrl}
              alt=""
              className="block h-auto w-full object-contain"
              loading="eager"
              decoding="async"
            />

            {urls.length > 1 ? (
              <>
                <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold text-white/90">
                  {Math.min(urls.length, (previewIndex ?? 0) + 1)}/{urls.length}
                </span>
                <button
                  type="button"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/45 p-2 text-white/90 disabled:opacity-30"
                  onClick={(e) => {
                    setPreviewIndex((i) => (i == null ? i : Math.max(0, i - 1)));
                  }}
                  disabled={(previewIndex ?? 0) <= 0}
                  aria-label="Image précédente"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/45 p-2 text-white/90 disabled:opacity-30"
                  onClick={(e) => {
                    setPreviewIndex((i) =>
                      i == null ? i : Math.min(urls.length - 1, i + 1),
                    );
                  }}
                  disabled={(previewIndex ?? 0) >= urls.length - 1}
                  aria-label="Image suivante"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      <button
        type="button"
        disabled={!canPreview}
        onClick={() => {
          if (canPreview) setPreviewIndex(0);
        }}
        className={cn(
          "flex h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-fs-surface-container text-neutral-400",
          canPreview ? "cursor-zoom-in" : "cursor-default",
          className,
        )}
        aria-label={canPreview ? "Agrandir l'image" : undefined}
      >
      {showImg ? (
        <img
          src={imageUrl!}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
        />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center"
          aria-hidden
        >
          <MdInventory2 className="h-7 w-7" />
        </span>
      )}
      </button>
    </>
  );
}
