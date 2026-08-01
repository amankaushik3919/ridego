// src/app/onboarding/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usersApi } from "@/lib/api/users";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const hydrate = useAuthStore((s) => s.hydrate);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    } else if (user.role !== null) {
      // Role already set — onboarding dobara nahi honi chahiye
      router.replace("/dashboard");
    }
  }, [user, router]);

  const handleSelect = async (role: "RIDER" | "DRIVER") => {
    setLoading(true);
    try {
      const { data } = await usersApi.selectRole(role);
      updateUser({ ...data, role: data.role });

      if (role === "DRIVER") {
        router.push("/register-vehicle");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to set role."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to RideConnect!</CardTitle>
          <CardDescription>
            Aap kya karna chahte hain? Ye choice permanent hai, isliye sochkar
            select karein.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleSelect("RIDER")}
            disabled={loading}
            className="flex flex-col items-center gap-2 rounded-lg border p-6 text-center hover:border-primary hover:bg-muted transition disabled:opacity-50"
          >
            <span className="text-3xl">🧍</span>
            <span className="font-medium">Ride karna hai</span>
            <span className="text-xs text-muted-foreground">
              Nearby rickshaws dhundo
            </span>
          </button>

          <button
            onClick={() => handleSelect("DRIVER")}
            disabled={loading}
            className="flex flex-col items-center gap-2 rounded-lg border p-6 text-center hover:border-primary hover:bg-muted transition disabled:opacity-50"
          >
            <span className="text-3xl">🛺</span>
            <span className="font-medium">Rickshaw chalani hai</span>
            <span className="text-xs text-muted-foreground">
              Vehicle register karke riders lo
            </span>
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
