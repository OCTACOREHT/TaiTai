"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { canAccessAdminPath, hasFullAdminAccess } from "@/lib/admin-access";
import { clearAdminSession, getAdminSession } from "@/lib/admin-auth";
import { roleLabels } from "@/lib/admin-team";
import type { CmsUser } from "@/types/cms";
import {
  BadgePercent,
  BarChart3,
  Bell,
  ChefHat,
  ClipboardCheck,
  Globe,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PackageSearch,
  ReceiptText,
  Search,
  Store,
  UserCog,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/context/NotificationContext";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} strokeWidth={2} /> },
  { name: "Données & Statistiques", path: "/data", icon: <BarChart3 size={20} strokeWidth={2} /> },
  { name: "Commandes", path: "/commandes", icon: <ReceiptText size={20} strokeWidth={2} /> },
  { name: "Validation", path: "/validation-commandes", icon: <ClipboardCheck size={20} strokeWidth={2} /> },
  { name: "Recherche Reçu", path: "/recherche-recu", icon: <Search size={20} strokeWidth={2} /> },
  { name: "Menu", path: "/menu-admin", icon: <ChefHat size={20} strokeWidth={2} /> },
  { name: "Promotions", path: "/promotions", icon: <BadgePercent size={20} strokeWidth={2} /> },
  { name: "Stocks", path: "/stocks", icon: <PackageSearch size={20} strokeWidth={2} /> },
  { name: "Fournisseurs", path: "/fournisseurs", icon: <Store size={20} strokeWidth={2} /> },
  { name: "Clients", path: "/clients", icon: <UsersRound size={20} strokeWidth={2} /> },
  { name: "Modération", path: "/moderation", icon: <MessageSquare size={20} strokeWidth={2} /> },
  { name: "Equipe", path: "/equipe", icon: <UserCog size={20} strokeWidth={2} /> },
  { name: "Site Public", path: "/", icon: <Globe size={20} strokeWidth={2} /> },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState<CmsUser | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, unreadCount, markAsRead } = useNotifications();

  useEffect(() => {
    const session = getAdminSession();
    setRole(session?.user.role || null);
    setUser(session?.user || null);
  }, [pathname]);

  const handleLogout = () => {
    clearAdminSession();
    router.push("/signin");
  };

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

      {/* Notifications */}
      <div className="px-3 pb-2">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="flex items-center justify-center rounded-xl p-2 text-gray-400 transition hover:bg-gray-50 hover:text-brand-500 relative"
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute bottom-full left-0 mb-2 w-80 rounded-2xl border border-gray-200 bg-white shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-gray-100 p-4">
                <h3 className="text-sm font-black text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={() => {
                      notifications.forEach(n => markAsRead(n.id));
                    }}
                    className="text-xs font-bold text-brand-500 hover:text-brand-600"
                  >
                    Tout marquer lu
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    Aucune notification
                  </div>
                ) : (
                  notifications.slice(0, 10).map((notif) => (
                    <a
                      key={notif.id}
                      href={notif.link || "#"}
                      onClick={() => markAsRead(notif.id)}
                      className={`block border-b border-gray-50 p-3 transition hover:bg-gray-50 ${
                        !notif.read ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`mt-0.5 h-2 w-2 rounded-full ${
                          notif.type === "order" ? "bg-green-500" :
                          notif.type === "comment" ? "bg-blue-500" :
                          notif.type === "stock_critical" ? "bg-red-500" :
                          "bg-orange-500"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900">{notif.title}</p>
                          <p className="mt-0.5 text-xs text-gray-600 line-clamp-2">{notif.message}</p>
                          <p className="mt-1 text-[10px] text-gray-400">
                            {new Date(notif.created_at).toLocaleTimeString("fr-FR", { 
                              hour: "2-digit", 
                              minute: "2-digit" 
                            })}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User block — bottom of sidebar */}
      <div className="mt-auto border-t border-gray-200 px-3 py-4 dark:border-gray-800">
        {isExpanded || isHovered || isMobileOpen ? (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-xs font-bold text-brand-600">
              {user?.name
                ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
                : "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                {user?.name ?? "Utilisateur"}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                {user?.role ? (roleLabels[user.role as keyof typeof roleLabels] ?? user.role) : ""}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Se déconnecter"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            title="Se déconnecter"
            className="flex w-full items-center justify-center rounded-lg py-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;
