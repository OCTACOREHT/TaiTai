"use client";

import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EliteForm from "@/components/club/forms/EliteForm";

export default function NouveauJoueurElite() {
  return (
    <>
      <PageBreadcrumb pageTitle="Ajouter un Joueur Élite" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Nouveau Joueur
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Ceci apparaîtra directement sur le site sous forme de carte joueur.
          </p>
        </div>
        <EliteForm />
      </div>
    </>
  );
}
