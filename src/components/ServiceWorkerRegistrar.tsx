"use client";

import { useEffect } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      navigator.serviceWorker
        .register(`${BASE_PATH}/sw.js`)
        .catch(() => {
          // Ignore registration issues in private browsing or local file contexts
        });
    }
  }, []);

  return null;
}
