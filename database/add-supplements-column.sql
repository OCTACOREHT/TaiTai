-- Migration: Ajouter la colonne supplements à la table menu_items
-- Cette colonne stocke les suppléments spécifiques à chaque plat en format JSONB

-- Ajouter la colonne supplements
ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS supplements JSONB DEFAULT '[]'::jsonb;

-- Commentaire sur la colonne
COMMENT ON COLUMN public.menu_items.supplements IS 'Suppléments disponibles pour ce plat (sauces, accompagnements, etc.) - Format JSONB: [{nom, prix, disponible}]';

-- Exemple de données pour tester
-- Mettre à jour un plat existant avec des suppléments
UPDATE public.menu_items 
SET supplements = '[
  {"nom": "Sos tomat", "prix": 50, "disponible": true},
  {"nom": "Sos moutard", "prix": 50, "disponible": true},
  {"nom": "Laitue", "prix": 25, "disponible": true},
  {"nom": "Fromage", "prix": 100, "disponible": true}
]'
WHERE nom = 'Burger creole' 
  AND categorie = 'Burgers'
  AND deleted_at IS NULL;

-- Mettre à jour un autre plat avec des suppléments gratuits et payants
UPDATE public.menu_items 
SET supplements = '[
  {"nom": "Sos pikliz", "prix": 75, "disponible": true},
  {"nom": "Sos ti-malice", "prix": 75, "disponible": true},
  {"nom": "Mayo", "prix": 0, "disponible": true},
  {"nom": "Ketchup", "prix": 0, "disponible": true}
]'
WHERE nom = 'Poulet grille TaiTai' 
  AND categorie = 'Grillades'
  AND deleted_at IS NULL;

-- Vérifier les mises à jour
SELECT id, nom, categorie, supplements 
FROM public.menu_items 
WHERE deleted_at IS NULL 
LIMIT 5;