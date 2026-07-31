"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { DriverProfile } from "@/components/driver/driver-profile";
import { RiderProfile } from "@/components/rider/rider-profile";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const isDriver = user?.role === "DRIVER" || user?.role === "BOTH";

  if (isDriver) {
    return <DriverProfile />;
  }

  return <RiderProfile />;
}
