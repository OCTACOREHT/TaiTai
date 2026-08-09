"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

export interface DeliveryZone {
  zone: string;
  frais: number;
  label: string;
}

const ZONES_LIVRAISON_DEFAULT: DeliveryZone[] = [
  { zone: "PV", frais: 300, label: "PV - 300 HTG" },
  { zone: "Puits B", frais: 300, label: "Puits B - 300 HTG" },
  { zone: "Routes Freres", frais: 300, label: "Routes Freres - 300 HTG" },
  { zone: "Delmas", frais: 350, label: "Delmas - 350 HTG" },
  { zone: "Limite Turgeau", frais: 400, label: "Limite Turgeau - 400 HTG" },
  { zone: "Centre Ville", frais: 500, label: "Centre Ville - 500 HTG" },
  { zone: "Rte Aeroport", frais: 500, label: "Rte Aeroport - 500 HTG" },
  { zone: "Cazeau", frais: 500, label: "Cazeau - 500 HTG" },
  { zone: "Gerald Bataille", frais: 500, label: "Gerald Bataille - 500 HTG" },
  { zone: "Tabarre", frais: 875, label: "Tabarre - 750-1000 HTG" },
  { zone: "Clercine", frais: 875, label: "Clercine - 750-1000 HTG" },
  { zone: "Thomassin", frais: 875, label: "Thomassin - 750-1000 HTG" },
];

export function useDeliveryZones() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadZones = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("delivery_zones")
        .select("*")
        .eq("active", true)
        .order("departement", { ascending: true })
        .order("frais", { ascending: true });

      if (!error && data && data.length > 0) {
        const zones = data.map((z) => ({
          zone: z.zone,
          frais: z.frais,
          label: z.label,
        }));
        setZones(zones);
        setLastUpdate(new Date());
      } else {
        // Fallback sur les valeurs par défaut
        setZones(ZONES_LIVRAISON_DEFAULT);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error("Failed to load delivery zones:", error);
      setZones(ZONES_LIVRAISON_DEFAULT);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadZones();

    // Abonnement Realtime pour les changements sur delivery_zones
    const channel = supabase
      .channel("delivery-zones-changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Écouter tous les événements (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "delivery_zones",
        },
        (payload) => {
          console.log("✅ Changement détecté en temps réel:", payload);
          // Recharger immédiatement les zones
          loadZones();
        }
      )
      .subscribe((status) => {
        console.log("Statut Realtime delivery_zones:", status);
      });

    // Mécanisme de polling de secours (toutes les 1 seconde pour une synchronisation quasi instantanée)
    const pollingInterval = setInterval(() => {
      loadZones();
    }, 1000);

    // Nettoyage de l'abonnement
    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollingInterval);
    };
  }, [loadZones]);

  return { zones, loading, lastUpdate, refreshZones: loadZones };
}
