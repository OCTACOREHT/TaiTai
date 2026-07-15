-- Table pour gérer les zones de livraison et leurs prix
CREATE TABLE IF NOT EXISTS public.delivery_zones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zone TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  frais INTEGER NOT NULL,
  departement TEXT NOT NULL DEFAULT 'Ouest',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer les zones par défaut
INSERT INTO public.delivery_zones (zone, label, frais, departement) VALUES
  ('PV', 'PV - 300 HTG', 300, 'Ouest'),
  ('Puits B', 'Puits B - 300 HTG', 300, 'Ouest'),
  ('Routes Freres', 'Routes Freres - 300 HTG', 300, 'Ouest'),
  ('Delmas', 'Delmas - 350 HTG', 350, 'Ouest'),
  ('Limite Turgeau', 'Limite Turgeau - 400 HTG', 400, 'Ouest'),
  ('Centre Ville', 'Centre Ville - 500 HTG', 500, 'Ouest'),
  ('Rte Aeroport', 'Rte Aeroport - 500 HTG', 500, 'Ouest'),
  ('Cazeau', 'Cazeau - 500 HTG', 500, 'Ouest'),
  ('Gerald Bataille', 'Gerald Bataille - 500 HTG', 500, 'Ouest'),
  ('Tabarre', 'Tabarre - 750-1000 HTG', 875, 'Ouest'),
  ('Clercine', 'Clercine - 750-1000 HTG', 875, 'Ouest'),
  ('Thomassin', 'Thomassin - 750-1000 HTG', 875, 'Ouest')
ON CONFLICT (zone) DO NOTHING;

-- Politiques RLS
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "delivery_zones_public_read" ON public.delivery_zones
  FOR SELECT USING (true);

-- Modification admin (toutes les opérations autorisées pour l'admin)
CREATE POLICY "delivery_zones_admin_insert" ON public.delivery_zones
  FOR INSERT WITH CHECK (true);

CREATE POLICY "delivery_zones_admin_update" ON public.delivery_zones
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "delivery_zones_admin_delete" ON public.delivery_zones
  FOR DELETE USING (true);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_delivery_zones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER delivery_zones_updated_at
  BEFORE UPDATE ON public.delivery_zones
  FOR EACH ROW
  EXECUTE FUNCTION update_delivery_zones_updated_at();