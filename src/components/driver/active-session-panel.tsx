// src/components/driver/active-session-panel.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { ridesApi } from "@/lib/api/rides";
import { useRideSocket } from "@/lib/hooks/use-ride-socket";
import { ActiveSession } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface Props {
  session: ActiveSession;
  qrImageDataUrl: string | null;
  onEnded: () => void;
}

export function ActiveSessionPanel({
  session,
  qrImageDataUrl,
  onEnded,
}: Props) {
  const [availableSeats, setAvailableSeats] = useState(
    session.availableSeats ?? 0,
  );
  const [riders, setRiders] = useState(session.riders ?? []);
  const [ending, setEnding] = useState(false);
  const [localQr, setLocalQr] = useState<string | null>(qrImageDataUrl);
  const [qrLoading, setQrLoading] = useState(false);

  // Parent se naya qrImageDataUrl aaye (jaise go-online se seedha) to sync karo
  useEffect(() => {
    if (qrImageDataUrl) setLocalQr(qrImageDataUrl);
  }, [qrImageDataUrl]);

  const refreshSession = useCallback(async () => {
    try {
      const { data } = await ridesApi.getMyActiveSession();
      if (data.active) {
        setAvailableSeats(data.availableSeats);
        setRiders(data.riders);
      }
    } catch (err) {
      console.error("Failed to refresh session:", err);
    }
  }, []);

  useRideSocket({
    sessionId: session.sessionId ?? null,
    onSeatUpdate: (data) => {
      setAvailableSeats(data.availableSeats);
      toast.info(`New rider boarded! ${data.availableSeats} seats left.`);
      refreshSession();
    },
    onSessionEnded: () => {
      toast.info("Ride session ended.");
      onEnded();
    },
  });

  useEffect(() => {
    const interval = setInterval(refreshSession, 10000);
    return () => clearInterval(interval);
  }, [refreshSession]);

  const handleEndRideForRider = async (riderId: string) => {
    if (!session.sessionId) return;
    try {
      await ridesApi.endRideByDriver(session.sessionId, riderId);
      toast.success("Rider marked as dropped.");
      refreshSession();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to end rider ride.");
    }
  };

  const handleGoOffline = async () => {
    setEnding(true);
    try {
      await ridesApi.goOffline();
      toast.success("Ride completed and saved.");
      onEnded();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to end session.");
    } finally {
      setEnding(false);
    }
  };

  const handleRegenerateQr = async () => {
    setQrLoading(true);
    try {
      const { data } = await ridesApi.regenerateQr();
      console.log("regenerate-qr response:", data); // temporary debug
      setLocalQr(data.qrImageDataUrl);
    } catch (err: any) {
      console.error("regenerate-qr error:", err.response?.data || err.message); // temporary debug
      toast.error(err.response?.data?.message || "Failed to regenerate QR.");
    } finally {
      setQrLoading(false);
    }
  };

  const boardedRiders = riders.filter((r) => r.status === "BOARDED");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{session.destination}</CardTitle>
          <CardDescription>{session.distanceKm} km away</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {localQr ? (
            <img src={localQr} alt="Ride QR" className="h-48 w-48" />
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-48 w-48 items-center justify-center rounded-lg border border-dashed text-center text-sm text-muted-foreground p-4">
                QR abhi visible nahi hai.
              </div>
              <Button
                size="sm"
                onClick={handleRegenerateQr}
                disabled={qrLoading}
              >
                {qrLoading ? "Loading..." : "Show QR Again"}
              </Button>
            </div>
          )}
          <Badge
            variant={availableSeats === 0 ? "default" : "secondary"}
            className={availableSeats === 0 ? "bg-green-600" : ""}
          >
            {availableSeats === 0
              ? "🎉 All seats full — Ready to go!"
              : `${availableSeats} / ${session.totalSeats} seats available`}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Riders Onboard ({boardedRiders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {boardedRiders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Koi rider abhi board nahi hua.
            </p>
          ) : (
            boardedRiders.map((r) => (
              <div
                key={r.riderId}
                className="flex items-center justify-between"
              >
                <span className="text-sm">Rider #{r.riderId.slice(0, 8)}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEndRideForRider(r.riderId)}
                >
                  Mark Dropped
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Separator />

      <Button
        className="w-full"
        variant="destructive"
        onClick={handleGoOffline}
        disabled={ending}
      >
        {ending ? "Ending ride..." : "End Ride (Go Offline)"}
      </Button>
    </div>
  );
}
