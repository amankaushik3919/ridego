"use client";

import { useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket";

interface UseRideSocketOptions {
  sessionId: string | null;
  onSeatUpdate?: (data: { sessionId: string; availableSeats: number }) => void;
  onSessionEnded?: (data: {
    sessionId: string;
    reason: "COMPLETED" | "EXPIRED";
  }) => void;
}

export function useRideSocket({
  sessionId,
  onSeatUpdate,
  onSessionEnded,
}: UseRideSocketOptions) {
  const joinedSessionRef = useRef<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const socket = getSocket();
    if (!socket.connected) socket.connect();

    socket.emit("joinSession", { sessionId });
    joinedSessionRef.current = sessionId;

    const handleSeatUpdate = (data: any) => onSeatUpdate?.(data);
    const handleSessionEnded = (data: any) => onSessionEnded?.(data);

    socket.on("seatUpdate", handleSeatUpdate);
    socket.on("sessionEnded", handleSessionEnded);

    return () => {
      socket.emit("leaveSession", { sessionId });
      socket.off("seatUpdate", handleSeatUpdate);
      socket.off("sessionEnded", handleSessionEnded);
    };
  }, [sessionId, onSeatUpdate, onSessionEnded]);
}
