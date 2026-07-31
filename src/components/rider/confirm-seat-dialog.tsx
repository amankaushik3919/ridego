"use client";

import { useState } from "react";
import { ridesApi } from "@/lib/api/rides";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface VerifiedInfo {
  sessionId: string;
  destination: string;
  distanceKm: number;
  totalSeats: number;
  availableSeats: number;
}

interface Props {
  open: boolean;
  qrToken: string | null;
  verified: VerifiedInfo | null;
  onClose: () => void;
  onLocked: (sessionId: string, destination: string) => void;
}

export function ConfirmSeatDialog({
  open,
  qrToken,
  verified,
  onClose,
  onLocked,
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!qrToken) return;
    setLoading(true);
    try {
      const { data } = await ridesApi.lockSeat(qrToken);

      if (data.result === "LOCKED") {
        toast.success("Seat locked! Enjoy your ride.");
        onLocked(data.sessionId, data.destination);
      } else if (data.result === "SEATS_FULL") {
        toast.error("Sorry, seats are full on this rickshaw.");
      } else if (data.result === "ALREADY_BOOKED") {
        toast.info("You already have a seat on this ride.");
        onLocked(data.sessionId, data.destination);
      } else {
        toast.error("This ride is no longer available.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to lock seat.");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  if (!verified) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Your Ride</DialogTitle>
          <DialogDescription>
            Is rickshaw jaa raha hai <strong>{verified.destination}</strong> (
            {verified.distanceKm} km). Available seats:{" "}
            {verified.availableSeats}/{verified.totalSeats}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || verified.availableSeats <= 0}
          >
            {loading ? "Locking seat..." : "Confirm & Board"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
