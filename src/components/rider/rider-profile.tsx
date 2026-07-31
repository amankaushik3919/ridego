"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RiderProfile() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const phone = user?.phone?.replace("+91", "") ?? "";

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
    </div>
  );
}
