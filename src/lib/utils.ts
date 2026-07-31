import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ApiErrorShape {
  response?: { data?: { message?: string } };
  message?: string;
}

export function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object") {
    const apiErr = err as ApiErrorShape;
    const message = apiErr.response?.data?.message ?? apiErr.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }
  return fallback;
}

export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
