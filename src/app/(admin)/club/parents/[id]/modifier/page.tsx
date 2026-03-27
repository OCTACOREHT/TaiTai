"use client";

import { useMemo } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { SectionCard } from "@/components/common/CmsShared";
import ParentForm from "@/components/club/forms/ParentForm";
import { useClubData } from "@/context/ClubDataContext";

export default function EditClubParentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { parents, players, setParents } = useClubData();

  const parent = useMemo(
    () => parents.find((item) => item.id === params.id),
    [params.id, parents],
  );

  if (!parent) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Modifier un parent" />

      <SectionCard
        title="Edition du parent"
        description="Le lien avec le joueur peut etre ajuste a tout moment."
      >
        <ParentForm
          players={players}
          initialValues={parent}
          onCancel={() => router.push("/club/parents")}
          onSubmit={async (values) => {
            const nextParent = { ...parent, ...values };
            const response = await fetch(`/api/club/parents/${parent.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(nextParent),
            });
            if (!response.ok) {
              return;
            }
            setParents((prevParents) =>
              prevParents.map((item) => (item.id === parent.id ? nextParent : item)),
            );
            router.push("/club/parents");
          }}
          submitLabel="Mettre a jour"
        />
      </SectionCard>
    </div>
  );
}
