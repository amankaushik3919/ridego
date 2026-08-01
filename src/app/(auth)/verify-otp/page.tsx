"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, HelpCircle, Loader2, Lock } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 45;

const PHONE_KEY = "rc_pending_phone";

function formatPhone(phone: string): string {
  return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
}

export default function VerifyOtpPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [phone] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(PHONE_KEY) ?? "";
  });
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!phone) {
      router.replace("/login");
      return;
    }
  }, [phone, router]);

  useEffect(() => {
    if (phone) {
      inputsRef.current[0]?.focus();
    }
  }, [phone]);

  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const otp = digits.join("");

  const handleChangeNumber = () => {
    localStorage.removeItem(PHONE_KEY);
    router.push("/login");
  };

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    if (digit && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setDigits(next);
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerify = async () => {
    if (!phone) {
      toast.error("Please enter your phone number first.");
      router.replace("/login");
      return;
    }
    if (otp.length !== OTP_LENGTH) {
      toast.error("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.verifyOtp(phone, otp);
      setAuth(data.user, data.accessToken, data.refreshToken);
      localStorage.removeItem(PHONE_KEY);
      toast.success(data.isNewUser ? "Account created!" : "Welcome back!");
      router.push(data.user.role === null ? "/role-selection" : "/dashboard");
    } catch (err) {
      toast.error(getErrorMessage(err, "Invalid OTP."));
      setDigits(Array(OTP_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await authApi.requestOtp(phone);
      setDigits(Array(OTP_LENGTH).fill(""));
      setResendTimer(RESEND_SECONDS);
      toast.success("OTP sent successfully!");
      inputsRef.current[0]?.focus();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to resend OTP."));
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background text-on-surface">
      <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <button
            aria-label="Back"
            onClick={handleChangeNumber}
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
            <Lock className="size-8" />
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold tracking-tight text-on-surface">
            Verify your number
          </h1>
          <p className="font-body-lg mt-2 text-body-lg text-on-surface-variant">
            Enter the 6-digit code sent to
          </p>
          <p className="mt-1 font-title-md text-title-md font-semibold text-on-surface">
            {phone ? formatPhone(phone) : ""}
          </p>
          <button
            onClick={handleChangeNumber}
            className="mt-3 font-body-md text-body-md font-semibold text-primary transition-colors hover:underline"
          >
            Change number
          </button>
        </div>

        <Card className="border-none bg-surface-container-lowest shadow-[0_4px_20px_0_rgba(0,0,0,0.04)] ring-1 ring-foreground/5">
          <CardContent className="space-y-6 p-6">
            <div
              className="flex w-full justify-between gap-2"
              onPaste={handlePaste}
            >
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputsRef.current[index] = el;
                  }}
                  aria-label={`Digit ${index + 1}`}
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="h-14 w-11 rounded-xl border-b-4 border-primary bg-surface-container-low text-center font-title-md text-title-md font-bold text-on-surface transition-all focus:border-primary focus:bg-white focus:shadow-[0_0_0_2px_rgba(0,74,198,0.1)] focus:outline-none"
                />
              ))}
            </div>

            <Button
              onClick={handleVerify}
              disabled={loading}
              className="h-13.5 w-full rounded-xl bg-primary text-white font-title-md text-body-lg font-semibold shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <span className="text-white flex justify-center">
                    <Loader2 className="size-5 animate-spin" />
                    Verifying...
                  </span>
                </>
              ) : (
                <span className="text-white">Verify</span>
              )}
            </Button>

            <button
              onClick={handleResend}
              disabled={resendTimer > 0}
              className="font-body-md w-full py-1 text-center font-semibold text-primary transition-colors hover:underline disabled:pointer-events-none disabled:text-on-surface-variant disabled:no-underline"
            >
              {resendTimer > 0
                ? `Resend code in 00:${resendTimer.toString().padStart(2, "0")}`
                : "Resend Code"}
            </button>
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
