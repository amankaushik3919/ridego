import { User } from "@/types";
import { create } from "zustand";
import Cookies from "js-cookie";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  updateUser: (user: User) => void;
  clearAuth: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,

  setAuth: (user, accessToken, refreshToken) => {
    Cookies.set("accessToken", accessToken, { expires: 7 });
    Cookies.set("refreshToken", refreshToken, { expires: 7 });
    Cookies.set("user", JSON.stringify(user), { expires: 7 });
    set({ user, accessToken, refreshToken });
  },

  updateUser: (user) => {
    Cookies.set("user", JSON.stringify(user), { expires: 7 });
    set({ user });
  },

  clearAuth: () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("user");
    set({ user: null, accessToken: null, refreshToken: null });
  },

  hydrate: () => {
    const accessToken = Cookies.get("accessToken") ?? null;
    const refreshToken = Cookies.get("refreshToken") ?? null;
    const userStr = Cookies.get("user");
    const user = userStr ? JSON.parse(userStr) : null;
    set({ user, accessToken, refreshToken });
  },
}));
