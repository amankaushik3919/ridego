"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ShieldX, ShieldCheck } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

interface RecentRide {
  id: string;
  destination: string;
  distanceKm: number;
  seatsBooked: number;
  status: string;
  startedAt: string;
  completedAt: string;
}

interface DriverDetail {
  driverId: string;
  userId: string;
  name: string | null;
  phone: string;
  vehicleNumber: string;
  vehicleModel: string | null;
  totalSeats: number;
  farePerRider: number;
  isActive: boolean;
  isOnline: boolean;
  today: { rides: number; riders: number; revenue: number };
  total: { rides: number; riders: number; revenue: number; distanceKm: number };
  recentRides: RecentRide[];
  destinations: { id: string; label: string; distanceKm: number }[];
}

function StatBox({ label, value, suffix }: { label: string; value: string | number; suffix?: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-3 text-center">
      <div className="text-lg font-bold">
        {value}
        {suffix ? <span className="text-sm font-medium text-muted-foreground">{suffix}</span> : null}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export default function AdminDriverDetailPage() {
  const params = useParams<{ driverProfileId: string }>();
  const router = useRouter();
  const [detail, setDetail] = useState<DriverDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.driverDetail(params.driverProfileId);
      setDetail(data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load driver."));
    } finally {
      setLoading(false);
    }
  }, [params.driverProfileId]);

  useEffect(() => {
    const id = setTimeout(() => void load(), 0);
    return () => clearTimeout(id);
  }, [load]);

  const toggleBlock = async () => {
    if (!detail) return;
    try {
      if (detail.isActive) {
        await adminApi.blockUser(detail.userId);
        toast.success("Driver blocked.");
      } else {
        await adminApi.unblockUser(detail.userId);
        toast.success("Driver unblocked.");
      }
      void load();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update status."));
    }
  };

  if (loading || !detail) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Skeleton className="h-8 w-40 bg-muted-foreground/20" />
        <Skeleton className="h-40 rounded-xl bg-muted-foreground/20" />
        <Skeleton className="h-48 rounded-xl bg-muted-foreground/20" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to drivers
      </button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{detail.name ?? detail.phone}</h1>
            {detail.isActive ? (
              <Badge className="bg-emerald-500 text-white">Active</Badge>
            ) : (
              <Badge className="bg-red-500 text-white">Blocked</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {detail.phone} · {detail.vehicleNumber} · {detail.vehicleModel ?? "-"} ·{" "}
            {detail.totalSeats} seats · ₹{detail.farePerRider}/rider
          </p>
        </div>
        <Button
          variant={detail.isActive ? "destructive" : "default"}
          onClick={() => void toggleBlock()}
        >
          {detail.isActive ? <ShieldX className="mr-2 size-4" /> : <ShieldCheck className="mr-2 size-4" />}
          {detail.isActive ? "Block Driver" : "Unblock Driver"}
        </Button>
      </div>

      {/* Today */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Today</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          <StatBox label="Rides" value={detail.today.rides} />
          <StatBox label="Riders" value={detail.today.riders} />
          <StatBox label="Earnings" value={detail.today.revenue} suffix="₹" />
        </CardContent>
      </Card>

      {/* Total */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">All Time</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBox label="Rides" value={detail.total.rides} />
          <StatBox label="Riders" value={detail.total.riders} />
          <StatBox label="Revenue" value={detail.total.revenue} suffix="₹" />
          <StatBox label="Distance" value={detail.total.distanceKm} suffix=" km" />
        </CardContent>
      </Card>

      {/* Recent rides */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Rides</CardTitle>
        </CardHeader>
        <CardContent>
          {detail.recentRides.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No rides yet.</p>
          ) : (
            <div className="space-y-2">
              {detail.recentRides.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <div>
                    <div className="font-medium">{r.destination}</div>
                    <div className="text-xs text-muted-foreground">
                      {r.distanceKm} km · {r.seatsBooked} riders ·{" "}
                      {new Date(r.completedAt).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <Badge
                    variant={
                      r.status === "COMPLETED" ? "secondary" : "default"
                    }
                  >
                    {r.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Destinations */}
      {detail.destinations.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Destinations</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {detail.destinations.map((d) => (
              <Badge key={d.id} variant="secondary">
                {d.label} · {d.distanceKm} km
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
