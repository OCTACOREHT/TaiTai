const fetch = require("node-fetch");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials");
  process.exit(1);
}

const executeSql = async (sql) => {
  try {
    console.log("🚀 Executing SQL on Supabase...");
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        "apikey": supabaseKey,
      },
      body: JSON.stringify({ sql }),
    });

    const text = await response.text();
    
    if (!response.ok) {
      console.log("Response status:", response.status);
      console.log("Response:", text);
      throw new Error(`HTTP ${response.status}`);
    }
    
    console.log("✅ SQL executed successfully!");
    return true;
  } catch (error) {
    console.log("⚠️  RPC method not available, trying alternative approach...");
    return false;
  }
};

const createTableViaFunction = async () => {
  // Create a temporary function to execute SQL
  const createFunctionSql = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;
  `;

  console.log("📝 Note: To execute SQL directly, you need to:");
  console.log("1. Use Supabase SQL Editor at: " + supabaseUrl.replace(/\/$/, "") + "/sql");
  console.log("2. Or create a PostgreSQL function with the service role key");
};

const createFournisseursTableSQL = `
  CREATE TABLE IF NOT EXISTS public.fournisseurs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nom text NOT NULL,
    telephone text NOT NULL,
    adresse text NOT NULL,
    created_at timestamptz DEFAULT now()
  );
  
  ALTER TABLE public.fournisseurs ENABLE ROW LEVEL SECURITY;
  
  DROP POLICY IF EXISTS "fournisseurs_public_read" ON public.fournisseurs;
  CREATE POLICY "fournisseurs_public_read" ON public.fournisseurs
    FOR SELECT USING (true);
  
  DROP POLICY IF EXISTS "fournisseurs_admin_insert" ON public.fournisseurs;
  CREATE POLICY "fournisseurs_admin_insert" ON public.fournisseurs
    FOR INSERT WITH CHECK (true);
  
  DROP POLICY IF EXISTS "fournisseurs_admin_update" ON public.fournisseurs;
  CREATE POLICY "fournisseurs_admin_update" ON public.fournisseurs
    FOR UPDATE USING (true) WITH CHECK (true);
  
  DROP POLICY IF EXISTS "fournisseurs_admin_delete" ON public.fournisseurs;
  CREATE POLICY "fournisseurs_admin_delete" ON public.fournisseurs
    FOR DELETE USING (true);
`;

const main = async () => {
  const success = await executeSql(createFournisseursTableSQL);
  
  if (!success) {
    console.log("\n");
    console.log("========================================");
    console.log("⚠️  MANUAL SETUP REQUIRED");
    console.log("========================================");
    console.log("\n📝 Execute this SQL in Supabase SQL Editor:\n");
    console.log(createFournisseursTableSQL);
    console.log("\n🔗 SQL Editor URL:");
    console.log(supabaseUrl.replace(/\/$/, "") + "/sql");
  }
};

main();
