"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { Loader2, Plus, Trash2, Save } from "lucide-react";

interface DeliveryZone {
  id: string;
  zone: string;
  label: string;
  frais: number;
  departement: string;
  active: boolean;
}

export function DeliveryManagement() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newZone, setNewZone] = useState({
    zone: "",
    label: "",
    frais: 0,
    departement: "Ouest",
  });

  const loadZones = async () => {
    try {
      const { data, error } = await supabase
        .from("delivery_zones")
        .select("*")
        .order("departement", { ascending: true })
        .order("frais", { ascending: true });

      if (!error && data) {
        setZones(data);
      }
    } catch (error) {
      console.error("Failed to load delivery zones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  const handleAddZone = async () => {
    if (!newZone.zone.trim() || !newZone.label.trim() || newZone.frais < 0) {
      alert("Veuillez remplir tous les champs correctement.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("delivery_zones").insert({
        zone: newZone.zone.trim(),
        label: newZone.label.trim(),
        frais: newZone.frais,
        departement: newZone.departement,
        active: true,
      });

      if (error) {
        alert("Erreur lors de l'ajout : " + error.message);
        return;
      }

      setNewZone({ zone: "", label: "", frais: 0, departement: "Ouest" });
      await loadZones();
    } catch (error) {
      alert("Erreur : " + (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateZone = async (id: string, updates: Partial<DeliveryZone>) => {
    try {
      const { error } = await supabase
        .from("delivery_zones")
        .update(updates)
        .eq("id", id);

      if (error) {
        alert("Erreur lors de la modification : " + error.message);
        return;
      }

      await loadZones();
    } catch (error) {
      alert("Erreur : " + (error as Error).message);
    }
  };

  const handleDeleteZone = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette zone ?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("delivery_zones")
        .delete()
        .eq("id", id);

      if (error) {
        alert("Erreur lors de la suppression : " + error.message);
        return;
      }

      await loadZones();
    } catch (error) {
      alert("Erreur : " + (error as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white/90">
            Gestion des zones de livraison
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Définissez les zones de livraison et leurs tarifs. Ces prix seront utilisés dans le panier client.
          </p>
        </div>

        {/* Formulaire d'ajout */}
        <div className="mb-8 rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900/30">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white/90">
            Ajouter une nouvelle zone
          </h3>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Zone (code)
              </label>
              <input
                type="text"
                value={newZone.zone}
                onChange={(e) => setNewZone({ ...newZone, zone: e.target.value })}
                placeholder="Ex: Tabarre"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Label
              </label>
              <input
                type="text"
                value={newZone.label}
                onChange={(e) => setNewZone({ ...newZone, label: e.target.value })}
                placeholder="Ex: Tabarre - 750 HTG"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Frais (HTG)
              </label>
              <input
                type="number"
                min={0}
                value={newZone.frais}
                onChange={(e) => setNewZone({ ...newZone, frais: Number(e.target.value) })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Département
              </label>
              <select
                value={newZone.departement}
                onChange={(e) => setNewZone({ ...newZone, departement: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="Ouest">Ouest</option>
                <option value="Artibonite">Artibonite</option>
                <option value="Centre">Centre</option>
                <option value="Grand'Anse">Grand'Anse</option>
                <option value="Nippes">Nippes</option>
                <option value="Nord">Nord</option>
                <option value="Nord-Est">Nord-Est</option>
                <option value="Nord-Ouest">Nord-Ouest</option>
                <option value="Sud">Sud</option>
                <option value="Sud-Est">Sud-Est</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAddZone}
                disabled={saving}
                className="inline-flex h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
                Ajouter
              </button>
            </div>
          </div>
        </div>

        {/* Liste des zones */}
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800">
                <th className="px-5 py-4">Zone</th>
                <th className="px-5 py-4">Label</th>
                <th className="px-5 py-4">Frais (HTG)</th>
                <th className="px-5 py-4">Département</th>
                <th className="px-5 py-4">Statut</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {zones.map((zone) => (
                <tr key={zone.id} className="transition hover:bg-gray-50/60 dark:hover:bg-white/5">
                  <td className="px-5 py-4">
                    <span className="font-semibold text-gray-900 dark:text-white/90">
                      {zone.zone}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <input
                      type="text"
                      value={zone.label}
                      onChange={(e) =>
                        handleUpdateZone(zone.id, { label: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <input
                      type="number"
                      min={0}
                      value={zone.frais}
                      onChange={(e) =>
                        handleUpdateZone(zone.id, { frais: Number(e.target.value) })
                      }
                      className="w-24 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {zone.departement}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateZone(zone.id, { active: !zone.active })
                      }
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        zone.active
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {zone.active ? "Actif" : "Inactif"}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteZone(zone.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100 dark:bg-red-500/10"
                      title="Supprimer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {zones.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">
            Aucune zone de livraison configurée. Ajoutez-en une ci-dessus.
          </div>
        )}
      </div>
    </div>
  );
}