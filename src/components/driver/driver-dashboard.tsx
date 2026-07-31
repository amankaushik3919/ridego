"use client";

import { useEffect, useState } from "react";
import { ridesApi } from "@/lib/api/rides";
import { GoOnlineForm } from "./go-online-form";
import { ActiveSessionPanel } from "./active-session-panel";
import { Skeleton } from "@/components/ui/skeleton";

export function DriverDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [qrImageDataUrl, setQrImageDataUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await ridesApi.getMyActiveSession();
      if (data.active) setActiveSession(data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Skeleton className="h-64 w-full" />;

  if (activeSession && qrImageDataUrl) {
    return (
      <ActiveSessionPanel
        session={activeSession}
        qrImageDataUrl={qrImageDataUrl}
        onEnded={() => {
          setActiveSession(null);
          setQrImageDataUrl(null);
        }}
      />
    );
  }

  return (
    <GoOnlineForm
      onOnline={(session, qr) => {
        setActiveSession(session);
        setQrImageDataUrl(qr);
      }}
    />
  );
}
