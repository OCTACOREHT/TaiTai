"use client";

import {
  FieldLabel,
  SelectInput,
  SectionCard,
  TextAreaInput,
  TextInput,
  ToggleInput,
} from "@/components/common/CmsShared";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { MenuGrid } from "@/components/dashboard/MenuGrid";
import { MenuItem, getMenuItems } from "@/lib/data";
import { supabase } from "@/lib/supabase-client";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus, Loader2, PlusIcon, X } from "lucide-react";

const categories = ["Grillades", "Signature", "Burgers", "PÃ¢tes", "Desserts", "Boissons"];

const emptyDraft = {
  nom: "",
  description: "",
  prix: "",
  categorie: categories[0],
  stock_quantity: "10",
  temps_prep: "15",
  disponible: true,
  best_seller: false,
};

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getMenuItems();
        setItems(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setImageFile(null);
      setImagePreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Veuillez choisir une image.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await fetch("/api/uploads/menu-image", {
      method: "POST",
      body: formData,
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Upload impossible.");
    }

    return payload.url as string;
  };

  const handleAddDish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const prix = Number(draft.prix);
    const stockQuantity = Number(draft.stock_quantity);
    const tempsPrep = Number(draft.temps_prep);

    if (!draft.nom.trim() || !Number.isFinite(prix) || prix <= 0) {
      alert("Veuillez saisir au minimum un nom et un prix valide.");
      return;
    }

    setSaving(true);
    let imageUrl: string | null = null;

    try {
      imageUrl = await uploadImage();
    } catch (err) {
      setSaving(false);
      alert("Erreur lors de l'upload de l'image : " + (err as Error).message);
      return;
    }

    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        nom: draft.nom.trim(),
        description: draft.description.trim(),
        prix,
        categorie: draft.categorie,
        image_url: imageUrl,
        stock_quantity: Number.isFinite(stockQuantity) && stockQuantity >= 0 ? stockQuantity : 0,
        temps_prep: Number.isFinite(tempsPrep) && tempsPrep > 0 ? tempsPrep : 15,
        disponible: draft.disponible,
        best_seller: draft.best_seller,
      })
      .select("*")
      .single();

    setSaving(false);

    if (error) {
      alert("Erreur lors de l'ajout du plat : " + error.message);
      return;
    }

    const nextItem: MenuItem = {
      id: data.id,
      name: data.nom,
      category: data.categorie,
      description: data.description || "",
      price: data.prix,
      stock: 10,
      maxStock: 20,
      prepTime: `${data.temps_prep} min`,
      featured: data.best_seller,
      image: data.image_url || undefined,
      disponible: data.disponible,
      stockQuantity: data.stock_quantity ?? 0,
    };

    setItems((current) => [nextItem, ...current]);
    setDraft(emptyDraft);
    clearImage();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageBreadCrumb pageTitle="Menu" />
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-brand-500">Catalogue produits</p>
        <h1 className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white/90">
          Gestion des plats et catégories
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500 dark:text-gray-400">
          Connecté à Supabase. Activez ou désactivez les plats pour les afficher ou les masquer sur le site client.
        </p>
      </section>

      <SectionCard
        title="Ajouter un plat"
        description="Le plat sera disponible sur le site client si l'option Disponible est active."
      >
        <form onSubmit={handleAddDish} className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <FieldLabel>Nom du plat</FieldLabel>
                <TextInput
                  required
                  value={draft.nom}
                  onChange={(event) => setDraft((current) => ({ ...current, nom: event.target.value }))}
                  placeholder="Ex: Poulet grille TaiTai"
                />
              </div>
              <div className="space-y-2">
                <FieldLabel>Categorie</FieldLabel>
                <SelectInput
                  value={draft.categorie}
                  onChange={(event) => setDraft((current) => ({ ...current, categorie: event.target.value }))}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </SelectInput>
              </div>
            </div>

            <div className="space-y-2">
              <FieldLabel>Description</FieldLabel>
              <TextAreaInput
                rows={3}
                value={draft.description}
                onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                placeholder="Ingredients, accompagnements, notes de preparation..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel>Prix HTG</FieldLabel>
                <TextInput
                  required
                  min={1}
                  type="number"
                  value={draft.prix}
                  onChange={(event) => setDraft((current) => ({ ...current, prix: event.target.value }))}
                  placeholder="1450"
                />
              </div>
              <div className="space-y-2">
                <FieldLabel>Temps prep. min</FieldLabel>
                <TextInput
                  min={1}
                  type="number"
                  value={draft.temps_prep}
                  onChange={(event) => setDraft((current) => ({ ...current, temps_prep: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <FieldLabel>Stock initial</FieldLabel>
                <TextInput
                  min={0}
                  type="number"
                  value={draft.stock_quantity}
                  onChange={(event) => setDraft((current) => ({ ...current, stock_quantity: event.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900/30">
            <div className="space-y-3">
              <div className="space-y-3">
                <FieldLabel>Image du plat</FieldLabel>
                <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-white p-4 text-center transition hover:border-brand-400 hover:bg-brand-50/30 dark:border-gray-700 dark:bg-gray-900">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Apercu du plat"
                      className="h-40 w-full rounded-xl object-cover"
                    />
                  ) : (
                    <>
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10">
                        <ImagePlus size={24} />
                      </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Choisir une image
                      </span>
                      <span className="text-xs text-gray-500">PNG, JPG ou WEBP, 5 MB max.</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imagePreview ? (
                  <button
                    type="button"
                    onClick={clearImage}
                    className="inline-flex items-center gap-2 text-sm font-medium text-error-600"
                  >
                    <X size={14} />
                    Retirer l'image
                  </button>
                ) : null}
              </div>

              <ToggleInput
                checked={draft.disponible}
                onChange={(checked) => setDraft((current) => ({ ...current, disponible: checked }))}
                label="Disponible sur le site"
              />
              <ToggleInput
                checked={draft.best_seller}
                onChange={(checked) => setDraft((current) => ({ ...current, best_seller: checked }))}
                label="Marquer best seller"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusIcon className="h-4 w-4" />}
              {saving ? "Ajout en cours..." : "Ajouter le plat"}
            </button>
          </div>
        </form>
      </SectionCard>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-brand-500" size={40} />
        </div>
      ) : (
        <MenuGrid items={items} allowDelete onItemsChange={setItems} />
      )}
    </div>
  );
}
