-- Table pour stocker les mots de passe des administrateurs
CREATE TABLE IF NOT EXISTS admin_passwords (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer le mot de passe par défaut pour l'admin principal
-- Mot de passe par défaut: "taitai2024"
INSERT INTO admin_passwords (id, email, password_hash, updated_at)
VALUES ('owner-01', 'taitai@gmail.com', 'taitai2024', NOW())
ON CONFLICT (id) DO NOTHING;

-- Index pour les recherches par email
CREATE INDEX IF NOT EXISTS idx_admin_passwords_email ON admin_passwords(email);