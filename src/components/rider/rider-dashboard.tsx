"use client";

import { useState, useCallback } from "react";
import { ridesApi } from "@/lib/api/rides";
import { NearbyList } from "./nearby-list";
import { QrScanner } from "./qr-scanner";
import { ConfirmSeatDialog } from "./confirm-seat-dialog";
import { ActiveRideTracker } from "./active-ride-tracker";
import { toast } from "sonner";

export function RiderDashboard() {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [verifiedInfo, setVerifiedInfo] = useState<any>(null);

  const [activeRide, setActiveRide] = useState<{
    sessionId: string;
    destination: string;
  } | null>(null);

  const handleScan = useCallback(async (token: string) => {
    setScannerOpen(false);
    setQrToken(token);

    try {
      const { data } = await ridesApi.verifyQr(token);
      setVerifiedInfo(data);
      setConfirmOpen(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid or expired QR code.");
    }
  }, []);

  if (activeRide) {
    return (
      <ActiveRideTracker
        sessionId={activeRide.sessionId}
        destination={activeRide.destination}
        onRideEnded={() => setActiveRide(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <NearbyList onScanClick={() => setScannerOpen(true)} />

      <QrScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
      />

      <ConfirmSeatDialog
        open={confirmOpen}
        qrToken={qrToken}
        verified={verifiedInfo}
        onClose={() => setConfirmOpen(false)}
        onLocked={(sessionId, destination) => {
          setActiveRide({ sessionId, destination });
        }}
      />
    </div>
  );
}
