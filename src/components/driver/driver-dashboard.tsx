"use client";

import { useEffect, useState } from "react";
import { ridesApi } from "@/lib/api/rides";
import { GoOnlineForm } from "./go-online-form";
import { ActiveSessionPanel } from "./active-session-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { GoOnlineToggle } from "./go-online-toggle";

export function DriverDashboard() {
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [qrImageDataUrl, setQrImageDataUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await ridesApi.getMyActiveSession();
        if (data.active) setActiveSession(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Skeleton className="h-64 w-full" />;

  // Session active hai (chahe QR abhi na ho, jaise page-refresh ke baad)
  if (activeSession) {
    return (
      <ActiveSessionPanel
        session={activeSession}
        qrImageDataUrl={qrImageDataUrl} // null bhi ho sakta hai — panel handle karega
        onEnded={() => {
          setActiveSession(null);
          setQrImageDataUrl(null);
        }}
      />
    );
  }

  return (
    <GoOnlineToggle
      onOnline={(session, qr) => {
        setActiveSession(session);
        setQrImageDataUrl(qr);
      }}
    />
  );
}
