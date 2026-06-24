-- Ajouter la colonne jour à la table menu_items
ALTER TABLE menu_items 
ADD COLUMN IF NOT EXISTS jour TEXT;

-- Ajouter une contrainte pour valider les valeurs
ALTER TABLE menu_items 
ADD CONSTRAINT jour_check 
CHECK (jour IS NULL OR jour IN ('Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'));

-- Commentaire sur la colonne
COMMENT ON COLUMN menu_items.jour IS 'Jour de la semaine pour lequel le plat est disponible (Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi, Dimanche)';

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_menu_items_jour ON menu_items(jour);