"use client";

import { CmsPartnerForm } from "@/components/common/CmsForms";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
<<<<<<< HEAD
import { getAdminToken } from "@/lib/admin-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewPartnerPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
=======
import { useCms } from "@/context/CmsContext";
import { useRouter } from "next/navigation";

export default function NewPartnerPage() {
  const { savePartner } = useCms();
  const router = useRouter();
>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nouveau Partenaire" />
      <CmsPartnerForm
        submitLabel="Creer le partenaire"
<<<<<<< HEAD
        onSubmit={async (value) => {
          setSubmitError("");
          const token = getAdminToken();

          if (!token) {
            setSubmitError("Connectez-vous d'abord avec un compte admin.");
            return;
          }

          const response = await fetch("/api/admin/partners", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              nom: value.name,
              website: value.website,
              logo: value.logo || "",
              categorie: value.category,
              tier: value.tier,
              description: value.description,
              featured: value.featured,
            }),
          });

          const payload = await response.json();
          if (!response.ok) {
            setSubmitError(payload.error || "Impossible d'enregistrer le partenaire.");
            return;
          }

          router.push("/parents");
        }}
      />
      {submitError ? (
        <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/10 dark:text-error-300">
          {submitError}
        </div>
      ) : null}
=======
        onSubmit={(value) => {
          savePartner(value);
          router.push("/parents");
        }}
      />
>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a
    </div>
  );
}
