-- Migration: Ajouter la colonne supplements à la table commande_items
-- Cette colonne stocke les suppléments choisis pour chaque item de commande

-- Ajouter la colonne supplements
ALTER TABLE public.commande_items 
ADD COLUMN IF NOT EXISTS supplements JSONB DEFAULT '[]'::jsonb;

-- Commentaire sur la colonne
COMMENT ON COLUMN public.commande_items.supplements IS 'Suppléments choisis par le client pour cet item - Format JSONB: [{nom, prix, disponible}]';

-- Vérifier la structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'commande_items'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Exemple de mise à jour pour les commandes existantes (optionnel)
-- Note: Les anciennes commandes n'auront pas de suppléments, ce qui est normal
-- Les nouvelles commandes auront automatiquement un tableau vide '[]'