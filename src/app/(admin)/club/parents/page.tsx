"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { SectionCard } from "@/components/common/CmsShared";
import ParentTable from "@/components/club/ParentTable";
import { useClubData } from "@/context/ClubDataContext";

export default function ClubParentsPage() {
  const router = useRouter();
  const { parents, players, setParents } = useClubData();

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Parents" />

      <SectionCard
        title="Parents et tuteurs"
        description="Chaque parent peut etre relie a un joueur du club."
        actions={
          <Link
            href="/club/parents/nouveau"
            className="rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            Ajouter un parent
          </Link>
        }
      >
        <ParentTable
          parents={parents}
          players={players}
          onEditParent={(parent) => router.push(`/club/parents/${parent.id}/modifier`)}
          onDeleteParent={async (parent) => {
            const response = await fetch(`/api/club/parents/${parent.id}`, { method: "DELETE" });
            if (!response.ok) {
              return;
            }
            setParents((prevParents) =>
              prevParents.filter((item) => item.id !== parent.id),
            );
          }}
        />
      </SectionCard>
    </div>
  );
}
