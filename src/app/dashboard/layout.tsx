// src/app/dashboard/layout.tsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useUiStore } from "@/lib/store/ui-store";
import { Navbar } from "@/components/shared/navbar";
import { AuthGuard } from "@/components/shared/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((s) => s.user);
  const hydrateMode = useUiStore((s) => s.hydrateMode);

  useEffect(() => {
    if (!user) return;
    const fallback = user.role === "DRIVER" ? "DRIVER" : "RIDER";
    hydrateMode(fallback);
  }, [user, hydrateMode]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-muted/20">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
