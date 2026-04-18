"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { SectionCard } from "@/components/common/CmsShared";
import StaffTable from "@/components/club/StaffTable";
import { useClubData } from "@/context/ClubDataContext";

export default function ClubStaffPage() {
  const router = useRouter();
  const { staff, setStaff, hydrated } = useClubData();

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Staff" />

      <SectionCard
        title="Equipe technique"
        description="Ajoutez les nouveaux membres et gardez la liste du staff a jour."
        actions={
          <Link
            href="/club/staff/nouveau"
            className="rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            Ajouter un membre
          </Link>
        }
      >
        <StaffTable
          staff={staff}
          isLoading={!hydrated}
          onEditStaff={(member) => router.push(`/club/staff/${member.id}/modifier`)}
          onDeleteStaff={async (member) => {
            const response = await fetch(`/api/club/staff/${member.id}`, { method: "DELETE" });
            if (!response.ok) {
              return;
            }
            setStaff((prevStaff) => prevStaff.filter((item) => item.id !== member.id));
          }}
        />
      </SectionCard>
    </div>
  );
}
