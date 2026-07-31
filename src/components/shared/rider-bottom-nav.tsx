"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, QrCode, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRiderScanStore } from "@/lib/store/rider-scan-store";
import { QrScanner } from "@/components/rider/qr-scanner";

export function RiderBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const scannerOpen = useRiderScanStore((s) => s.scannerOpen);
  const setScannerOpen = useRiderScanStore((s) => s.setScannerOpen);
  const setScanToken = useRiderScanStore((s) => s.setScanToken);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const handleScan = (token: string) => {
    setScannerOpen(false);
    setScanToken(token);
  };

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4">
        <div className="mx-auto flex max-w-sm items-center justify-around rounded-3xl bg-white/90 px-2 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/5 backdrop-blur-xl">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex flex-1 flex-col items-center"
          >
            <span
              className={cn(
                "flex w-full flex-col items-center gap-1 rounded-2xl py-2 transition-all duration-200",
                isActive("/dashboard")
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "text-on-surface-variant hover:bg-surface-container-low",
              )}
            >
              <Home
                className={cn(
                  "size-6 transition-all",
                  isActive("/dashboard") && "scale-110",
                )}
                strokeWidth={isActive("/dashboard") ? 2.6 : 2}
                fill={isActive("/dashboard") ? "currentColor" : "none"}
              />
              <span
                className={cn(
                  "text-[11px] transition-all",
                  isActive("/dashboard") ? "font-bold" : "font-medium",
                )}
              >
                Home
              </span>
            </span>
          </button>

          <div className="relative flex-1">
            <div className="absolute inset-x-0 -top-9 flex justify-center">
              <button
                onClick={() => setScannerOpen(true)}
                aria-label="Scan QR"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-xl shadow-primary/40 ring-4 ring-background transition-all active:scale-95"
              >
                <QrCode className="size-7" />
              </button>
            </div>
            <span className="pointer-events-none flex items-center justify-center pt-1 text-[11px] font-medium text-on-surface-variant">
              Scan
            </span>
          </div>

          <button
            onClick={() => router.push("/dashboard/profile")}
            className="flex flex-1 flex-col items-center"
          >
            <span
              className={cn(
                "flex w-full flex-col items-center gap-1 rounded-2xl py-2 transition-all duration-200",
                isActive("/dashboard/profile")
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "text-on-surface-variant hover:bg-surface-container-low",
              )}
            >
              <User
                className={cn(
                  "size-6 transition-all",
                  isActive("/dashboard/profile") && "scale-110",
                )}
                strokeWidth={isActive("/dashboard/profile") ? 2.6 : 2}
                fill={isActive("/dashboard/profile") ? "currentColor" : "none"}
              />
              <span
                className={cn(
                  "text-[11px] transition-all",
                  isActive("/dashboard/profile") ? "font-bold" : "font-medium",
                )}
              >
                Profile
              </span>
            </span>
          </button>
        </div>
      </nav>

      <QrScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
      />
    </>
  );
}
