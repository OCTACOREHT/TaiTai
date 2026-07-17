"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { MenuItem, Supplement } from "@/types/restaurant";
import { useCart } from "@/context/CartContext";
import { Plus, ShoppingBasket, Search, Clock, Flame, CalendarDays, X, Check } from "lucide-react";

type Promotion = {
  id: string;
  title: string;
  scope: "item" | "order";
  menu_item_id: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  active: boolean;
};

const getDiscountAmount = (price: number, promotion?: Promotion) => {
  if (!promotion) return 0;
  const discount =
    promotion.discount_type === "percent"
      ? Math.round((price * promotion.discount_value) / 100)
      : promotion.discount_value;

  return Math.min(price, Math.max(0, discount));
};

function MenuContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cat");
  
  const { addToCart } = useCart();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [itemPromotions, setItemPromotions] = useState<Record<string, Promotion>>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(catParam || "Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDay, setSelectedDay] = useState<string>("Tous");
  const [allSupplements, setAllSupplements] = useState<Supplement[]>([]);
  const [showSupplementModal, setShowSupplementModal] = useState(false);
  const [selectedItemForSupplements, setSelectedItemForSupplements] = useState<MenuItem | null>(null);
  const [selectedSupplements, setSelectedSupplements] = useState<Supplement[]>([]);

  const categories = ["Tous", "Grillades", "Signature", "Burgers", "Pâtes", "Desserts", "Boissons"];
  const daysOfWeek = ["Tous", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
  const categoryLabels: Record<string, string> = {
    Tous: "Tout",
    Grillades: "Griyay",
    Signature: "Espesyal",
    Burgers: "Bègè",
    "Pâtes": "Pat",
    Desserts: "Desè",
    Boissons: "Bwason",
  };

  useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      const [{ data, error }, promoResult, supplementsResult] = await Promise.all([
        supabase
          .from("menu_items")
          .select("*")
          .eq("disponible", true)
          .is("deleted_at", null),
        supabase
          .from("promotions")
          .select("*")
          .eq("active", true)
          .eq("scope", "item"),
        supabase
          .from("supplements")
          .select("*")
          .eq("disponible", true),
      ]);
      
      if (!error && data) {
        setItems(data);
      }

      if (!promoResult.error && promoResult.data) {
        const nextPromos: Record<string, Promotion> = {};
        promoResult.data.forEach((promotion) => {
          if (promotion.menu_item_id) {
            nextPromos[promotion.menu_item_id] = promotion as Promotion;
          }
        });
        setItemPromotions(nextPromos);
      }

      if (!supplementsResult.error && supplementsResult.data) {
        setAllSupplements(supplementsResult.data as Supplement[]);
      }
      setLoading(false);
    }
    fetchMenu();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === "Tous" || item.categorie === selectedCategory;
    const description = item.description || "";
    const itemDay = item.jour || "";
    const matchesSearch = item.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDay = selectedDay === "Tous" || itemDay === selectedDay || itemDay === "";
    return matchesCategory && matchesSearch && matchesDay;
  });

  const handleAddToCart = (item: MenuItem) => {
    if ((item.stock_quantity ?? 0) <= 0) return;
    
    // Ajouter directement sans suppléments
    const promotion = itemPromotions[item.id];
    const discount = getDiscountAmount(item.prix, promotion);
    addToCart({
      ...item,
      prix: item.prix - discount,
      original_prix: item.prix,
      promotion_title: promotion?.title,
    });
  };

  const handleConfirmSupplements = () => {
    if (!selectedItemForSupplements) return;
    
    const promotion = itemPromotions[selectedItemForSupplements.id];
    const discount = getDiscountAmount(selectedItemForSupplements.prix, promotion);
    const supplementsPrixTotal = selectedSupplements.reduce((sum, sup) => sum + sup.prix, 0);
    
    addToCart({
      ...selectedItemForSupplements,
      prix: selectedItemForSupplements.prix - discount + supplementsPrixTotal,
      original_prix: selectedItemForSupplements.prix,
      promotion_title: promotion?.title,
    }, selectedSupplements);
    
    setShowSupplementModal(false);
    setSelectedItemForSupplements(null);
    setSelectedSupplements([]);
  };

  const toggleSupplement = (supplement: Supplement) => {
    setSelectedSupplements(prev => {
      const exists = prev.find(s => s.id === supplement.id);
      if (exists) {
        return prev.filter(s => s.id !== supplement.id);
      }
      return [...prev, supplement];
    });
  };

  return (
    <div className="space-y-8 md:space-y-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-[#101828] sm:text-4xl md:text-5xl">Meni nou</h1>
          <p className="text-base md:text-lg text-[#667085] font-medium">Dekouvri bon gou kreyòl lakay nou.</p>
        </div>
        
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" size={20} />
            <input 
              type="text"
              placeholder="Chèche yon plat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-6 text-sm font-medium shadow-sm transition-all focus:border-[#F4A640] focus:outline-none focus:ring-4 focus:ring-[#F4A640]/10 sm:w-[28rem]"
            />
          </div>
        </div>
      </div>

      {/* Day Selector */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <CalendarDays className="text-[#F4A640]" size={24} />
          <h2 className="text-lg md:text-xl font-bold text-[#101828]">Menu par jour</h2>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {daysOfWeek.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs md:text-sm font-bold transition-all ${
                selectedDay === day
                  ? "bg-[#F4A640] text-white shadow-lg"
                  : "bg-gray-50 text-[#667085] border border-gray-200 hover:border-[#F4A640] hover:text-[#F4A640]"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Categories - Sticky on Mobile */}
      <div className="sticky top-20 z-40 -mx-4 bg-[#F9FAFB]/95 px-4 py-2 backdrop-blur-md md:static md:mx-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar md:justify-center">
           {categories.map(cat => (
             <button
               key={cat}
               onClick={() => setSelectedCategory(cat)}
               className={`whitespace-nowrap rounded-full px-5 py-2.5 text-xs md:text-sm font-bold transition-all ${
                 selectedCategory === cat
                 ? "bg-[#101828] text-white"
                 : "bg-white text-[#667085] border border-gray-300 hover:border-[#F4A640] hover:text-[#F4A640]"
               }`}
             >
               {categoryLabels[cat] || cat}
             </button>
           ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#F4A640] border-t-transparent"></div>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid auto-rows-fr gap-6 pb-10 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const outOfStock = (item.stock_quantity ?? 0) <= 0;
            const promotion = itemPromotions[item.id];
            const discount = getDiscountAmount(item.prix, promotion);
            const finalPrice = item.prix - discount;

            return (
            <div key={item.id} className={`group flex h-full min-w-0 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white transition-all duration-300 ${outOfStock ? "opacity-60 grayscale" : "hover:shadow-xl hover:border-transparent"}`}>
              <div className="relative h-56 md:h-64 w-full overflow-hidden">
                <img 
                  src={item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"} 
                  alt={item.nom}
                  className={`h-full w-full object-cover transition-transform duration-700 ${outOfStock ? "" : "group-hover:scale-110"}`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400";
                  }}
                />
                {item.best_seller && (
                  <div className="absolute left-4 top-4 md:left-6 md:top-6 flex items-center gap-2 rounded-xl bg-[#F4A640] px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs font-bold text-white shadow-lg">
                    <Flame size={14} fill="currentColor" />
                    PI VANN
                  </div>
                )}
                {outOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                    <span className="rounded-2xl bg-white px-5 py-3 text-sm font-black uppercase tracking-widest text-[#101828] shadow-xl">
                      Pa disponib
                    </span>
                  </div>
                )}
                {promotion && !outOfStock && (
                  <div className="absolute left-4 bottom-4 rounded-xl bg-red-600 px-3 py-2 text-xs font-black uppercase tracking-wider text-white shadow-lg">
                    Promo -{promotion.discount_type === "percent" ? `${promotion.discount_value}%` : `${promotion.discount_value} HTG`}
                  </div>
                )}
                <div className="absolute right-4 bottom-4 md:right-6 md:bottom-6 rounded-xl md:rounded-2xl bg-white/90 backdrop-blur-md px-4 py-2 md:px-5 md:py-2.5 text-base md:text-lg font-black text-[#101828] shadow-lg border border-white/20">
                  {finalPrice} HTG
                </div>
              </div>
              
              <div className="flex flex-1 flex-col space-y-4 p-5 sm:p-6 md:space-y-6 md:p-8">
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="break-words text-xl font-bold leading-tight text-[#101828] md:text-2xl">{item.nom}</h3>
                    <span className="shrink-0 text-[10px] font-black text-[#98A2B3] uppercase tracking-widest bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">{categoryLabels[item.categorie] || item.categorie}</span>
                  </div>
                  <p className="text-[#667085] line-clamp-2 text-xs md:text-sm leading-relaxed font-medium">{item.description || ""}</p>
                </div>
                
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex items-center gap-3 text-xs font-bold text-[#667085]">
                    <span className="inline-flex items-center gap-1.5">
                      <div className="p-1.5 rounded-lg bg-gray-50 text-[#98A2B3]">
                        <Clock size={16} />
                      </div>
                      {item.temps_prep} min
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <div className="p-1.5 rounded-lg bg-gray-50 text-[#F4A640]">
                        <CalendarDays size={16} />
                      </div>
                      {item.jour || "Tout jou"}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleAddToCart(item)}
                    disabled={outOfStock}
                    className={`flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-xl md:rounded-2xl text-white transition-all duration-300 shadow-lg active:scale-90 ${
                      outOfStock
                        ? "cursor-not-allowed bg-gray-300 shadow-none"
                        : "bg-[#F4A640] hover:bg-[#101828] hover:rotate-90 shadow-[#F4A640]/20"
                    }`}
                    title={outOfStock ? "Plat la pa disponib" : "Ajoute nan panyen"}
                  >
                    <Plus size={24} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center space-y-6">
          <div className="h-20 w-20 md:h-24 md:w-24 rounded-3xl bg-gray-50 flex items-center justify-center text-[#98A2B3] border border-gray-100">
            <ShoppingBasket size={48} />
          </div>
          <div className="space-y-2">
            <p className="text-xl md:text-2xl font-bold text-[#101828]">Nou pa jwenn okenn plat</p>
            <p className="text-sm md:text-base text-[#667085] font-medium">Chanje rechèch la oswa chwazi yon lòt kategori.</p>
          </div>
        </div>
      )}

    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center">Ap chaje...</div>}>
      <MenuContent />
    </Suspense>
  );
}
