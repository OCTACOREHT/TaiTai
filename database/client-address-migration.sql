ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS adresse text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS ville text;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS departement text;
