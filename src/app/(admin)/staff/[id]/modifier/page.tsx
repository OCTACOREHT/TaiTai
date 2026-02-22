"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import StaffForm from "@/components/club/forms/StaffForm";
import { useClubData } from "@/context/ClubDataContext";
import { StaffFormValues } from "@/types/club";

export default function EditStaffPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const memberId = params.id;
  const { staff, setStaff } = useClubData();

  const targetMember = staff.find((member) => member.id === memberId);

  if (!targetMember) {
    return (
      <div className="space-y-6">
        <PageBreadcrumb pageTitle="Modifier staff" />
        <div className="rounded-2xl border border-gray-200 bg-white p-5 text-sm text-gray-600 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300">
          Membre introuvable.
        </div>
        <Link
          href="/staff"
          className="text-sm font-medium text-brand-500 hover:text-brand-600"
        >
          Retour a la liste
        </Link>
      </div>
    );
  }

  const handleSubmit = (values: StaffFormValues) => {
    setStaff((prevStaff) =>
      prevStaff.map((member) =>
        member.id === memberId ? { ...member, ...values } : member,
      ),
    );
    router.push("/staff");
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Modifier staff" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <StaffForm
          initialValues={targetMember}
          onCancel={() => router.push("/staff")}
          onSubmit={handleSubmit}
          submitLabel="Mettre a jour"
        />
      </div>
    </div>
  );
}
