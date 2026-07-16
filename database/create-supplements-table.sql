-- Création de la table supplements
CREATE TABLE IF NOT EXISTS public.supplements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  prix INTEGER NOT NULL,
  disponible BOOLEAN NOT NULL DEFAULT true,
  categorie TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "supplements_public_read" ON public.supplements
  FOR SELECT USING (true);

CREATE POLICY "supplements_admin_insert" ON public.supplements
  FOR INSERT WITH CHECK (true);

CREATE POLICY "supplements_admin_update" ON public.supplements
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "supplements_admin_delete" ON public.supplements
  FOR DELETE USING (true);

-- Données de test
INSERT INTO public.supplements (nom, prix, disponible, categorie) VALUES
  ('Sos tomat', 50, true, 'Grillades'),
  ('Sos moutard', 50, true, 'Grillades'),
  ('Sos pikliz', 75, true, 'Grillades'),
  ('Laitue', 25, true, 'Burgers'),
  ('Tomate', 25, true, 'Burgers'),
  ('Fromage', 100, true, 'Burgers'),
  ('Bacon', 150, true, 'Burgers'),
  ('Oignon karamelize', 75, true, 'Burgers'),
  ('Ketchup', 25, true, NULL),
  ('Mayo', 25, true, NULL),
  ('Sos pwa', 50, true, NULL),
  ('Sos ti-malice', 75, true, NULL);