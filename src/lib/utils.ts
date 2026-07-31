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
