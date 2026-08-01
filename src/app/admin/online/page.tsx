"use client";

import { useCallback, useEffect, useState } from "react";
import { Radio, RefreshCw } from "lucide-react";
import { adminApi, OnlineDriver } from "@/lib/api/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export default function AdminOnlinePage() {
  const [items, setItems] = useState<OnlineDriver[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (showToast = false) => {
    setLoading(true);
    try {
      const { data } = await adminApi.onlineDrivers();
      setItems(data.items);
      if (showToast) toast.success("Refreshed.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load online drivers."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => void load(), 0);
    const interval = setInterval(() => void load(), 30000);
    return () => {
      clearTimeout(id);
      clearInterval(interval);
    };
  }, [load]);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Online Drivers</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} online — auto-refresh every 30s
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void load(true)}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 size-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {loading && items.length === 0 ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton
              key={i}
              className="h-20 rounded-xl bg-muted-foreground/20"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
            <Radio className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No driver online yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((d) => (
            <Card key={d.sessionId}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{d.name ?? d.phone}</div>
                    <div className="text-xs text-muted-foreground">
                      {d.phone}
                    </div>
                  </div>
                  <Badge
                    className={
                      d.status === "STARTED"
                        ? "bg-blue-500 text-white"
                        : "bg-emerald-500 text-white"
                    }
                  >
                    {d.status === "STARTED" ? "On Ride" : "Active"}
                  </Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-muted/50 p-2 text-center text-xs sm:grid-cols-4">
                  <div>
                    <div className="font-semibold">
                      {d.vehicleNumber ?? "-"}
                    </div>
                    <div className="text-muted-foreground">Vehicle</div>
                  </div>
                  <div>
                    <div className="font-semibold truncate">
                      {d.destination}
                    </div>
                    <div className="text-muted-foreground">Destination</div>
                  </div>
                  <div>
                    <div className="font-semibold">
                      {d.availableSeats}/{d.totalSeats}
                    </div>
                    <div className="text-muted-foreground">Seats left</div>
                  </div>
                  <div>
                    <div className="font-semibold">{d.distanceKm} km</div>
                    <div className="text-muted-foreground">Route</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
