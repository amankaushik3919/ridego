"use client";

import { useRouter } from "next/navigation";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/lib/store/ui-store";
import { useAuthStore } from "@/lib/store/auth-store";

export function ModeSwitcher() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { activeMode, setActiveMode } = useUiStore();

  if (user?.role === "BOTH" || user?.role === "DRIVER") {
    return (
      <ToggleGroup
        type="single"
        value={activeMode}
        onValueChange={(value) =>
          value && setActiveMode(value as "RIDER" | "DRIVER")
        }
      >
        <ToggleGroupItem value="RIDER">Rider</ToggleGroupItem>
        <ToggleGroupItem value="DRIVER">Driver</ToggleGroupItem>
      </ToggleGroup>
    );
  }

  // RIDER-only user — driver banne ka option hamesha available rahe
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => router.push("/dashboard/become-driver")}
    >
      Become a Driver
    </Button>
  );
}
