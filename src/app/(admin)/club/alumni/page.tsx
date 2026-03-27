"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { SectionCard } from "@/components/common/CmsShared";
import { useClubData } from "@/context/ClubDataContext";

export default function ClubAlumniPage() {
  const router = useRouter();
  const { alumni, setAlumni } = useClubData();
  const [search, setSearch] = useState("");

  const filteredAlumni = useMemo(() => {
    const query = search.trim().toLowerCase();
    return alumni.filter((item) => {
      if (!query) {
        return true;
      }
      return (
        item.nom.toLowerCase().includes(query) ||
        item.poste.toLowerCase().includes(query) ||
        item.situationActuelle.toLowerCase().includes(query)
      );
    });
  }, [alumni, search]);

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Alumni" />

      <SectionCard
        title="Anciens du club"
        description="Gardez une trace des anciens joueurs et de leur parcours."
        actions={
          <Link
            href="/club/alumni/nouveau"
            className="rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            Ajouter un alumni
          </Link>
        }
      >
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher un alumni"
          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 shadow-theme-xs outline-hidden transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredAlumni.map((item) => (
            <div
              key={item.id}
              className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">
                    {item.nom}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {item.poste}
                  </p>
                </div>
                <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 dark:border-gray-700 dark:text-gray-300">
                  {item.anneeEntree} - {item.anneeSortie}
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
                {item.situationActuelle || "Situation non renseignee."}
              </p>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => router.push(`/club/alumni/${item.id}/modifier`)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() =>
                    fetch(`/api/club/alumni/${item.id}`, { method: "DELETE" }).then((response) => {
                      if (!response.ok) {
                        return;
                      }
                      setAlumni((prevAlumni) =>
                        prevAlumni.filter((entry) => entry.id !== item.id),
                      );
                    })
                  }
                  className="rounded-lg border border-error-300 px-3 py-2 text-xs font-semibold text-error-700 transition hover:bg-error-50 dark:border-error-900/40 dark:text-error-300 dark:hover:bg-error-900/10"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
