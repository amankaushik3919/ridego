import { apiClient } from "./client";

export const ridesApi = {
  goOnline: (data: { destinationId: string; lat: number; lng: number }) =>
    apiClient.post("/rides/online", data),

  goOffline: () => apiClient.post("/rides/offline"),

  startRide: () => apiClient.post("/rides/start"),

  updateLocation: (lat: number, lng: number) =>
    apiClient.post("/rides/location", { lat, lng }),

  getNearby: (lat: number, lng: number, radiusKm = 2) =>
    apiClient.get("/rides/nearby", { params: { lat, lng, radiusKm } }),

  verifyQr: (qrToken: string) =>
    apiClient.post("/rides/verify-qr", { qrToken }),

  lockSeat: (qrToken: string) =>
    apiClient.post("/rides/lock-seat", { qrToken }),

  endRide: (qrToken: string) => apiClient.post("/rides/end-ride", { qrToken }),

  endRideByDriver: (sessionId: string, riderId: string) =>
    apiClient.post(`/rides/${sessionId}/riders/${riderId}/end`),

  getMyActiveSession: () => apiClient.get("/rides/my-active-session"),

  getRiderActiveSession: () => apiClient.get("/rides/rider-active-session"),

  getDriverStats: () => apiClient.get("/rides/stats"),

  getRideHistory: () => apiClient.get("/rides/history"),

  getRiderRideHistory: () => apiClient.get("/rides/rider-history"),

  regenerateQr: () => apiClient.post("/rides/regenerate-qr"),
};
