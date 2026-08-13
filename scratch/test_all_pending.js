const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAllPending() {
  const { data, error } = await supabaseAdmin
    .from("commandes")
    .select("id, numero_commande, statut, archived_at")
    .eq("statut", "En attente");

  console.log("All orders with statut = 'En attente':", data);
}

testAllPending();
