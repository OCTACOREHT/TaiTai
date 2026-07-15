-- Script pour créer le bucket de stockage des images de menu dans Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- Créer le bucket pour les images de menu
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-images',
  'menu-images',
  true,
  5242880, -- 5 MB en bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Politique de sécurité pour le bucket menu-images
-- Lecture publique
CREATE POLICY "menu_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'menu-images');

-- Insertion autorisée (pour l'API)
CREATE POLICY "menu_images_public_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'menu-images');

-- Mise à jour autorisée
CREATE POLICY "menu_images_public_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'menu-images');

-- Suppression autorisée
CREATE POLICY "menu_images_public_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'menu-images');

-- Accorder les permissions
GRANT SELECT ON storage.objects TO anon, authenticated;
GRANT INSERT ON storage.objects TO anon, authenticated;
GRANT UPDATE ON storage.objects TO anon, authenticated;
GRANT DELETE ON storage.objects TO anon, authenticated;