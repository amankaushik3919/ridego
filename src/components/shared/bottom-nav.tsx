"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, CarFront, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "home", label: "Home", icon: Home, href: "/dashboard" },
  { key: "rides", label: "Rides", icon: CarFront, href: "/dashboard/rides" },
  { key: "profile", label: "Profile", icon: User, href: "/dashboard/profile" },
] as const;

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4">
      <div className="mx-auto flex max-w-sm items-center rounded-3xl bg-white/90 px-2 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-1 ring-black/5 backdrop-blur-xl">
        {TABS.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => router.push(tab.href)}
              className="relative flex flex-1 flex-col items-center"
            >
              <span
                className={cn(
                  "flex w-full flex-col items-center gap-1 rounded-2xl py-2 transition-all duration-200",
                  active
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-on-surface-variant hover:bg-surface-container-low",
                )}
              >
                <Icon
                  className={cn(
                    "size-6 transition-all",
                    active ? "scale-110" : "",
                  )}
                  strokeWidth={active ? 2.6 : 2}
                  fill={active ? "currentColor" : "none"}
                />
                <span
                  className={cn(
                    "text-[11px] transition-all",
                    active ? "font-bold" : "font-medium",
                  )}
                >
                  {tab.label}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
