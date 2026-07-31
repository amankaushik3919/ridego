"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Group, Route, IndianRupee, CarFront, Plus } from "lucide-react";
import { ridesApi } from "@/lib/api/rides";
import { usersApi } from "@/lib/api/users";
import { useAuthStore } from "@/lib/store/auth-store";
import { getErrorMessage } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export function DriverHome() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<{
    totalRides: number;
    totalRiders: number;
    totalDistance: number;
    estimatedRevenue: number;
  } | null>(null);
  const [vehicle, setVehicle] = useState<{ vehicleNumber: string } | null>(
    null,
  );

  useEffect(() => {
    (async () => {
      try {
        const [{ data: statsData }, { data: profileData }] = await Promise.all([
          ridesApi.getDriverStats(),
          usersApi.getDriverProfile(),
        ]);
        setStats(statsData);
        setVehicle(profileData);
      } catch (err) {
        toast.error(getErrorMessage(err, "Failed to load stats."));
      }
    })();
  }, []);

  if (!stats || !vehicle) {
    return <DriverHomeSkeleton />;
  }

  const firstName = user?.name?.split(" ")[0] ?? "Driver";

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold tracking-tight text-on-surface">
          Hello, {firstName}
        </h1>
        <p className="font-body-md mt-1 text-body-md text-on-surface-variant">
          Here&apos;s your driving overview.
        </p>
      </section>

      <div className="flex items-center justify-between rounded-[20px] border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-fixed text-primary">
            <CarFront className="size-6" />
          </div>
          <div>
            <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              Vehicle
            </p>
            <p className="font-title-md text-title-md font-semibold text-on-surface">
              {vehicle.vehicleNumber}
            </p>
          </div>
        </div>
        <span className="font-label-sm flex items-center gap-1 rounded-full bg-secondary-container/50 px-3 py-1 text-label-sm font-semibold text-on-secondary-container">
          <span className="size-1.5 rounded-full bg-secondary" />
          Active
        </span>
      </div>

      <section className="grid grid-cols-2 gap-4">
        <div className="glass-card flex flex-col gap-2 rounded-xl p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-fixed/30 text-primary">
            <Group className="size-5" />
          </span>
          <span className="font-label-sm mt-2 text-label-sm uppercase tracking-wider text-on-surface-variant">
            Total Rides
          </span>
          <span className="font-display-lg text-display-lg font-bold leading-none text-on-surface">
            {stats.totalRides}
          </span>
        </div>

        <div className="glass-card flex flex-col gap-2 rounded-xl p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-container/30 text-secondary">
            <IndianRupee className="size-5" />
          </span>
          <span className="font-label-sm mt-2 text-label-sm uppercase tracking-wider text-on-surface-variant">
            Est. Revenue
          </span>
          <span className="font-display-lg text-display-lg font-bold leading-none text-on-surface">
            ₹{stats.estimatedRevenue}
          </span>
        </div>

        <div className="glass-card flex flex-col gap-2 rounded-xl p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-fixed/30 text-primary">
            <Route className="size-5" />
          </span>
          <span className="font-label-sm mt-2 text-label-sm uppercase tracking-wider text-on-surface-variant">
            Riders
          </span>
          <span className="font-display-lg text-display-lg font-bold leading-none text-on-surface">
            {stats.totalRiders}
          </span>
        </div>

        <div className="glass-card flex flex-col gap-2 rounded-xl p-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-container/30 text-secondary">
            <Route className="size-5" />
          </span>
          <span className="font-label-sm mt-2 text-label-sm uppercase tracking-wider text-on-surface-variant">
            Distance (km)
          </span>
          <span className="font-display-lg text-display-lg font-bold leading-none text-on-surface">
            {stats.totalDistance}
          </span>
        </div>
      </section>

      <button
        onClick={() => router.push("/dashboard/rides")}
        className="flex w-full items-center justify-center gap-2 rounded-[20px] border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-sm transition-all hover:bg-surface-container-low active:scale-[0.98]"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
          <Plus className="size-4" />
        </span>
        <span className="font-title-md text-title-md font-semibold text-primary">
          Start a new ride
        </span>
      </button>
    </div>
  );
}

function DriverHomeSkeleton() {
  return (
    <div className="space-y-6">
      <section>
        <Skeleton className="h-9 w-48" />
        <Skeleton className="mt-2 h-5 w-64" />
      </section>

      <Skeleton className="h-[76px] w-full rounded-[20px]" />

      <section className="grid grid-cols-2 gap-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </section>

      <Skeleton className="h-16 w-full rounded-[20px]" />
    </div>
  );
}
