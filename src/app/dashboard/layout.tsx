// src/app/dashboard/layout.tsx
"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { BottomNav } from "@/components/shared/bottom-nav";
import { RiderBottomNav } from "@/components/shared/rider-bottom-nav";
import { AuthGuard } from "@/components/shared/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const isDriver = user?.role === "DRIVER" || user?.role === "BOTH";

  return (
    <AuthGuard>
      {isDriver ? (
        <div className="relative min-h-dvh bg-background text-on-surface">
          <div className="mx-auto w-full max-w-md px-5 pb-28 pt-6">
            {children}
          </div>
          <BottomNav />
        </div>
      ) : (
        <div className="relative min-h-dvh bg-background text-on-surface">
          <div className="mx-auto w-full max-w-md px-5 pb-32 pt-6">
            {children}
          </div>
          <RiderBottomNav />
        </div>
      )}
    </AuthGuard>
  );
}
