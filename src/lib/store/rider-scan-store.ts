"use client";

import { create } from "zustand";

interface RiderScanState {
  scannerOpen: boolean;
  setScannerOpen: (open: boolean) => void;
  scanToken: string | null;
  setScanToken: (token: string | null) => void;
  reset: () => void;
}

export const useRiderScanStore = create<RiderScanState>((set) => ({
  scannerOpen: false,
  setScannerOpen: (open) => set({ scannerOpen: open }),
  scanToken: null,
  setScanToken: (token) => set({ scanToken: token }),
  reset: () => set({ scannerOpen: false, scanToken: null }),
}));
