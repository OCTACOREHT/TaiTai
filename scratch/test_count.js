const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testCount() {
  const { count, data, error } = await supabaseAnon
    .from("commandes")
    .select("id", { count: "exact" })
    .eq("statut", "En attente")
    .is("archived_at", null);

  console.log("Anon count with is(archived_at, null):", count, "Error:", error);
}

testCount();
