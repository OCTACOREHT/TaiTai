"use client";

import { useEffect, useRef } from "react";

type AutoRefreshOptions = {
  enabled?: boolean;
  intervalMs?: number;
};

export function useAutoRefresh(
  refresh: () => void | Promise<void>,
  { enabled = true, intervalMs = 30000 }: AutoRefreshOptions = {},
) {
  const refreshRef = useRef(refresh);
  const runningRef = useRef(false);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    if (!enabled) return;

    const tick = async () => {
      if (runningRef.current || document.hidden) return;

      runningRef.current = true;
      try {
        await refreshRef.current();
      } finally {
        runningRef.current = false;
      }
    };

    const interval = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(interval);
  }, [enabled, intervalMs]);
}
