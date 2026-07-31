"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";

interface UseRideSocketOptions {
  sessionId: string | null;
  onSeatUpdate?: (data: { sessionId: string; availableSeats: number }) => void;
  onSessionEnded?: (data: {
    sessionId: string;
    reason: "COMPLETED" | "EXPIRED";
  }) => void;
  onDriverLocation?: (data: {
    sessionId: string;
    lat: number;
    lng: number;
  }) => void;
}

export function useRideSocket({
  sessionId,
  onSeatUpdate,
  onSessionEnded,
  onDriverLocation,
}: UseRideSocketOptions) {
  useEffect(() => {
    if (!sessionId) return;

    const socket = getSocket();

    const doJoin = () => {
      console.log("[socket] joining session:", sessionId);
      socket.emit("joinSession", { sessionId });
    };

    if (socket.connected) {
      doJoin();
    } else {
      socket.connect();
      socket.once("connect", () => {
        console.log("[socket] connected:", socket.id);
        doJoin();
      });
    }

    const handleSeatUpdate = (data: any) => {
      console.log("[socket] seatUpdate received:", data);
      if (data.sessionId === sessionId) onSeatUpdate?.(data);
    };

    const handleSessionEnded = (data: any) => {
      console.log("[socket] sessionEnded received:", data);
      if (data.sessionId === sessionId) onSessionEnded?.(data);
    };

    const handleDriverLocation = (data: any) => {
      if (data.sessionId === sessionId) onDriverLocation?.(data);
    };

    socket.on("seatUpdate", handleSeatUpdate);
    socket.on("sessionEnded", handleSessionEnded);
    socket.on("driverLocation", handleDriverLocation);
    socket.on("connect_error", (err) =>
      console.error("[socket] connect_error:", err.message),
    );

    return () => {
      socket.emit("leaveSession", { sessionId });
      socket.off("seatUpdate", handleSeatUpdate);
      socket.off("sessionEnded", handleSessionEnded);
      socket.off("driverLocation", handleDriverLocation);
    };
  }, [sessionId, onSeatUpdate, onSessionEnded, onDriverLocation]);
}
