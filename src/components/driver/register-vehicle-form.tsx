// src/components/driver/register-vehicle-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CarFront, Loader2 } from "lucide-react";
import { usersApi } from "@/lib/api/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

export function RegisterVehicleForm() {
  const router = useRouter();

  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [totalSeats, setTotalSeats] = useState("4");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!vehicleNumber || !totalSeats) {
      toast.error("Vehicle number and seat count are required.");
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
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to register vehicle."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background text-on-surface">
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-12">
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-6 flex h-40 w-full max-w-xs items-center justify-center overflow-hidden rounded-[20px] border border-outline-variant/30 bg-surface-container-low">
            <div className="absolute inset-0 opacity-40">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary-fixed/50 blur-2xl" />
              <div className="absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-secondary-container/40 blur-2xl" />
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <CarFront className="size-16 text-primary" />
              <p className="font-label-sm mt-2 text-label-sm uppercase tracking-widest text-on-surface-variant">
                Vehicle Registration
              </p>
            </div>
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold tracking-tight text-on-surface">
            Register your vehicle
          </h1>
          <p className="font-body-lg mt-2 text-body-lg text-on-surface-variant">
            Add your rickshaw details to start accepting riders.
          </p>
        </div>

        <Card className="border-none bg-surface-container-lowest shadow-[0_4px_20px_0_rgba(0,0,0,0.04)] ring-1 ring-foreground/5">
          <CardContent className="space-y-5 p-6">
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className="space-y-2">
                <Label
                  htmlFor="vehicle-number"
                  className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant"
                >
                  Vehicle Number
                </Label>
                <Input
                  id="vehicle-number"
                  placeholder="UP16-1234"
                  value={vehicleNumber}
                  onChange={(e) =>
                    setVehicleNumber(
                      e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ""),
                    )
                  }
                  className="h-14 w-full rounded-xl border-0 bg-surface-container-low px-4 font-body-lg text-body-lg uppercase tracking-wider text-on-surface transition-all placeholder:normal-case placeholder:tracking-normal placeholder:text-outline/70 focus:bg-white focus:ring-2 focus:ring-primary"
                />
                <p className="font-body-md px-1 pt-1 text-[12px] italic text-on-surface-variant/70">
                  Format: State Code + District + Series + Number
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="vehicle-model"
                  className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant"
                >
                  Vehicle Model (optional)
                </Label>
                <Input
                  id="vehicle-model"
                  placeholder="Mahindra Treo"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="h-14 w-full rounded-xl border-0 bg-surface-container-low px-4 font-body-lg text-body-lg text-on-surface transition-all placeholder:text-outline/70 focus:bg-white focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="total-seats"
                  className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant"
                >
                  Total Seats
                </Label>
                <Input
                  id="total-seats"
                  type="number"
                  min={1}
                  max={10}
                  value={totalSeats}
                  onChange={(e) => setTotalSeats(e.target.value)}
                  className="h-14 w-full rounded-xl border-0 bg-surface-container-low px-4 font-body-lg text-body-lg text-on-surface transition-all placeholder:text-outline/70 focus:bg-white focus:ring-2 focus:ring-primary"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-13.5 w-full rounded-xl bg-primary text-white font-title-md text-body-lg font-semibold shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <span className="text-white flex gap-2 justify-center">
                      <Loader2 className="size-5 animate-spin" />
                      Saving...
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-white flex gap-2 justify-center">
                      Register & Continue
                      <ArrowRight className="size-5" />
                    </span>
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary-fixed/40 blur-[80px]" />
        <div className="absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-secondary-container/30 blur-[90px]" />
      </div>
    </div>
  );
}
