"use client";

import { CmsStageForm } from "@/components/common/CmsForms";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useCms } from "@/context/CmsContext";
import { useParams, useRouter } from "next/navigation";

export default function EditStagePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { stages, saveStage } = useCms();
  const stage = stages.find((entry) => entry.id === params.id);

  if (!stage) {
    return (
      <div className="rounded-2xl border border-error-200 bg-error-50 p-6 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/10 dark:text-error-300">
        Stage introuvable.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Modifier Stage" />
      <CmsStageForm
        initialValue={stage}
        submitLabel="Enregistrer les changements"
        onSubmit={(value) => {
          saveStage(value);
          router.push("/staff");
        }}
      />
    </div>
  );
}
