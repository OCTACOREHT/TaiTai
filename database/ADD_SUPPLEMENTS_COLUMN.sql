-- ============================================
-- SCRIPT: Ajouter la colonne supplements
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- Étape 1: Ajouter la colonne supplements à menu_items
ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS supplements JSONB DEFAULT '[]'::jsonb;

-- Étape 2: Ajouter la colonne supplements à commande_items
ALTER TABLE public.commande_items 
ADD COLUMN IF NOT EXISTS supplements JSONB DEFAULT '[]'::jsonb;

-- Étape 3: Ajouter un commentaire (optionnel)
COMMENT ON COLUMN public.menu_items.supplements IS 'Suppléments disponibles pour ce plat';
COMMENT ON COLUMN public.commande_items.supplements IS 'Suppléments choisis par le client';

-- ============================================
-- VÉRIFICATION
-- ============================================
-- Exécutez cette requête pour vérifier que les colonnes ont été ajoutées:

SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name IN ('menu_items', 'commande_items')
  AND column_name = 'supplements'
ORDER BY table_name, ordinal_position;

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Vous devriez voir 2 lignes:
-- 1. menu_items | supplements | jsonb | YES | '[]'::jsonb
-- 2. commande_items | supplements | jsonb | YES | '[]'::jsonb

-- ============================================
-- SI VOUS AVEZ DÉJÀ DES DONNÉES
-- ============================================
-- Les anciennes commandes n'auront pas de suppléments (tableau vide)
-- C'est normal, seules les nouvelles commandes auront des suppléments

-- ============================================
-- TEST (optionnel)
-- ============================================
-- Ajouter des suppléments à un plat existant:
-- Remplacez 'VOTRE_PLAT_ID' par l'ID réel d'un plat

-- UPDATE public.menu_items 
-- SET supplements = '[
--   {"nom": "Sos tomat", "prix": 50, "disponible": true},
--   {"nom": "Mayo", "prix": 0, "disponible": true},
--   {"nom": "Fromage", "prix": 100, "disponible": true}
-- ]'
-- WHERE id = 'VOTRE_PLAT_ID';
