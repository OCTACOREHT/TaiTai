-- Ajouter la colonne photo_url à la table fournisseurs
ALTER TABLE fournisseurs 
ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Commentaire sur la colonne
COMMENT ON COLUMN fournisseurs.photo_url IS 'URL du document/photo du fournisseur (justificatif de paiement, fiche, etc.)';