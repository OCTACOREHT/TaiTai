"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { Supplement } from "@/types/restaurant";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { Modal } from "@/components/ui/modal";
import {
  FieldLabel,
  TextInput,
  SelectInput,
  ToggleInput,
} from "@/components/common/CmsShared";
import { PlusIcon, Loader2, X, Pencil, Trash2 } from "lucide-react";

type SupplementDraft = {
  nom: string;
  prix: string;
  disponible: boolean;
  categorie: string;
};

const createEmptyDraft = (): SupplementDraft => ({
  nom: "",
  prix: "",
  disponible: true,
  categorie: "",
});

export default function SupplementsPage() {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<SupplementDraft>(createEmptyDraft());
  const [editingSupplement, setEditingSupplement] = useState<Supplement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = ["Grillades", "Signature", "Burgers", "Pâtes", "Desserts", "Boissons"];

  const loadSupplements = async () => {
    try {
      const { data, error } = await supabase
        .from("supplements")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setSupplements(data as Supplement[]);
      }
    } catch (error) {
      console.error("Failed to load supplements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSupplements();
  }, []);

  const openCreateModal = () => {
    setEditingSupplement(null);
    setDraft(createEmptyDraft());
    setIsModalOpen(true);
  };

  const openEditModal = (supplement: Supplement) => {
    setEditingSupplement(supplement);
    setDraft({
      nom: supplement.nom,
      prix: String(supplement.prix),
      disponible: supplement.disponible,
      categorie: supplement.categorie || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSupplement(null);
    setDraft(createEmptyDraft());
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    const prix = Number(draft.prix);

    if (!draft.nom.trim() || !Number.isFinite(prix) || prix <= 0) {
      alert("Veuillez saisir un nom et un prix valide.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nom: draft.nom.trim(),
        prix,
        disponible: draft.disponible,
        categorie: draft.categorie || null,
      };

      const query = supabase.from("supplements");
      const { error } = editingSupplement
        ? await query.update(payload).eq("id", editingSupplement.id)
        : await query.insert(payload);

      if (error) {
        alert(`Erreur lors de ${editingSupplement ? "la modification" : "l'ajout"} : ` + error.message);
        return;
      }

      await loadSupplements();
      closeModal();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue.";
      alert("Erreur lors de l'enregistrement : " + message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (supplement: Supplement) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${supplement.nom}" ?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("supplements")
        .delete()
        .eq("id", supplement.id);

      if (error) {
        alert("Erreur lors de la suppression : " + error.message);
        return;
      }

      await loadSupplements();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue.";
      alert("Erreur lors de la suppression : " + message);
    }
  };

  const toggleDisponible = async (supplement: Supplement) => {
    try {
      const { error } = await supabase
        .from("supplements")
        .update({ disponible: !supplement.disponible })
        .eq("id", supplement.id);

      if (error) {
        alert("Erreur lors de la mise à jour : " + error.message);
        return;
      }

      await loadSupplements();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue.";
      alert("Erreur lors de la mise à jour : " + message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageBreadCrumb pageTitle="Suppléments" />
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
        >
          <PlusIcon className="h-4 w-4" />
          Ajouter un supplément
        </button>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-xs">
        <p className="text-sm text-brand-500">Gestion des suppléments</p>
        <h1 className="mt-4 text-3xl font-semibold text-gray-900">
          Suppléments disponibles
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500">
          Gérez les suppléments que les clients peuvent ajouter à leurs plats (sauces, accompagnements, etc.).
        </p>
      </section>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-brand-500" size={40} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {supplements.map((supplement) => (
            <div
              key={supplement.id}
              className={`rounded-xl border-2 p-5 transition-all ${
                supplement.disponible
                  ? "border-gray-200 bg-white hover:border-brand-300"
                  : "border-gray-100 bg-gray-50 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{supplement.nom}</h3>
                  <p className="mt-1 text-sm font-black text-brand-500">
                    +{supplement.prix} HTG
                  </p>
                  {supplement.categorie && (
                    <span className="mt-2 inline-block rounded-lg bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
                      {supplement.categorie}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => toggleDisponible(supplement)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      supplement.disponible
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                  >
                    {supplement.disponible ? "Disponible" : "Indisponible"}
                  </button>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => openEditModal(supplement)}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <Pencil size={16} />
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(supplement)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {supplements.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-16 w-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
            <PlusIcon size={32} />
          </div>
          <p className="mt-4 text-lg font-bold text-gray-900">Aucun supplément</p>
          <p className="mt-2 text-sm text-gray-500">
            Commencez par ajouter votre premier supplément.
          </p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} size="md">
        <div className="mb-6">
          <p className="text-sm font-medium text-brand-500">
            {editingSupplement ? "Modifier" : "Nouveau supplément"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-gray-900">
            {editingSupplement ? "Modifier le supplément" : "Ajouter un supplément"}
          </h2>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <FieldLabel>Nom du supplément</FieldLabel>
            <TextInput
              required
              value={draft.nom}
              onChange={(event) => setDraft((current) => ({ ...current, nom: event.target.value }))}
              placeholder="Ex: Sos tomat, Laitue, Fromage..."
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>Prix HTG</FieldLabel>
            <TextInput
              required
              min={1}
              type="number"
              value={draft.prix}
              onChange={(event) => setDraft((current) => ({ ...current, prix: event.target.value }))}
              placeholder="50"
            />
          </div>

          <div className="space-y-2">
            <FieldLabel>Catégorie (optionnel)</FieldLabel>
            <SelectInput
              value={draft.categorie}
              onChange={(event) => setDraft((current) => ({ ...current, categorie: event.target.value }))}
            >
              <option value="">Toutes catégories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </SelectInput>
            <p className="text-xs text-gray-500">
              Laissez vide pour appliquer ce supplément à toutes les catégories.
            </p>
          </div>

          <ToggleInput
            checked={draft.disponible}
            onChange={(checked) => setDraft((current) => ({ ...current, disponible: checked }))}
            label="Disponible"
          />

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-300"
            >
              {saving ? (
                <>
                  <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                  Enregistrement...
                </>
              ) : editingSupplement ? (
                "Enregistrer"
              ) : (
                "Ajouter"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}