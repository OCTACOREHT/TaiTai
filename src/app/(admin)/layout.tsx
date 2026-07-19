"use client";

import { useSidebar } from "@/context/SidebarContext";
import AdminAccessGuard from "@/components/auth/AdminAccessGuard";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import OrderNotificationPopup from "@/components/admin/OrderNotificationPopup";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[230px]"
    : "lg:ml-[72px]";

  return (
    <div className="min-h-screen overflow-x-hidden xl:flex">
      <AppSidebar />
      <Backdrop />
      <div
        className={`min-w-0 flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        <AppHeader />
        <div className="mx-auto w-full max-w-(--breakpoint-2xl) p-4 md:p-6">
          <AdminAccessGuard>{children}</AdminAccessGuard>
        </div>
      </div>

      {/* Popup de notification pour nouvelles commandes */}
      <OrderNotificationPopup />
    </div>
  );
}
