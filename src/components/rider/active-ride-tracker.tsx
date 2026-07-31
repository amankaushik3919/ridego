"use client";

import { useState, useCallback, useEffect } from "react";
import { ridesApi } from "@/lib/api/rides";
import { useRideSocket } from "@/lib/hooks/use-ride-socket";
import { useGeolocation } from "@/lib/hooks/use-geolocation";
import { haversineMeters } from "@/lib/utils";
import { QrScanner } from "./qr-scanner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation } from "lucide-react";
import { toast } from "sonner";

interface Props {
  sessionId: string;
  destination: string;
  onRideEnded: () => void;
}

export function ActiveRideTracker({
  sessionId,
  destination,
  onRideEnded,
}: Props) {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [driverLoc, setDriverLoc] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const { getLocation, loading } = useGeolocation();
  const [riderLoc, setRiderLoc] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  useRideSocket({
    sessionId,
    onSessionEnded: () => {
      toast.info("This ride has ended.");
      onRideEnded();
    },
    onDriverLocation: (data) => {
      setDriverLoc({ lat: data.lat, lng: data.lng });
    },
  });

  const handleScanToEnd = async (qrToken: string) => {
    setScannerOpen(false);
    try {
      const { data } = await ridesApi.endRide(qrToken);
      if (data.result === "RIDE_ENDED") {
        toast.success("Ride ended. Hope you had a good trip!");
        onRideEnded();
      } else if (data.result === "ALREADY_COMPLETED") {
        toast.info("This ride was already marked complete.");
        onRideEnded();
      } else {
        toast.error("Could not end ride — QR does not match your active ride.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to end ride.");
    }
  };

  const handleRefreshDistance = useCallback(async () => {
    try {
      const loc = await getLocation();
      setRiderLoc(loc);
    } catch {
      /* rider location fail — silent */
    }
  }, [getLocation]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void handleRefreshDistance();
    }, 100);
    const interval = setInterval(() => {
      void handleRefreshDistance();
    }, 10000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [handleRefreshDistance]);

  const liveDistanceM = (() => {
    if (driverLoc && riderLoc) {
      return haversineMeters(
        riderLoc.lat,
        riderLoc.lng,
        driverLoc.lat,
        driverLoc.lng,
      );
    }
    return null;
  })();

  const liveDistanceText = (() => {
    if (liveDistanceM === null) return null;
    if (liveDistanceM < 1000) {
      return `${Math.max(0, Math.round(liveDistanceM / 10) * 10)} m away`;
    }
    return `${(liveDistanceM / 1000).toFixed(1)} km away`;
  })();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>You're on a ride!</CardTitle>
          <CardDescription>Heading to {destination}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Status: Boarded</Badge>
            <Badge
              variant="secondary"
              className={driverLoc ? "bg-emerald-500 text-white" : ""}
            >
              <Navigation
                className={`size-3 ${driverLoc ? "animate-pulse" : ""}`}
              />
              {liveDistanceText ??
                (driverLoc
                  ? "Live location on"
                  : "Waiting for driver location")}
            </Badge>
          </div>

          {driverLoc && (
            <div className="flex items-center gap-3 rounded-xl bg-primary/5 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                <MapPin className="size-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  Driver is moving
                </p>
                <p className="text-xs text-muted-foreground">
                  {liveDistanceText
                    ? `About ${liveDistanceText} from you`
                    : "Enable location to see live distance"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshDistance}
                disabled={loading}
                className="shrink-0"
              >
                {loading ? "Locating..." : "Refresh"}
              </Button>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Scan QR Code to reach your destination.
          </p>
          <Button className="w-full h-12" onClick={() => setScannerOpen(true)}>
            Scan QR to End Ride
          </Button>
        </CardContent>
      </Card>

      <QrScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScanToEnd}
      />
    </>
  );
}
