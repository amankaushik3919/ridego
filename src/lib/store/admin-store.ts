import { create } from "zustand";
import Cookies from "js-cookie";

export interface AdminUser {
  adminId: string;
  username: string;
}

interface AdminState {
  admin: AdminUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAdmin: (admin: AdminUser, accessToken: string, refreshToken: string) => void;
  clearAdmin: () => void;
  hydrate: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  admin: null,
  accessToken: null,
  refreshToken: null,

  setAdmin: (admin, accessToken, refreshToken) => {
    Cookies.set("adminAccessToken", accessToken, { expires: 1 });
    Cookies.set("adminRefreshToken", refreshToken, { expires: 7 });
    Cookies.set("adminUser", JSON.stringify(admin), { expires: 7 });
    set({ admin, accessToken, refreshToken });
  },

  clearAdmin: () => {
    Cookies.remove("adminAccessToken");
    Cookies.remove("adminRefreshToken");
    Cookies.remove("adminUser");
    set({ admin: null, accessToken: null, refreshToken: null });
  },

  hydrate: () => {
    const accessToken = Cookies.get("adminAccessToken") ?? null;
    const refreshToken = Cookies.get("adminRefreshToken") ?? null;
    const adminStr = Cookies.get("adminUser");
    const admin = adminStr ? (JSON.parse(adminStr) as AdminUser) : null;
    set({ admin, accessToken, refreshToken });
  },
}));
