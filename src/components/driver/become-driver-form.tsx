"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usersApi } from "@/lib/api/users";
import { useAuthStore } from "@/lib/store/auth-store";
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

export function BecomeDriverForm() {
  const router = useRouter();
  const updateUser = useAuthStore((s) => s.updateUser);
  const user = useAuthStore((s) => s.user);

  const [rickshawNumber, setRickshawNumber] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [totalSeats, setTotalSeats] = useState("4");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!rickshawNumber || !totalSeats) {
      toast.error("Rickshaw number aur seat count zaroori hai.");
      return;
    }

    setLoading(true);
    try {
      await usersApi.becomeDriver({
        rickshawNumber,
        vehicleModel: vehicleModel || undefined,
        totalSeats: Number(totalSeats),
      });

      if (user) updateUser({ ...user, role: "BOTH" });

      toast.success("Driver profile created!");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to create driver profile.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Become a Driver</CardTitle>
        <CardDescription>Apni rickshaw ki details daalein.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Rickshaw Number</Label>
          <Input
            placeholder="UP16-1234"
            value={rickshawNumber}
            onChange={(e) => setRickshawNumber(e.target.value)}
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
          {loading ? "Saving..." : "Save & Continue"}
        </Button>
      </CardContent>
    </Card>
  );
}
