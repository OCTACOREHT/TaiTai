 "use client";

import {
  FieldLabel,
  SelectInput,
  TextAreaInput,
  TextInput,
  ToggleInput,
} from "@/components/common/CmsShared";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { MenuGrid } from "@/components/dashboard/MenuGrid";
import { Modal } from "@/components/ui/modal";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { MenuItem, getMenuItems } from "@/lib/data";
import { supabase } from "@/lib/supabase-client";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus, Loader2, PlusIcon, X } from "lucide-react";

const categories = ["Grillades", "Signature", "Burgers", "Pâtes", "Desserts", "Boissons"];

type MenuDraft = {
  nom: string;
  description: string;
  prix: string;
  categorie: string;
  stock_quantity: string;
  temps_prep: string;
  disponible: boolean;
  best_seller: boolean;
  jour: string;
  supplements: SupplementDraft[];
};

type SupplementDraft = {
  id?: string;
  nom: string;
  prix: string;
  disponible: boolean;
};

const createEmptyDraft = (): MenuDraft => ({
  nom: "",
  description: "",
  prix: "",
  categorie: categories[0],
  stock_quantity: "10",
  temps_prep: "15",
  disponible: true,
  best_seller: false,
  jour: "",
  supplements: [],
});

const buildDraftFromItem = (item: MenuItem): MenuDraft => ({
  nom: item.name,
  description: item.description || "",
  prix: String(item.price),
  categorie: item.category || categories[0],
  stock_quantity: String(item.stockQuantity ?? 0),
  temps_prep: String(Number.parseInt(item.prepTime, 10) || 15),
  disponible: item.disponible ?? true,
  best_seller: item.featured ?? false,
  jour: item.jour || "",
  supplements: (item.supplements as SupplementDraft[]) || [],
});

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<MenuDraft>(createEmptyDraft());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [stockAlerts, setStockAlerts] = useState<{ lowStock: number; outOfStock: number; items: any[] }>({ lowStock: 0, outOfStock: 0, items: [] });
  const [newSupplementNom, setNewSupplementNom] = useState("");
  const [newSupplementPrix, setNewSupplementPrix] = useState("");

  const loadItems = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await getMenuItems();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    loadStockAlerts();
  }, []);

  useAutoRefresh(() => {
    loadItems(false);
    loadStockAlerts();
  }, { enabled: !saving && !isFormModalOpen });

  const loadStockAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("id, nom, stock_quantity")
        .eq("disponible", true)
        .is("deleted_at", null);

      if (!error && data) {
        const lowStock = data.filter(item => item.stock_quantity > 0 && item.stock_quantity <= 5).length;
        const outOfStock = data.filter(item => item.stock_quantity <= 0).length;
        setStockAlerts({
          lowStock,
          outOfStock,
          items: data.filter(item => item.stock_quantity <= 5)
        });
      }
    } catch (error) {
      console.error("Failed to load stock alerts:", error);
    }
  };

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
    setImageUrl("");
  };

  const resetFormState = () => {
    setDraft(createEmptyDraft());
    clearImage();
    setNewSupplementNom("");
    setNewSupplementPrix("");
  };

  const openCreateModal = () => {
    if (saving) return;
    setEditingItem(null);
    resetFormState();
    setIsFormModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    if (saving) return;
    setEditingItem(item);
    setDraft(buildDraftFromItem(item));
    setImageFile(null);
    setImagePreview(item.image_url || "");
    setImageUrl(item.image_url || "");
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    if (saving) return;
    setIsFormModalOpen(false);
    setEditingItem(null);
    resetFormState();
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

  const addSupplement = () => {
    if (!newSupplementNom.trim()) {
      alert("Veuillez saisir un nom pour le supplément.");
      return;
    }

    // Si le prix est vide, considérer comme gratuit (0)
    const prix = newSupplementPrix === "" ? 0 : Number(newSupplementPrix);
    if (!Number.isFinite(prix) || prix < 0) {
      alert("Le prix doit être un nombre positif ou zéro (0 = gratuit).");
      return;
    }

    setDraft((current) => ({
      ...current,
      supplements: [
        ...current.supplements,
        {
          nom: newSupplementNom.trim(),
          prix: String(prix),
          disponible: true,
        },
      ],
    }));

    setNewSupplementNom("");
    setNewSupplementPrix("");
  };

  const removeSupplement = (index: number) => {
    setDraft((current) => ({
      ...current,
      supplements: current.supplements.filter((_, i) => i !== index),
    }));
  };

  const toggleSupplementDisponible = (index: number) => {
    setDraft((current) => ({
      ...current,
      supplements: current.supplements.map((sup, i) =>
        i === index ? { ...sup, disponible: !sup.disponible } : sup
      ),
    }));
  };

  const handleSaveDish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const prix = Number(draft.prix);
    const stockQuantity = Number(draft.stock_quantity);
    const tempsPrep = Number(draft.temps_prep);

    if (!draft.nom.trim() || !Number.isFinite(prix) || prix <= 0) {
      alert("Veuillez saisir au minimum un nom et un prix valide.");
      return;
    }

    setSaving(true);
    try {
      const nextImageUrl = imageFile ? await uploadImage() : imageUrl || null;
      
      // Préparer les suppléments pour la sauvegarde
      const supplements = draft.supplements
        .filter((sup) => sup.nom.trim())
        .map((sup) => ({
          nom: sup.nom.trim(),
          prix: Number(sup.prix),
          disponible: sup.disponible,
        }));

      const payload = {
        nom: draft.nom.trim(),
        description: draft.description.trim(),
        prix,
        categorie: draft.categorie,
        image_url: nextImageUrl,
        stock_quantity: Number.isFinite(stockQuantity) && stockQuantity >= 0 ? stockQuantity : 0,
        temps_prep: Number.isFinite(tempsPrep) && tempsPrep > 0 ? tempsPrep : 15,
        disponible: draft.disponible,
        best_seller: draft.best_seller,
        jour: draft.jour || null,
        supplements,
      };

      const query = supabase.from("menu_items");
      const { error } = editingItem
        ? await query.update(payload).eq("id", editingItem.id)
        : await query.insert(payload);

      if (error) {
        alert(`Erreur lors de ${editingItem ? "la modification" : "l'ajout"} du plat : ` + error.message);
        return;
      }

      await Promise.all([loadItems(false), loadStockAlerts()]);
      setIsFormModalOpen(false);
      setEditingItem(null);
      resetFormState();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue.";
      alert("Erreur lors de l'enregistrement : " + message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {(stockAlerts.lowStock > 0 || stockAlerts.outOfStock > 0) && (
        <div className="space-y-3">
          {stockAlerts.outOfStock > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-red-800 dark:text-red-300">
                    Critique: Rupture de stock
                  </h3>
                  <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                    {stockAlerts.outOfStock} plat(s) sont en rupture. Ils ne sont plus disponibles à la vente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {stockAlerts.lowStock > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                    Attention: Stock faible
                  </h3>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                    {stockAlerts.lowStock} plat(s) ont 5 unités ou moins. Réassortez rapidement.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {stockAlerts.items
                      .filter(item => item.stock_quantity > 0 && item.stock_quantity <= 5)
                      .slice(0, 5)
                      .map(item => (
                        <span key={item.id} className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                          {item.nom}
                          <span className="font-bold text-amber-600 dark:text-amber-400">({item.stock_quantity})</span>
                        </span>
                      ))}
                    {stockAlerts.items.filter(item => item.stock_quantity > 0 && item.stock_quantity <= 5).length > 5 && (
                      <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                        +{stockAlerts.items.filter(item => item.stock_quantity > 0 && item.stock_quantity <= 5).length - 5} autres
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageBreadCrumb pageTitle="Menu" />
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
        >
          <PlusIcon className="h-4 w-4" />
          Ajouter un plat
        </button>
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

      <Modal isOpen={isFormModalOpen} onClose={closeFormModal} size="xl" className="max-h-[92vh] overflow-y-auto p-6">
        <div className="mb-6 pr-12">
          <p className="text-sm font-medium text-brand-500">
            {editingItem ? "Modifier le plat" : "Nouveau plat"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white/90">
            {editingItem ? "Mettre à jour un plat" : "Ajouter un plat"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
            {editingItem
              ? "Modifiez les informations du plat déjà disponible sur le site client."
              : "Le plat sera disponible sur le site client si l'option Disponible est active."}
          </p>
        </div>

        <form onSubmit={handleSaveDish} className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Nom du plat</label>
                <input
                  required
                  value={draft.nom}
                  onChange={(event) => setDraft((current) => ({ ...current, nom: event.target.value }))}
                  placeholder="Ex: Poulet grille TaïTaï"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Categorie</label>
                <select
                  value={draft.categorie}
                  onChange={(event) => setDraft((current) => ({ ...current, categorie: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                value={draft.description}
                onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                placeholder="Ingredients, accompagnements, notes de preparation..."
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Prix HTG</label>
                <input
                  required
                  min={1}
                  type="number"
                  value={draft.prix}
                  onChange={(event) => setDraft((current) => ({ ...current, prix: event.target.value }))}
                  placeholder="1450"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Temps prep. min</label>
                <input
                  min={1}
                  type="number"
                  value={draft.temps_prep}
                  onChange={(event) => setDraft((current) => ({ ...current, temps_prep: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Stock initial</label>
                <input
                  min={0}
                  type="number"
                  value={draft.stock_quantity}
                  onChange={(event) => setDraft((current) => ({ ...current, stock_quantity: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Jour de la semaine (optionnel)</label>
                <select
                  value={draft.jour}
                  onChange={(event) => setDraft((current) => ({ ...current, jour: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10"
                >
                  <option value="">Tous les jours</option>
                  <option value="Lundi">Lundi</option>
                  <option value="Mardi">Mardi</option>
                  <option value="Mercredi">Mercredi</option>
                  <option value="Jeudi">Jeudi</option>
                  <option value="Vendredi">Vendredi</option>
                  <option value="Samedi">Samedi</option>
                  <option value="Dimanche">Dimanche</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-gray-800 dark:bg-gray-900/30">
            <div className="space-y-3">
              <div className="space-y-3">
                <FieldLabel>Image du plat</FieldLabel>
                
                {/* Upload depuis l'ordinateur */}
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
                        Cliquez pour uploader une image
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
                {imagePreview && (
                  <button
                    type="button"
                    onClick={clearImage}
                    className="inline-flex items-center gap-2 text-sm font-medium text-error-600"
                  >
                    <X size={14} />
                    Retirer l'image
                  </button>
                )}

                {/* OU séparateur */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-gray-50 px-2 text-gray-500">OU</span>
                  </div>
                </div>

                {/* URL externe */}
                <div className="space-y-2">
                  <FieldLabel>URL de l'image (alternative)</FieldLabel>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      if (e.target.value && !imageFile) {
                        setImagePreview(e.target.value);
                      }
                    }}
                    placeholder="https://exemple.com/image.jpg"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500">
                    Utilisez une URL externe si vous n'avez pas Supabase Storage configuré
                  </p>
                </div>
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

              {/* Section Suppléments */}
              <div className="space-y-3 rounded-2xl border-2 border-gray-200 bg-gray-50 p-5">
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold text-gray-900">Suppléments disponibles</p>
                  <span className="text-xs text-gray-500">(optionnel)</span>
                </div>
                <p className="text-xs text-gray-500">
                  Ajoutez les suppléments spécifiques à ce plat (sauces, accompagnements, etc.)
                </p>

                {/* Liste des suppléments existants */}
                {draft.supplements.length > 0 && (
                  <div className="space-y-2">
                    {draft.supplements.map((supplement, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between rounded-xl border-2 p-3 ${
                          supplement.disponible
                            ? "border-gray-200 bg-white"
                            : "border-gray-100 bg-gray-100 opacity-60"
                        }`}
                      >
                        <div className="flex-1">
                          <p className="font-bold text-gray-900" dir="ltr">{supplement.nom}</p>
                          <p className="text-sm font-black text-brand-500">
                            {Number(supplement.prix) === 0 ? "Gratuit" : `+${supplement.prix} HTG`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleSupplementDisponible(index)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                              supplement.disponible
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                            }`}
                          >
                            {supplement.disponible ? "Disponible" : "Indisponible"}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSupplement(index)}
                            className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Ajout d'un nouveau supplément */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-700">Ajouter un supplément</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSupplementNom}
                      onChange={(event) => setNewSupplementNom(event.target.value)}
                      placeholder="Nom (ex: Sos tomat)"
                      dir="ltr"
                      className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10"
                    />
                    <input
                      type="number"
                      value={newSupplementPrix}
                      onChange={(event) => setNewSupplementPrix(event.target.value)}
                      placeholder="Prix HTG"
                      dir="ltr"
                      className="w-24 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10"
                    />
                    <button
                      type="button"
                      onClick={addSupplement}
                      className="rounded-xl bg-brand-500 p-3 text-white transition hover:bg-brand-600"
                      title="Ajouter"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusIcon className="h-4 w-4" />}
              {saving ? "Enregistrement..." : editingItem ? "Enregistrer les changements" : "Ajouter le plat"}
            </button>
          </div>
        </form>
      </Modal>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-brand-500" size={40} />
        </div>
      ) : (
        <MenuGrid items={items} allowDelete onItemsChange={setItems} onEditItem={openEditModal} />
      )}
    </div>
  );
}
