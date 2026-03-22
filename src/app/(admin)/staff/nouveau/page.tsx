"use client";

import { CmsStageForm } from "@/components/common/CmsForms";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useCms } from "@/context/CmsContext";
import { useRouter } from "next/navigation";

export default function NewStagePage() {
  const { saveStage } = useCms();
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nouveau Stage" />
      <CmsStageForm
        submitLabel="Creer le stage"
        onSubmit={(value) => {
          saveStage(value);
          router.push("/staff");
        }}
      />
    </div>
  );
}
