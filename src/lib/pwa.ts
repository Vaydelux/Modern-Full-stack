import { useEffect, useState, useCallback } from "react";

export interface PwaState {
  isOnline: boolean;
  canInstall: boolean;
  hasUpdate: boolean;
  promptInstall: () => Promise<boolean>;
  applyUpdate: () => void;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let waitingWorker: ServiceWorker | null = null;

const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((listener) => listener());
}

let isOnlineState = typeof navigator !== "undefined" ? navigator.onLine : true;
let canInstallState = false;
let hasUpdateState = false;

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    isOnlineState = true;
    notify();
  });

  window.addEventListener("offline", () => {
    isOnlineState = false;
    notify();
  });

  window.addEventListener("beforeinstallprompt", (e) => {
    // Prevent standard minibar on mobile
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    canInstallState = true;
    notify();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    canInstallState = false;
    notify();
  });
}

/**
 * Registers the Service Worker only in production to avoid interfering with Vite HMR during development.
 */
export function registerServiceWorker() {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !import.meta.env.PROD
  ) {
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // If there's an already waiting worker
        if (registration.waiting) {
          waitingWorker = registration.waiting;
          hasUpdateState = true;
          notify();
        }

        // Detect new worker installing
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New content available, waiting to activate
                waitingWorker = newWorker;
                hasUpdateState = true;
                notify();
              }
            });
          }
        });
      })
      .catch((err) => {
        console.warn("[PWA] Service Worker registration failed:", err);
      });

    // When the controller changes (after skipWaiting), reload page
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}

export function usePwa(): PwaState {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick((t) => t + 1);
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        deferredPrompt = null;
        canInstallState = false;
        notify();
        return true;
      }
    } catch (err) {
      console.warn("[PWA] Install prompt failed:", err);
    }
    return false;
  }, []);

  const applyUpdate = useCallback(() => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    } else {
      window.location.reload();
    }
  }, []);

  return {
    isOnline: isOnlineState,
    canInstall: canInstallState,
    hasUpdate: hasUpdateState,
    promptInstall,
    applyUpdate,
  };
}
