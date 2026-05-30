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
  GlassWater,
} from "lucide-react";

const categories = [
  { name: "Grillades", label: "Griyay", icon: Flame, color: "bg-orange-50", text: "text-orange-600" },
  { name: "Signature", label: "Espesyal", icon: Award, color: "bg-yellow-50", text: "text-yellow-600" },
  { name: "Burgers", label: "Bègè", icon: Beef, color: "bg-red-50", text: "text-red-600" },
  { name: "Pâtes", label: "Pat", icon: Soup, color: "bg-blue-50", text: "text-blue-600" },
  { name: "Desserts", label: "Desè", icon: CakeSlice, color: "bg-pink-50", text: "text-pink-600" },
  { name: "Boissons", label: "Bwason", icon: GlassWater, color: "bg-cyan-50", text: "text-cyan-600" },
];

export default function ClientHomePage() {
  return (
    <div className="space-y-24 pb-20">
      <section className="relative overflow-hidden rounded-3xl bg-[#101828] p-8 text-white shadow-2xl md:px-12 md:py-16">
        <div className="absolute right-0 top-0 h-full w-full opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#101828] via-[#101828]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-[#F4A640] backdrop-blur-md">
            <Star size={16} fill="currentColor" />
            <span>Referans bon gou nan Pòtoprens</span>
          </div>
          <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight md:text-6xl">
            Nanm kizin <span className="text-[#F4A640]">Kreyòl</span> la.
          </h1>
          <p className="text-lg font-light leading-relaxed text-gray-300">
            Dekouvri plat espesyal nou yo, prepare ak pasyon epi ak engredyan fre lakay.
            Nou pote bon gou rive jwenn ou rapid.
          </p>
          <div className="flex flex-wrap gap-5">
            <Link
              href="/menu"
              className="flex items-center gap-3 rounded-2xl bg-[#F4A640] px-10 py-5 font-bold text-white shadow-lg shadow-[#F4A640]/20 transition hover:scale-[1.02] hover:bg-[#db8923] active:scale-95"
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
            <h2 className="text-4xl font-bold tracking-tight text-[#101828]">Espesyalite nou yo</h2>
            <p className="text-lg font-medium text-[#667085]">Goute pi bon manje lakay nou yo</p>
          </div>
          <Link href="/menu" className="group flex items-center gap-2 text-sm font-bold text-[#F4A640] transition hover:gap-3">
            Gade tout meni an
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
                className="group flex flex-col items-center gap-5 rounded-3xl border border-gray-100 bg-white p-8 transition-all duration-300 hover:-translate-y-2 hover:border-[#F4A640]/30 hover:shadow-xl"
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

      <section className="grid gap-8 md:grid-cols-3">
        <div className="group space-y-6 rounded-3xl border border-gray-100 bg-white p-12 transition hover:shadow-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#F4A640]">
            <Clock size={28} />
          </div>
          <h3 className="text-2xl font-bold text-[#101828]">Livrezon rapid</h3>
          <p className="leading-relaxed text-[#667085]">Ou pa bezwen tann lontan. Plat ou rive cho, nenpòt kote ou ye.</p>
        </div>
        <div className="group space-y-6 rounded-3xl border border-gray-100 bg-white p-12 transition hover:shadow-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600">
            <Utensils size={28} />
          </div>
          <h3 className="text-2xl font-bold text-[#101828]">Engredyan lokal</h3>
          <p className="leading-relaxed text-[#667085]">Nou chwazi bon pwodwi lokal pou bay manje fre ak bon kalite.</p>
        </div>
        <div className="group space-y-6 rounded-3xl border border-gray-100 bg-white p-12 transition hover:shadow-xl">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <Heart size={28} />
          </div>
          <h3 className="text-2xl font-bold text-[#101828]">Kwit ak pasyon</h3>
          <p className="leading-relaxed text-[#667085]">Chak kòmann prepare ak swen pou respekte gou orijinal chak plat.</p>
        </div>
      </section>

      <section className="space-y-8 rounded-3xl bg-[#F4A640] p-12 text-center text-white shadow-xl shadow-[#F4A640]/30">
        <h2 className="text-4xl font-extrabold tracking-tight">Ou pare pou gou TaiTai a ?</h2>
        <p className="mx-auto max-w-xl text-xl font-medium opacity-90">
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
