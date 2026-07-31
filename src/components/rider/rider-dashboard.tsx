"use client";

import { useState, useCallback, useEffect } from "react";
import { ridesApi } from "@/lib/api/rides";
import { useRiderScanStore } from "@/lib/store/rider-scan-store";
import { NearbyList } from "./nearby-list";
import { ConfirmSeatDialog } from "./confirm-seat-dialog";
import { ActiveRideTracker } from "./active-ride-tracker";
import { toast } from "sonner";

export function RiderDashboard() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [verifiedInfo, setVerifiedInfo] = useState<any>(null);
  const [restoring, setRestoring] = useState(true);

  const [activeRide, setActiveRide] = useState<{
    sessionId: string;
    destination: string;
  } | null>(null);

  const scanToken = useRiderScanStore((s) => s.scanToken);
  const setScanToken = useRiderScanStore((s) => s.setScanToken);

  const handleScan = useCallback(async (token: string) => {
    try {
      const { data } = await ridesApi.verifyQr(token);
      setVerifiedInfo(data);
      setQrToken(token);
      setConfirmOpen(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid or expired QR code.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await ridesApi.getRiderActiveSession();
        if (data.active) {
          setActiveRide({ sessionId: data.sessionId, destination: data.destination });
        }
      } catch {
        /* ignore */
      } finally {
        setRestoring(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (scanToken) {
      const token = scanToken;
      const timeout = setTimeout(() => {
        void handleScan(token);
        setScanToken(null);
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [scanToken, handleScan, setScanToken]);

  if (restoring) {
    return <div className="space-y-4" />;
  }

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
      <NearbyList />

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
