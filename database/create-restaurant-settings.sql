-- Table restaurant_settings
CREATE TABLE IF NOT EXISTS public.restaurant_settings (
  id TEXT PRIMARY KEY DEFAULT 'general',
  commandes_ouvertes BOOLEAN NOT NULL DEFAULT true,
  message_fermeture TEXT DEFAULT 'Kòmann sou sit la fèmen pou kounye a. Nou ap retounen talè !',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertion de la configuration par défaut (ouvert)
INSERT INTO public.restaurant_settings (id, commandes_ouvertes, message_fermeture)
VALUES ('general', true, 'Kòmann sou sit la fèmen pou kounye a. Nou ap retounen talè !')
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_public_read" ON public.restaurant_settings;
CREATE POLICY "settings_public_read" ON public.restaurant_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "settings_admin_insert" ON public.restaurant_settings;
CREATE POLICY "settings_admin_insert" ON public.restaurant_settings
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "settings_admin_update" ON public.restaurant_settings;
CREATE POLICY "settings_admin_update" ON public.restaurant_settings
  FOR UPDATE USING (true) WITH CHECK (true);
