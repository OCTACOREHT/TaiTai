ALTER TABLE public.commandes
ADD COLUMN IF NOT EXISTS client_email TEXT;
