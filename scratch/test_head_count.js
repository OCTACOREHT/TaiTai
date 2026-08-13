const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testHeadCount() {
  const { count, error } = await supabase
    .from("commandes")
    .select("id", { count: "exact", head: true })
    .eq("statut", "En attente")
    .is("archived_at", null);

  console.log("Head count result:", count, "Error:", error);
}

testHeadCount();
