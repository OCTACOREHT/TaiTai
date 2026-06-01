"use client";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { TextInput } from "@/components/common/CmsShared";
import { Modal } from "@/components/ui/modal";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { supabase } from "@/lib/supabase-client";
import { Loader2, MapPin, Phone, PlusIcon, RefreshCcw, Store } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

type Supplier = {
  id: string;
  nom: string;
  telephone: string;
  adresse: string;
  created_at: string | null;
};

export default function FournisseursPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState({
    nom: "",
    telephone: "",
    adresse: "",
  });

  const loadSuppliers = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const { data, error } = await supabase
      .from("fournisseurs")
      .select("id, nom, telephone, adresse, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      alert("Erreur lors du chargement des fournisseurs : " + error.message);
    } else {
      setSuppliers(data || []);
    }

    if (showLoading) setLoading(false);
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  useAutoRefresh(() => loadSuppliers(false), { enabled: !saving && !isModalOpen });

  const handleAddSupplier = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.nom.trim() || !draft.telephone.trim() || !draft.adresse.trim()) return;

    setSaving(true);
    const { error } = await supabase.from("fournisseurs").insert({
      nom: draft.nom.trim(),
      telephone: draft.telephone.trim(),
      adresse: draft.adresse.trim(),
    });

    if (error) {
      alert("Erreur lors de l'ajout du fournisseur : " + error.message);
    } else {
      setDraft({ nom: "", telephone: "", adresse: "" });
      setIsModalOpen(false);
      await loadSuppliers();
    }

    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageBreadCrumb pageTitle="Fournisseurs" />
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => loadSuppliers()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            <RefreshCcw className="h-4 w-4" />
            Actualiser
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            <PlusIcon className="h-5 w-5" />
            Ajouter un fournisseur
          </button>
        </div>
      </div>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-brand-500">Approvisionnement</p>
        <h1 className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white/90">
          Fournisseurs TaiTai
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500 dark:text-gray-400">
          Ajoutez les fournisseurs avec leur nom, numero de telephone et adresse.
        </p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">
            Liste des fournisseurs
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {suppliers.length} fournisseur{suppliers.length > 1 ? "s" : ""} enregistre{suppliers.length > 1 ? "s" : ""}.
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
          </div>
        ) : suppliers.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Aucun fournisseur ajoute pour le moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800">
                  <th className="px-5 py-4">Fournisseur</th>
                  <th className="px-5 py-4">Telephone</th>
                  <th className="px-5 py-4">Adresse</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="transition hover:bg-gray-50/60 dark:hover:bg-white/5">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
                          <Store className="h-5 w-5" />
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white/90">{supplier.nom}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="inline-flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {supplier.telephone}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {supplier.adresse}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="md">
        <div className="p-5">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white/90">Nouveau fournisseur</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Renseignez les informations principales du fournisseur.
          </p>

          <form className="mt-5 space-y-3" onSubmit={handleAddSupplier}>
            <TextInput
              placeholder="Nom du fournisseur"
              value={draft.nom}
              onChange={(event) => setDraft((current) => ({ ...current, nom: event.target.value }))}
            />
            <TextInput
              placeholder="Numero de telephone"
              value={draft.telephone}
              onChange={(event) => setDraft((current) => ({ ...current, telephone: event.target.value }))}
            />
            <TextInput
              placeholder="Adresse"
              value={draft.adresse}
              onChange={(event) => setDraft((current) => ({ ...current, adresse: event.target.value }))}
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
                disabled={saving}
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-60"
              >
                {saving ? "Ajout..." : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
