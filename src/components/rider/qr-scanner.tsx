// src/components/rider/qr-scanner.tsx — poora updated file
"use client";

import { useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onClose: () => void;
  onScan: (qrToken: string) => void;
}

const CONTAINER_ID = "qr-reader-container";

export function QrScanner({ open, onClose, onScan }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);

  const safeStop = async (scanner: Html5Qrcode) => {
    try {
      if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
        await scanner.stop();
      }
    } catch {
      // already stopped — ignore
    }
  };

  useEffect(() => {
    if (!open) return;

    hasScannedRef.current = false;
    let cancelled = false;

    const rafId = requestAnimationFrame(() => {
      if (cancelled) return;

      const el = document.getElementById(CONTAINER_ID);
      if (!el) return;

      const scanner = new Html5Qrcode(CONTAINER_ID);
      scannerRef.current = scanner;

      scanner
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            if (hasScannedRef.current) return; // duplicate frame guard
            hasScannedRef.current = true;

            await safeStop(scanner);
            onScan(decodedText);
          },
          () => {
            // per-frame scan failure — ignore, normal until QR aligns
          },
        )
        .catch((err) => {
          console.error("Camera start failed:", err);
        });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);

      const scanner = scannerRef.current;
      if (scanner) {
        safeStop(scanner).finally(() => {
          try {
            scanner.clear();
          } catch {
            // ignore
          }
        });
        scannerRef.current = null;
      }
    };
  }, [open, onScan]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Scan Rickshaw QR</DialogTitle>
        </DialogHeader>
        <div id={CONTAINER_ID} className="w-full" />
      </DialogContent>
    </Dialog>
  );
}
