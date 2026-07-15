"use client";

import { Modal } from "@/components/ui/modal";
import { MenuItem, formatCurrency } from "@/lib/data";
import { supabase } from "@/lib/supabase-client";
import { CalendarDays, Loader2, PencilLine, Trash2, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";

const gradients = [
  "from-brand-500/15 via-brand-500/8 to-transparent",
  "from-warning-500/18 via-warning-500/8 to-transparent",
  "from-orange-500/15 via-orange-500/8 to-transparent",
  "from-brand-400/15 via-brand-400/8 to-transparent",
];

export function MenuGrid({
  items: initialItems,
  allowDelete = false,
  onItemsChange,
  onEditItem,
}: {
  items: MenuItem[];
  allowDelete?: boolean;
  onItemsChange?: (items: MenuItem[]) => void;
  onEditItem?: (item: MenuItem) => void;
}) {
  const [items, setItems] = useState(initialItems);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const updateItems = (nextItems: MenuItem[]) => {
    setItems(nextItems);
    onItemsChange?.(nextItems);
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    const previousItems = items;

    updateItems(items.map((item) => (item.id === id ? { ...item, disponible: nextStatus } : item)));

    const { error } = await supabase
      .from("menu_items")
      .update({ disponible: nextStatus })
      .eq("id", id);

    if (error) {
      alert("Erreur de mise a jour : " + error.message);
      updateItems(previousItems);
    }
  };

  const deleteItem = async () => {
    if (!itemToDelete) return;

    setDeleting(true);
    const previousItems = items;
    updateItems(items.filter((item) => item.id !== itemToDelete.id));

    const { error } = await supabase
      .from("menu_items")
      .update({
        disponible: false,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", itemToDelete.id);

    setDeleting(false);

    if (error) {
      alert("Erreur de suppression : " + error.message);
      updateItems(previousItems);
      return;
    }

    setItemToDelete(null);
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <article
            key={item.id}
            className={`overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs transition dark:border-gray-800 dark:bg-white/[0.03] ${!item.disponible ? "opacity-60 grayscale-[0.5]" : ""}`}
          >
            <div className={`bg-gradient-to-br ${gradients[index % gradients.length]} p-5`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                    {item.featured ? (
                      <span className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-700 dark:border-brand-900/40 dark:bg-brand-900/10 dark:text-brand-300">
                        Best seller
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white/90">
                    {item.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-gray-600 dark:text-gray-300">
                    {item.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-600 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-300">
                      <CalendarDays className="h-3.5 w-3.5 text-brand-500" />
                      {item.jour || "Tous les jours"}
                    </span>
                  </div>
                </div>

                {item.image_url ? (
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border-2 border-white shadow-lg dark:border-gray-800">
                    <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                ) : null}
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Prix
                  </p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white/90">
                    {formatCurrency(item.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                    Prep
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white/90">
                    {item.prepTime}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
                <span className={`text-sm font-medium ${item.disponible ? "text-green-600" : "text-red-500"}`}>
                  {item.disponible ? "Disponible" : "Indisponible"}
                </span>
                <div className="flex items-center gap-2">
                  {onEditItem ? (
                    <button
                      type="button"
                      onClick={() => onEditItem(item)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-300"
                      title="Modifier le plat"
                    >
                      <PencilLine size={15} />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => toggleAvailability(item.id, item.disponible ?? true)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                      item.disponible
                        ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10"
                        : "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-500/10"
                    }`}
                  >
                    {item.disponible ? "Desactiver" : "Activer"}
                  </button>
                  {allowDelete ? (
                    <button
                      type="button"
                      onClick={() => setItemToDelete(item)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100 dark:bg-red-500/10"
                      title="Supprimer le plat"
                    >
                      <Trash2 size={15} />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <Modal
        isOpen={Boolean(itemToDelete)}
        onClose={() => !deleting && setItemToDelete(null)}
        showCloseButton={!deleting}
        size="sm"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10">
              <TriangleAlert size={24} />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">
                Supprimer ce plat ?
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                {itemToDelete ? (
                  <>
                    Le plat{" "}
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {itemToDelete.name}
                    </span>{" "}
                    sera retire du menu admin et du site client.
                  </>
                ) : null}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={deleting}
              onClick={() => setItemToDelete(null)}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={deleteItem}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={16} />}
              {deleting ? "Suppression..." : "Supprimer"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
