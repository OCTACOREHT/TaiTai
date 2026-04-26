"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import {
  BoxCubeIcon,
  BoxIconLine,
  CalenderIcon,
  GridIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons/index";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: <GridIcon /> },
  { name: "Données", path: "/donnees", icon: <BoxIconLine /> },
  { name: "Commandes", path: "/commandes", icon: <TableIcon /> },
  { name: "Menu", path: "/menu", icon: <BoxCubeIcon /> },
  { name: "Stocks", path: "/stocks", icon: <TableIcon /> },
  { name: "Fournisseurs", path: "/fournisseurs", icon: <UserCircleIcon /> },
  { name: "Clients", path: "/clients", icon: <UserCircleIcon /> },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const isActive = useCallback(
    (path: string) => pathname === path || pathname.startsWith(`${path}/`),
    [pathname],
  );

  return (
    <aside
      className={`fixed left-0 top-0 z-50 mt-16 flex h-screen flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 lg:mt-0 ${
        isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`flex py-8 ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/dashboard">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo/tailogo.png"
                alt="TaiTai"
                width={40}
                height={40}
                className="h-10 w-10 rounded-lg object-contain"
              />
              <div>
                <p className="text-lg font-semibold leading-5 text-gray-900 dark:text-white">
                  TaiTai
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Restaurant SaaS</p>
              </div>
            </div>
          ) : (
            <Image
              src="/images/logo/tailogo.png"
              alt="TaiTai"
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg object-contain"
            />
          )}
        </Link>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <div>
            <h2
              className={`mb-4 flex text-xs uppercase leading-[20px] text-gray-400 ${
                !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
              }`}
            >
              {isExpanded || isHovered || isMobileOpen ? "Navigation" : "..."}
            </h2>

            <ul className="flex flex-col gap-4">
              {navItems.map((nav) => (
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
