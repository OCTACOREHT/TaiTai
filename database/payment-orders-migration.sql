ALTER TABLE public.commandes ADD COLUMN IF NOT EXISTS client_user_id uuid;
ALTER TABLE public.commandes ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'Sur place';
ALTER TABLE public.commandes ADD COLUMN IF NOT EXISTS payment_proof_url text;
ALTER TABLE public.commandes ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'Valide';

ALTER TABLE public.commandes DROP CONSTRAINT IF EXISTS commandes_canal_check;
ALTER TABLE public.commandes
  ADD CONSTRAINT commandes_canal_check CHECK (canal IN ('Livraison'));

ALTER TABLE public.commandes DROP CONSTRAINT IF EXISTS commandes_statut_check;
ALTER TABLE public.commandes
  ADD CONSTRAINT commandes_statut_check
  CHECK (statut IN ('En attente','En préparation','Prêt','En route','Livré','Annulee','En prÃ©paration','PrÃªt','LivrÃ©'));

ALTER TABLE public.commandes DROP CONSTRAINT IF EXISTS commandes_payment_method_check;
ALTER TABLE public.commandes
  ADD CONSTRAINT commandes_payment_method_check CHECK (payment_method IN ('Sur place','MonCash','Zelle'));

ALTER TABLE public.commandes DROP CONSTRAINT IF EXISTS commandes_payment_status_check;
ALTER TABLE public.commandes
  ADD CONSTRAINT commandes_payment_status_check CHECK (payment_status IN ('A verifier','Valide','Refuse'));
