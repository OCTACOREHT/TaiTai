"use client";

import {
  SectionCard,
  TextInput,
} from "@/components/common/CmsShared";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { Modal } from "@/components/ui/modal";
import { Supplier, suppliers as initialSuppliers } from "@/lib/data";
import { PlusIcon } from "lucide-react";
import { useState, type FormEvent } from "react";

export default function FournisseursPage() {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    specialty: "",
    contact: "",
    nextDelivery: "",
    reliability: "95",
  });

  const handleAddSupplier = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draft.name.trim() || !draft.specialty.trim()) {
      return;
    }

    const nextSupplier: Supplier = {
      id: `sup-${Date.now()}`,
      name: draft.name.trim(),
      specialty: draft.specialty.trim(),
      contact: draft.contact.trim() || "+509 0000-0000",
      nextDelivery: draft.nextDelivery.trim() || "A planifier",
      reliability: Number(draft.reliability) || 90,
    };

    setSuppliers((current) => [nextSupplier, ...current]);
    setDraft({
      name: "",
      specialty: "",
      contact: "",
      nextDelivery: "",
      reliability: "95",
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageBreadCrumb pageTitle="Fournisseurs" />
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          <PlusIcon className="h-5 w-5" />
          Ajouter un Fournisseur
        </button>
      </div>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-brand-500">Logistique restaurant</p>
        <h1 className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white/90">
          Gestion des Partenaires TaiTai
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500 dark:text-gray-400">
          Suivez vos sources d'approvisionnement, la fiabilite des livraisons et les contacts directs.
        </p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Fournisseur</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Specialite</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Prochaine livraison</th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Fiabilite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900 dark:text-white/90">{supplier.name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{supplier.specialty}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{supplier.contact}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{supplier.nextDelivery}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <div className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className={`h-full rounded-full ${
                            supplier.reliability > 95 ? "bg-success-500" : "bg-brand-500"
                          }`}
                          style={{ width: `${supplier.reliability}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{supplier.reliability}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="md">
        <div className="p-5">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white/90">Nouveau Fournisseur</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Ajoutez un nouveau partenaire logistique a votre chaine d'approvisionnement.
          </p>

          <form className="mt-5 space-y-3" onSubmit={handleAddSupplier}>
            <TextInput
              placeholder="Nom du fournisseur"
              value={draft.name}
              onChange={(event) =>
                setDraft((current) => ({ ...current, name: event.target.value }))
              }
            />
            <TextInput
              placeholder="Specialite (ex: Fruits & Legumes)"
              value={draft.specialty}
              onChange={(event) =>
                setDraft((current) => ({ ...current, specialty: event.target.value }))
              }
            />
            <TextInput
              placeholder="Telephone ou Email"
              value={draft.contact}
              onChange={(event) =>
                setDraft((current) => ({ ...current, contact: event.target.value }))
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                placeholder="Prochaine livraison"
                value={draft.nextDelivery}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, nextDelivery: event.target.value }))
                }
              />
              <TextInput
                type="number"
                min={0}
                max={100}
                placeholder="Fiabilite (%)"
                value={draft.reliability}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, reliability: event.target.value }))
                }
              />
            </div>
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
                Ajouter le fournisseur
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
