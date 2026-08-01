// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { usersApi } from "@/lib/api/users";
import { DriverHome } from "@/components/driver/driver-home";
import { RiderDashboard } from "@/components/rider/rider-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [checkingVehicle, setCheckingVehicle] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Naya user jiska role abhi bhi null hai (edge-case, refresh ke beech mein) — onboarding bhej do
    if (user.role === null) {
      router.replace("/onboarding");
      return;
    }

    if (user.role === "DRIVER" || user.role === "BOTH") {
      const id = setTimeout(() => {
        setCheckingVehicle(true);
        usersApi
          .getDriverProfile()
          .catch(() => {
            // Vehicle register nahi hai abhi — register-vehicle pe bhej do
            router.replace("/register-vehicle");
          })
          .finally(() => setCheckingVehicle(false));
      }, 0);
      return () => clearTimeout(id);
    }
  }, [user, router]);

  if (!user || checkingVehicle) return <Skeleton className="h-64 w-full" />;

  if (user.role === "DRIVER" || user.role === "BOTH") {
    return <DriverHome />;
  }

  return <RiderDashboard />;
}
