"use client";

import {
  SectionCard,
} from "@/components/common/CmsShared";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { MenuGrid } from "@/components/dashboard/MenuGrid";
import { MenuItem, getMenuItems } from "@/lib/data";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageBreadCrumb pageTitle="Meni" />
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-brand-500">Katalòg pwodwi</p>
        <h1 className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white/90">
          Jesyon plat ak kategori
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500 dark:text-gray-400">
          Konekte ak Supabase. Aktive oswa dezaktive plat yo pou montre yo oswa kache yo sou sit kliyan an.
        </p>
      </section>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-brand-500" size={40} />
        </div>
      ) : (
        <MenuGrid items={items} />
      )}
    </div>
  );
}
