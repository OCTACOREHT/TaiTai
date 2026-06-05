import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-1 bg-white p-6 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex h-screen w-full flex-col justify-center dark:bg-gray-900 sm:p-0 lg:flex-row">
          {children}
          <div className="hidden h-full w-full items-center bg-brand-950 dark:bg-white/5 lg:grid lg:w-1/2">
            <div className="relative z-1 flex items-center justify-center">
              <GridShape />
              <div className="flex max-w-xs flex-col items-center">
                <Link href="/" className="mb-4 block">
                  <div className="flex items-center gap-3">
                    <Image
                      width={52}
                      height={52}
                      src="/images/logo/tailogo.png"
                      alt="TaiTai"
                      className="rounded-lg object-contain"
                    />
                    <div>
                      <p className="text-2xl font-semibold text-white">TaiTai</p>
                      <p className="text-sm text-gray-300">Restaurant</p>
                    </div>
                  </div>
                </Link>
                <p className="text-center text-gray-400 dark:text-white/60">
                  Espace de demonstration du back-office TaiTai
                </p>
              </div>
            </div>
          </div>
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
