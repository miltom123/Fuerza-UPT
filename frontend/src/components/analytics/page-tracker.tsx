"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function PageTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    // Do NOT track administration or API routes
    if (pathname.startsWith("/administracion") || pathname.startsWith("/api")) {
      return;
    }

    // Avoid duplicate triggers for the same path
    if (lastTrackedPath.current === pathname) {
      return;
    }
    lastTrackedPath.current = pathname;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    const payload = JSON.stringify({
      path: pathname,
      referrer: typeof document !== "undefined" ? document.referrer : "",
    });

    try {
      fetch(`${apiUrl}/analytics/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Silently catch tracking errors so user experience is never affected
      });
    } catch {
      // Ignore
    }
  }, [pathname]);

  return null;
}
