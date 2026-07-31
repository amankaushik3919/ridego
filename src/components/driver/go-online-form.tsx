"use client";

import { useState } from "react";
import { ridesApi } from "@/lib/api/rides";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";

interface Props {
  onOnline: (session: any, qrImageDataUrl: string) => void;
}

export function GoOnlineForm({ onOnline }: { onOnline: () => void }) {
  const [destination, setDestination] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [loading, setLoading] = useState(false);

  const getLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => reject(new Error("Location permission denied.")),
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });
  };

  const handleGoOnline = async () => {
    if (!destination || !distanceKm) {
      toast.error("Destination aur distance daalein.");
      return;
    }

    setLoading(true);
    try {
      const { lat, lng } = await getLocation();

      const { data } = await ridesApi.goOnline({
        destination,
        distanceKm: Number(distanceKm),
        lat,
        lng,
      });

      toast.success("You are now online!");
      onOnline(data, data.qrImageDataUrl);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to go online.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Go Online</CardTitle>
        <CardDescription>
          Destination aur distance set karein, riders ko dikhne lagenge.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Destination</Label>
          <Input
            placeholder="Sector 62, Noida"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Distance (km)</Label>
          <Input
            type="number"
            step="0.1"
            placeholder="3.5"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
          />
        </div>

        <Button className="w-full" onClick={handleGoOnline} disabled={loading}>
          {loading ? "Going online..." : "Go Online"}
        </Button>
      </CardContent>
    </Card>
  );
}
