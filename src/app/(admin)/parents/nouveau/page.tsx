"use client";

import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ParentForm from "@/components/club/forms/ParentForm";
import { useClubData } from "@/context/ClubDataContext";
import { Parent, ParentFormValues } from "@/types/club";

export default function NewParentPage() {
  const router = useRouter();
  const { players, setParents } = useClubData();

  const handleSubmit = (values: ParentFormValues) => {
    const newParent: Parent = {
      id: `parent-${Date.now()}`,
      ...values,
    };
    setParents((prevParents) => [newParent, ...prevParents]);
    router.push("/parents");
  };

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Ajouter un parent" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <ParentForm
          players={players}
          onCancel={() => router.push("/parents")}
          onSubmit={handleSubmit}
          submitLabel="Enregistrer"
        />
      </div>
    </div>
  );
}
