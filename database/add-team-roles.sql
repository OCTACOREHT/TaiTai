-- Migration pour supporter les roles de l'equipe (caissier, moderator)
ALTER TYPE cms_user_role ADD VALUE IF NOT EXISTS 'caissier';
ALTER TYPE cms_user_role ADD VALUE IF NOT EXISTS 'moderator';

