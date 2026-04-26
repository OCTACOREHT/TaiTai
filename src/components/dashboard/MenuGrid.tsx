"use client";

import { MenuItem, formatCurrency } from "@/lib/data";
import Image from "next/image";
import { supabase } from "@/lib/supabase-client";
import { useState } from "react";

const gradients = [
  "from-brand-500/15 via-brand-500/8 to-transparent",
  "from-warning-500/18 via-warning-500/8 to-transparent",
  "from-orange-500/15 via-orange-500/8 to-transparent",
  "from-brand-400/15 via-brand-400/8 to-transparent",
];

export function MenuGrid({ items: initialItems }: { items: MenuItem[] }) {
  const [items, setItems] = useState(initialItems);

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    
    // Optimistic
    setItems(prev => prev.map(item => item.id === id ? { ...item, disponible: nextStatus } : item));

    const { error } = await supabase
      .from("menu_items")
      .update({ disponible: nextStatus })
      .eq("id", id);

    if (error) {
      alert("Erreur de mise à jour : " + error.message);
      // Rollback
      setItems(prev => prev.map(item => item.id === id ? { ...item, disponible: currentStatus } : item));
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => {
        return (
          <article
            key={item.id}
            className={`overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs transition dark:border-gray-800 dark:bg-white/[0.03] ${!item.disponible ? 'opacity-60 grayscale-[0.5]' : ''}`}
          >
            <div className={`bg-gradient-to-br ${gradients[index % gradients.length]} p-5`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                    {item.featured && (
                      <span className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700 dark:border-brand-900/40 dark:bg-brand-900/10 dark:text-brand-300 uppercase tracking-wider">
                        Best seller
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white/90">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-sm leading-5 text-gray-600 dark:text-gray-300 line-clamp-2">
                    {item.description}
                  </p>
                </div>
                
                {item.image && (
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full border-2 border-white shadow-lg dark:border-gray-800">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
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

              <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
                <span className={`text-sm font-medium ${item.disponible ? 'text-green-600' : 'text-red-500'}`}>
                  {item.disponible ? 'Disponible' : 'Indisponible'}
                </span>
                <button
                  onClick={() => toggleAvailability(item.id, item.disponible ?? true)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                    item.disponible 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10' 
                    : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-500/10'
                  }`}
                >
                  {item.disponible ? 'Désactiver' : 'Activer'}
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
