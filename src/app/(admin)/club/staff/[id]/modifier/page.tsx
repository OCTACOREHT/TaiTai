"use client";

import { useMemo } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { SectionCard } from "@/components/common/CmsShared";
import StaffForm from "@/components/club/forms/StaffForm";
import { useClubData } from "@/context/ClubDataContext";

export default function EditClubStaffPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { staff, setStaff } = useClubData();

  const member = useMemo(
    () => staff.find((item) => item.id === params.id),
    [params.id, staff],
  );

  if (!member) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Modifier le staff" />

      <SectionCard
        title="Edition du membre"
        description="Mettez a jour le role, le contact ou la date de debut."
      >
        <StaffForm
          initialValues={member}
          onCancel={() => router.push("/club/staff")}
          onSubmit={async (values) => {
            const nextMember = { ...member, ...values };
            const response = await fetch(`/api/club/staff/${member.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(nextMember),
            });
            if (!response.ok) {
              return;
            }
            setStaff((prevStaff) =>
              prevStaff.map((item) => (item.id === member.id ? nextMember : item)),
            );
            router.push("/club/staff");
          }}
          submitLabel="Mettre a jour"
        />
      </SectionCard>
    </div>
  );
}
