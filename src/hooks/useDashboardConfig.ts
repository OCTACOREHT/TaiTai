import { useEffect, useMemo, useState } from "react";
import { getAdminToken } from "@/lib/admin-auth";
import {
  createDefaultDashboardConfig,
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
    const load = async () => {
      const token = getAdminToken();
      if (!token) {
        setConfig(createDefaultDashboardConfig());
        setHydrated(true);
        return;
      }

      try {
        const response = await fetch("/api/admin/dashboard-config", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Chargement impossible");
        }

        const payload = await response.json();
        setConfig(
          mergeDashboardConfig({
            widgets: payload.data?.widgets,
            playerColumns: payload.data?.player_columns,
          }),
        );
      } catch {
        setConfig(createDefaultDashboardConfig());
      } finally {
        setHydrated(true);
      }
    };

    void load();
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const token = getAdminToken();
    if (!token) {
      return;
    }

    void fetch("/api/admin/dashboard-config", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(config),
    }).catch(() => {
      console.error("[useDashboardConfig] sauvegarde impossible");
    });
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
