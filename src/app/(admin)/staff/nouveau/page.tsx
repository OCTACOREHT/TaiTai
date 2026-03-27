"use client";

import { CmsStageForm } from "@/components/common/CmsForms";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
<<<<<<< HEAD
import { getAdminToken } from "@/lib/admin-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewStagePage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
=======
import { useCms } from "@/context/CmsContext";
import { useRouter } from "next/navigation";

export default function NewStagePage() {
  const { saveStage } = useCms();
  const router = useRouter();
>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nouveau Stage" />
      <CmsStageForm
        submitLabel="Creer le stage"
<<<<<<< HEAD
        onSubmit={async (value) => {
          setSubmitError("");
          const token = getAdminToken();

          if (!token) {
            setSubmitError("Connectez-vous d'abord avec un compte admin.");
            return;
          }

          const response = await fetch("/api/admin/stages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              titre: value.title,
              extrait: value.excerpt,
              contenu: value.body,
              photo_couverture: value.coverImage || "",
              departement: value.department,
              location: value.location,
              work_mode: value.workMode,
              duration: value.duration,
              contact_email: value.contactEmail,
              close_date: value.closeDate,
              featured: value.featured,
              statut: value.status,
              date_publication:
                value.status === "published" ? new Date().toISOString() : null,
            }),
          });

          const payload = await response.json();
          if (!response.ok) {
            setSubmitError(payload.error || "Impossible d'enregistrer le stage.");
            return;
          }

          router.push("/staff");
        }}
      />
      {submitError ? (
        <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/10 dark:text-error-300">
          {submitError}
        </div>
      ) : null}
=======
        onSubmit={(value) => {
          saveStage(value);
          router.push("/staff");
        }}
      />
>>>>>>> 8dace4bc0a45c5486fb56dd83a4a0b5a447a7b3a
    </div>
  );
}
