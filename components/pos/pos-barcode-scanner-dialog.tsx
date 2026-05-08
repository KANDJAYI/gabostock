"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MdClose } from "react-icons/md";
import { cn } from "@/lib/utils/cn";

type Props = {
  open: boolean;
  onClose: () => void;
  onDecoded: (text: string) => void;
  onError?: (message: string) => void;
};

/**
 * Scan code-barres / QR via la caméra (html5-qrcode).
 * HTTPS requis ; l’utilisateur doit autoriser la caméra.
 */
export function PosBarcodeScannerDialog({
  open,
  onClose,
  onDecoded,
  onError,
}: Props) {
  const reactId = useId().replace(/:/g, "");
  const regionId = `pos-scan-${reactId}`;
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  /** Keeps `#regionId` in the document until the scanner stops, so `video.play()` is not aborted by unmounting. */
  const [preserveScanRegion, setPreserveScanRegion] = useState(open);
  const onDecodedRef = useRef(onDecoded);
  onDecodedRef.current = onDecoded;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    if (open) setPreserveScanRegion(true);
  }, [open]);

  async function disposeScanner(html5: import("html5-qrcode").Html5Qrcode | null) {
    if (!html5) return;
    try {
      if (html5.isScanning) await html5.stop();
    } catch {
      /* */
    }
    try {
      html5.clear();
    } catch {
      /* */
    }
  }

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function finish(
      html5: import("html5-qrcode").Html5Qrcode,
      decodedText: string,
    ) {
      await disposeScanner(html5);
      scannerRef.current = null;
      setPreserveScanRegion(false);
      const t = decodedText.replace(/\r|\n/g, "").trim();
      if (t) onDecodedRef.current(t);
      onClose();
    }

    const run = async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      await new Promise<void>((r) => {
        requestAnimationFrame(() => r());
      });
      if (cancelled) return;
      if (!document.getElementById(regionId)) return;

      const html5 = new Html5Qrcode(regionId, { verbose: false });
      scannerRef.current = html5;

      const config = { fps: 10, qrbox: { width: 280, height: 200 } } as const;
      const onFrameFail = () => {};

      try {
        const cams = await Html5Qrcode.getCameras();
        if (cancelled) return;
        if (cams?.length) {
          const back = cams.find((c) =>
            /back|rear|environment|arrière|wide/i.test(c.label),
          );
          const cameraId = (back ?? cams[cams.length - 1]).id;
          try {
            await html5.start(
              cameraId,
              config,
              (decodedText) => {
                void finish(html5, decodedText);
              },
              onFrameFail,
            );
            return;
          } catch {
            /* caméra choisie indisponible → facingMode */
          }
        }
      } catch {
        /* énumération des caméras impossible → facingMode */
      }

      if (cancelled) return;

      try {
        await html5.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            void finish(html5, decodedText);
          },
          onFrameFail,
        );
      } catch (e) {
        const msg =
          e instanceof Error &&
          (/Permission|NotAllowed|NotFound/i.test(e.message) ||
            e.name === "NotAllowedError")
            ? "Autorisez l’accès à la caméra pour scanner."
            : e instanceof Error
              ? e.message
              : "Impossible d’ouvrir la caméra.";
        onErrorRef.current?.(msg);
        await disposeScanner(html5);
        scannerRef.current = null;
        setPreserveScanRegion(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
      const s = scannerRef.current;
      scannerRef.current = null;
      void disposeScanner(s).finally(() => {
        setPreserveScanRegion(false);
      });
    };
  }, [open, regionId, onClose]);

  if (!open && !preserveScanRegion) return null;

  return (
    <div
      className={cn(
        "fixed z-[200]",
        open
          ? "inset-0 flex flex-col items-center justify-end bg-black/50 p-4 sm:justify-center"
          : "left-[-9999px] top-0 h-[380px] w-[420px] overflow-hidden opacity-0 pointer-events-none",
      )}
      role={open ? "dialog" : undefined}
      aria-modal={open ? true : undefined}
      aria-hidden={!open}
      aria-label={open ? "Scannez un code-barres" : undefined}
    >
      <div
        className={cn(
          "relative w-full max-w-md overflow-hidden rounded-2xl bg-[#1F2937] shadow-xl",
          !open && "shadow-none",
        )}
      >
        {open ? (
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-base font-semibold text-white">Scannez un code-barres</p>
            <button
              type="button"
              onClick={() => onClose()}
              className="rounded-full p-2 text-white hover:bg-white/10"
              aria-label="Fermer"
            >
              <MdClose className="h-6 w-6" aria-hidden />
            </button>
          </div>
        ) : null}
        <div className={cn("p-3", !open && "p-0")}>
          {/* Same wrapper depth whenever open changes so `#regionId` is not remounted mid-scan. */}
          <div
            id={regionId}
            className="mx-auto min-h-[220px] w-full max-w-[360px] overflow-hidden rounded-xl bg-black"
          />
          {open ? (
            <p className="mt-3 text-center text-xs text-white/70">
              Cadrez le code-barres ou le QR code. La lecture se fait automatiquement.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
