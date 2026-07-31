"use client";

import { useEffect, useState } from "react";
import { usersApi } from "@/lib/api/users";
import { DriverDestination } from "@/types";
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

export function ManageDestinations() {
  const [destinations, setDestinations] = useState<DriverDestination[]>([]);
  const [label, setLabel] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchDestinations = async () => {
    const { data } = await usersApi.getDestinations();
    setDestinations(data);
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const handleAdd = async () => {
    if (!label || !distanceKm) {
      toast.error("Destination naam aur distance daalein.");
      return;
    }
    setLoading(true);
    try {
      await usersApi.addDestination({ label, distanceKm: Number(distanceKm) });
      toast.success("Destination added!");
      setLabel("");
      setDistanceKm("");
      fetchDestinations();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add destination.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await usersApi.deleteDestination(id);
      toast.success("Destination removed.");
      fetchDestinations();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to remove destination.",
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Destinations</CardTitle>
        <CardDescription>
          Apne common routes add karein — Go Online karte waqt inme se select
          kar payenge.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Sector 62, Noida"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <Input
            type="number"
            step="0.1"
            placeholder="Distance (km)"
            className="w-32"
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
          />
          <Button onClick={handleAdd} disabled={loading}>
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {destinations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Koi destination add nahi ki abhi.
            </p>
          ) : (
            destinations.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between rounded-md border p-2"
              >
                <span className="text-sm">
                  {d.label} — {d.distanceKm} km
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(d.id)}
                >
                  Remove
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
