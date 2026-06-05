CREATE TABLE IF NOT EXISTS public.avis_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_user_id UUID,
  nom TEXT NOT NULL,
  note INTEGER NOT NULL CHECK (note BETWEEN 1 AND 5),
  commentaire TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.avis_clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "avis_public_read" ON public.avis_clients;
CREATE POLICY "avis_public_read" ON public.avis_clients
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "avis_public_insert" ON public.avis_clients;
CREATE POLICY "avis_public_insert" ON public.avis_clients
  FOR INSERT WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
