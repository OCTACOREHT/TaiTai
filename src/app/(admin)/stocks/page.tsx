"use client";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { cn } from "@/components/common/CmsShared";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { supabase } from "@/lib/supabase-client";
import { AlertTriangle, CheckCircle2, Loader2, Package, RefreshCcw, Save } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

type StockDish = {
  id: string;
  nom: string;
  categorie: string;
  prix: number;
  image_url: string | null;
  stock_quantity: number;
  temps_prep: number;
  best_seller: boolean;
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value);

export default function StocksPage() {
  const [items, setItems] = useState<StockDish[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());

  const loadStocks = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const { data, error } = await supabase
      .from("menu_items")
      .select("id, nom, categorie, prix, image_url, stock_quantity, temps_prep, best_seller")
      .eq("disponible", true)
      .is("deleted_at", null)
      .order("categorie", { ascending: true })
      .order("nom", { ascending: true });

    if (error) {
      alert("Erreur lors du chargement du stock : " + error.message);
    } else {
      const nextItems = (data || []).map((item) => ({ ...item, stock_quantity: item.stock_quantity ?? 0 }));
      setItems((current) => {
        if (showLoading || dirtyIds.size === 0) return nextItems;

        const dirtyById = new Map(current.filter((item) => dirtyIds.has(item.id)).map((item) => [item.id, item]));
        return nextItems.map((item) => dirtyById.get(item.id) || item);
      });
    }

    if (showLoading) setLoading(false);
  };

  useEffect(() => {
    loadStocks();
  }, []);

  useAutoRefresh(() => loadStocks(false), { enabled: savingId === null });

  const metrics = useMemo(() => {
    const totalStock = items.reduce((sum, item) => sum + item.stock_quantity, 0);
    const outOfStock = items.filter((item) => item.stock_quantity <= 0).length;
    const lowStock = items.filter((item) => item.stock_quantity > 0 && item.stock_quantity <= 5).length;

    return {
      dishes: items.length,
      totalStock,
      outOfStock,
      lowStock,
    };
  }, [items]);

  const changeLocalStock = (id: string, nextStock: number) => {
    setDirtyIds((current) => new Set(current).add(id));
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, stock_quantity: Math.max(0, nextStock) } : item,
      ),
    );
  };

  const saveStock = async (item: StockDish) => {
    setSavingId(item.id);
    const { error } = await supabase
      .from("menu_items")
      .update({ stock_quantity: item.stock_quantity })
      .eq("id", item.id);

    setSavingId(null);

    if (error) {
      alert("Erreur lors de la mise a jour du stock : " + error.message);
    } else {
      setDirtyIds((current) => {
        const next = new Set(current);
        next.delete(item.id);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageBreadCrumb pageTitle="Stocks" />
        <button
          type="button"
          onClick={() => loadStocks()}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          <RefreshCcw className="h-4 w-4" />
          Actualiser
        </button>
      </div>

      {metrics.lowStock > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                Attention: Stock faible detecte
              </h3>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                {metrics.lowStock} plat(s) ont 5 unites ou moins en stock. Reassortez rapidement pour eviter les ruptures.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {items
                  .filter((item) => item.stock_quantity > 0 && item.stock_quantity <= 5)
                  .map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                    >
                      {item.nom}
                      <span className="font-bold text-amber-600 dark:text-amber-400">({item.stock_quantity})</span>
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {metrics.outOfStock > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-red-800 dark:text-red-300">
                Critique: Rupture de stock
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                {metrics.outOfStock} plat(s) sont en rupture de stock. Ces plats ne sont plus disponibles a la vente.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {items
                  .filter((item) => item.stock_quantity <= 0)
                  .map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-red-800 dark:bg-red-900/40 dark:text-red-200"
                    >
                      {item.nom}
                      <span className="font-bold text-red-600 dark:text-red-400">(0)</span>
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-brand-500">Stock par plat</p>
        <h1 className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white/90">
          Plats disponibles et quantites restantes
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500 dark:text-gray-400">
          Chaque commande decremente automatiquement le stock. A zero, le plat reste visible sur le site mais passe en rupture.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard label="Plats disponibles" value={metrics.dishes} icon={<Package />} />
        <MetricCard label="Unites en stock" value={metrics.totalStock} icon={<CheckCircle2 />} />
        <MetricCard label="Stock faible" value={metrics.lowStock} tone="warning" icon={<AlertTriangle />} />
        <MetricCard label="Ruptures" value={metrics.outOfStock} tone="danger" icon={<AlertTriangle />} />
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">
            Inventaire des plats
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Ajustez les quantites apres preparation ou reassort.
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Aucun plat disponible dans le menu.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[840px] w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800">
                  <th className="px-5 py-4">Plat</th>
                  <th className="px-5 py-4">Categorie</th>
                  <th className="px-5 py-4">Etat</th>
                  <th className="px-5 py-4">Quantite</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {items.map((item) => {
                  const status =
                    item.stock_quantity <= 0
                      ? { label: "Rupture", className: "bg-red-50 text-red-600" }
                      : item.stock_quantity <= 5
                        ? { label: "Stock faible", className: "bg-amber-50 text-amber-700" }
                        : { label: "Disponible", className: "bg-green-50 text-green-700" };

                  return (
                    <tr key={item.id} className="transition hover:bg-gray-50/60 dark:hover:bg-white/5">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 overflow-hidden rounded-2xl bg-gray-100">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.nom} className="h-full w-full object-cover" />
                            ) : null}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white/90">{item.nom}</p>
                            <p className="mt-1 text-xs text-gray-500">{formatNumber(item.prix)} HTG</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{item.categorie}</td>
                      <td className="px-5 py-4">
                        <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-bold", status.className)}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => changeLocalStock(item.id, item.stock_quantity - 1)}
                            className="h-9 w-9 rounded-lg border border-gray-200 text-lg font-bold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={0}
                            value={item.stock_quantity}
                            onChange={(event) => changeLocalStock(item.id, Number(event.target.value))}
                            className="h-9 w-24 rounded-lg border border-gray-200 bg-white px-3 text-center text-sm font-semibold text-gray-900 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                          />
                          <button
                            type="button"
                            onClick={() => changeLocalStock(item.id, item.stock_quantity + 1)}
                            className="h-9 w-9 rounded-lg border border-gray-200 text-lg font-bold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => saveStock(item)}
                          disabled={savingId === item.id}
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
                        >
                          {savingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          Enregistrer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  tone = "default",
}: {
  label: string;
  value: number;
  icon: ReactNode;
  tone?: "default" | "warning" | "danger";
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            tone === "danger"
              ? "bg-red-50 text-red-600"
              : tone === "warning"
                ? "bg-amber-50 text-amber-600"
                : "bg-brand-50 text-brand-500",
          )}
        >
          {icon}
        </div>
      </div>
      <p className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white/90">
        {formatNumber(value)}
      </p>
    </div>
  );
}
