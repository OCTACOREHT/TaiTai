-- TaiTai Restaurant SaaS Database Schema
-- Optimized for Next.js / Supabase

-- [1] EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- [2] CLEANUP (Remove old football tables and old CMS tables)
DROP TABLE IF EXISTS public.flagday_top_scorers CASCADE;
DROP TABLE IF EXISTS public.flagday_standings CASCADE;
DROP TABLE IF EXISTS public.flagday_categories CASCADE;
DROP TABLE IF EXISTS public.flagday_matches CASCADE;
DROP TABLE IF EXISTS public.flagday_competition_teams CASCADE;
DROP TABLE IF EXISTS public.flagday_teams CASCADE;
DROP TABLE IF EXISTS public.flagday_competitions CASCADE;
DROP TABLE IF EXISTS public.club_event_participants CASCADE;
DROP TABLE IF EXISTS public.club_events CASCADE;
DROP TABLE IF EXISTS public.club_staff CASCADE;
DROP TABLE IF EXISTS public.club_players CASCADE;
DROP TABLE IF EXISTS public.articles CASCADE;
DROP TABLE IF EXISTS public.stages CASCADE;
DROP TABLE IF EXISTS public.partners CASCADE;
DROP TABLE IF EXISTS public.media CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;
DROP TABLE IF EXISTS public.home_page_settings CASCADE;
DROP TABLE IF EXISTS public.home_hero_metrics CASCADE;
DROP TABLE IF EXISTS public.dashboard_preferences CASCADE;
DROP TABLE IF EXISTS public.connexion_logs CASCADE;

-- Cleanup types
DROP TYPE IF EXISTS cms_publish_status CASCADE;
DROP TYPE IF EXISTS cms_user_role CASCADE;
DROP TYPE IF EXISTS cms_stage_work_mode CASCADE;
DROP TYPE IF EXISTS cms_partner_tier CASCADE;
DROP TYPE IF EXISTS club_player_status CASCADE;
DROP TYPE IF EXISTS club_event_type CASCADE;
DROP TYPE IF EXISTS club_event_color CASCADE;
DROP TYPE IF EXISTS flagday_stage CASCADE;
DROP TYPE IF EXISTS flagday_status CASCADE;

-- [3] AUTH / ADMIN
CREATE TYPE cms_user_role AS ENUM ('admin', 'editor', 'author', 'super_admin');

CREATE TABLE public.admin_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role cms_user_role NOT NULL DEFAULT 'editor'::cms_user_role,
  title character varying NOT NULL DEFAULT '',
  avatar text NOT NULL DEFAULT '/images/user/owner.jpg',
  bio text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT admin_users_pkey PRIMARY KEY (id)
);

-- [4] TAITAI RESTAURANT TABLES

-- Table menu
CREATE TABLE public.menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  description TEXT,
  prix INTEGER NOT NULL,
  categorie TEXT NOT NULL,
  image_url TEXT,
  disponible BOOLEAN DEFAULT true,
  stock_quantity INTEGER NOT NULL DEFAULT 10,
  temps_prep INTEGER DEFAULT 15,
  best_seller BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Table commandes
CREATE TABLE public.commandes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_commande TEXT UNIQUE NOT NULL,
  client_nom TEXT NOT NULL,
  client_tel TEXT,
  canal TEXT NOT NULL DEFAULT 'Livraison' CHECK (canal IN ('Livraison')),
  table_numero TEXT,
  adresse_livraison TEXT,
  notes TEXT,
  statut TEXT DEFAULT 'En attente' 
    CHECK (statut IN ('En attente','En préparation','Prêt','Livré','Annulee')),
  client_user_id UUID,
  payment_method TEXT DEFAULT 'Sur place' CHECK (payment_method IN ('Sur place','MonCash','Zelle')),
  payment_proof_url TEXT,
  payment_status TEXT DEFAULT 'Valide' CHECK (payment_status IN ('A verifier','Valide','Refuse')),
  total INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table items par commande
CREATE TABLE public.commande_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  commande_id UUID REFERENCES public.commandes(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id),
  nom_plat TEXT NOT NULL,
  prix_unitaire INTEGER NOT NULL,
  quantite INTEGER NOT NULL DEFAULT 1,
  sous_total INTEGER NOT NULL
);

-- Table promotions
CREATE TABLE public.promotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  code TEXT,
  scope TEXT NOT NULL CHECK (scope IN ('item','order')),
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent','fixed')),
  discount_value INTEGER NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table avis clients
CREATE TABLE public.avis_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_user_id UUID,
  nom TEXT NOT NULL,
  note INTEGER NOT NULL CHECK (note BETWEEN 1 AND 5),
  commentaire TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table fournisseurs
CREATE TABLE public.fournisseurs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nom TEXT NOT NULL,
  telephone TEXT NOT NULL,
  adresse TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- [5] SECURITY (RLS Policies)
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commande_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avis_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fournisseurs ENABLE ROW LEVEL SECURITY;

-- Menu : lecture publique
CREATE POLICY "menu_public_read" ON public.menu_items
  FOR SELECT USING (true);
CREATE POLICY "menu_admin_insert" ON public.menu_items
  FOR INSERT WITH CHECK (true);
CREATE POLICY "menu_admin_update" ON public.menu_items
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "menu_admin_delete" ON public.menu_items
  FOR DELETE USING (true);

-- Commandes : insert public, lecture par numero
CREATE POLICY "commandes_public_insert" ON public.commandes
  FOR INSERT WITH CHECK (true);
CREATE POLICY "commandes_public_select" ON public.commandes
  FOR SELECT USING (true);

-- Commande items : insert et lecture publics
CREATE POLICY "items_public_insert" ON public.commande_items
  FOR INSERT WITH CHECK (true);
CREATE POLICY "items_public_select" ON public.commande_items
  FOR SELECT USING (true);

-- Promotions : lecture publique, gestion admin
CREATE POLICY "promotions_public_read" ON public.promotions
  FOR SELECT USING (true);
CREATE POLICY "promotions_admin_insert" ON public.promotions
  FOR INSERT WITH CHECK (true);
CREATE POLICY "promotions_admin_update" ON public.promotions
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "promotions_admin_delete" ON public.promotions
  FOR DELETE USING (true);

-- Avis clients : lecture et ajout publics
CREATE POLICY "avis_public_read" ON public.avis_clients
  FOR SELECT USING (active = true);
CREATE POLICY "avis_public_insert" ON public.avis_clients
  FOR INSERT WITH CHECK (true);

-- Fournisseurs : lecture publique, gestion admin
CREATE POLICY "fournisseurs_public_read" ON public.fournisseurs
  FOR SELECT USING (true);
CREATE POLICY "fournisseurs_admin_insert" ON public.fournisseurs
  FOR INSERT WITH CHECK (true);
CREATE POLICY "fournisseurs_admin_update" ON public.fournisseurs
  FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "fournisseurs_admin_delete" ON public.fournisseurs
  FOR DELETE USING (true);

-- [6] REALTIME
-- Note: If publication doesn't exist, this might need manual setup in Supabase, 
-- but common in schema files for local/staging migrations.
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.commandes;

-- [7] SEED DATA
INSERT INTO public.menu_items (nom, description, prix, categorie, temps_prep, best_seller, image_url) VALUES
('Poulet grille TaiTai','Poulet marinÃ© 24h, Ã©pis maison, lÃ©gumes rÃ´tis.',1450,'Grillades',18,true,'https://images.unsplash.com/photo-1598103442097-8b74394b95c7?w=400'),
('Bowl riz creole','Riz djondjon, bÅ“uf effilochÃ©, sauce citron piklÃ©.',1350,'Signature',12,true,'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400'),
('Burger creole','Steak maison, pikliz doux, cheddar fumÃ©.',1290,'Burgers',14,true,'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'),
('Pates fruits de mer','Sauce crÃ¨me Ã©picÃ©e, crevettes, calamars, citron vert.',1890,'PÃ¢tes',16,false,'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400'),
('Cheesecake coco','Base sablÃ©e, crÃ¨me coco, caramel salÃ©.',1000,'Desserts',8,false,'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400'),
('Jus passion maison','Infusion passion, orange, citron vert.',550,'Boissons',4,true,'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400');

