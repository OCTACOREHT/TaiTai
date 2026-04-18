"use client";

import { useCms } from "@/context/CmsContext";
import Link from "next/link";
import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { alerts, unreadDemandesCount } = useCms();

  const totalAlerts = alerts.length + (unreadDemandesCount > 0 ? 1 : 0);

  return (
    <div className="relative">
      <button
        className="dropdown-toggle relative flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={() => setIsOpen((value) => !value)}
      >
        {totalAlerts > 0 ? (
          <span className="absolute right-0 top-0.5 z-10 flex h-2 w-2 rounded-full bg-orange-400">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
          </span>
        ) : null}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="absolute right-0 mt-[17px] flex w-[340px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div className="mb-3 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Alertes CMS</h5>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/20 dark:text-brand-300">
            {totalAlerts}
          </span>
        </div>

        <div className="max-h-[360px] space-y-2 overflow-y-auto custom-scrollbar">
          {totalAlerts === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
              Aucun contenu en attente pour le moment.
            </div>
          ) : (
            <>
              {unreadDemandesCount > 0 && (
                <Link
                  href="/demandes"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3 transition hover:bg-brand-50 dark:border-brand-900/30 dark:bg-brand-900/10 dark:hover:bg-brand-900/20"
                >
                  <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider text-[10px]">
                     Nouveaux Messages
                  </p>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white/90 font-medium">
                    Vous avez {unreadDemandesCount} message{unreadDemandesCount > 1 ? 's' : ''} non lu{unreadDemandesCount > 1 ? 's' : ''} dans votre boîte de réception.
                  </p>
                </Link>
              )}
              {alerts.map((alert) => (
              <Link
                key={alert.id}
                href={alert.href}
                onClick={() => setIsOpen(false)}
                className="block rounded-xl border border-gray-100 px-4 py-3 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/5"
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-white/90">{alert.title}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{alert.description}</p>
              </Link>
              ))}
            </>
          )}
        </div>
      </Dropdown>
    </div>
  );
}
