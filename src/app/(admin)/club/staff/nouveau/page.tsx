"use client";

import { useRouter } from "next/navigation";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { SectionCard } from "@/components/common/CmsShared";
import StaffForm from "@/components/club/forms/StaffForm";
import { useClubData } from "@/context/ClubDataContext";

export default function NewClubStaffPage() {
  const router = useRouter();
  const { setStaff } = useClubData();

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Ajouter un membre du staff" />

      <SectionCard
        title="Nouveau membre"
        description="Les informations du staff sont sauvegardees dans club_staff."
      >
        <StaffForm
          onCancel={() => router.push("/club/staff")}
          onSubmit={async (values) => {
            const nextMember = { id: crypto.randomUUID(), ...values };
            const response = await fetch("/api/club/staff", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(nextMember),
            });
            if (!response.ok) {
              return;
            }
            setStaff((prevStaff) => [nextMember, ...prevStaff]);
            router.push("/club/staff");
          }}
          submitLabel="Ajouter le membre"
        />
      </SectionCard>
    </div>
  );
}
