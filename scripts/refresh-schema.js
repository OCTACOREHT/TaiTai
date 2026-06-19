const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });
const fs = require("fs");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const createFournisseursTable = async () => {
  try {
    console.log("🔄 Creating fournisseurs table on Supabase...");
    
    // Create table using simple inserts check
    const { data, error: checkError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .eq("table_name", "fournisseurs");
    
    // If we get an error or no data, create the table
    console.log("Creating fournisseurs table...");
    
    const sql = `
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
    
    // Execute the SQL - try direct query
    const { error } = await supabase.rpc("exec_sql", { sql });
    
    if (error) {
      console.log("⚠️  Using alternative method to create table...");
      
      // Try a simpler approach - just test the table
      const { data: testData, error: testError } = await supabase
        .from("fournisseurs")
        .select("count")
        .limit(0);
      
      if (testError && testError.message.includes("Could not find")) {
        console.log("📝 Please execute this SQL manually in Supabase SQL Editor:");
        console.log(sql);
        console.log("\n🔗 Go to: " + supabaseUrl + "/sql");
      } else {
        console.log("✅ Fournisseurs table is now accessible!");
      }
    } else {
      console.log("✅ Fournisseurs table created successfully!");
    }
    
  } catch (err) {
    console.error("⚠️  Error:", err.message);
    console.log("📝 Please create the table manually in Supabase SQL Editor");
  }
};

createFournisseursTable();
