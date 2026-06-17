"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { canAccessAdminPath, hasFullAdminAccess } from "@/lib/admin-access";
import { getAdminSession } from "@/lib/admin-auth";
import {
  BadgePercent,
  ChefHat,
  ClipboardCheck,
  Globe,
  LayoutDashboard,
  PackageSearch,
  ReceiptText,
  Store,
  UserCog,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} strokeWidth={2} /> },
  { name: "Commandes", path: "/commandes", icon: <ReceiptText size={20} strokeWidth={2} /> },
  { name: "Validation", path: "/validation-commandes", icon: <ClipboardCheck size={20} strokeWidth={2} /> },
  { name: "Menu", path: "/menu-admin", icon: <ChefHat size={20} strokeWidth={2} /> },
  { name: "Promotions", path: "/promotions", icon: <BadgePercent size={20} strokeWidth={2} /> },
  { name: "Stocks", path: "/stocks", icon: <PackageSearch size={20} strokeWidth={2} /> },
  { name: "Fournisseurs", path: "/fournisseurs", icon: <Store size={20} strokeWidth={2} /> },
  { name: "Clients", path: "/clients", icon: <UsersRound size={20} strokeWidth={2} /> },
  { name: "Equipe", path: "/equipe", icon: <UserCog size={20} strokeWidth={2} /> },
  { name: "Site Public", path: "/", icon: <Globe size={20} strokeWidth={2} /> },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(getAdminSession()?.user.role || null);
  }, [pathname]);

  const visibleNavItems = useMemo(
    () =>
      navItems.filter((item) => {
        if (item.path === "/") return true;
        if (item.path === "/equipe") return hasFullAdminAccess(role);
        return canAccessAdminPath(item.path, role);
      }),
    [role],
  );

  const isActive = useCallback(
    (path: string) => pathname === path || pathname.startsWith(`${path}/`),
    [pathname],
  );

  return (
    <aside
      className={`fixed left-0 top-0 z-50 mt-16 flex h-screen flex-col border-r border-gray-200 bg-white px-3 text-gray-900 transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 lg:mt-0 ${
        isExpanded || isMobileOpen ? "w-[230px]" : isHovered ? "w-[230px]" : "w-[72px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-center py-3">
        <Link href="/dashboard" className="flex items-center justify-center">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="relative h-9 w-32">
              <Image
                src="/images/logo/tailogo.png"
                alt="TaïTaï"
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="relative h-8 w-8">
              <Image
                src="/images/logo/tailogo.png"
                alt="TaïTaï"
                fill
                className="object-contain"
              />
            </div>
          )}
        </Link>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-2">
          <div>
            <h2
              className={`mb-2 flex text-xs uppercase leading-[20px] text-gray-400 ${
                !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
              }`}
            >
              {isExpanded || isHovered || isMobileOpen ? "Navigation" : "..."}
            </h2>

            <ul className="flex flex-col gap-2">
              {visibleNavItems.map((nav) => (
                <li key={nav.path}>
                  <Link
                    href={nav.path}
                    className={`menu-item group ${
                      isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                    }`}
                  >
                    <span
                      className={isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}
                    >
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className="menu-item-text">{nav.name}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
