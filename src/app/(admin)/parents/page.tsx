"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ParentTable from "@/components/club/ParentTable";
import { useClubData } from "@/context/ClubDataContext";

export default function ParentsPage() {
  const router = useRouter();
  const { parents, setParents, players } = useClubData();

  const handleDeleteParent = (parentId: string) => {
    const target = parents.find((parent) => parent.id === parentId);
    if (!target) {
      return;
    }

    if (!window.confirm(`Supprimer ${target.prenom} ${target.nom} ?`)) {
      return;
    }
    setParents((prevParents) =>
      prevParents.filter((parent) => parent.id !== parentId),
    );
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Parents" />

      <div className="mb-6 flex items-center justify-end">
        <Link
          href="/parents/nouveau"
          className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          + Ajouter un parent
        </Link>
      </div>

      <ParentTable
        parents={parents}
        players={players}
        onEditParent={(parent) => router.push(`/parents/${parent.id}/modifier`)}
        onDeleteParent={(parent) => handleDeleteParent(parent.id)}
      />
    </div>
  );
}
