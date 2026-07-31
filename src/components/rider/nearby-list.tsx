"use client";

import { useEffect, useState, useCallback } from "react";
import { ridesApi } from "@/lib/api/rides";
import { useGeolocation } from "@/lib/hooks/use-geolocation";
import { NearbySession } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export function NearbyList({ onScanClick }: { onScanClick: () => void }) {
  const [sessions, setSessions] = useState<NearbySession[]>([]);
  const [loading, setLoading] = useState(true);
  const { getLocation } = useGeolocation();

  const fetchNearby = useCallback(async () => {
    setLoading(true);
    try {
      const { lat, lng } = await getLocation();
      const { data } = await ridesApi.getNearby(lat, lng, 2);
      setSessions(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch nearby rickshaws.");
    } finally {
      setLoading(false);
    }
  }, [getLocation]);

  useEffect(() => {
    fetchNearby();
    const interval = setInterval(fetchNearby, 15000); // har 15 sec refresh
    return () => clearInterval(interval);
  }, [fetchNearby]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Nearby Rickshaws</h2>
        <Button size="sm" onClick={onScanClick}>
          Scan QR to Board
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Koi rickshaw nearby active nahi hai abhi. Thodi der mein try karein.
        </p>
      ) : (
        sessions.map((s) => (
          <Card key={s.sessionId}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{s.destination}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {s.distanceKm} km route
              </span>
              <Badge
                variant={s.availableSeats > 0 ? "secondary" : "destructive"}
              >
                {s.availableSeats} / {s.totalSeats} seats
              </Badge>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
