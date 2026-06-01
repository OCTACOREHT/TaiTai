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
