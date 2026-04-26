"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { MenuItem } from "@/types/restaurant";
import { useCart } from "@/context/CartContext";
import { Plus, ShoppingBasket, Search, Clock, Flame } from "lucide-react";

function MenuContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cat");
  
  const { addToCart } = useCart();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(catParam || "Tous");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["Tous", "Grillades", "Signature", "Burgers", "Pâtes", "Desserts", "Boissons"];

  useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("disponible", true);
      
      if (!error && data) {
        setItems(data);
      }
      setLoading(false);
    }
    fetchMenu();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === "Tous" || item.categorie === selectedCategory;
    const matchesSearch = item.nom.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (item: MenuItem) => {
    addToCart(item);
  };

  return (
    <div className="space-y-8 md:space-y-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#101828]">Notre Menu</h1>
          <p className="text-base md:text-lg text-[#667085] font-medium">Découvrez nos saveurs créoles authentiques.</p>
        </div>
        
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" size={20} />
            <input 
              type="text"
              placeholder="Rechercher un plat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-6 text-sm font-medium focus:border-[#F4A640] focus:ring-4 focus:ring-[#F4A640]/10 focus:outline-none sm:w-80 shadow-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* Categories - Sticky on Mobile */}
      <div className="sticky top-20 z-40 -mx-4 md:mx-0 bg-[#F9FAFB]/95 backdrop-blur-md px-4 py-4 md:static md:bg-transparent md:p-0 md:backdrop-blur-none">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
           {categories.map(cat => (
             <button
               key={cat}
               onClick={() => setSelectedCategory(cat)}
               className={`whitespace-nowrap rounded-xl px-5 py-3 text-xs md:text-sm font-bold transition-all ${
                 selectedCategory === cat 
                 ? "bg-[#101828] text-white shadow-lg" 
                 : "bg-white text-[#667085] border border-gray-100 hover:border-[#F4A640] hover:text-[#F4A640] shadow-sm"
               }`}
             >
               {cat}
             </button>
           ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#F4A640] border-t-transparent"></div>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 pb-10">
          {filteredItems.map((item) => (
            <div key={item.id} className="group overflow-hidden rounded-3xl border border-gray-100 bg-white transition-all duration-300 hover:shadow-xl hover:border-transparent">
              <div className="relative h-56 md:h-64 w-full overflow-hidden">
                <img 
                  src={item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"} 
                  alt={item.nom}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {item.best_seller && (
                  <div className="absolute left-4 top-4 md:left-6 md:top-6 flex items-center gap-2 rounded-xl bg-[#F4A640] px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs font-bold text-white shadow-lg">
                    <Flame size={14} fill="currentColor" />
                    BEST SELLER
                  </div>
                )}
                <div className="absolute right-4 bottom-4 md:right-6 md:bottom-6 rounded-xl md:rounded-2xl bg-white/90 backdrop-blur-md px-4 py-2 md:px-5 md:py-2.5 text-base md:text-lg font-black text-[#101828] shadow-lg border border-white/20">
                  {item.prix} HTG
                </div>
              </div>
              
              <div className="p-6 md:p-8 space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl md:text-2xl font-bold text-[#101828] leading-tight">{item.nom}</h3>
                    <span className="shrink-0 text-[10px] font-black text-[#98A2B3] uppercase tracking-widest bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">{item.categorie}</span>
                  </div>
                  <p className="text-[#667085] line-clamp-2 text-xs md:text-sm leading-relaxed font-medium">{item.description}</p>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#667085]">
                    <div className="p-1.5 rounded-lg bg-gray-50 text-[#98A2B3]">
                      <Clock size={16} />
                    </div>
                    <span>{item.temps_prep} min</span>
                  </div>
                  <button 
                    onClick={() => handleAddToCart(item)}
                    className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl md:rounded-2xl bg-[#F4A640] text-white transition-all duration-300 hover:bg-[#101828] hover:rotate-90 shadow-lg shadow-[#F4A640]/20 active:scale-90"
                  >
                    <Plus size={24} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center space-y-6">
          <div className="h-20 w-20 md:h-24 md:w-24 rounded-3xl bg-gray-50 flex items-center justify-center text-[#98A2B3] border border-gray-100">
            <ShoppingBasket size={48} />
          </div>
          <div className="space-y-2">
            <p className="text-xl md:text-2xl font-bold text-[#101828]">Aucun plat trouvé</p>
            <p className="text-sm md:text-base text-[#667085] font-medium">Modifiez votre recherche ou explorez une autre catégorie.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center">Chargement...</div>}>
      <MenuContent />
    </Suspense>
  );
}
