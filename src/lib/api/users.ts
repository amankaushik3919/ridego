import { apiClient } from "./client";

export const usersApi = {
  getMe: () => apiClient.get("/users/me"),

  updateProfile: (name: string) => apiClient.patch("/users/me", { name }),

  becomeDriver: (data: {
    rickshawNumber: string;
    vehicleModel?: string;
    totalSeats: number;
  }) => apiClient.post("/users/become-driver", data),

  getDriverProfile: () => apiClient.get("/users/driver-profile"),

  updateDriverProfile: (
    data: Partial<{
      vehicleNumber: string;
      vehicleModel: string;
      totalSeats: number;
    }>,
  ) => apiClient.patch("/users/driver-profile", data),
};
