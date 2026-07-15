import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { AuthProvider } from '@/context/AuthContext';
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { CmsProvider } from '@/context/CmsContext';


const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "TaïTaï - Fast Food Créole | Livraison à Port-au-Prince",
    template: "%s | TaïTaï Fast Food"
  },
  description: "TaïTaï - Le meilleur fast food créole de Port-au-Prince. Commandez en ligne : poulet grillé, burgers créoles, pâtes, desserts. Livraison rapide dans tout l'Ouest. Goûtez l'authenticité de la cuisine haïtienne !",
  keywords: ["taitaï", "taitai", "fast food", "créole", "haïtien", "Port-au-Prince", "livraison", "poulet grillé", "burger créole", "riz", "commande en ligne", "restaurant haïtien"],
  authors: [{ name: "TaïTaï Restaurant" }],
  creator: "TaïTaï",
  publisher: "TaïTaï",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/images/logo/tailogo.png",
    shortcut: "/images/logo/tailogo.png",
    apple: "/images/logo/tailogo.png",
  },
  openGraph: {
    type: "website",
    locale: "fr_HT",
    url: "/",
    siteName: "TaïTaï Fast Food",
    title: "TaïTaï - Fast Food Créole | Livraison à Port-au-Prince",
    description: "Le meilleur fast food créole de Port-au-Prince. Commandez en ligne et profitez de nos spécialités haïtiennes : poulet grillé, burgers, pâtes et plus encore.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TaïTaï - Fast Food Créole",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TaïTaï - Fast Food Créole",
    description: "Le meilleur fast food créole de Port-au-Prince. Livraison rapide dans tout l'Ouest.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <CmsProvider>
          <AuthProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </AuthProvider>
          </CmsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
