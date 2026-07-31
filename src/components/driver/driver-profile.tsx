"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CarFront,
  CalendarDays,
  Clock,
  Settings,
  HelpCircle,
  LogOut,
  Plus,
  Trash2,
  ChevronRight,
  MapPin,
  UserRound,
  Volume2,
  IndianRupee,
} from "lucide-react";
import { usersApi } from "@/lib/api/users";
import { ridesApi } from "@/lib/api/rides";
import { useAuthStore } from "@/lib/store/auth-store";
import { useSpeech } from "@/lib/hooks/use-speech";
import { DriverDestination } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage, cn } from "@/lib/utils";
import { toast } from "sonner";

export function DriverProfile() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [vehicle, setVehicle] = useState<{
    vehicleNumber: string;
    vehicleModel: string | null;
    totalSeats: number;
    farePerRider: number | null;
  } | null>(null);
  const [stats, setStats] = useState<{
    totalRides: number;
    totalRiders: number;
    estimatedRevenue: number;
    farePerRider: number;
  } | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [destinations, setDestinations] = useState<DriverDestination[]>([]);
  const [label, setLabel] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [adding, setAdding] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const { speak, stop, speaking, speakingId } = useSpeech();
  const maxDestinations = 10;
  const atLimit = destinations.length >= maxDestinations;

  // Dialogs
  const [destDialogOpen, setDestDialogOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [nameLoading, setNameLoading] = useState(false);

  const [fareDialogOpen, setFareDialogOpen] = useState(false);
  const [fare, setFare] = useState<string>("");
  const [fareLoading, setFareLoading] = useState(false);

  const refreshDestinations = async () => {
    try {
      const { data } = await usersApi.getDestinations();
      setDestinations(data);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [{ data: profileData }, { data: statsData }] = await Promise.all([
          usersApi.getDriverProfile(),
          ridesApi.getDriverStats(),
        ]);
        setVehicle(profileData);
        setStats(statsData);
        if (profileData.farePerRider != null) {
          setFare(String(profileData.farePerRider));
        }
      } catch {
        /* ignore */
      }
      await refreshDestinations();
      setInitialLoading(false);
    })();
  }, []);

  const handleAddDestination = async () => {
    if (!label.trim() || !distanceKm) {
      toast.error("Please enter destination name and distance.");
      return;
    }
    if (destinations.length >= maxDestinations) {
      toast.error(`You can only add up to ${maxDestinations} destinations.`);
      return;
    }
    setAdding(true);
    try {
      await usersApi.addDestination({
        label,
        distanceKm: Number(distanceKm),
      });
      toast.success("Destination added!");
      setLabel("");
      setDistanceKm("");
      await refreshDestinations();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to add destination."));
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteDestination = async (id: string) => {
    try {
      await usersApi.deleteDestination(id);
      toast.success("Destination removed.");
      await refreshDestinations();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to remove destination."));
    }
  };

  const handleSaveFare = async () => {
    const fareNum = Number(fare);
    if (!fare.trim() || isNaN(fareNum) || fareNum <= 0) {
      toast.error("Please enter a valid fare amount.");
      return;
    }
    setFareLoading(true);
    try {
      await usersApi.updateDriverProfile({ farePerRider: fareNum });
      toast.success("Per person fare saved!");
      setFareDialogOpen(false);
      const { data: statsData } = await ridesApi.getDriverStats();
      setStats(statsData);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save fare."));
    } finally {
      setFareLoading(false);
    }
  };

  const handleSaveName = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    setNameLoading(true);
    try {
      const { data } = await usersApi.updateProfile(name.trim());
      updateUser(data);
      toast.success("Profile updated!");
      setAccountDialogOpen(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to update profile."));
    } finally {
      setNameLoading(false);
    }
  };

  const handleLogout = () => {
    setLogoutLoading(true);
    clearAuth();
    router.push("/login");
  };

  const phone = user?.phone?.replace("+91", "") ?? "";

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <section className="flex flex-col items-center text-center">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="mt-4 h-8 w-36" />
          <Skeleton className="mt-2 h-5 w-32" />
        </section>
        <Skeleton className="h-19 w-full rounded-[20px]" />
        <section className="grid grid-cols-2 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </section>
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/25">
          <span className="font-display-lg text-display-lg font-bold">
            {(user?.name ?? "D").charAt(0).toUpperCase()}
          </span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold tracking-tight text-on-surface">
          {user?.name ?? "Driver"}
        </h1>
        <p className="font-body-md mt-1 flex items-center gap-1 text-body-md text-on-surface-variant">
          +91 {phone}
        </p>
      </section>

      {vehicle && (
        <section className="flex items-center justify-between rounded-[20px] border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-fixed text-primary">
              <CarFront className="size-6" />
            </div>
            <div>
              <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Vehicle Number
              </p>
              <p className="font-title-md text-title-md font-semibold text-on-surface">
                {vehicle.vehicleNumber}
              </p>
            </div>
          </div>
          <span className="font-label-sm rounded-full bg-primary-fixed px-3 py-1 text-label-sm font-semibold text-on-primary-fixed-variant">
            {vehicle.totalSeats} seats
          </span>
        </section>
      )}

      {stats && (
        <section className="grid grid-cols-2 gap-4">
          <div className="glass-card flex flex-col gap-2 rounded-xl p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-container/30 text-secondary">
              <CalendarDays className="size-5" />
            </span>
            <span className="font-label-sm mt-2 text-label-sm uppercase tracking-wider text-on-surface-variant">
              Total Rides
            </span>
            <span className="font-title-md text-title-md font-bold text-on-surface">
              {stats.totalRides}
            </span>
          </div>
          <div className="glass-card flex flex-col gap-2 rounded-xl p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-fixed/30 text-primary">
              <Clock className="size-5" />
            </span>
            <span className="font-label-sm mt-2 text-label-sm uppercase tracking-wider text-on-surface-variant">
              Revenue
            </span>
            <span className="font-title-md text-title-md font-bold text-on-surface">
              ₹{stats.estimatedRevenue}
            </span>
          </div>
        </section>
      )}

      <section className="space-y-2">
        <button
          onClick={() => setDestDialogOpen(true)}
          className="flex w-full items-center justify-between rounded-xl bg-surface-container-lowest px-4 py-3.5 shadow-sm transition-all hover:bg-surface-container-low active:scale-[0.98]"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-fixed/30">
              <MapPin className="size-5 text-primary" />
            </span>
            <span className="font-body-lg text-body-lg">Destinations</span>
          </span>
          <ChevronRight className="size-5 text-outline" />
        </button>

        <button
          onClick={() => setAccountDialogOpen(true)}
          className="flex w-full items-center justify-between rounded-xl bg-surface-container-lowest px-4 py-3.5 shadow-sm transition-all hover:bg-surface-container-low active:scale-[0.98]"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-fixed/30">
              <Settings className="size-5 text-primary" />
            </span>
            <span className="font-body-lg text-body-lg">Account Settings</span>
          </span>
          <ChevronRight className="size-5 text-outline" />
        </button>

        <button
          onClick={() => setFareDialogOpen(true)}
          className="flex w-full items-center justify-between rounded-xl bg-surface-container-lowest px-4 py-3.5 shadow-sm transition-all hover:bg-surface-container-low active:scale-[0.98]"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-fixed/30">
              <IndianRupee className="size-5 text-primary" />
            </span>
            <span className="flex flex-col text-left">
              <span className="font-body-lg text-body-lg">Per Person Fare</span>
              <span className="font-body-md text-body-md text-on-surface-variant">
                {stats?.farePerRider != null && stats.farePerRider > 0
                  ? `₹${stats.farePerRider} per rider`
                  : "Set fare per rider"}
              </span>
            </span>
          </span>
          <ChevronRight className="size-5 text-outline" />
        </button>

        <button className="flex w-full items-center justify-between rounded-xl bg-surface-container-lowest px-4 py-3.5 shadow-sm transition-all hover:bg-surface-container-low active:scale-[0.98]">
          <span className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-fixed/30">
              <HelpCircle className="size-5 text-primary" />
            </span>
            <span className="font-body-lg text-body-lg">Support & FAQ</span>
          </span>
          <ChevronRight className="size-5 text-outline" />
        </button>
      </section>

      <Button
        onClick={handleLogout}
        disabled={logoutLoading}
        variant="destructive"
        className={cn(
          "h-13.5 w-full rounded-xl font-title-md text-body-lg font-semibold",
          logoutLoading && "opacity-70",
        )}
      >
        <LogOut className="size-5" />
        {logoutLoading ? "Logging out..." : "Logout"}
      </Button>

      {/* Destinations Dialog */}
      <Dialog open={destDialogOpen} onOpenChange={setDestDialogOpen}>
        <DialogContent className="rounded-[20px] bg-background p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="flex items-center justify-between font-title-md text-title-md text-on-surface">
              Destinations
              <span
                className={cn(
                  "font-label-sm rounded-full px-3 py-1 text-label-sm font-semibold",
                  atLimit
                    ? "bg-error-container text-on-error-container"
                    : "bg-primary-fixed text-primary",
                )}
              >
                {destinations.length}/{maxDestinations}
              </span>
            </DialogTitle>
            <DialogDescription className="font-body-md text-body-md text-on-surface-variant">
              Add routes so you can select them when going online.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-6">
            <div className="flex gap-2">
              <Input
                placeholder="Sector 62, Noida"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="h-12 flex-1 rounded-xl border-0 bg-surface-container-low px-3 font-body-md text-body-md focus:bg-white focus:ring-2 focus:ring-primary"
              />
              <Input
                type="number"
                step="0.1"
                placeholder="km"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                className="h-12 w-20 rounded-xl border-0 bg-surface-container-low px-3 font-body-md text-body-md focus:bg-white focus:ring-2 focus:ring-primary"
              />
              <Button
                size="icon"
                onClick={handleAddDestination}
                disabled={adding || atLimit}
                className="h-12 w-12 shrink-0 rounded-xl bg-primary text-white"
              >
                {adding ? (
                  <span className="size-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  <Plus className="size-5" />
                )}
              </Button>
            </div>
            {atLimit && (
              <p className="font-body-md rounded-xl bg-error-container/50 px-4 py-3 text-body-md text-on-error-container">
                You have reached the limit of {maxDestinations} destinations.
                Remove one to add a new one.
              </p>
            )}

            <div className="max-h-64 space-y-2 overflow-y-auto">
              {destinations.length === 0 ? (
                <p className="font-body-md rounded-xl bg-surface-container-low px-4 py-3 text-body-md text-on-surface-variant">
                  No destinations added yet.
                </p>
              ) : (
                destinations.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label={`Speak ${d.label}`}
                        onClick={() => {
                          if (speaking && speakingId === d.id) {
                            stop();
                          } else {
                            speak(d.label, d.id);
                          }
                        }}
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all active:scale-90",
                          speaking && speakingId === d.id
                            ? "bg-primary text-white"
                            : "bg-primary/10 text-primary",
                        )}
                      >
                        <Volume2
                          className={cn(
                            "size-5",
                            speaking && speakingId === d.id && "animate-pulse",
                          )}
                        />
                      </button>
                      <div>
                        <p className="font-body-lg text-body-lg font-medium text-on-surface">
                          {d.label}
                        </p>
                        <p className="font-body-md text-body-md text-on-surface-variant">
                          {d.distanceKm} km
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteDestination(d.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-error transition-colors hover:bg-error-container/30"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter className="px-6 pb-6">
            {/* <Button
              variant="outline"
              onClick={() => setDestDialogOpen(false)}
              className="h-12 flex-1 rounded-xl"
            >
              
              Close
            </Button> */}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Settings Dialog */}
      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent className="rounded-[20px] bg-background p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="flex items-center gap-2 font-title-md text-title-md text-on-surface">
              <UserRound className="size-5 text-primary" />
              Account Settings
            </DialogTitle>
            <DialogDescription className="font-body-md text-body-md text-on-surface-variant">
              Update your personal information.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-6">
            <div className="space-y-2">
              <Label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Full Name
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="h-14 w-full rounded-xl border-0 bg-surface-container-low px-4 font-body-lg text-body-lg focus:bg-white focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Phone Number
              </Label>
              <Input
                value={`+91 ${phone}`}
                disabled
                className="h-14 w-full rounded-xl border-0 bg-surface-container-low px-4 font-body-lg text-body-lg opacity-70"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 px-6 pb-6">
            {/* <Button
              variant="outline"
              onClick={() => setAccountDialogOpen(false)}
              className="h-12 flex-1 rounded-xl"
            >
              Cancel
            </Button> */}
            <Button
              onClick={handleSaveName}
              disabled={nameLoading}
              className="h-12 flex-1 rounded-xl bg-primary text-white font-title-md text-body-lg font-semibold py-3"
            >
              {nameLoading ? (
                <span className="size-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Per Person Fare Dialog */}
      <Dialog open={fareDialogOpen} onOpenChange={setFareDialogOpen}>
        <DialogContent className="rounded-[20px] bg-background p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="flex items-center gap-2 font-title-md text-title-md text-on-surface">
              <IndianRupee className="size-5 text-primary" />
              Per Person Fare
            </DialogTitle>
            <DialogDescription className="font-body-md text-body-md text-on-surface-variant">
              Set how much to charge each rider. This is used to calculate your
              estimated earnings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-6">
            <div className="space-y-2">
              <Label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                Fare per rider (₹)
              </Label>
              <Input
                type="number"
                step="1"
                min="0"
                value={fare}
                onChange={(e) => setFare(e.target.value)}
                placeholder="e.g. 10"
                className="h-14 w-full rounded-xl border-0 bg-surface-container-low px-4 font-body-lg text-body-lg focus:bg-white focus:ring-2 focus:ring-primary"
              />
            </div>
            <p className="font-body-md rounded-xl bg-primary-fixed/30 px-4 py-3 text-body-md text-primary">
              Example: ₹{fare || "10"} per rider × 4 riders = ₹
              {fare ? Number(fare) * 4 : 40} per trip
            </p>
          </div>

          <DialogFooter className="flex gap-2 px-6 pb-6">
            {/* <Button
              variant="outline"
              onClick={() => setFareDialogOpen(false)}
              className="h-12 flex-1 rounded-xl"
            >
              Cancel
            </Button> */}
            <Button
              onClick={handleSaveFare}
              disabled={fareLoading}
              className="h-12 flex-1 rounded-xl bg-primary text-white font-title-md text-body-lg font-semibold py-3 "
            >
              {fareLoading ? (
                <span className="size-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                "Save Fare"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
