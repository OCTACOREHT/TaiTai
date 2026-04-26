"use client";

import {
  SectionCard,
  SelectInput,
  TextInput,
} from "@/components/common/CmsShared";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { CustomersTable } from "@/components/dashboard/CustomersTable";
import {
  CustomerRecord,
  customerSegmentOptions,
  customers as initialCustomers,
  clientAvatarPool,
  menuItems,
} from "@/lib/data";
import { useState, type FormEvent } from "react";

export default function ClientsPage() {
  const [customers, setCustomers] = useState(initialCustomers);
  const [draft, setDraft] = useState({
    name: "",
    email: "",
    favoriteDish: menuItems[0]?.name ?? "",
    segment: customerSegmentOptions[2],
  });

  const handleAddClient = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draft.name.trim() || !draft.email.trim()) {
      return;
    }

    const nextClient: CustomerRecord = {
      id: `cust-${Date.now()}`,
      name: draft.name.trim(),
      email: draft.email.trim(),
      favoriteDish: draft.favoriteDish,
      segment: draft.segment,
      visits: 1,
      lifetimeSpend: 1250,
      lastOrder: "Nouveau client",
      avatar: clientAvatarPool[customers.length % clientAvatarPool.length],
    };

    setCustomers((current) => [nextClient, ...current]);
    setDraft({
      name: "",
      email: "",
      favoriteDish: menuItems[0]?.name ?? "",
      segment: customerSegmentOptions[2],
    });
  };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Clients" />

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-brand-500">Relation client</p>
        <h1 className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white/90">
          Fiches clients et profils VIP
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500 dark:text-gray-400">
          Ajoutez un client, mettez en avant ses habitudes et suivez sa valeur pour le restaurant.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="Liste clients"
          description="Historique rapide et badges prioritaires."
        >
          <CustomersTable customers={customers} />
        </SectionCard>

        <SectionCard
          title="Ajouter un client"
          description="Creation instantanee d'une nouvelle fiche."
        >
          <form className="space-y-4" onSubmit={handleAddClient}>
            <TextInput
              placeholder="Nom du client"
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
            />
            <TextInput
              type="email"
              placeholder="Email du client"
              value={draft.email}
              onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
            />
            <SelectInput
              value={draft.favoriteDish}
              onChange={(event) =>
                setDraft((current) => ({ ...current, favoriteDish: event.target.value }))
              }
            >
              {menuItems.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </SelectInput>
            <SelectInput
              value={draft.segment}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  segment: event.target.value as typeof draft.segment,
                }))
              }
            >
              {customerSegmentOptions.map((segment) => (
                <option key={segment} value={segment}>
                  {segment}
                </option>
              ))}
            </SelectInput>

            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
            >
              Ajouter le client
            </button>
          </form>
        </SectionCard>
      </div>
    </div>
  );
}
