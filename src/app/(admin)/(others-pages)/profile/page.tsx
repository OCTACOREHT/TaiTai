"use client";

import { CmsUserForm } from "@/components/common/CmsForms";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useCms } from "@/context/CmsContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ProfilePage() {
  const { currentUser, saveUser } = useCms();
  const router = useRouter();
  const [message, setMessage] = useState("");

  if (!currentUser) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Mon Compte" />
      {message ? (
        <div className="rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700 dark:border-success-900/40 dark:bg-success-900/10 dark:text-success-300">
          {message}
        </div>
      ) : null}
      <CmsUserForm
        initialValue={currentUser}
        submitLabel="Enregistrer mon compte"
        allowAdminFields={false}
        onSubmit={async (value) => {
          const result = await saveUser(value);
          if (result.success) {
            setMessage("Votre profil a ete mis a jour.");
            window.setTimeout(() => setMessage(""), 2500);
            router.refresh();
          }
        }}
      />
    </div>
  );
}
