const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixOrphanedPendingOrders() {
  // Find all orders that are archived (archived_at not null) but still have "En attente" status
  const { data: orphans, error: fetchErr } = await supabaseAdmin
    .from("commandes")
    .select("id, numero_commande, statut, archived_at")
    .eq("statut", "En attente")
    .not("archived_at", "is", null);

  if (fetchErr) {
    console.error("Fetch error:", fetchErr);
    return;
  }

  if (!orphans || orphans.length === 0) {
    console.log("✓ Aucune commande orpheline trouvée.");
    return;
  }

  console.log(`Trouvé ${orphans.length} commande(s) archivée(s) avec statut 'En attente':`);
  orphans.forEach(o => console.log(` - ${o.numero_commande} | archived_at: ${o.archived_at}`));

  // Fix: update their status to "Annulee" since they are archived
  const ids = orphans.map(o => o.id);
  const { error: updateErr } = await supabaseAdmin
    .from("commandes")
    .update({ statut: "Annulee" })
    .in("id", ids);

  if (updateErr) {
    console.error("Update error:", updateErr);
  } else {
    console.log(`✓ ${ids.length} commande(s) corrigée(s) → statut mis à 'Annulee'.`);
  }
}

fixOrphanedPendingOrders();
