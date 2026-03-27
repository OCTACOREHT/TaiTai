"use client";

import { useRouter } from "next/navigation";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { SectionCard } from "@/components/common/CmsShared";
import AlumniForm from "@/components/club/forms/AlumniForm";
import { useClubData } from "@/context/ClubDataContext";

export default function NewClubAlumniPage() {
  const router = useRouter();
  const { setAlumni } = useClubData();

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Ajouter un alumni" />

      <SectionCard
        title="Nouvel alumni"
        description="Ajoutez un ancien membre du club et sa situation actuelle."
      >
        <AlumniForm
          onCancel={() => router.push("/club/alumni")}
          onSubmit={async (values) => {
            const nextAlumni = { id: crypto.randomUUID(), ...values };
            const response = await fetch("/api/club/alumni", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(nextAlumni),
            });
            if (!response.ok) {
              return;
            }
            setAlumni((prevAlumni) => [nextAlumni, ...prevAlumni]);
            router.push("/club/alumni");
          }}
          submitLabel="Ajouter l'alumni"
        />
      </SectionCard>
    </div>
  );
}
