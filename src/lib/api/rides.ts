import { apiClient } from "./client";

export const ridesApi = {
  goOnline: (data: {
    destination: string;
    distanceKm: number;
    lat: number;
    lng: number;
  }) => apiClient.post("/rides/online", data),

  goOffline: () => apiClient.post("/rides/offline"),

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
};
