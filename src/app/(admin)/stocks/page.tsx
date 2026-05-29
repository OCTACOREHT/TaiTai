"use client";

import {
  SectionCard,
  SelectInput,
  TextInput,
} from "@/components/common/CmsShared";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { InventoryOverview } from "@/components/dashboard/InventoryOverview";
import {
  StockItem,
  StockStatus,
  Supplier,
  stockItems as initialStockItems,
  stockStatusOptions,
  suppliers as initialSuppliers,
} from "@/lib/data";
import { useState, type FormEvent } from "react";

import { Modal } from "@/components/ui/modal";
import { PlusIcon } from "lucide-react";

export default function StocksPage() {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [stockItems, setStockItems] = useState(initialStockItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stockDraft, setStockDraft] = useState({
    name: "",
    quantity: "",
    unit: "kg",
    reorderLevel: "",
    supplier: initialSuppliers[0]?.name ?? "",
    status: stockStatusOptions[1],
  });

  const handleAddStock = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stockDraft.name.trim() || !stockDraft.quantity || !stockDraft.reorderLevel) {
      return;
    }

    const nextStock: StockItem = {
      id: `stock-${Date.now()}`,
      name: stockDraft.name.trim(),
      quantity: Number(stockDraft.quantity),
      unit: stockDraft.unit,
      reorderLevel: Number(stockDraft.reorderLevel),
      supplier: stockDraft.supplier,
      status: stockDraft.status as StockStatus,
    };

    setStockItems((current) => [nextStock, ...current]);
    setStockDraft({
      name: "",
      quantity: "",
      unit: "kg",
      reorderLevel: "",
      supplier: suppliers[0]?.name ?? "",
      status: stockStatusOptions[1],
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageBreadCrumb pageTitle="Stocks" />
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600 shadow-theme-xs"
        >
          <PlusIcon className="h-5 w-5" />
          Ajoute nan estòk
        </button>
      </div>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-brand-500">Biwo kizin</p>
        <h1 className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white/90">
          Founisè ak matyè premyè
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500 dark:text-gray-400">
          Ajoute yon founisè, kreye yon estòk epi kenbe nivo envantè a anba kontwòl.
        </p>
      </section>

      <InventoryOverview suppliers={suppliers} stockItems={stockItems} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="md">
        <div className="p-5">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white/90">Nouvo engredyan</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Ajoute yon nouvo matyè premyè nan envantè ou.
          </p>

          <form className="mt-5 space-y-3" onSubmit={handleAddStock}>
            <TextInput
              placeholder="Non pwodwi a"
              value={stockDraft.name}
              onChange={(event) => setStockDraft((current) => ({ ...current, name: event.target.value }))}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                type="number"
                min={0}
                placeholder="Kantite"
                value={stockDraft.quantity}
                onChange={(event) =>
                  setStockDraft((current) => ({ ...current, quantity: event.target.value }))
                }
              />
              <TextInput
                placeholder="Inite (egz: kg, lit, sak)"
                value={stockDraft.unit}
                onChange={(event) => setStockDraft((current) => ({ ...current, unit: event.target.value }))}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                type="number"
                min={0}
                placeholder="Limit pou rekòmande"
                value={stockDraft.reorderLevel}
                onChange={(event) =>
                  setStockDraft((current) => ({ ...current, reorderLevel: event.target.value }))
                }
              />
              <SelectInput
                value={stockDraft.supplier}
                onChange={(event) => setStockDraft((current) => ({ ...current, supplier: event.target.value }))}
              >
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.name}>
                    {supplier.name}
                  </option>
                ))}
              </SelectInput>
            </div>
            <SelectInput
              value={stockDraft.status}
              onChange={(event) =>
                setStockDraft((current) => ({
                  ...current,
                  status: event.target.value as StockStatus,
                }))
              }
            >
              {stockStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </SelectInput>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Anile
              </button>
              <button
                type="submit"
                className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
              >
                Ajoute estòk la
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
