"use client";

import {
  SectionCard,
  TextAreaInput,
  TextInput,
  ToggleInput,
} from "@/components/common/CmsShared";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { MenuGrid } from "@/components/dashboard/MenuGrid";
import { MenuItem, menuItems as initialMenuItems } from "@/lib/data";
import { useState, type FormEvent } from "react";

import { Modal } from "@/components/ui/modal";
import { PlusIcon } from "lucide-react";

export default function MenuPage() {
  const [items, setItems] = useState(initialMenuItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    stock: "",
    maxStock: "",
    prepTime: "",
    featured: false,
  });

  const handleAddDish = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draft.name.trim() || !draft.category.trim() || !draft.price) {
      return;
    }

    const nextDish: MenuItem = {
      id: `dish-${Date.now()}`,
      name: draft.name.trim(),
      category: draft.category.trim(),
      description: draft.description.trim() || "Nouveau plat TaiTai a mettre en avant.",
      price: Number(draft.price),
      stock: Number(draft.stock) || 0,
      maxStock: Number(draft.maxStock) || Number(draft.stock) || 1,
      prepTime: draft.prepTime.trim() || "15 min",
      featured: draft.featured,
    };

    setItems((current) => [nextDish, ...current]);
    setDraft({
      name: "",
      category: "",
      description: "",
      price: "",
      stock: "",
      maxStock: "",
      prepTime: "",
      featured: false,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageBreadCrumb pageTitle="Menu" />
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600 shadow-theme-xs"
        >
          <PlusIcon className="h-5 w-5" />
          Ajouter un Plat
        </button>
      </div>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-brand-500">Catalogue produits</p>
        <h1 className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white/90">
          Gestion des plats et categories
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500 dark:text-gray-400">
          Ajoutez un plat, fixez son prix et suivez sa disponibilite sans quitter le front.
        </p>
      </section>

      <MenuGrid items={items} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="md">
        <div className="p-5">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white/90">Nouveau Plat</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Creez une nouvelle fiche produit pour votre menu.
          </p>

          <form className="mt-5 space-y-3" onSubmit={handleAddDish}>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                placeholder="Nom du plat"
                value={draft.name}
                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              />
              <TextInput
                placeholder="Categorie"
                value={draft.category}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, category: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                placeholder="Temps de prep"
                value={draft.prepTime}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, prepTime: event.target.value }))
                }
              />
              <TextInput
                type="number"
                min={0}
                placeholder="Prix"
                value={draft.price}
                onChange={(event) => setDraft((current) => ({ ...current, price: event.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                type="number"
                min={0}
                placeholder="Stock"
                value={draft.stock}
                onChange={(event) => setDraft((current) => ({ ...current, stock: event.target.value }))}
              />
              <TextInput
                type="number"
                min={1}
                placeholder="Stock max"
                value={draft.maxStock}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, maxStock: event.target.value }))
                }
              />
            </div>
            <TextAreaInput
              rows={3}
              placeholder="Description du plat"
              value={draft.description}
              onChange={(event) =>
                setDraft((current) => ({ ...current, description: event.target.value }))
              }
            />
            <ToggleInput
              checked={draft.featured}
              onChange={(checked) => setDraft((current) => ({ ...current, featured: checked }))}
              label="Mettre en avant ce plat (Featured)"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
              >
                Ajouter au menu
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
