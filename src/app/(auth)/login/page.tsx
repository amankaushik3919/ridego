"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Info,
  Loader2,
  Phone,
  CarFront,
} from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const hydrate = useAuthStore((s) => s.hydrate);
  const user = useAuthStore((s) => s.user);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const handleContinue = async () => {
    if (!phone) {
      toast.error("Enter the number");
      return;
    }
    if (phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    try {
      await authApi.requestOtp(phone);
      localStorage.setItem("rc_pending_phone", phone);
      router.push("/verify-otp");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to send OTP."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background text-on-surface">
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <button
            aria-label="Back"
            onClick={() => router.push("/")}
            className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface transition-all hover:bg-surface-container-high active:scale-90"
          >
            <ArrowLeft className="size-5" />
          </button>
          <span className="font-title-md text-title-md font-semibold text-primary">
            RideGo
          </span>
        </div>
        <button
          aria-label="Help"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant transition-colors hover:bg-surface-container"
        >
          <HelpCircle className="size-5" />
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 pb-12">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[20px] bg-primary text-white shadow-lg shadow-primary/25">
            <CarFront className="size-8" />
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold tracking-tight text-on-surface">
            Welcome back
          </h1>
          <p className="font-body-lg mt-2 text-body-lg text-on-surface-variant">
            Enter your phone number to get started.
          </p>
        </div>

        <Card className="border-none bg-surface-container-lowest shadow-[0_4px_20px_0_rgba(0,0,0,0.04)] ring-1 ring-foreground/5">
          <CardContent className="space-y-5 p-6">
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                handleContinue();
              }}
            >
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant"
                >
                  Phone Number
                </Label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Phone className="size-5 text-on-surface-variant transition-colors group-focus-within:text-primary" />
                  </div>
                  <div className="pointer-events-none absolute inset-y-0 left-11 flex items-center">
                    <span className="font-body-lg text-body-lg font-medium text-on-surface-variant">
                      +91
                    </span>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    maxLength={10}
                    inputMode="numeric"
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, ""))
                    }
                    className="h-14 w-full rounded-xl border-0 bg-surface-container-low pl-20 pr-4 font-body-lg text-body-lg text-on-surface transition-all placeholder:text-outline/70 focus:bg-white focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-primary-fixed-dim/40 bg-primary-fixed/30 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Info className="size-[18px] text-primary" />
                </div>
                <p className="font-body-md text-body-md leading-relaxed text-on-primary-fixed-variant">
                  We&apos;ll send a verification code to this number to ensure
                  your account security.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="h-[54px] w-full rounded-xl bg-primary text-white font-title-md text-body-lg font-semibold shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70 disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <span className="text-white flex gap-2 justify-center">
                      <Loader2 className="size-5 animate-spin" />
                      Sending OTP...
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-white flex gap-2 justify-center">
                      Continue
                      <ArrowRight className="size-5" />
                    </span>
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="font-body-md mt-6 text-center text-outline">
          By continuing, you agree to our{" "}
          <a className="font-semibold text-primary hover:underline" href="#">
            Terms of Service
          </a>{" "}
          and{" "}
          <a className="font-semibold text-primary hover:underline" href="#">
            Privacy Policy
          </a>
          .
        </p>
      </main>

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary-fixed/40 blur-[80px]" />
        <div className="absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-secondary-container/30 blur-[90px]" />
      </div>
    </div>
  );
}
