// src/components/driver/register-vehicle-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usersApi } from "@/lib/api/users";
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

export function RegisterVehicleForm() {
  const router = useRouter();

  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [totalSeats, setTotalSeats] = useState("4");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!vehicleNumber || !totalSeats) {
      toast.error("Rickshaw number aur seat count zaroori hai.");
      return;
    }

    setLoading(true);
    try {
      await usersApi.becomeDriver({
        vehicleNumber,
        vehicleModel: vehicleModel || undefined,
        totalSeats: Number(totalSeats),
      });

      toast.success("Vehicle registered!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to register vehicle.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register Your Vehicle</CardTitle>
        <CardDescription>
          Apni rickshaw ki details daalein — isके baad Go Online kar payenge.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Rickshaw Number</Label>
          <Input
            placeholder="UP16-1234"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Vehicle Model (optional)</Label>
          <Input
            placeholder="Mahindra Treo"
            value={vehicleModel}
            onChange={(e) => setVehicleModel(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Total Seats</Label>
          <Input
            type="number"
            min={1}
            max={10}
            value={totalSeats}
            onChange={(e) => setTotalSeats(e.target.value)}
          />
        </div>
        <Button className="w-full" onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Register & Continue"}
        </Button>
      </CardContent>
    </Card>
  );
}
