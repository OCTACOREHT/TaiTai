"use client";

import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import StaffForm from "@/components/club/forms/StaffForm";
import { useClubData } from "@/context/ClubDataContext";
import { StaffFormValues, StaffMember } from "@/types/club";

export default function NewStaffPage() {
  const router = useRouter();
  const { setStaff } = useClubData();

  const handleSubmit = (values: StaffFormValues) => {
    const newMember: StaffMember = {
      id: `staff-${Date.now()}`,
      ...values,
    };
    setStaff((prevStaff) => [newMember, ...prevStaff]);
    router.push("/staff");
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Ajouter un membre staff" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <StaffForm
          onCancel={() => router.push("/staff")}
          onSubmit={handleSubmit}
          submitLabel="Enregistrer"
        />
      </div>
    </div>
  );
}
