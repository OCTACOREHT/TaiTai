// This is a migration helper endpoint for development only
// In production, use proper database migrations via Supabase CLI

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase credentials");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const migrations = [
  {
    name: "Create fournisseurs table",
    sql: `
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
    `,
  },
];

export async function POST(request: Request) {
  // ⚠️ In production, add proper authentication!
  // For now, this is dev-only

  try {
    const results = [];

    for (const migration of migrations) {
      try {
        // Try to execute via RPC
        const { data, error } = await supabase.rpc("exec_sql", {
          sql: migration.sql,
        });

        if (error) {
          // If RPC doesn't work, try direct query to test table existence
          const { error: tableError } = await supabase
            .from("fournisseurs")
            .select("count")
            .limit(0);

          if (
            tableError &&
            !tableError.message.includes("Could not find")
          ) {
            // Table exists but query failed for other reason
            results.push({
              migration: migration.name,
              status: "exists",
            });
          } else if (tableError?.message.includes("Could not find")) {
            results.push({
              migration: migration.name,
              status: "missing",
              error: "Table not found - please execute SQL manually in Supabase SQL Editor",
            });
          }
        } else {
          results.push({
            migration: migration.name,
            status: "applied",
          });
        }
      } catch (err: any) {
        results.push({
          migration: migration.name,
          status: "error",
          error: err.message,
        });
      }
    }

    return Response.json({
      success: true,
      results,
      supabaseUrl,
    });
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
