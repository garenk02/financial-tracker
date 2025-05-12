"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { InstallPrompt } from "./install-prompt";
import { PWAStatus } from "./pwa-status";
import { processSyncQueue } from "@/utils/indexeddb";

interface PWAContextType {
  isOnline: boolean;
  isPWA: boolean;
  isUpdateAvailable: boolean;
  updateServiceWorker: () => void;
}

const PWAContext = createContext<PWAContextType>({
  isOnline: true,
  isPWA: false,
  isUpdateAvailable: false,
  updateServiceWorker: () => {},
});

export const usePWA = () => useContext(PWAContext);

interface PWAProviderProps {
  children: ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [isPWA, setIsPWA] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Check if running as PWA
    if (typeof window !== "undefined") {
      setIsPWA(window.matchMedia("(display-mode: standalone)").matches);
      setIsOnline(navigator.onLine);
    }

    // Set up online/offline listeners
    const handleOnline = () => {
      setIsOnline(true);
      processSyncQueue(); // Process any pending offline changes
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        // Check for updates
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                setIsUpdateAvailable(true);
              }
            });
          }
        });
      });

      // Listen for controller change
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        // New service worker activated
        setIsUpdateAvailable(false);
      });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const updateServiceWorker = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  };

  const value = {
    isOnline,
    isPWA,
    isUpdateAvailable,
    updateServiceWorker,
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
      <InstallPrompt />
      <PWAStatus />
    </PWAContext.Provider>
  );
}
