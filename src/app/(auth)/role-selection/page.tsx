"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Car,
  CheckCircle2,
  HelpCircle,
  Loader2,
  PersonStanding,
  UsersRound,
} from "lucide-react";
import { usersApi } from "@/lib/api/users";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";
import { getErrorMessage, cn } from "@/lib/utils";
import { toast } from "sonner";

type Role = "RIDER" | "DRIVER";

const ROLES: {
  value: Role;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}[] = [
  {
    value: "DRIVER",
    icon: Car,
    title: "Vehicle Owner",
    description: "List your rickshaw and manage trips with ease.",
  },
  {
    value: "RIDER",
    icon: PersonStanding,
    title: "Rider",
    description: "Find reliable rides for your daily commute.",
  },
];

export default function RoleSelectionPage() {
  const router = useRouter();
  const hydrate = useAuthStore((s) => s.hydrate);
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [selected, setSelected] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    } else if (user.role !== null) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const handleContinue = async () => {
    if (!selected) return;

    setLoading(true);
    try {
      const { data } = await usersApi.selectRole(selected);
      updateUser({ ...data, role: data.role });

      if (selected === "DRIVER") {
        router.push("/register-vehicle");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to set role."));
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
            onClick={() => router.push("/login")}
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

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col px-6 py-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[20px] bg-primary text-white shadow-lg shadow-primary/25">
            <UsersRound className="size-8" />
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold tracking-tight text-on-surface">
            Choose your role
          </h1>
          <p className="font-body-lg mt-2 text-body-lg text-on-surface-variant">
            Select how you want to use RideGo.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {ROLES.map((role) => {
            const active = selected === role.value;
            const Icon = role.icon;
            return (
              <button
                key={role.value}
                onClick={() => setSelected(role.value)}
                className={cn(
                  "relative flex flex-row items-center gap-4 rounded-[20px] border-2 bg-surface-container-lowest p-5 text-left transition-all",
                  active
                    ? "border-primary bg-white shadow-[0_10px_25px_-5px_rgba(0,74,198,0.15)]"
                    : "border-transparent bg-surface-container-low shadow-sm",
                )}
              >
                <div
                  className={cn(
                    "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl transition-colors",
                    active
                      ? "bg-primary text-white"
                      : "bg-surface-container text-on-surface-variant",
                  )}
                >
                  <Icon className="size-7" />
                </div>
                <div className="flex-1">
                  <h3 className="font-title-md text-title-md font-semibold text-on-surface">
                    {role.title}
                  </h3>
                  <p className="font-body-md mt-0.5 text-body-md text-on-surface-variant">
                    {role.description}
                  </p>
                </div>
                <CheckCircle2
                  className={cn(
                    "size-6 shrink-0 transition-all",
                    active ? "scale-100 text-primary" : "scale-0 text-outline",
                  )}
                />
              </button>
            );
          })}
        </div>
      </main>

      <footer className="mx-auto w-full max-w-sm px-6 pb-10">
        <Button
          onClick={handleContinue}
          disabled={!selected || loading}
          className="h-13.5 w-full rounded-xl bg-primary text-white font-title-md text-body-lg font-semibold shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70 disabled:shadow-none"
        >
          {loading ? (
            <>
              <span className="text-white flex gap-2 justify-center">
                <Loader2 className="size-5 animate-spin" />
                Setting role...
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
        {/* <p className="font-body-md mt-4 text-center text-on-surface-variant">
          You can always change your role later in settings.
        </p> */}
      </footer>

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-primary-fixed/40 blur-[80px]" />
        <div className="absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-secondary-container/30 blur-[90px]" />
      </div>
    </div>
  );
}
