"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EliteTable from "@/components/club/EliteTable";

export default function ElitePage() {
  return (
    <>
      <PageBreadcrumb pageTitle="Gestion des Joueurs Élite" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Effectif FC Toro Élite
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gérez les joueurs de l'équipe élite (limité à 10 joueurs).
          </p>
        </div>
        <EliteTable />
      </div>
    </>
  );
}
