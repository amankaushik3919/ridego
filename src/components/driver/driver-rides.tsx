"use client";

import { useEffect, useState, useCallback } from "react";
import { ridesApi } from "@/lib/api/rides";
import { usersApi } from "@/lib/api/users";
import { useRideSocket } from "@/lib/hooks/use-ride-socket";
import { DriverDestination, ActiveSession } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  QrCode,
  MapPin,
  ChevronDown,
  X,
  Navigation,
  Volume2,
} from "lucide-react";
import { useSpeech } from "@/lib/hooks/use-speech";
import { getErrorMessage, cn, haversineMeters } from "@/lib/utils";
import { SlideToStart } from "./slide-to-start";
import { toast } from "sonner";

export function DriverRides() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [isOn, setIsOn] = useState(false);
  const [destinations, setDestinations] = useState<DriverDestination[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [destPickerOpen, setDestPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [qrImageDataUrl, setQrImageDataUrl] = useState<string | null>(null);
  const [availableSeats, setAvailableSeats] = useState(0);
  const [started, setStarted] = useState(false);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const { speak, stop, speaking, speakingId } = useSpeech();

  useEffect(() => {
    (async () => {
      try {
        const [{ data: destData }, { data: sessionData }] = await Promise.all([
          usersApi.getDestinations(),
          ridesApi.getMyActiveSession(),
        ]);
        setDestinations(destData);
        if (sessionData.active) {
          setSession(sessionData);
          setAvailableSeats(sessionData.availableSeats);
          setStarted(sessionData.status === "STARTED");
          setIsOn(true);
        }
      } catch {
        toast.error("Failed to load destinations.");
      } finally {
        setInitialLoading(false);
      }
    })();
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { data } = await ridesApi.getMyActiveSession();
      if (data.active) {
        setAvailableSeats(data.availableSeats);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useRideSocket({
    sessionId: session?.sessionId ?? null,
    onSeatUpdate: (data) => {
      setAvailableSeats(data.availableSeats);
      toast.info(`${data.availableSeats} seats left.`);
      refreshSession();
    },
    onSessionEnded: () => {
      toast.info("Ride session ended.");
      setSession(null);
      setQrImageDataUrl(null);
      setIsOn(false);
    },
  });

  const getLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported."));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => reject(new Error("Location denied, Please allow location.")),
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });
  };

  useEffect(() => {
    if (!isOn || !session?.sessionId) return;

    let lastLat: number | null = null;
    let lastLng: number | null = null;
    let sending = false;
    let stopped = false;

    const sendIfMoved = async (lat: number, lng: number) => {
      if (sending || stopped) return;
      if (
        lastLat !== null &&
        lastLng !== null &&
        haversineMeters(lastLat, lastLng, lat, lng) < 10
      ) {
        return;
      }
      sending = true;
      try {
        await ridesApi.updateLocation(lat, lng);
        lastLat = lat;
        lastLng = lng;
      } catch {
        /* transient error — agle tick par retry */
      } finally {
        sending = false;
      }
    };

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        void sendIfMoved(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        /* permission denied — silent, nearby list purane location se hi chalega */
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );

    return () => {
      stopped = true;
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, [isOn, session?.sessionId]);

  const handleToggle = async (checked: boolean) => {
    if (!checked) {
      await handleGoOffline();
      return;
    }

    if (destinations.length === 0) {
      toast.error("Please add destinations from your profile first.");
      return;
    }

    setIsOn(true);
  };

  const handleConfirmOnline = async () => {
    if (!selectedId) {
      toast.error("Please select a destination.");
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
      setSession(data);
      setAvailableSeats(data.availableSeats);
      setQrImageDataUrl(data.qrImageDataUrl);
      setStarted(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to go online."));
      setIsOn(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStartRide = async () => {
    setStarting(true);
    try {
      const { data } = await ridesApi.startRide();
      toast.success("Ride started! Riders can now board.");
      setStarted(true);
      if (data.availableSeats !== undefined) {
        setAvailableSeats(data.availableSeats);
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to start ride."));
    } finally {
      setStarting(false);
    }
  };

  const handleGoOffline = async () => {
    if (!session) {
      setIsOn(false);
      return;
    }
    setEnding(true);
    try {
      const { data } = await ridesApi.goOffline();
      if (data.rideRecorded) {
        toast.success("Ride completed and saved!");
      } else {
        toast.info("You went offline. Ride was not counted.");
      }
      setSession(null);
      setQrImageDataUrl(null);
      setIsOn(false);
      setStarted(false);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to end session."));
    } finally {
      setEnding(false);
    }
  };

  const handleRegenerateQr = async () => {
    setQrLoading(true);
    try {
      const { data } = await ridesApi.regenerateQr();
      setQrImageDataUrl(data.qrImageDataUrl);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to regenerate QR."));
    } finally {
      setQrLoading(false);
    }
  };

  const selectedDestination = destinations.find((d) => d.id === selectedId);

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <section>
          <Skeleton className="h-9 w-32" />
          <Skeleton className="mt-2 h-5 w-56" />
        </section>
        <Skeleton className="h-21 w-full rounded-[20px]" />
        <Skeleton className="h-48 w-full rounded-[20px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold tracking-tight text-on-surface">
          Rides
        </h1>
        <p className="font-body-md mt-1 text-body-md text-on-surface-variant">
          Go online and let riders find you.
        </p>
      </section>

      <div
        role="button"
        tabIndex={0}
        aria-disabled={ending || started}
        onClick={() => {
          if (ending || started) return;
          if (isOn) {
            handleGoOffline();
          } else {
            handleToggle(true);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            if (ending || started) return;
            if (isOn) {
              handleGoOffline();
            } else {
              handleToggle(true);
            }
          }
        }}
        className={cn(
          "flex w-full items-center justify-between rounded-[20px] border-2 p-4 text-left transition-all active:scale-[0.99]",
          isOn
            ? "border-secondary bg-secondary-container/30 shadow-[0_8px_20px_-4px_rgba(0,108,73,0.35)]"
            : "border-outline-variant bg-surface-container-lowest shadow-sm",
          (ending || started) && "pointer-events-none opacity-60",
        )}
      >
        <div>
          <p
            className={cn(
              "font-title-md text-title-md font-semibold",
              isOn ? "text-on-secondary-container" : "text-on-surface",
            )}
          >
            {isOn ? "You are Online" : "Go Online"}
          </p>
          <p className="font-body-md mt-0.5 flex items-center gap-1.5 text-body-md text-on-surface-variant">
            <span
              className={cn(
                "size-2 rounded-full",
                isOn ? "bg-secondary" : "bg-outline",
              )}
            />
            {started
              ? "Ride in progress"
              : isOn
                ? "Currently online"
                : "Currently offline"}
          </p>
        </div>
        <Switch
          checked={isOn}
          onCheckedChange={handleToggle}
          disabled={started}
          className="pointer-events-none data-[state=checked]:bg-secondary"
        />
      </div>

      {isOn && !session && (
        <section className="space-y-4 rounded-[20px] border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-sm">
          <div className="space-y-2">
            <Label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              Select Destination
            </Label>
            <button
              onClick={() => setDestPickerOpen(true)}
              className="flex h-14 w-full items-center justify-between rounded-xl border-2 border-primary/40 bg-surface-container-low px-4 font-body-lg text-body-lg transition-all active:scale-[0.99]"
            >
              {selectedDestination ? (
                <span className="flex items-center gap-2 text-on-surface">
                  <MapPin className="size-5 text-primary" />
                  {selectedDestination.label}
                </span>
              ) : (
                <span className="flex items-center gap-2 text-on-surface-variant">
                  <Navigation className="size-5 text-primary" />
                  Choose a destination
                </span>
              )}
              <ChevronDown className="size-5 text-on-surface-variant" />
            </button>
            {selectedDestination && (
              <p className="font-body-md px-1 text-body-md text-on-surface-variant">
                Distance: {selectedDestination.distanceKm} km
              </p>
            )}
          </div>

          <Button
            onClick={handleConfirmOnline}
            disabled={loading}
            className="h-13.5 w-full rounded-xl bg-primary text-white font-title-md text-body-lg font-semibold shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98] [&_svg]:text-white"
          >
            {loading ? (
              <>
                <span className="text-white justify-center flex gap-2">
                  <Loader2 className="size-5 animate-spin" />
                  Going online...
                </span>
              </>
            ) : (
              <span className="text-white">Confirm & Go Online</span>
            )}
          </Button>
        </section>
      )}

      {destPickerOpen && (
        // TODO: Error if any to change z-[100]
        <div className="fixed inset-0 z-100 flex flex-col bg-background">
          <header className="flex h-16 items-center justify-between px-5">
            <span className="font-title-md text-title-md font-semibold text-on-surface">
              Select Destination
            </span>
            <button
              aria-label="Close"
              onClick={() => setDestPickerOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant"
            >
              <X className="size-5" />
            </button>
          </header>

          <div className="mx-auto w-full max-w-md flex-1 space-y-2 overflow-y-auto px-5 pb-8 pt-2">
            {destinations.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <MapPin className="size-10 text-outline" />
                <p className="font-body-md text-body-md text-on-surface-variant">
                  No destinations yet. Add some from your profile.
                </p>
              </div>
            ) : (
              destinations.map((d) => {
                const active = d.id === selectedId;
                return (
                  <div
                    key={d.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedId(d.id);
                      setDestPickerOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedId(d.id);
                        setDestPickerOpen(false);
                      }
                    }}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left transition-all active:scale-[0.99]",
                      active
                        ? "border-primary bg-primary/5"
                        : "border-transparent bg-surface-container-low",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                        active
                          ? "bg-primary text-white"
                          : "bg-surface-container text-on-surface-variant",
                      )}
                    >
                      <MapPin className="size-5" />
                    </span>
                    <span className="flex-1">
                      <span className="font-title-md block text-title-md font-semibold text-on-surface">
                        {d.label}
                      </span>
                      <span className="font-body-md block text-body-md text-on-surface-variant">
                        {d.distanceKm} km away
                      </span>
                    </span>
                    <button
                      type="button"
                      aria-label={`Speak ${d.label}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (speaking && speakingId === d.id) {
                          stop();
                        } else {
                          speak(d.label, d.id);
                        }
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all active:scale-90",
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
                    {active && (
                      <span className="font-label-sm rounded-full bg-primary px-3 py-1 text-label-sm font-semibold text-white">
                        Selected
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t border-outline-variant/20 bg-surface/80 px-5 py-4 backdrop-blur-md">
            <Button
              onClick={() => setDestPickerOpen(false)}
              disabled={!selectedId}
              className="h-13.5 w-full rounded-xl bg-primary text-white font-title-md text-body-lg font-semibold shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
            >
              {selectedId ? (
                <span className="text-white">Done</span>
              ) : (
                <span className="text-white">Select a destination</span>
              )}
            </Button>
          </div>
        </div>
      )}

      {session && (
        <section className="space-y-4">
          <div className="flex flex-col items-center gap-4 rounded-[20px] border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-sm">
            <div className="flex w-full items-center justify-between">
              <div>
                <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
                  Destination
                </p>
                <p className="font-title-md text-title-md font-semibold text-on-surface">
                  {session.destination}
                </p>
              </div>
              <Badge className="bg-secondary-container text-on-secondary-container hover:bg-secondary-container">
                {started ? "Ride Started" : "Online"}
              </Badge>
            </div>

            {qrImageDataUrl ? (
              <div className="rounded-2xl bg-white p-4 shadow-md">
                <img src={qrImageDataUrl} alt="Ride QR" className="h-52 w-52" />
              </div>
            ) : (
              <div className="flex w-full flex-col items-center gap-3">
                <div className="flex h-52 w-52 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-primary text-center">
                  <QrCode className="size-10 text-primary" />
                  <p className="font-body-md px-4 text-body-md text-on-surface-variant">
                    QR not visible yet
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRegenerateQr}
                  disabled={qrLoading}
                >
                  {qrLoading ? "Loading..." : "Show QR Again"}
                </Button>
              </div>
            )}

            <Badge
              variant="secondary"
              className={
                availableSeats === 0
                  ? "bg-secondary text-white"
                  : "bg-primary-fixed text-on-primary-fixed-variant"
              }
            >
              {availableSeats === 0
                ? "All seats full"
                : `${availableSeats} / ${session.totalSeats} seats available`}
            </Badge>
          </div>

          {!started && (
            <div className="space-y-2">
              <SlideToStart
                onStart={handleStartRide}
                disabled={ending}
                loading={starting}
              />
              <p className="font-body-md px-2 text-center text-body-md text-on-surface-variant">
                Slide to start the ride. Ride will be counted only after you
                start it.
              </p>
            </div>
          )}

          {started && (
            <>
              <Separator />
              <SlideToStart
                onStart={handleGoOffline}
                disabled={ending}
                loading={ending}
                label="Slide to End Ride"
                loadingLabel="Ending ride..."
                variant="destructive"
              />
              <p className="font-body-md px-2 text-center text-body-md text-on-surface-variant">
                Slide to end the ride. It will be counted only if riders
                boarded.
              </p>
            </>
          )}
        </section>
      )}
    </div>
  );
}
