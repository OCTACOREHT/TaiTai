"use client";

import { useMemo } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { SectionCard } from "@/components/common/CmsShared";
import AlumniForm from "@/components/club/forms/AlumniForm";
import { useClubData } from "@/context/ClubDataContext";

export default function EditClubAlumniPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { alumni, setAlumni } = useClubData();

  const alumnus = useMemo(
    () => alumni.find((item) => item.id === params.id),
    [alumni, params.id],
  );

  if (!alumnus) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Modifier un alumni" />

      <SectionCard
        title="Edition de l'alumni"
        description="Mettez a jour la periode au club ou la situation actuelle."
      >
        <AlumniForm
          initialValues={alumnus}
          onCancel={() => router.push("/club/alumni")}
          onSubmit={async (values) => {
            const nextAlumni = { ...alumnus, ...values };
            const response = await fetch(`/api/club/alumni/${alumnus.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(nextAlumni),
            });
            if (!response.ok) {
              return;
            }
            setAlumni((prevAlumni) =>
              prevAlumni.map((item) => (item.id === alumnus.id ? nextAlumni : item)),
            );
            router.push("/club/alumni");
          }}
          submitLabel="Mettre a jour"
        />
      </SectionCard>
    </div>
  );
}
