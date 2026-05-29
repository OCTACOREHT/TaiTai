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
  { name: "Grillades", label: "Griyad", icon: Flame, color: "bg-orange-50", text: "text-orange-600" },
  { name: "Signature", label: "Siyati", icon: Award, color: "bg-yellow-50", text: "text-yellow-600" },
  { name: "Burgers", label: "Bègè", icon: Beef, color: "bg-red-50", text: "text-red-600" },
  { name: "Pâtes", label: "Pat", icon: Soup, color: "bg-blue-50", text: "text-blue-600" },
  { name: "Desserts", label: "Desè", icon: CakeSlice, color: "bg-pink-50", text: "text-pink-600" },
  { name: "Boissons", label: "Bwason", icon: GlassWater, color: "bg-cyan-50", text: "text-cyan-600" },
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
            <span>Referans gou a nan Pòtoprens</span>
          </div>
          <h1 className="text-4xl font-extrabold leading-[1.1] md:text-6xl tracking-tight">
            Nanm kizin <span className="text-[#F4A640]">kreyol</span> otantik la.
          </h1>
          <p className="text-lg leading-relaxed text-gray-300 font-light">
            Dekouvri plat siyati nou yo, prepare ak pasyon epi ak engredyan fre lakay.
            Yon eksplozyon gou ki rive lakay ou byen vit.
          </p>
          <div className="flex flex-wrap gap-5">
            <Link
              href="/menu"
              className="flex items-center gap-3 rounded-2xl bg-[#F4A640] px-10 py-5 font-bold text-white transition hover:bg-[#db8923] hover:scale-[1.02] active:scale-95 shadow-lg shadow-[#F4A640]/20"
            >
              Kòmande kounye a
              <ArrowRight size={22} />
            </Link>
            <Link
              href="/suivi"
              className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md px-10 py-5 font-bold text-white transition hover:bg-white/10 active:scale-95"
            >
              Swivi kòmand mwen
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold tracking-tight text-[#101828]">Espesyalite nou yo</h2>
            <p className="text-[#667085] text-lg font-medium">Eksplore pi bon gou kizin nou an</p>
          </div>
          <Link href="/menu" className="group flex items-center gap-2 text-sm font-bold text-[#F4A640] transition hover:gap-3">
            Dekouvri tout meni an
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
                <span className="font-bold text-[#101828]">{cat.label}</span>
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
          <h3 className="text-2xl font-bold text-[#101828]">Livrezon rapid</h3>
          <p className="text-[#667085] leading-relaxed">
            Pa gen tann lontan. Plat ou yo rive cho nan mwens pase 30 minit, kote ou ye a.
          </p>
        </div>
        <div className="group rounded-3xl bg-white border border-gray-100 p-12 space-y-6 transition hover:shadow-xl">
          <div className="h-14 w-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
             <Utensils size={28} />
          </div>
          <h3 className="text-2xl font-bold text-[#101828]">Engredyan lokal</h3>
          <p className="text-[#667085] leading-relaxed">
            Nou travay ak pwodiktè ayisyen yo pou garanti frechè nan chak plat.
          </p>
        </div>
        <div className="group rounded-3xl bg-white border border-gray-100 p-12 space-y-6 transition hover:shadow-xl">
          <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
             <Heart size={28} />
          </div>
          <h3 className="text-2xl font-bold text-[#101828]">Kwit ak pasyon</h3>
          <p className="text-[#667085] leading-relaxed">
            Chak komand prepare youn pa youn pa chef nou yo pou respekte gou otantik la.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="rounded-3xl bg-[#F4A640] p-12 text-center text-white space-y-8 shadow-xl shadow-[#F4A640]/30">
        <h2 className="text-4xl font-extrabold tracking-tight">Pare pou gou TaiTai a pran ou?</h2>
        <p className="text-xl opacity-90 max-w-xl mx-auto font-medium">
          Vin jwenn moun ki renmen bon manje yo epi pwofite yon eksperyans gou ou pap bliye.
        </p>
        <div className="flex justify-center">
          <Link
            href="/menu"
            className="rounded-2xl bg-white px-12 py-5 font-bold text-[#F4A640] transition hover:scale-105 active:scale-95 shadow-lg"
          >
            Eksplore meni konplè a
          </Link>
        </div>
      </section>
    </div>
  );
}
