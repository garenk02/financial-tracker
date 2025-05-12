"use client";

import { useEffect } from "react";
import { initDB } from "@/utils/indexeddb";

export function PWAInit() {
  useEffect(() => {
    // Initialize IndexedDB
    const initializeDB = async () => {
      try {
        await initDB();
        console.log("IndexedDB initialized successfully");
      } catch (error) {
        console.error("Failed to initialize IndexedDB:", error);
      }
    };

    // Register service worker
    const registerServiceWorker = async () => {
      if ("serviceWorker" in navigator) {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          });
          
          if (registration.installing) {
            console.log("Service worker installing");
          } else if (registration.waiting) {
            console.log("Service worker installed");
          } else if (registration.active) {
            console.log("Service worker active");
          }
        } catch (error) {
          console.error(`Service worker registration failed: ${error}`);
        }
      }
    };

    // Request notification permission
    const requestNotificationPermission = async () => {
      if ("Notification" in window) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            console.log("Notification permission granted");
          }
        } catch (error) {
          console.error("Error requesting notification permission:", error);
        }
      }
    };

    // Initialize everything
    initializeDB();
    registerServiceWorker();
    
    // Only request notification permission if the user has interacted with the page
    const handleUserInteraction = () => {
      requestNotificationPermission();
      // Remove event listeners after first interaction
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("touchstart", handleUserInteraction);

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };
  }, []);

  return null;
}
