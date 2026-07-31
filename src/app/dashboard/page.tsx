// src/app/dashboard/page.tsx
"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { useUiStore } from "@/lib/store/ui-store";
import { BecomeDriverPrompt } from "@/components/driver/become-driver-prompt";
import { DriverDashboard } from "@/components/driver/driver-dashboard";
import { RiderDashboardPlaceholder } from "@/components/rider/rider-dashboard-placeholder";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const activeMode = useUiStore((s) => s.activeMode);
  console.log({ activeMode, user });

  if (!user) return null;

  if (activeMode === "DRIVER" && user.role === "RIDER") {
    return <BecomeDriverPrompt />;
  }

  if (activeMode === "DRIVER") {
    return <DriverDashboard />;
  }

  return <RiderDashboardPlaceholder />;
}
