-- Prevent duplicate client accounts for the same email address.
-- Before running it, resolve any duplicates returned by:
-- SELECT lower(email), count(*) FROM public.clients GROUP BY lower(email) HAVING count(*) > 1;

CREATE UNIQUE INDEX IF NOT EXISTS clients_email_unique_ci
ON public.clients (lower(email))
WHERE email IS NOT NULL;
