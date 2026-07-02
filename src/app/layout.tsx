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
  title: "TaïTaï",
  description: "Commandes et livraison TaïTaï",
  icons: {
    icon: "/images/logo/tailogo.png",
    shortcut: "/images/logo/tailogo.png",
    apple: "/images/logo/tailogo.png",
  },
  charset: "UTF-8",
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
