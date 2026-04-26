"use client";

import Image from "next/image";
import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";

const demoUser = {
  name: "TaiTai Admin",
  email: "demo@taitai.app",
  avatar: "/images/logo/tailogo.png",
};

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const closeDropdown = () => setIsOpen(false);

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="dropdown-toggle flex items-center text-gray-700 dark:text-gray-400"
      >
        <span className="mr-3 flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-brand-100 bg-brand-25">
          <Image
            width={44}
            height={44}
            src={demoUser.avatar}
            alt={demoUser.name}
            className="h-9 w-9 object-contain"
          />
        </span>

        <span className="mr-1 block text-theme-sm font-medium">{demoUser.name.split(" ")[0]}</span>

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
        className="absolute right-0 mt-[17px] flex w-[280px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block text-theme-sm font-medium text-gray-700 dark:text-gray-400">
            {demoUser.name}
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {demoUser.email}
          </span>
          <span className="mt-2 inline-flex rounded-full border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-600 dark:border-gray-700 dark:text-gray-300">
            Mode demo
          </span>
        </div>

        <ul className="flex flex-col gap-1 border-b border-gray-200 pb-3 pt-4 dark:border-gray-800">
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

        <p className="mt-3 rounded-lg bg-gray-50 px-3 py-3 text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">
          Interface front-end seule avec donnees fictives TaiTai.
        </p>
      </Dropdown>
    </div>
  );
}
