export interface User {
  id: string;
  phone: string;
  name: string | null;
  role: "RIDER" | "DRIVER" | "BOTH" | null;
}

export interface DriverProfile {
  id: string;
  vehicleNumber: string;
  vehicleModel: string | null;
  totalSeats: number;
}

export interface RideSession {
  sessionId: string;
  destination: string;
  distanceKm: string;
  totalSeats: number;
  availableSeats: number;
  qrImageDataUrl?: string;
  expiresAt?: string;
}

export type SeatLockResult =
  | "LOCKED"
  | "SEAT_FULL"
  | "ALREADY_CLOSED"
  | "SESSION_CLOSED"
  | "SESSION_NOT_FOUND";

export interface ActiveSession {
  active: boolean;
  sessionId?: string;
  destination?: string;
  distanceKm?: number;
  totalSeats?: number;
  availableSeats?: number;
  status?: "ACTIVE" | "STARTED";
  riders?: { riderId: string; status: "BOARDED" | "COMPLETED" }[];
}

export interface NearbySession {
  sessionId: string;
  destination: string;
  routeDistanceKm: number;
  distanceM: number;
  direction: string;
  totalSeats: number;
  availableSeats: number;
  vehicleNumber: string;
}

export interface DriverDestination {
  id: string;
  label: string;
  distanceKm: number;
}
