// src/app/dashboard/layout.tsx
"use client";

import { Navbar } from "@/components/shared/navbar";
import { AuthGuard } from "@/components/shared/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-muted/20">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
