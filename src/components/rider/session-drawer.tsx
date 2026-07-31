"use client";

import { useState, useCallback, useEffect } from "react";
import { NearbySession } from "@/types";
import { useRideSocket } from "@/lib/hooks/use-ride-socket";
import { useGeolocation } from "@/lib/hooks/use-geolocation";
import { haversineMeters, cn } from "@/lib/utils";
import { useRiderScanStore } from "@/lib/store/rider-scan-store";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Users, Navigation, MapPin, QrCode, CarFront } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  session: NearbySession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.max(0, Math.round(m / 10) * 10)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function bearingDirection(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): string {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  const dLng = toRad(toLng - fromLng);
  const lat1 = toRad(fromLat);
  const lat2 = toRad(toLat);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  const bearing = (toDeg(Math.atan2(y, x)) + 360) % 360;
  const directions = [
    "North",
    "North-East",
    "East",
    "South-East",
    "South",
    "South-West",
    "West",
    "North-West",
  ];
  return directions[Math.round(bearing / 45) % 8];
}

export function SessionDrawer({ session, open, onOpenChange }: Props) {
  const setScannerOpen = useRiderScanStore((s) => s.setScannerOpen);
  const { getLocation } = useGeolocation();
  const [liveLoc, setLiveLoc] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [riderLoc, setRiderLoc] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  useRideSocket({
    sessionId: session?.sessionId ?? null,
    onDriverLocation: (data) => {
      setLiveLoc({ lat: data.lat, lng: data.lng });
    },
  });

  const refreshRiderLoc = useCallback(async () => {
    try {
      const loc = await getLocation();
      setRiderLoc(loc);
    } catch {
      /* silent */
    }
  }, [getLocation]);

  useEffect(() => {
    if (!open || !session) return;
    const timeout = setTimeout(() => {
      setLiveLoc(null);
      void refreshRiderLoc();
    }, 100);
    const interval = setInterval(() => {
      void refreshRiderLoc();
    }, 10000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [open, session, refreshRiderLoc]);

  const liveDistanceM = (() => {
    if (liveLoc && riderLoc) {
      return haversineMeters(
        riderLoc.lat,
        riderLoc.lng,
        liveLoc.lat,
        liveLoc.lng,
      );
    }
    return null;
  })();

  const liveDirection = (() => {
    if (liveLoc && riderLoc) {
      return bearingDirection(
        riderLoc.lat,
        riderLoc.lng,
        liveLoc.lat,
        liveLoc.lng,
      );
    }
    return null;
  })();

  const liveDistanceText =
    liveDistanceM !== null ? formatDistance(liveDistanceM) : null;
  const displayDistance =
    liveDistanceText ?? formatDistance(session?.distanceM ?? 0);
  const displayDirection = liveDirection ?? session?.direction ?? "";
  const liveTracking = liveLoc !== null;

  const seatsBooked = session ? session.totalSeats - session.availableSeats : 0;
  const full = session ? session.availableSeats <= 0 : false;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-surface-container-lowest">
        {!session ? (
          <DrawerHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </DrawerHeader>
        ) : (
          <>
            <DrawerHeader className="px-5 pt-2">
              <div className="flex items-center justify-between gap-2">
                <DrawerTitle className="font-title-lg flex items-center gap-2 text-title-lg text-on-surface">
                  <MapPin className="size-5 text-primary" />
                  {session.destination}
                </DrawerTitle>
                <span
                  className={cn(
                    "font-label-sm shrink-0 rounded-full px-3 py-1 text-label-sm font-semibold",
                    full
                      ? "bg-error-container text-on-error-container"
                      : "bg-secondary-container/60 text-on-secondary-container",
                  )}
                >
                  {full ? "Full" : `${session.availableSeats} seats left`}
                </span>
              </div>
              <DrawerDescription className="font-body-md text-body-md text-on-surface-variant">
                <span className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-primary-fixed/40 px-3 py-1 font-label-lg text-label-lg font-bold text-primary">
                  <CarFront className="size-4" />
                  {session.vehicleNumber}
                </span>
                <span className="block">
                  {session.routeDistanceKm} km route · {seatsBooked}/
                  {session.totalSeats} riders onboard
                </span>
              </DrawerDescription>
            </DrawerHeader>

            <div className="space-y-3 px-5 py-2">
              <div
                className={cn(
                  "rounded-2xl border p-4 transition-colors",
                  liveTracking
                    ? "border-primary/30 bg-primary/5"
                    : "border-outline-variant/30 bg-surface-container-low",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-body-lg text-body-lg font-semibold text-on-surface">
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full",
                        liveTracking
                          ? "bg-primary text-white"
                          : "bg-primary-fixed text-primary",
                      )}
                    >
                      <CarFront className="size-5" />
                    </span>
                    {liveTracking ? "Rickshaw on the move" : "Rickshaw online"}
                  </span>
                  {liveTracking && (
                    <span className="flex items-center gap-1.5 font-label-sm text-label-sm font-semibold text-primary">
                      <span className="size-2 animate-pulse rounded-full bg-primary" />
                      LIVE
                    </span>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-surface-container-lowest p-3">
                    <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                      Distance
                    </p>
                    <p className="font-title-md mt-1 flex items-center gap-1.5 text-title-md font-bold text-on-surface">
                      <Navigation className="size-4 text-primary" />
                      {displayDistance} away
                    </p>
                  </div>
                  <div className="rounded-xl bg-surface-container-lowest p-3">
                    <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                      Direction
                    </p>
                    <p className="font-title-md mt-1 flex items-center gap-1.5 text-title-md font-bold text-on-surface">
                      <MapPin className="size-4 text-primary" />
                      {displayDirection || "Moving"}
                    </p>
                  </div>
                </div>

                {!liveTracking && (
                  <p className="font-body-md mt-3 flex items-center gap-1.5 text-body-md text-on-surface-variant">
                    <span className="size-1.5 rounded-full bg-secondary" />
                    Live tracking will start when the rickshaw starts moving
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-outline-variant/30 bg-surface-container-low px-4 py-3">
                <span className="flex items-center gap-2 font-body-md text-body-md font-medium text-on-surface">
                  <Users className="size-4 text-primary" />
                  {seatsBooked}/{session.totalSeats} seats booked
                </span>
                <span className="font-body-md text-body-md text-on-surface-variant">
                  {session.routeDistanceKm} km route
                </span>
              </div>
            </div>

            <DrawerFooter className="px-5 pb-6">
              <button
                onClick={() => {
                  onOpenChange(false);
                  setScannerOpen(true);
                }}
                className="flex h-13.5 w-full items-center justify-center gap-2 rounded-xl bg-primary font-title-md text-title-md font-semibold text-white shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
              >
                <QrCode className="size-5" />
                Board this rickshaw — Scan QR
              </button>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}
