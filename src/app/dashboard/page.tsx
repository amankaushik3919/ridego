"use client";

import { useAuthStore } from "@/lib/store/auth-store";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="p-10">
      <h1 className="text-xl font-semibold">Welcome, {user?.phone}</h1>
      <p className="text-muted-foreground">Role: {user?.role}</p>
    </div>
  );
}
