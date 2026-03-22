"use client";

import { CmsUserForm } from "@/components/common/CmsForms";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useCms } from "@/context/CmsContext";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function EditEditorialAccountPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { users, currentUser, canManageUsers, saveUser } = useCms();
  const [error, setError] = useState("");
  const user = users.find((entry) => entry.id === params.id);

  if (!user) {
    return (
      <div className="rounded-2xl border border-error-200 bg-error-50 p-6 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/10 dark:text-error-300">
        Compte introuvable.
      </div>
    );
  }

  if (!canManageUsers && currentUser?.id !== user.id) {
    return (
      <div className="rounded-2xl border border-warning-200 bg-warning-50 p-6 text-sm text-warning-700 dark:border-warning-900/40 dark:bg-warning-900/10 dark:text-warning-300">
        Vous pouvez uniquement modifier votre propre compte.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Modifier Compte" />
      {error ? (
        <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-900/40 dark:bg-error-900/10 dark:text-error-300">
          {error}
        </div>
      ) : null}
      <CmsUserForm
        initialValue={user}
        submitLabel="Enregistrer les changements"
        allowAdminFields={canManageUsers}
        onSubmit={(value) => {
          const result = saveUser(value);
          if (!result.success) {
            setError(result.message || "Mise a jour impossible.");
            return;
          }
          router.push("/alumni");
        }}
      />
    </div>
  );
}
