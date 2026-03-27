"use client";

import { SectionCard, StatusBadge } from "@/components/common/CmsShared";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
<<<<<<< HEAD
import { fetchAdminJson, mapDbUser } from "@/lib/cms-admin-client";
import { useCms } from "@/context/CmsContext";
import { CmsUser } from "@/types/cms";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function EditorialTeamPage() {
  const { canManageUsers, deleteUser } = useCms();
  const [users, setUsers] = useState<CmsUser[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const payload = await fetchAdminJson("/api/admin/users");
        setUsers(Array.isArray(payload.data) ? payload.data.map(mapDbUser) : []);
      } catch (error) {
        console.error("[EditorialTeamPage] chargement impossible", error);
      }
    };

    void load();
  }, []);

=======
import { useCms } from "@/context/CmsContext";
import Link from "next/link";
import { useState } from "react";

export default function EditorialTeamPage() {
  const { users, canManageUsers, deleteUser } = useCms();
  const [message, setMessage] = useState("");

>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a
  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Equipe Editoriale" />

      <SectionCard
        title="Comptes de publication"
        description="Administrateurs, editeurs et auteurs du CMS."
        actions={
          canManageUsers ? (
            <Link
              href="/alumni/nouveau"
              className="rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600"
            >
              Ajouter un compte
            </Link>
          ) : null
        }
      >
        {message ? (
          <div className="mb-5 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/10 dark:text-error-300">
            {message}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <div className="flex items-center gap-4">
                <img src={user.avatar} alt={user.name} className="h-14 w-14 rounded-full object-cover" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white/90">{user.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{user.title}</p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <StatusBadge value={user.role} />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {user.active ? "Actif" : "Desactive"}
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">{user.bio}</p>
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              <div className="mt-5 flex gap-2">
                <Link
                  href={`/alumni/${user.id}/modifier`}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Modifier
                </Link>
                {canManageUsers ? (
                  <button
                    type="button"
                    onClick={() => {
                      const result = deleteUser(user.id);
<<<<<<< HEAD
                      if (result.success) {
                        setUsers((prev) => prev.filter((item) => item.id !== user.id));
                      }
=======
>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a
                      setMessage(result.success ? "" : result.message || "");
                    }}
                    className="rounded-lg border border-error-300 px-3 py-2 text-xs font-semibold text-error-700 transition hover:bg-error-50 dark:border-error-900/40 dark:text-error-300 dark:hover:bg-error-900/10"
                  >
                    Supprimer
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
