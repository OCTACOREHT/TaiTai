"use client";

import { CmsUserForm } from "@/components/common/CmsForms";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useCms } from "@/context/CmsContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewEditorialAccountPage() {
  const { canManageUsers, saveUser } = useCms();
  const router = useRouter();
  const [error, setError] = useState("");

  if (!canManageUsers) {
    return (
      <div className="rounded-2xl border border-warning-200 bg-warning-50 p-6 text-sm text-warning-700 dark:border-warning-900/40 dark:bg-warning-900/10 dark:text-warning-300">
        Seul un administrateur peut creer de nouveaux comptes.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Nouveau Compte" />
      {error ? (
        <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/10 dark:text-error-300">
          {error}
        </div>
      ) : null}
      <CmsUserForm
        submitLabel="Creer le compte"
        onSubmit={(value) => {
          const result = saveUser(value);
          if (!result.success) {
            setError(result.message || "Creation impossible.");
            return;
          }
          router.push("/alumni");
        }}
      />
    </div>
  );
}
