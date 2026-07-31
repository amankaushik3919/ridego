"use client";

import { useEffect, useState } from "react";
import { ridesApi } from "@/lib/api/rides";
import { usersApi } from "@/lib/api/users";
import { DriverDestination } from "@/types";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Props {
  onOnline: (session: any, qrImageDataUrl: string) => void;
}

export function GoOnlineToggle({ onOnline }: Props) {
  const [isOn, setIsOn] = useState(false);
  const [destinations, setDestinations] = useState<DriverDestination[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    usersApi.getDestinations().then(({ data }) => setDestinations(data));
  }, []);

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

  const handleToggle = async (checked: boolean) => {
    if (!checked) {
      // Toggle OFF hone par turant offline ho jaaye (destination select ki zaroorat nahi)
      setIsOn(false);
      return;
    }

    if (destinations.length === 0) {
      toast.error("Pehle Profile mein jaakar apni destinations add karein.");
      return;
    }

    setIsOn(true); // dropdown dikhao, submit hone tak online nahi hoga
  };

  const handleConfirmOnline = async () => {
    if (!selectedId) {
      toast.error("Destination select karein.");
      return;
    }

    setLoading(true);
    try {
      const { lat, lng } = await getLocation();
      const { data } = await ridesApi.goOnline({
        destinationId: selectedId,
        lat,
        lng,
      });
      toast.success("You are now online!");
      onOnline(data, data.qrImageDataUrl);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to go online.",
      );
      setIsOn(false);
    } finally {
      setLoading(false);
    }
  };

  const selectedDistance = destinations.find(
    (d) => d.id === selectedId,
  )?.distanceKm;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Driver Status</CardTitle>
        <CardDescription>
          Online hone ke liye toggle on karein aur destination select karein.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="online-toggle">
            {isOn ? "🟢 Going Online..." : "⚪ Offline"}
          </Label>
          <Switch
            id="online-toggle"
            checked={isOn}
            onCheckedChange={handleToggle}
          />
        </div>

        {isOn && (
          <div className="space-y-3 border-t pt-4">
            <div className="space-y-2">
              <Label>Select Destination</Label>
              <Select value={selectedId} onValueChange={setSelectedId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a destination" />
                </SelectTrigger>
                <SelectContent>
                  {destinations.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedDistance && (
                <p className="text-sm text-muted-foreground">
                  Distance: {selectedDistance} km
                </p>
              )}
            </div>

            <Button
              className="w-full"
              onClick={handleConfirmOnline}
              disabled={loading}
            >
              {loading ? "Going online..." : "Confirm & Go Online"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
