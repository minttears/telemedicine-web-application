"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const DEFAULT_REFRESH_INTERVAL_MS = 5000;

type MessageRefreshProps = {
  intervalMs?: number;
};

export function MessageRefresh({
  intervalMs = DEFAULT_REFRESH_INTERVAL_MS,
}: MessageRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    function refreshIfVisible() {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }

    const intervalId = window.setInterval(refreshIfVisible, intervalMs);
    document.addEventListener("visibilitychange", refreshIfVisible);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [intervalMs, router]);

  return null;
}
