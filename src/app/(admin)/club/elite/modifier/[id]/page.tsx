import React from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import EliteForm from "@/components/club/forms/EliteForm";
const db = require("@/server/db");

export default async function ModifierJoueurElite({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { rows } = await db.query(
    "SELECT * FROM club_elite_players WHERE id = $1",
    [id]
  );

  if (rows.length === 0) {
    return <div>Joueur non trouvé.</div>;
  }

  return (
    <>
      <PageBreadcrumb pageTitle="Modifier un Joueur Élite" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Modifier Joueur
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Mettez à jour les informations, vidéos ou photos.
          </p>
        </div>
        <EliteForm initialData={rows[0]} playerId={id} />
      </div>
    </>
  );
}
