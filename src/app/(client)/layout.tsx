"use client";

import { Outfit } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingCart, Home, UtensilsCrossed, Search, MapPin } from 'lucide-react';
import { CartProvider, useCart } from '@/context/CartContext';
import { cn } from '@/components/common/CmsShared';

const outfit = Outfit({ subsets: ['latin'] });

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
  const pathname = usePathname();
  
  const navLinks = [
    { href: '/', label: 'Accueil', icon: Home },
    { href: '/menu', label: 'Notre Menu', icon: UtensilsCrossed },
    { href: '/suivi', label: 'Suivre ma commande', icon: MapPin },
  ];

  return (
    <div className={`${outfit.className} min-h-screen bg-[#F9FAFB] text-[#101828] selection:bg-[#F4A640] selection:text-white pb-20 md:pb-0`}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-transform group-hover:scale-105">
              <Image 
                src="/images/logo/tailogo.png" 
                alt="TaiTai" 
                fill 
                className="object-contain p-1.5"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight leading-none">TaiTai</span>
              <span className="text-[10px] uppercase tracking-widest text-[#F4A640] font-bold">Authentic Cuisine</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className={cn(
                  "text-sm font-semibold transition hover:text-[#F4A640]",
                  pathname === link.href ? "text-[#F4A640]" : "text-[#475467]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="/panier"
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-[#475467] shadow-sm transition hover:border-[#F4A640] hover:text-[#F4A640]"
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

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 md:py-12">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t border-gray-100 bg-white/90 backdrop-blur-xl px-4 md:hidden shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                isActive ? "text-[#F4A640] scale-110" : "text-[#98A2B3] hover:text-[#475467]"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-2xl transition-all",
                isActive ? "bg-[#F4A640]/10" : ""
              )}>
                <Icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">{link.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer (Hidden on very small screens or made simpler) */}
      <footer className="border-t border-gray-200 bg-white py-16 hidden md:block">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-gray-100 shadow-sm">
                  <Image src="/images/logo/tailogo.png" alt="TaiTai" fill className="object-contain p-1" />
                </div>
                <span className="text-xl font-bold tracking-tight text-[#101828]">TaiTai</span>
              </div>
              <p className="text-sm leading-relaxed text-[#475467]">
                L'excellence de la cuisine créole revisitée. Des ingrédients frais, des recettes ancestrales et une livraison ultra-rapide.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-[#101828]">Navigation</h4>
              <ul className="space-y-4 text-sm text-[#475467]">
                <li><Link href="/" className="hover:text-[#F4A640]">Accueil</Link></li>
                <li><Link href="/menu" className="hover:text-[#F4A640]">Menu</Link></li>
                <li><Link href="/suivi" className="hover:text-[#F4A640]">Suivi Commande</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-[#101828]">Contact</h4>
              <ul className="space-y-4 text-sm text-[#475467]">
                <li>Port-au-Prince, Haïti</li>
                <li>+509 0000-0000</li>
                <li>contact@taitai.ht</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-[#101828]">Horaires</h4>
              <ul className="space-y-4 text-sm text-[#475467]">
                <li>Lun - Ven: 11h - 22h</li>
                <li>Sam - Dim: 12h - 23h</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-16 border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[#98A2B3]">© 2026 TaiTai Restaurant. Fièrement Haïtien.</p>
            <div className="flex gap-6">
              <span className="text-xs text-[#98A2B3] cursor-pointer hover:text-[#475467]">Mentions légales</span>
              <span className="text-xs text-[#98A2B3] cursor-pointer hover:text-[#475467]">Confidentialité</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
