"use client";

import { cn } from "@/components/common/CmsShared";
import { useCms } from "@/context/CmsContext";
import Link from "next/link";
import React from "react";

const navItems = [
  { href: "#hero", label: "Accueil" },
  { href: "#articles", label: "Articles" },
  { href: "#stages", label: "Stages" },
  { href: "#partenaires", label: "Partenaires" },
];

export default function PublicSiteShell({ children }: { children: React.ReactNode }) {
  const { currentUser, siteSettings } = useCms();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <a href="#hero" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-500/20 ring-1 ring-inset ring-brand-400/30">
              <span className="text-lg font-semibold text-brand-300">FT</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{siteSettings.siteName}</p>
              <p className="text-xs text-gray-400">{siteSettings.publicTagline}</p>
            </div>
          </a>
          <nav className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  "text-gray-300 hover:bg-white/10 hover:text-white",
                )}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href={currentUser ? "/dashboard" : "/signin"}
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              {currentUser ? "Acceder au CMS" : "Connexion"}
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-white/10 bg-gray-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-gray-400 sm:px-6 lg:grid-cols-[1.6fr_1fr_1fr] lg:px-8">
          <div>
            <p className="text-base font-semibold text-white">{siteSettings.siteName}</p>
            <p className="mt-3 max-w-xl leading-7">{siteSettings.footerText}</p>
          </div>
          <div>
            <p className="font-semibold text-white">Contact</p>
            <p className="mt-3">{siteSettings.primaryEmail}</p>
            <p className="mt-2">{siteSettings.phone}</p>
          </div>
          <div>
            <p className="font-semibold text-white">Adresse</p>
            <p className="mt-3">{siteSettings.address}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
