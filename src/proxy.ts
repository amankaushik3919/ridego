// src/proxy.ts
// Next.js 16 route protection: not logged in → /login, logged in → /dashboard
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/onboarding", "/role-selection", "/register-vehicle"];
const AUTH_PATHS = ["/login", "/verify-otp"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;

  // Root "/" → logged in? /dashboard, else /login
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(token ? "/dashboard" : "/login", request.url),
    );
  }

  // Protected routes → require login
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Auth pages → already logged in? send to dashboard
  if (AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login/:path*",
    "/verify-otp/:path*",
    "/onboarding/:path*",
    "/role-selection/:path*",
    "/register-vehicle/:path*",
    "/dashboard/:path*",
  ],
};
