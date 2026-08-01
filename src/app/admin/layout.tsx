"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Car,
  Radio,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { useAdminStore } from "@/lib/store/admin-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/drivers", label: "Drivers", icon: Car },
  { href: "/admin/riders", label: "Riders", icon: Users },
  { href: "/admin/online", label: "Online Drivers", icon: Radio },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrate = useAdminStore((s) => s.hydrate);
  const admin = useAdminStore((s) => s.admin);
  const clearAdmin = useAdminStore((s) => s.clearAdmin);
  const [checked, setChecked] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    hydrate();
    const id = setTimeout(() => setChecked(true), 0);
    return () => clearTimeout(id);
  }, [hydrate]);

  useEffect(() => {
    if (checked && !admin) {
      router.replace("/admin/login");
    }
  }, [checked, admin, router]);

  const handleLogout = () => {
    clearAdmin();
    router.replace("/admin/login");
  };

  const isLoginPage = pathname === "/admin/login";
  if (isLoginPage) return <>{children}</>;

  if (!checked || !admin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-8 w-40 bg-muted-foreground/20" />
      </div>
    );
  }

  const SidebarContent = (
    <>
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10">
          <Image
            src="/icons/icon-512.png"
            alt="RideGo logo"
            width={40}
            height={40}
            className="object-cover"
            priority
          />
        </div>
        <div className="min-w-0">
          <div className="text-base font-bold leading-tight">RideGo</div>
          <div className="text-xs text-muted-foreground">Admin Panel</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/icons/ridego-logo.png" alt="Admin" />
                <AvatarFallback className="bg-primary text-xs font-bold text-white">
                  {(admin.username ?? "A").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium capitalize">
                  {admin.username}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  Administrator
                </div>
              </div>
              <ChevronDown className="size-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Signed in as</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="capitalize">
              @{admin.username}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="size-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  return (
    <div className="min-h-dvh bg-muted/30 md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-background md:flex">
        {SidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b bg-background px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <ShieldCheck className="size-4" />
          </div>
          <span className="font-semibold">RideGo Admin</span>
        </div>
        <button
          aria-label="Menu"
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-background shadow-xl">
            <div className="flex flex-1 flex-col">{SidebarContent}</div>
            <button
              aria-label="Close"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-5 flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-x-auto px-4 py-6 md:px-8 md:py-8">
        {children}
      </main>
    </div>
  );
}
