"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import StaffTable from "@/components/club/StaffTable";
import { useClubData } from "@/context/ClubDataContext";

export default function StaffPage() {
  const router = useRouter();
  const { staff, setStaff } = useClubData();

  const handleDeleteStaff = (staffId: string) => {
    const target = staff.find((member) => member.id === staffId);
    if (!target) {
      return;
    }

    if (!window.confirm(`Supprimer ${target.nom} ?`)) {
      return;
    }
    setStaff((prev) => prev.filter((member) => member.id !== staffId));
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Staff" />

      <div className="mb-6 flex items-center justify-end">
        <Link
          href="/staff/nouveau"
          className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          + Ajouter un membre
        </Link>
      </div>

      <StaffTable
        staff={staff}
        onEditStaff={(member) => router.push(`/staff/${member.id}/modifier`)}
        onDeleteStaff={(member) => handleDeleteStaff(member.id)}
      />
    </div>
  );
}
