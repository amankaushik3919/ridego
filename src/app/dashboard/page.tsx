"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { useUiStore } from "@/lib/store/ui-store";
import { BecomeDriverPrompt } from "@/components/driver/become-driver-prompt";
import { DriverDashboardPlaceholder } from "@/components/driver/driver-dashboard-placeholder";
import { RiderDashboardPlaceholder } from "@/components/rider/rider-dashboard-placeholder";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const activeMode = useUiStore((s) => s.activeMode);

  if (!user) return null;

  // Driver mode select kiya hai lekin driver profile nahi hai -> CTA dikhao
  if (activeMode === "DRIVER" && user.role === "RIDER") {
    return <BecomeDriverPrompt />;
  }

  if (activeMode === "DRIVER") {
    return <DriverDashboardPlaceholder />;
  }

  return <RiderDashboardPlaceholder />;
}
