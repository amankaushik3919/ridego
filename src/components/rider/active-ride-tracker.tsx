"use client";

import { useState } from "react";
import { ridesApi } from "@/lib/api/rides";
import { useRideSocket } from "@/lib/hooks/use-ride-socket";
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

  useRideSocket({
    sessionId,
    onSessionEnded: () => {
      toast.info("This ride has ended.");
      onRideEnded();
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>You're on a ride!</CardTitle>
          <CardDescription>Heading to {destination}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Badge variant="secondary">Status: Boarded</Badge>
          <p className="text-sm text-muted-foreground">
            Destination pahunchne par driver ka QR dobara scan karein ride
            khatam karne ke liye.
          </p>
          <Button className="w-full" onClick={() => setScannerOpen(true)}>
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
