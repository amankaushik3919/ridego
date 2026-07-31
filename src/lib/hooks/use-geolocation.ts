"use client";

import { useState, useCallback } from "react";

export function useGeolocation() {
  const [loading, setLoading] = useState(false);

  const getLocation = useCallback(
    (): Promise<{ lat: number; lng: number; accuracy: number }> => {
      setLoading(true);
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          setLoading(false);
          reject(new Error("Geolocation not supported."));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLoading(false);
            resolve({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            });
          },
          () => {
            setLoading(false);
            reject(new Error("Location permission denied."));
          },
          { enableHighAccuracy: true, timeout: 10000 },
        );
      });
    },
    [],
  );

  return { getLocation, loading };
}
