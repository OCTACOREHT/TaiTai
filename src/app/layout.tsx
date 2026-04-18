import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ClubDataProvider } from '@/context/ClubDataContext';
import { CmsProvider } from '@/context/CmsContext';

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata = {
  title: "FC Toro CMS",
  description: "Le système de pilotage de FC Toro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <ClubDataProvider>
            <CmsProvider>
              <SidebarProvider>{children}</SidebarProvider>
            </CmsProvider>
          </ClubDataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
