"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { ridesApi } from "@/lib/api/rides";
import { useGeolocation } from "@/lib/hooks/use-geolocation";
import { useRiderScanStore } from "@/lib/store/rider-scan-store";
import { NearbySession } from "@/types";
import { Users, Navigation, MapPin, QrCode, RotateCcw, ChevronUp, CarFront } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { SessionDrawer } from "./session-drawer";
import { toast } from "sonner";

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.max(0, Math.round(m / 10) * 10)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

export function NearbyList() {
  const setScannerOpen = useRiderScanStore((s) => s.setScannerOpen);
  const [sessions, setSessions] = useState<NearbySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<NearbySession | null>(null);
  const { getLocation } = useGeolocation();
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchNearby = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      try {
        const { lat, lng, accuracy } = await getLocation();
        if (mountedRef.current) setLocationAccuracy(accuracy);
        const { data } = await ridesApi.getNearby(lat, lng, 2);
        if (mountedRef.current) setSessions(data);
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : "Failed to fetch nearby rickshaws.",
        );
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [getLocation],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchNearby();
    }, 100);
    const interval = setInterval(() => fetchNearby(true), 15000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [fetchNearby]);

  const booked = (s: NearbySession) => s.totalSeats - s.availableSeats;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold tracking-tight text-on-surface">
            Nearby Rickshaws
          </h1>
          <p className="font-body-md mt-1 text-body-md text-on-surface-variant">
            Online rickshaws sorted by distance
          </p>
        </div>
        <button
          onClick={() => fetchNearby(true)}
          disabled={refreshing}
          aria-label="Refresh"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest text-primary shadow-sm transition-all active:scale-90"
        >
          <RotateCcw className={cn("size-5", refreshing && "animate-spin")} />
        </button>
      </div>

      {locationAccuracy !== null && locationAccuracy > 500 && (
        <div className="rounded-xl bg-secondary-container/40 px-4 py-3">
          <p className="font-body-md flex items-center gap-2 text-body-md text-on-secondary-container">
            <Navigation className="size-4 shrink-0" />
            Location approximate (±
            {Math.round(locationAccuracy / 10) * 10}m). Rickshaws nearby area
            mein dikh rahe hain — asli location ke liye GPS wala area use
            karein.
          </p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed border-outline-variant/50 px-6 py-12 text-center">
          <MapPin className="size-10 text-outline" />
          <p className="font-body-lg text-body-lg font-medium text-on-surface">
            No rickshaws nearby right now
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Try again in a few minutes, or scan a QR code if you can see a
            rickshaw.
          </p>
          <button
            onClick={() => setScannerOpen(true)}
            className="mt-1 flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 font-label-lg text-label-lg font-semibold text-white shadow-lg shadow-primary/25 active:scale-95"
          >
            <QrCode className="size-4" />
            Scan QR to Board
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s, idx) => {
            const seatsBooked = booked(s);
            const full = s.availableSeats <= 0;
            return (
              <button
                key={s.sessionId}
                onClick={() => setSelected(s)}
                className={cn(
                  "w-full rounded-[20px] border bg-surface-container-lowest p-4 text-left shadow-sm transition-all active:scale-[0.98]",
                  full
                    ? "border-error/30 opacity-80"
                    : "border-outline-variant/30",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl",
                      full
                        ? "bg-error-container text-on-error-container"
                        : "bg-primary-fixed text-primary",
                    )}
                  >
                    <span className="font-display-sm text-display-sm font-bold leading-none">
                      {idx + 1}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-title-md truncate text-title-md font-semibold text-on-surface">
                        {s.destination}
                      </p>
                      <span
                        className={cn(
                          "font-label-sm shrink-0 rounded-full px-2.5 py-1 text-label-sm font-semibold",
                          full
                            ? "bg-error-container text-on-error-container"
                            : "bg-secondary-container/50 text-on-secondary-container",
                        )}
                      >
                        {full ? "Full" : `${s.availableSeats} left`}
                      </span>
                    </div>
                    <p className="font-body-md mt-0.5 flex items-center gap-1.5 text-body-md text-on-surface-variant">
                      <CarFront className="size-4 shrink-0 text-primary" />
                      {s.vehicleNumber}
                    </p>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      {s.routeDistanceKm} km route
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-xl bg-surface-container-low px-3 py-2.5">
                  <span className="flex items-center gap-1.5 font-body-md text-body-md font-medium text-on-surface">
                    <Navigation className="size-4 text-primary" />
                    {formatDistance(s.distanceM)} away · {s.direction}
                  </span>
                  <span className="flex items-center gap-1.5 font-body-md text-body-md text-on-surface-variant">
                    <Users className="size-4 text-primary" />
                    {seatsBooked}/{s.totalSeats} seats
                  </span>
                </div>

                <span className="mt-2 flex items-center justify-center gap-1 font-label-sm text-label-sm font-semibold text-primary">
                  <ChevronUp className="size-3.5 rotate-180" />
                  View live location
                </span>
              </button>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setScannerOpen(true)}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-[20px] border border-primary/20 bg-primary/5 py-3.5 font-title-md text-title-md font-semibold text-primary transition-all active:scale-[0.98]"
      >
        <QrCode className="size-5" />
        Scan QR to Board
      </button>

      <SessionDrawer
        session={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}
