import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAdminStore } from "@/lib/store/admin-store";

const adminClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

adminClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAdminStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const { refreshToken, clearAdmin } = useAdminStore.getState();
      if (!refreshToken) {
        clearAdmin();
        return Promise.reject(error);
      }
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/refresh`,
          { refreshToken },
        );
        const admin = useAdminStore.getState().admin;
        if (admin) {
          useAdminStore.getState().setAdmin(admin, data.accessToken, data.refreshToken);
        }
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return adminClient(originalRequest);
      } catch {
        clearAdmin();
        window.location.href = "/admin/login";
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

export interface AdminOverview {
  totalDrivers: number;
  totalRiders: number;
  ridesToday: number;
  revenueToday: number;
  driversOnline: number;
}

export interface TrendPoint {
  date: string;
  rides: number;
  revenue: number;
}

export interface DriverSummary {
  driverId: string;
  userId: string;
  name: string | null;
  phone: string;
  vehicleNumber: string;
  vehicleModel: string | null;
  totalSeats: number;
  farePerRider: number;
  isActive: boolean;
  isOnline: boolean;
  today: { rides: number; riders: number; revenue: number };
  total: { rides: number; riders: number; revenue: number };
}

export interface RiderSummary {
  userId: string;
  name: string | null;
  phone: string;
  role: "RIDER" | "BOTH";
  isActive: boolean;
  totalRides: number;
  createdAt: string;
}

export interface OnlineDriver {
  sessionId: string;
  driverId: string | null;
  userId: string | null;
  name: string | null;
  phone: string | null;
  vehicleNumber: string | null;
  destination: string;
  distanceKm: number;
  totalSeats: number;
  availableSeats: number;
  status: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export const adminApi = {
  login: (username: string, password: string) =>
    axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/login`, {
      username,
      password,
    }),
  me: () => adminClient.get("/admin/me"),
  overview: () => adminClient.get<AdminOverview>("/admin/stats/overview"),
  trend: (days = 7) =>
    adminClient.get<TrendPoint[]>("/admin/stats/trend", { params: { days } }),
  drivers: (page = 1, limit = 20, search = "") =>
    adminClient.get<Paginated<DriverSummary>>("/admin/drivers", {
      params: { page, limit, search },
    }),
  driverDetail: (id: string) => adminClient.get(`/admin/drivers/${id}`),
  riders: (page = 1, limit = 20, search = "") =>
    adminClient.get<Paginated<RiderSummary>>("/admin/riders", {
      params: { page, limit, search },
    }),
  riderDetail: (id: string) => adminClient.get(`/admin/riders/${id}`),
  onlineDrivers: () =>
    adminClient.get<{ items: OnlineDriver[]; total: number }>("/admin/online-drivers"),
  blockUser: (userId: string) =>
    adminClient.patch(`/admin/users/${userId}/block`),
  unblockUser: (userId: string) =>
    adminClient.patch(`/admin/users/${userId}/unblock`),
};
