"use client";

import { useState, useEffect, useCallback } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function PWAStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [newVersionAvailable, setNewVersionAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const updateServiceWorker = useCallback(() => {
    if (registration && registration.waiting) {
      // Send a message to the waiting service worker to skip waiting
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
      setNewVersionAvailable(false);
    }
  }, [registration]);

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine);

    // Add event listeners for online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("You are back online");
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("You are offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check for service worker updates
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        // Check for updates when the component mounts
        reg.update();

        // Listen for new service worker updates
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          toast.success("App updated to the latest version");
        });
      });

      // Listen for new service worker installation
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "NEW_VERSION") {
          setNewVersionAvailable(true);
          toast.info("A new version is available", {
            action: {
              label: "Update",
              onClick: () => updateServiceWorker(),
            },
          });
        }
      });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [updateServiceWorker]);

  return (
    <>
      {!isOnline && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            variant="destructive"
            size="sm"
            className="gap-1"
            onClick={() => window.location.reload()}
          >
            <WifiOff className="h-4 w-4" />
            Offline
          </Button>
        </div>
      )}

      {newVersionAvailable && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            variant="default"
            size="sm"
            className="gap-1"
            onClick={updateServiceWorker}
          >
            <RefreshCw className="h-4 w-4" />
            Update Available
          </Button>
        </div>
      )}
    </>
  );
}
