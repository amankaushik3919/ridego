import { apiClient } from "./client";

export const authApi = {
  requestOtp: (phone: string) => apiClient.post("/auth/otp/request", { phone }),

  verifyOtp: (phone: string, otp: string) =>
    apiClient.post("/auth/otp/verify", { phone, otp }),
};
