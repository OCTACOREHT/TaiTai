import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "404 — Page introuvable | TaïTaï",
  description: "Paj sa a pa egziste sou platfòm TaïTaï.",
};

export default function Error404Page() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#101828] px-6 py-12">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-500/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-brand-500/8 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/3 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 text-center">
        {/* Logo */}
        <div className="relative h-12 w-48">
          <Image
            src="/images/logo/tailogo.png"
            alt="TaïTaï"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* 404 number */}
        <div className="space-y-1">
          <p className="text-[120px] font-black leading-none text-brand-500 sm:text-[160px]">
            404
          </p>
          <div className="mx-auto h-1 w-24 rounded-full bg-brand-500/40" />
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            Paj sa a pa egziste
          </h1>
          <p className="max-w-sm text-base text-[#98A2B3]">
            Li sanble ou pèdi chemen ou. Paj ou ap chèche a pa disponib oswa deplase.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-6 py-3 text-sm font-black text-[#101828] transition hover:bg-brand-600"
          >
            ← Retounen akèy
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Dashboard admin
          </Link>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-xs text-[#475467]">
        © {new Date().getFullYear()} TaïTaï · Fyète Ayiti
      </p>
    </div>
  );
}
