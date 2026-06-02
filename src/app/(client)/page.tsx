"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase-client";
import { MenuItem } from "@/types/restaurant";
import {
  ArrowRight,
  Star,
  Clock,
  Utensils,
  Heart,
  Flame,
  Award,
  Beef,
  Soup,
  CakeSlice,
  GlassWater,
  Plus,
} from "lucide-react";

const categories = [
  { name: "Grillades", label: "Griyay", icon: Flame, color: "bg-orange-50", text: "text-orange-600" },
  { name: "Signature", label: "Espesyal", icon: Award, color: "bg-yellow-50", text: "text-yellow-600" },
  { name: "Burgers", label: "Bègè", icon: Beef, color: "bg-red-50", text: "text-red-600" },
  { name: "Pâtes", label: "Pat", icon: Soup, color: "bg-blue-50", text: "text-blue-600" },
  { name: "Desserts", label: "Desè", icon: CakeSlice, color: "bg-pink-50", text: "text-pink-600" },
  { name: "Boissons", label: "Bwason", icon: GlassWater, color: "bg-cyan-50", text: "text-cyan-600" },
];

const featuredDishes = [
  {
    name: "Poulet grille TaiTai",
    category: "Griyay",
    price: 1450,
    image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c7?w=600",
  },
  {
    name: "Bowl riz creole",
    category: "Espesyal",
    price: 1350,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600",
  },
  {
    name: "Burger creole",
    category: "Begè",
    price: 1290,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
  },
];

featuredDishes.push(
  {
    name: "Pates fruits de mer",
    category: "Pat",
    price: 1890,
    image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600",
  },
  {
    name: "Jus passion maison",
    category: "Bwason",
    price: 550,
    image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600",
  },
);

export default function ClientHomePage() {
  const { addToCart } = useCart();
  const [homeDishes, setHomeDishes] = useState<MenuItem[]>([]);

  useEffect(() => {
    async function fetchFeaturedDishes() {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("disponible", true)
        .is("deleted_at", null)
        .order("best_seller", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error && data) {
        setHomeDishes(data as MenuItem[]);
      }
    }

    fetchFeaturedDishes();
  }, []);

  const handleAddDish = (dish: MenuItem) => {
    addToCart(dish);
  };

  return (
    <div className="space-y-24 pb-20">
      <section className="relative overflow-hidden rounded-3xl bg-[#101828] p-6 text-white shadow-2xl sm:p-8 md:px-12 md:py-16">
        <div className="absolute right-0 top-0 h-full w-full opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#101828] via-[#101828]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-[#F4A640] backdrop-blur-md">
            <Star size={16} fill="currentColor" />
            <span>Referans bon gou nan Pòtoprens</span>
          </div>
          <h1 className="text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl md:text-6xl">
            Nanm kizin <span className="text-[#F4A640]">Kreyòl</span> la.
          </h1>
          <p className="text-lg font-light leading-relaxed text-gray-300">
            Dekouvri plat espesyal nou yo, prepare ak pasyon epi ak engredyan fre lakay.
            Nou pote bon gou rive jwenn ou rapid.
          </p>
          <div className="flex flex-wrap gap-5">
            <Link
              href="/menu"
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#F4A640] px-6 py-4 font-bold text-white shadow-lg shadow-[#F4A640]/20 transition hover:bg-[#db8923] active:scale-95 sm:w-auto sm:px-10 sm:py-5"
            >
              Kòmande kounye a
              <ArrowRight size={22} />
            </Link>
            <Link
              href="/suivi"
              className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-10 py-5 font-bold text-white backdrop-blur-md transition hover:bg-white/10 active:scale-95"
            >
              Swiv kòmann mwen
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-12">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-[#101828] sm:text-4xl">Espesyalite nou yo</h2>
            <p className="text-lg font-medium text-[#667085]">Goute pi bon manje lakay nou yo</p>
          </div>
          <Link href="/menu" className="group flex items-center gap-2 text-sm font-bold text-[#F4A640] transition hover:gap-3">
            Gade tout meni an
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={`/menu?cat=${cat.name}`}
                className="group flex flex-col items-center gap-4 rounded-3xl border border-gray-100 bg-white p-5 transition-all duration-300 hover:border-[#F4A640]/30 hover:shadow-xl sm:gap-5 sm:p-8"
              >
                <div className={`relative flex h-24 w-24 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-110 ${cat.color}`}>
                  <Icon className={`h-12 w-12 ${cat.text}`} strokeWidth={1.5} />
                </div>
                <span className="font-bold text-[#101828]">{cat.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="space-y-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-[#101828] sm:text-4xl">Kèk plat popilè</h2>
            <p className="text-lg font-medium text-[#667085]">Chwazi youn nan plat kliyan yo renmen anpil.</p>
            <p className="text-sm font-bold text-[#98A2B3] md:hidden">Glise a goch oswa adwat pou wè lòt plat yo.</p>
          </div>
        </div>

        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3 xl:grid-cols-5">
          {(homeDishes.length > 0 ? homeDishes : []).map((dish) => (
            <div
              key={dish.id}
              className="group min-w-[82vw] snap-center overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:min-w-[360px] md:min-w-0"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={dish.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600"}
                  alt={dish.nom}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <button
                  type="button"
                  onClick={() => handleAddDish(dish)}
                  title="Ajoute nan panyen"
                  className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4A640] text-white shadow-lg shadow-[#F4A640]/30 transition hover:rotate-90 hover:bg-[#101828] active:scale-95"
                >
                  <Plus size={24} strokeWidth={3} />
                </button>
              </div>
              <div className="space-y-3 p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[#F4A640]/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#C87518]">
                    {dish.categorie}
                  </span>
                  <span className="text-lg font-black text-[#F4A640]">{dish.prix} HTG</span>
                </div>
                <h3 className="text-xl font-black leading-tight text-[#101828]">{dish.nom}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Link
            href="/menu"
            className="inline-flex items-center gap-3 rounded-2xl bg-[#101828] px-8 py-4 font-black text-white shadow-lg shadow-black/10 transition hover:bg-[#F4A640] active:scale-95"
          >
            Voir plus
            <ArrowRight size={18} strokeWidth={3} />
          </Link>
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-3">
        <div className="group space-y-6 rounded-3xl border border-gray-100 bg-white p-6 transition hover:shadow-xl sm:p-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#F4A640]">
            <Clock size={28} />
          </div>
          <h3 className="text-2xl font-bold text-[#101828]">Livrezon rapid</h3>
          <p className="leading-relaxed text-[#667085]">Ou pa bezwen tann lontan. Plat ou rive cho, nenpòt kote ou ye.</p>
        </div>
        <div className="group space-y-6 rounded-3xl border border-gray-100 bg-white p-6 transition hover:shadow-xl sm:p-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600">
            <Utensils size={28} />
          </div>
          <h3 className="text-2xl font-bold text-[#101828]">Engredyan lokal</h3>
          <p className="leading-relaxed text-[#667085]">Nou chwazi bon pwodwi lokal pou bay manje fre ak bon kalite.</p>
        </div>
        <div className="group space-y-6 rounded-3xl border border-gray-100 bg-white p-6 transition hover:shadow-xl sm:p-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <Heart size={28} />
          </div>
          <h3 className="text-2xl font-bold text-[#101828]">Kwit ak pasyon</h3>
          <p className="leading-relaxed text-[#667085]">Chak kòmann prepare ak swen pou respekte gou orijinal chak plat.</p>
        </div>
      </section>

      <section className="space-y-8 rounded-3xl bg-[#F4A640] p-6 text-center text-white shadow-xl shadow-[#F4A640]/30 sm:p-12">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Ou pare pou gou TaiTai a ?</h2>
        <p className="mx-auto max-w-xl text-lg font-medium opacity-90 sm:text-xl">
          Pase kòmann ou jodi a epi jwi yon eksperyans manje ou pap bliye.
        </p>
        <div className="flex justify-center">
          <Link
            href="/menu"
            className="rounded-2xl bg-white px-12 py-5 font-bold text-[#F4A640] shadow-lg transition hover:scale-105 active:scale-95"
          >
            Gade meni konplè a
          </Link>
        </div>
      </section>
    </div>
  );
}
