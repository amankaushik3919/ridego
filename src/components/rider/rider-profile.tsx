"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  UserRound,
  Settings,
  ChevronRight,
  History,
  MapPin,
  CarFront,
} from "lucide-react";
import { usersApi } from "@/lib/api/users";
import { ridesApi } from "@/lib/api/rides";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn, getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

interface RideHistoryItem {
  rideId: string;
  destination: string;
  distanceKm: number;
  totalSeats: number;
  seatsBooked: number;
  status: string;
  boardedAt: string;
  completedAt: string;
  vehicleNumber: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function RiderProfile() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [nameLoading, setNameLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<RideHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const phone = user?.phone?.replace("+91", "") ?? "";

  const openHistory = async () => {
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const { data } = await ridesApi.getRiderRideHistory();
      setHistory(data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load ride history."));
    } finally {
      setHistoryLoading(false);
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
      setAccountOpen(false);
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

  return (
    <div className="space-y-6">
      <section className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/25">
          <span className="font-display-lg text-display-lg font-bold">
            {(user?.name ?? "R").charAt(0).toUpperCase()}
          </span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold tracking-tight text-on-surface">
          {user?.name ?? "Rider"}
        </h1>
        <p className="font-body-md mt-1 flex items-center gap-1 text-body-md text-on-surface-variant">
          +91 {phone}
        </p>
      </section>

      <section className="space-y-3">
        <button
          onClick={() => setAccountOpen(true)}
          className="flex w-full items-center justify-between rounded-xl bg-surface-container-lowest px-4 py-3.5 shadow-sm transition-all hover:bg-surface-container-low active:scale-[0.98]"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-fixed/30">
              <Settings className="size-5 text-primary" />
            </span>
            <span className="flex flex-col text-left">
              <span className="font-body-lg text-body-lg">Account Settings</span>
              <span className="font-body-md text-body-md text-on-surface-variant">
                Change your name
              </span>
            </span>
          </span>
          <ChevronRight className="size-5 text-outline" />
        </button>

        <button
          onClick={openHistory}
          className="flex w-full items-center justify-between rounded-xl bg-surface-container-lowest px-4 py-3.5 shadow-sm transition-all hover:bg-surface-container-low active:scale-[0.98]"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-fixed/30">
              <History className="size-5 text-primary" />
            </span>
            <span className="flex flex-col text-left">
              <span className="font-body-lg text-body-lg">Ride History</span>
              <span className="font-body-md text-body-md text-on-surface-variant">
                Latest 10 rides
              </span>
            </span>
          </span>
          <ChevronRight className="size-5 text-outline" />
        </button>

        <div className="flex items-center justify-between rounded-xl bg-surface-container-lowest px-4 py-3.5 shadow-sm">
          <span className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-fixed/30">
              <UserRound className="size-5 text-primary" />
            </span>
            <span className="flex flex-col">
              <span className="font-body-md text-body-md text-on-surface-variant">
                Account Type
              </span>
              <span className="font-body-lg text-body-lg font-semibold text-on-surface">
                Rider
              </span>
            </span>
          </span>
        </div>
      </section>

      <Button
        onClick={handleLogout}
        disabled={logoutLoading}
        variant="destructive"
        className={cn(
          "h-[54px] w-full rounded-xl font-title-md text-body-lg font-semibold",
          logoutLoading && "opacity-70",
        )}
      >
        <LogOut className="size-5" />
        {logoutLoading ? "Logging out..." : "Logout"}
      </Button>

      {/* Ride History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="rounded-[20px] bg-background p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="flex items-center gap-2 font-title-md text-title-md text-on-surface">
              <History className="size-5 text-primary" />
              Ride History
            </DialogTitle>
            <DialogDescription className="font-body-md text-body-md text-on-surface-variant">
              Your latest 10 rides
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-80 space-y-2 overflow-y-auto px-6">
            {historyLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : history.length === 0 ? (
              <p className="font-body-md rounded-xl bg-surface-container-low px-4 py-3 text-body-md text-on-surface-variant">
                No rides yet. Book a rickshaw to see your history here.
              </p>
            ) : (
              history.map((h) => (
                <div
                  key={h.rideId}
                  className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-body-lg flex items-center gap-1.5 text-body-lg font-semibold text-on-surface">
                      <MapPin className="size-4 text-primary" />
                      {h.destination}
                    </p>
                    <span className="font-label-sm shrink-0 rounded-full bg-primary-fixed px-2.5 py-0.5 text-label-sm font-semibold text-primary">
                      {formatDate(h.completedAt || h.boardedAt)}
                    </span>
                  </div>
                  <p className="font-body-md mt-1 flex items-center gap-1.5 text-body-md text-on-surface-variant">
                    <CarFront className="size-3.5" />
                    {h.vehicleNumber} · {h.distanceKm} km
                  </p>
                </div>
              ))
            )}
          </div>

          <DialogFooter className="px-6 pb-6">
            <Button
              variant="outline"
              onClick={() => setHistoryOpen(false)}
              className="h-12 w-full rounded-xl"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Settings Dialog */}
      <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
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
            <Button
              variant="outline"
              onClick={() => setAccountOpen(false)}
              className="h-12 flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveName}
              disabled={nameLoading}
              className="h-12 flex-1 rounded-xl bg-primary text-white font-title-md text-body-lg font-semibold py-3 text-white"
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
    </div>
  );
}

