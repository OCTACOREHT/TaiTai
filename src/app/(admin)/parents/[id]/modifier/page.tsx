"use client";

import { CmsPartnerForm } from "@/components/common/CmsForms";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useCms } from "@/context/CmsContext";
import { useParams, useRouter } from "next/navigation";

export default function EditPartnerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { partners, savePartner } = useCms();
  const partner = partners.find((entry) => entry.id === params.id);

  if (!partner) {
    return (
      <div className="rounded-2xl border border-error-200 bg-error-50 p-6 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/10 dark:text-error-300">
        Partenaire introuvable.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Modifier Partenaire" />
      <CmsPartnerForm
        initialValue={partner}
        submitLabel="Enregistrer les changements"
        onSubmit={(value) => {
          savePartner(value);
          router.push("/parents");
        }}
      />
    </div>
  );
}
