"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
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

type Step = "PHONE" | "OTP";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const hydrate = useAuthStore((s) => s.hydrate);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const [step, setStep] = useState<Step>("PHONE");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendTimer(45);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRequestOtp = async () => {
    if (phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    try {
      await authApi.requestOtp(phone);
      toast.success("OTP sent successfully!");
      setStep("OTP");
      startResendTimer();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.verifyOtp(phone, otp);
      setAuth(data.user, data.accessToken, data.refreshToken);

      toast.success(data.isNewUser ? "Account created!" : "Welcome back!");

      // router.push(data.user.role === null ? "/dashboard" : "/dashboard");
      router.push(data.user.role === null ? "/onboarding" : "/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    await handleRequestOtp();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>RideConnect</CardTitle>
          <CardDescription>
            {step === "PHONE"
              ? "Enter your phone number to continue"
              : `OTP sent to ${phone}`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {step === "PHONE" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">+91</span>
                  <Input
                    id="phone"
                    type="tel"
                    maxLength={10}
                    placeholder="9999900001"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, ""))
                    }
                  />
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleRequestOtp}
                disabled={loading}
              >
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </Button>

              <div className="flex justify-between text-sm">
                <button
                  className="text-muted-foreground hover:underline"
                  onClick={() => setStep("PHONE")}
                >
                  Change number
                </button>
                <button
                  className="text-primary hover:underline disabled:opacity-50 disabled:no-underline"
                  onClick={handleResend}
                  disabled={resendTimer > 0}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
