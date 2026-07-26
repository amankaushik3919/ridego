"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useUiStore } from "@/lib/store/ui-store";
import { useAuthStore } from "@/lib/store/auth-store";

export function ModeSwitcher() {
  const user = useAuthStore((s) => s.user);
  const { activeMode, setActiveMode } = useUiStore();

  if (user?.role !== "BOTH") return null;

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
