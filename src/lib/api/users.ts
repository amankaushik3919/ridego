import { apiClient } from "./client";

export const usersApi = {
  getMe: () => apiClient.get("/users/me"),

  updateProfile: (name: string) => apiClient.patch("/users/me", { name }),

  becomeDriver: (data: {
    vehicleNumber: string;
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

  addDestination: (data: { label: string; distanceKm: number }) =>
    apiClient.post("/users/driver-profile/destinations", data),

  getDestinations: () => apiClient.get("/users/driver-profile/destinations"),

  deleteDestination: (id: string) =>
    apiClient.delete(`/users/driver-profile/destinations/${id}`),

  selectRole: (role: "RIDER" | "DRIVER") =>
    apiClient.post("/users/select-role", { role }),
};
