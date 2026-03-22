"use client";

import { CmsPartnerForm } from "@/components/common/CmsForms";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useCms } from "@/context/CmsContext";
import { useRouter } from "next/navigation";

export default function NewPartnerPage() {
  const { savePartner } = useCms();
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nouveau Partenaire" />
      <CmsPartnerForm
        submitLabel="Creer le partenaire"
        onSubmit={(value) => {
          savePartner(value);
          router.push("/parents");
        }}
      />
    </div>
  );
}
