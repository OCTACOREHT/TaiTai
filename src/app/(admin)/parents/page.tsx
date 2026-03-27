"use client";

import { SectionCard, StatusBadge, formatNumber } from "@/components/common/CmsShared";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
<<<<<<< HEAD
import { getAdminToken } from "@/lib/admin-auth";
import { fetchAdminJson, mapDbPartner } from "@/lib/cms-admin-client";
import { CmsPartner } from "@/types/cms";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function PartnersPage() {
  const [partners, setPartners] = useState<CmsPartner[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const payload = await fetchAdminJson("/api/admin/partners");
        setPartners(Array.isArray(payload.data) ? payload.data.map(mapDbPartner) : []);
      } catch (error) {
        console.error("[PartnersPage] chargement impossible", error);
      }
    };

    void load();
  }, []);

=======
import { useCms } from "@/context/CmsContext";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function PartnersPage() {
  const { partners, deletePartner } = useCms();
  const [search, setSearch] = useState("");

>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a
  const filteredPartners = useMemo(
    () =>
      partners.filter(
        (partner) =>
          partner.name.toLowerCase().includes(search.toLowerCase()) ||
          partner.category.toLowerCase().includes(search.toLowerCase()),
      ),
    [partners, search],
  );

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Partenaires" />

      <SectionCard
        title="Partenaires du site"
        description="Logos, categories, liens et mise en avant."
        actions={
          <Link
            href="/parents/nouveau"
            className="rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            Ajouter un partenaire
          </Link>
        }
      >
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher un partenaire"
          className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 shadow-theme-xs outline-hidden transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        />

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPartners.map((partner) => (
            <div
              key={partner.id}
              className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <div className="flex h-18 items-center justify-center rounded-2xl bg-gray-50 p-4 dark:bg-gray-900/50">
<<<<<<< HEAD
                {partner.logo ? (
                  <img src={partner.logo} alt={partner.name} className="max-h-10 object-contain" />
                ) : (
                  <div className="text-xs font-medium text-gray-400 dark:text-gray-500">
                    Aucun logo
                  </div>
                )}
=======
                <img src={partner.logo} alt={partner.name} className="max-h-10 object-contain" />
>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a
              </div>
              <div className="mt-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">{partner.name}</h3>
                <StatusBadge value={partner.tier} />
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{partner.category}</p>
              <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
                {partner.description}
              </p>
              <div className="mt-5 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{formatNumber(partner.clicks)} clics</span>
                {partner.featured ? <span>Mis en avant</span> : <span>Standard</span>}
              </div>
              <div className="mt-5 flex gap-2">
                <Link
                  href={`/parents/${partner.id}/modifier`}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Modifier
                </Link>
                <button
                  type="button"
<<<<<<< HEAD
                  onClick={async () => {
                    const token = getAdminToken();
                    if (!token) {
                      return;
                    }
                    const response = await fetch(`/api/admin/partners/${partner.id}`, {
                      method: "DELETE",
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!response.ok) {
                      return;
                    }
                    setPartners((prev) => prev.filter((item) => item.id !== partner.id));
                  }}
=======
                  onClick={() => deletePartner(partner.id)}
>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a
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
