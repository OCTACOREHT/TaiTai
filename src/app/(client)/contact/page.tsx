"use client";

import Link from "next/link";
import {
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Truck,
} from "lucide-react";

const contactCards = [
  {
    title: "Telefòn",
    value: "+509 31 19 1999",
    note: "Rele nou pou kesyon rapid.",
    icon: Phone,
  },
  {
    title: "Email",
    value: "contact@taitai.ht",
    note: "Nou reponn mesaj yo pi vit posib.",
    icon: Mail,
  },
  {
    title: "Adrès",
    value: "Pòtoprens, Ayiti",
    note: "Livrezon disponib nan depatman Lwès.",
    icon: MapPin,
  },
];

export default function ContactPage() {
  return (
    <div className="space-y-14 pb-16">
      <section className="grid gap-8 rounded-3xl bg-[#101828] p-6 text-white shadow-2xl sm:p-8 md:grid-cols-[1.1fr_0.9fr] md:p-12">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-[#F4A640]">
            <MessageCircle className="h-4 w-4" />
            Kontakte TaiTai
          </span>
          <div className="space-y-4">
            <h1 className="text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
              Nou la pou ede w ak kòmann ou.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-gray-300 sm:text-lg">
              Bezwen poze yon kesyon, verifye livrezon, oswa pale ak ekip la?
              Voye mesaj la, rele nou, oubyen pase kòmann ou dirèkteman nan meni an.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/menu"
              className="inline-flex w-full items-center justify-center rounded-2xl bg-[#F4A640] px-6 py-4 text-sm font-black text-white transition hover:bg-[#db8923] sm:w-auto"
            >
              Gade meni an
            </Link>
            <Link
              href="/suivi"
              className="inline-flex w-full items-center justify-center rounded-2xl border border-white/15 px-6 py-4 text-sm font-black text-white transition hover:bg-white/10 sm:w-auto"
            >
              Swiv kòmann mwen
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:p-6">
          <div className="space-y-5">
            <InfoRow icon={<Clock />} label="Orè" value="Livrezon apati 12h midi" />
            <InfoRow icon={<Truck />} label="Livrezon" value="Disponib sèlman nan Lwès" />
            <InfoRow icon={<Phone />} label="Sèvis kliyan" value="+509 31 19 1999" />
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {contactCards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4A640]/10 text-[#F4A640]">
                <Icon className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-black text-[#101828]">{card.title}</h2>
              <p className="mt-2 font-bold text-[#344054]">{card.value}</p>
              <p className="mt-2 text-sm leading-6 text-[#667085]">{card.note}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-2xl font-black text-[#101828]">Enfòmasyon itil</h2>
          <div className="mt-6 space-y-4 text-sm leading-7 text-[#667085]">
            <p>
              Pou livrezon, TaiTai sèvi kounye a sèlman zòn ki nan depatman Lwès.
              Si adrès ou deyò Lwès, sit la ap montre livrezon pa disponib.
            </p>
            <p>
              Pou peman MonCash oswa Zelle, sonje ajoute justificatif la lè w ap pase kòmann nan.
              Ekip la ap verifye l avan kòmann nan valide.
            </p>
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            alert("Mèsi! Mesaj ou a pare pou ekip TaiTai la.");
          }}
          className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-black text-[#101828]">Voye yon mesaj</h2>
            <p className="mt-2 text-sm text-[#667085]">Ranpli fòm nan, ekip la ap tounen jwenn ou.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              required
              placeholder="Non ou"
              className="h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#F4A640] focus:ring-4 focus:ring-[#F4A640]/10"
            />
            <input
              required
              type="tel"
              placeholder="Telefòn"
              className="h-12 rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#F4A640] focus:ring-4 focus:ring-[#F4A640]/10"
            />
          </div>
          <input
            type="email"
            placeholder="Email"
            className="mt-4 h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#F4A640] focus:ring-4 focus:ring-[#F4A640]/10"
          />
          <textarea
            required
            rows={5}
            placeholder="Ekri mesaj ou..."
            className="mt-4 w-full resize-none rounded-2xl border border-gray-200 bg-white p-4 text-sm font-semibold outline-none transition focus:border-[#F4A640] focus:ring-4 focus:ring-[#F4A640]/10"
          />
          <button
            type="submit"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#101828] px-6 py-4 text-sm font-black text-white transition hover:bg-[#1D2939] md:w-auto"
          >
            Voye mesaj
            <Send className="h-4 w-4" />
          </button>
        </form>
      </section>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl bg-white/5 p-4">
      <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4A640]/15 text-[#F4A640]">
        {icon}
      </span>
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">{label}</p>
        <p className="mt-1 font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
