"use client";

import React from "react";
import Link from "next/link";
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
  GlassWater 
} from "lucide-react";

const categories = [
  { name: "Grillades", icon: Flame, color: "bg-orange-50", text: "text-orange-600" },
  { name: "Signature", icon: Award, color: "bg-yellow-50", text: "text-yellow-600" },
  { name: "Burgers", icon: Beef, color: "bg-red-50", text: "text-red-600" },
  { name: "Pâtes", icon: Soup, color: "bg-blue-50", text: "text-blue-600" },
  { name: "Desserts", icon: CakeSlice, color: "bg-pink-50", text: "text-pink-600" },
  { name: "Boissons", icon: GlassWater, color: "bg-cyan-50", text: "text-cyan-600" },
];

export default function ClientHomePage() {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-[#101828] p-8 md:py-16 md:px-12 text-white shadow-2xl">
        <div className="absolute right-0 top-0 h-full w-full opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200')] bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#101828] via-[#101828]/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-2xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-5 py-2 text-sm font-semibold text-[#F4A640]">
            <Star size={16} fill="currentColor" />
            <span>La référence du goût à Port-au-Prince</span>
          </div>
          <h1 className="text-4xl font-extrabold leading-[1.1] md:text-6xl tracking-tight">
            L'âme de la cuisine <span className="text-[#F4A640]">Créole</span> authentique.
          </h1>
          <p className="text-lg leading-relaxed text-gray-300 font-light">
            Découvrez nos plats signatures préparés avec passion et des ingrédients frais du terroir. 
            Une explosion de saveurs livrée chez vous en un temps record.
          </p>
          <div className="flex flex-wrap gap-5">
            <Link
              href="/menu"
              className="flex items-center gap-3 rounded-2xl bg-[#F4A640] px-10 py-5 font-bold text-white transition hover:bg-[#db8923] hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#F4A640]/20"
            >
              Commander maintenant
              <ArrowRight size={22} />
            </Link>
            <Link
              href="/suivi"
              className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md px-10 py-5 font-bold text-white transition hover:bg-white/10 active:scale-95"
            >
              Suivre ma commande
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold tracking-tight text-[#101828]">Nos Spécialités</h2>
            <p className="text-[#667085] text-lg font-medium">Explorez le meilleur de notre gastronomie</p>
          </div>
          <Link href="/menu" className="group flex items-center gap-2 text-sm font-bold text-[#F4A640] transition hover:gap-3">
            Découvrir tout le menu
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={`/menu?cat=${cat.name}`}
                className="group flex flex-col items-center gap-5 rounded-3xl border border-gray-100 bg-white p-8 transition-all duration-300 hover:border-[#F4A640]/30 hover:shadow-xl hover:-translate-y-2"
              >
                <div className={`relative flex h-24 w-24 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${cat.color} shadow-sm`}>
                  <Icon className={`h-12 w-12 ${cat.text}`} strokeWidth={1.5} />
                </div>
                <span className="font-bold text-[#101828]">{cat.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="grid gap-8 md:grid-cols-3">
        <div className="group rounded-3xl bg-white border border-gray-100 p-12 space-y-6 transition hover:shadow-xl">
          <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center text-[#F4A640]">
             <Clock size={28} />
          </div>
          <h3 className="text-2xl font-bold text-[#101828]">Livraison Express</h3>
          <p className="text-[#667085] leading-relaxed">
            Pas d'attente interminable. Vos plats arrivent fumants en moins de 30 minutes, où que vous soyez.
          </p>
        </div>
        <div className="group rounded-3xl bg-white border border-gray-100 p-12 space-y-6 transition hover:shadow-xl">
          <div className="h-14 w-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
             <Utensils size={28} />
          </div>
          <h3 className="text-2xl font-bold text-[#101828]">Ingrédients Locaux</h3>
          <p className="text-[#667085] leading-relaxed">
            Nous travaillons main dans la main avec les producteurs haïtiens pour vous garantir une fraîcheur absolue.
          </p>
        </div>
        <div className="group rounded-3xl bg-white border border-gray-100 p-12 space-y-6 transition hover:shadow-xl">
          <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
             <Heart size={28} />
          </div>
          <h3 className="text-2xl font-bold text-[#101828]">Cuisiné avec Passion</h3>
          <p className="text-[#667085] leading-relaxed">
            Chaque commande est préparée individuellement par nos chefs pour respecter l'authenticité de chaque saveur.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="rounded-3xl bg-[#F4A640] p-12 text-center text-white space-y-8 shadow-xl shadow-[#F4A640]/30">
        <h2 className="text-4xl font-extrabold tracking-tight">Prêt à succomber au goût TaiTai ?</h2>
        <p className="text-xl opacity-90 max-w-xl mx-auto font-medium">
          Rejoignez des milliers de gourmets et profitez d'une expérience culinaire inoubliable dès aujourd'hui.
        </p>
        <div className="flex justify-center">
          <Link
            href="/menu"
            className="rounded-2xl bg-white px-12 py-5 font-bold text-[#F4A640] transition hover:scale-105 active:scale-95 shadow-lg"
          >
            Explorer le menu complet
          </Link>
        </div>
      </section>
    </div>
  );
}
