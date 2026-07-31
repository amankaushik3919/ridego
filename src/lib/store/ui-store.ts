// TODO: Future for Admin Panel
import { create } from "zustand";
import Cookies from "js-cookie";

type Mode = "RIDER" | "DRIVER";

interface UiState {
  activeMode: Mode;
  setActiveMode: (mode: Mode) => void;
  hydrateMode: (fallback: Mode) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeMode: "RIDER",

  setActiveMode: (mode) => {
    Cookies.set("activeMode", mode, { expires: 30 });
    set({ activeMode: mode });
  },

  hydrateMode: (fallback) => {
    const saved = Cookies.get("activeMode") as Mode | undefined;
    set({ activeMode: saved ?? fallback });
  },
}));
