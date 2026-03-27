"use client";

import { useRouter } from "next/navigation";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { SectionCard } from "@/components/common/CmsShared";
import ParentForm from "@/components/club/forms/ParentForm";
import { useClubData } from "@/context/ClubDataContext";

export default function NewClubParentPage() {
  const router = useRouter();
  const { players, setParents } = useClubData();

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Ajouter un parent" />

      <SectionCard
        title="Nouveau parent"
        description="Associez le parent au joueur concerne des sa creation."
      >
        <ParentForm
          players={players}
          onCancel={() => router.push("/club/parents")}
          onSubmit={async (values) => {
            const nextParent = { id: crypto.randomUUID(), ...values };
            const response = await fetch("/api/club/parents", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(nextParent),
            });
            if (!response.ok) {
              return;
            }
            setParents((prevParents) => [nextParent, ...prevParents]);
            router.push("/club/parents");
          }}
          submitLabel="Ajouter le parent"
        />
      </SectionCard>
    </div>
  );
}
