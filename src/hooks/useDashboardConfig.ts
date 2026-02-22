"use client";

import { useEffect, useMemo, useState } from "react";
import {
  createDefaultDashboardConfig,
  DASHBOARD_CONFIG_STORAGE_KEY,
  DashboardConfig,
  DashboardWidgetKey,
  mergeDashboardConfig,
  PlayerColumnKey,
} from "@/config/dashboard.config";

export const useDashboardConfig = () => {
  const [config, setConfig] = useState<DashboardConfig>(() =>
    createDefaultDashboardConfig(),
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const rawConfig = window.localStorage.getItem(DASHBOARD_CONFIG_STORAGE_KEY);
    if (rawConfig) {
      try {
        const parsed = JSON.parse(rawConfig) as Partial<DashboardConfig>;
        setConfig(mergeDashboardConfig(parsed));
      } catch {
        setConfig(createDefaultDashboardConfig());
      }
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      DASHBOARD_CONFIG_STORAGE_KEY,
      JSON.stringify(config),
    );
  }, [config, hydrated]);

  const setWidgetEnabled = (key: DashboardWidgetKey, enabled: boolean) => {
    setConfig((prev) => ({
      ...prev,
      widgets: prev.widgets.map((widget) =>
        widget.key === key ? { ...widget, enabled } : widget,
      ),
    }));
  };

  const setPlayerColumnEnabled = (key: PlayerColumnKey, enabled: boolean) => {
    setConfig((prev) => ({
      ...prev,
      playerColumns: prev.playerColumns.map((column) =>
        column.key === key ? { ...column, enabled } : column,
      ),
    }));
  };

  const resetConfig = () => {
    setConfig(createDefaultDashboardConfig());
  };

  const enabledWidgetKeys = useMemo(
    () =>
      config.widgets
        .filter((widget) => widget.enabled)
        .map((widget) => widget.key),
    [config.widgets],
  );

  const enabledPlayerColumns = useMemo(
    () =>
      config.playerColumns
        .filter((column) => column.enabled)
        .map((column) => column.key),
    [config.playerColumns],
  );

  return {
    config,
    hydrated,
    enabledWidgetKeys,
    enabledPlayerColumns,
    setWidgetEnabled,
    setPlayerColumnEnabled,
    resetConfig,
  };
};
