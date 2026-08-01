"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";

export function Navbar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const initials = user?.phone?.slice(-2) ?? "??";

  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <span className="text-lg font-semibold">RideGo</span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button>
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            +91 {user?.phone?.replace("+91", "")}
          </div>
          <div className="px-2 pb-1.5 text-xs text-muted-foreground">
            Role: {user?.role}
          </div>
          <div className="px-2 pb-1.5 text-xs text-muted-foreground">
            <Button
              variant="secondary"
              onClick={() => router.push("/dashboard/profile")}
            >
              Profile
            </Button>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
