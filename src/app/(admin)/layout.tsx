"use client";

import { useCms } from "@/context/CmsContext";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import Loader from "@/components/common/Loader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, hydrated } = useCms();
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!currentUser) {
      router.replace(`/signin?next=${encodeURIComponent(pathname)}`);
      return;
    }

    // Role-based protection for routes
    const superAdminOnlyPaths = ["/equipe", "/parametres"];
    const isRestricted = superAdminOnlyPaths.some(path => 
      pathname === path || pathname.startsWith(`${path}/`)
    );

    if (isRestricted && currentUser.role !== "super_admin") {
      router.replace("/dashboard");
    }
  }, [currentUser, hydrated, pathname, router]);

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  if (!hydrated || !currentUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader />
        <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
          Chargement du CMS...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>
    </div>
  );
}
