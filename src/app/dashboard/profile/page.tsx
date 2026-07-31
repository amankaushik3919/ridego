"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { DriverProfile } from "@/components/driver/driver-profile";
import { ManageDestinations } from "@/components/driver/manage-destinations";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const isDriver = user?.role === "DRIVER" || user?.role === "BOTH";

  if (isDriver) {
    return <DriverProfile />;
  }

  return (
    <div className="space-y-4">
      <ManageDestinations />
    </div>
  );
}
