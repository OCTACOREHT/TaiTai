"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { clearAdminSession, getAdminSession } from "@/lib/admin-auth";
import { roleLabels } from "@/lib/admin-team";
import type { CmsUser } from "@/types/cms";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { LogOut } from "lucide-react";

export default function UserDropdown() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<CmsUser | null>(null);

  useEffect(() => {
    const session = getAdminSession();
    if (session?.user) setUser(session.user);
  }, []);

  const toggleDropdown = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const closeDropdown = () => setIsOpen(false);

  const handleLogout = () => {
    clearAdminSession();
    router.push("/signin");
  };

  const displayName = user?.name ?? "Utilisateur";
  const displayEmail = user?.email ?? "";
  const displayRole = user?.role ? (roleLabels[user.role] ?? user.role) : "";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="dropdown-toggle flex items-center text-gray-700 dark:text-gray-400"
      >
        <span className="mr-3 flex h-11 w-11 items-center justify-center rounded-xl border border-brand-100 bg-brand-50 text-sm font-bold text-brand-600">
          {initials}
        </span>

        <span className="mr-1 block text-theme-sm font-medium">
          {displayName.split(" ")[0]}
        </span>

        <svg
          className={`stroke-gray-500 transition-transform duration-200 dark:stroke-gray-400 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-[17px] flex w-[calc(100vw-2rem)] max-w-[280px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        {/* User info */}
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-sm font-bold text-brand-600">
            {initials}
          </div>
          <div className="min-w-0">
            <span className="block truncate text-theme-sm font-semibold text-gray-900 dark:text-white">
              {displayName}
            </span>
            <span className="block truncate text-theme-xs text-gray-500 dark:text-gray-400">
              {displayEmail}
            </span>
            {displayRole && (
              <span className="mt-1 inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600">
                {displayRole}
              </span>
            )}
          </div>
        </div>

        {/* Nav links */}
        <ul className="flex flex-col gap-1 border-b border-gray-200 pb-3 pt-3 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Dashboard
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/commandes"
              className="flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Commandes
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/clients"
              className="flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Clients
            </DropdownItem>
          </li>
        </ul>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
        >
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </button>
      </Dropdown>
    </div>
  );
}
