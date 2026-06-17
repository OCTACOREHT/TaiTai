"use client";

import { Outfit } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingCart, Home, UtensilsCrossed, MapPin, History, Phone } from "lucide-react";
import { CartProvider, useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/components/common/CmsShared";
import AuthModal from "@/components/auth/AuthModal";

const outfit = Outfit({ subsets: ["latin"] });

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <ClientLayoutContent>{children}</ClientLayoutContent>
    </CartProvider>
  );
}

function ClientLayoutContent({ children }: { children: React.ReactNode }) {
  const { totalItems } = useCart();
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const isProtected = pathname === "/panier" || pathname === "/suivi" || pathname === "/historique";
  const protectedMessage =
    pathname === "/suivi" || pathname === "/historique"
      ? "Ou dwe konekte pou swiv kòmann ou yo."
      : "Ou dwe konekte pou antre nan panyen an epi pase kòmann.";
  if (isProtected && !loading && !user) {
    return (
      <div className={`${outfit.className} flex min-h-screen flex-col items-center justify-center gap-8 bg-[#F9FAFB] px-6 text-center`}>
        <div className="relative h-20 w-40">
  <Image
    src="/images/logo/tailogo.png"
    alt="TaïTaï"
    fill
    className="object-contain"
  />
</div>
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-[#101828]">Koneksyon obligatwa</h1>
          <p className="max-w-sm font-medium text-[#667085]">{protectedMessage}</p>
          <p className="hidden">
            Ou dwe konekte pou antre nan panyen an epi pase kòmann.
          </p>
        </div>
        <AuthModal />
      </div>
    );
  }

  const navLinks = [
    { href: "/", label: "Akèy", icon: Home },
    { href: "/menu", label: "Meni nou", icon: UtensilsCrossed },
    { href: "/suivi", label: "Swiv kòmann mwen", icon: MapPin },
    { href: "/historique", label: "Istorik", icon: History },
    { href: "/contact", label: "Kontak", icon: Phone },
  ];

  return (
    <div className={`${outfit.className} min-h-screen bg-[#F9FAFB] pb-20 text-[#101828] selection:bg-[#F4A640] selection:text-white md:pb-0`}>
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="group flex items-center">
            <div className="relative h-8 w-32 transition-transform group-hover:scale-105">
              <Image src="/images/logo/tailogo.png" alt="TaïTaï" fill className="object-contain object-left" />
            </div>
          </Link>

          <nav className="hidden min-w-0 items-center gap-4 md:flex lg:gap-8 xl:gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "whitespace-nowrap text-sm font-semibold transition hover:text-[#F4A640]",
                  pathname === link.href ? "text-[#F4A640]" : "text-[#475467]",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <AuthModal />
            <Link
              href="/panier"
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#475467] shadow-sm transition hover:border-[#F4A640] hover:text-[#F4A640]"
              title="Panyen"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#F4A640] text-[10px] font-black text-white shadow-lg ring-4 ring-white animate-in zoom-in duration-300">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl overflow-hidden px-4 py-8 sm:px-6 md:py-12">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-between border-t border-gray-100 bg-white/90 px-1 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:px-3 md:hidden">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-1 transition-all duration-300",
                isActive ? "scale-110 text-[#F4A640]" : "text-[#98A2B3] hover:text-[#475467]",
              )}
            >
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-2xl transition-all", isActive ? "bg-[#F4A640]/10" : "")}>
                <Icon size={isActive ? 21 : 19} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="max-w-full truncate text-[9px] font-bold uppercase tracking-wide sm:text-[10px]">{link.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>

      <footer className="hidden border-t border-gray-200 bg-white py-16 md:block">
  <div className="mx-auto max-w-7xl px-6">
    <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-6">
        <div className="relative h-8 w-32">
          <Image
            src="/images/logo/tailogo.png"
            alt="TaïTaï"
            fill
            className="object-contain object-left"
          />
        </div>
        <p className="text-sm leading-relaxed text-[#475467]">
          Pi bon gou kizin kreyòl la, ak engredyan fre, resèt lakay, epi livrezon rapid.
        </p>
      </div>

      <div>
        <h4 className="mb-6 font-bold text-[#101828]">Navigasyon</h4>
        <ul className="space-y-4 text-sm text-[#475467]">
          <li><Link href="/" className="hover:text-[#F4A640]">Akèy</Link></li>
          <li><Link href="/menu" className="hover:text-[#F4A640]">Meni</Link></li>
          <li><Link href="/historique" className="hover:text-[#F4A640]">Istorik</Link></li>
          <li><Link href="/contact" className="hover:text-[#F4A640]">Kontak</Link></li>
          <li><Link href="/suivi" className="hover:text-[#F4A640]">Swivi kòmann</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="mb-6 font-bold text-[#101828]">Kontak</h4>
        <ul className="space-y-4 text-sm text-[#475467]">
          <li>Port-au-Prince, Ayiti</li>
          <li>+509 31 19 1999</li>
          <li><a href="mailto:info@xn--tata-6pac.com" className="hover:text-[#F4A640]">info@taïtaï.com</a></li>
        </ul>
      </div>

      <div>
        <h4 className="mb-6 font-bold text-[#101828]">Orè</h4>
        <ul className="space-y-4 text-sm text-[#475467]">
          <li>Livrezon: apati 12h midi</li>
          <li>Lendi - Dimanch: 12h - 22h</li>
        </ul>
      </div>
    </div>

    <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 md:flex-row">
      <p className="text-xs text-[#98A2B3]">© 2026 TaïTaï Restaurant. Fyète Ayiti.</p>
      <div className="flex gap-6">
        <span className="cursor-pointer text-xs text-[#98A2B3] hover:text-[#475467]">
          Enfòmasyon legal
        </span>
        <span className="cursor-pointer text-xs text-[#98A2B3] hover:text-[#475467]">
          Konfidansyalite
        </span>
      </div>
    </div>
  </div>
</footer>
    </div>
  );
}
