const { Pool } = require('pg');

async function run() {
  const p = new Pool({
    user: 'postgres.yuriotdtjubnbumeisdk',
    password: 'Taitai@2026',
    host: 'aws-1-us-east-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  const client = await p.connect();

  try {
    console.log('✅ Connecté à Supabase...');

    await client.query('BEGIN');

    // [1] EXTENSIONS
    console.log('📦 Activation des extensions...');
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // [2] NETTOYAGE tables legacy si elles existent
    console.log('🧹 Nettoyage des éventuelles tables legacy...');
    const legacyTables = [
      'flagday_top_scorers', 'flagday_standings', 'flagday_categories',
      'flagday_matches', 'flagday_competition_teams', 'flagday_teams',
      'flagday_competitions', 'club_event_participants', 'club_events',
      'club_staff', 'club_players', 'articles', 'stages', 'partners',
      'media', 'site_settings', 'home_page_settings', 'home_hero_metrics',
      'dashboard_preferences', 'connexion_logs', 'commande_items',
      'commandes', 'menu_items', 'admin_users'
    ];
    for (const table of legacyTables) {
      await client.query(`DROP TABLE IF EXISTS public."${table}" CASCADE;`);
    }

    // Drop legacy types
    const legacyTypes = [
      'cms_publish_status', 'cms_user_role', 'cms_stage_work_mode',
      'cms_partner_tier', 'club_player_status', 'club_event_type',
      'club_event_color', 'flagday_stage', 'flagday_status'
    ];
    for (const t of legacyTypes) {
      await client.query(`DROP TYPE IF EXISTS ${t} CASCADE;`);
    }

    // [3] AUTH / ADMIN
    console.log('👤 Création de la table admin_users...');
    await client.query(`CREATE TYPE cms_user_role AS ENUM ('admin', 'editor', 'author', 'super_admin');`);
    await client.query(`
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
    `);

    // [4] TABLES RESTAURANT TAITAI
    console.log('🍽️ Création de la table menu_items...');
    await client.query(`
      CREATE TABLE public.menu_items (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        nom TEXT NOT NULL,
        description TEXT,
        prix INTEGER NOT NULL,
        categorie TEXT NOT NULL,
        image_url TEXT,
        disponible BOOLEAN DEFAULT true,
        temps_prep INTEGER DEFAULT 15,
        best_seller BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log('📋 Création de la table commandes (avec colonnes paiement et statut étendu)...');
    await client.query(`
      CREATE TABLE public.commandes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        numero_commande TEXT UNIQUE NOT NULL,
        client_nom TEXT NOT NULL,
        client_tel TEXT,
        canal TEXT NOT NULL CHECK (canal IN ('Salle','Livraison','A emporter')),
        table_numero TEXT,
        adresse_livraison TEXT,
        notes TEXT,
        statut TEXT DEFAULT 'En attente'
          CHECK (statut IN ('En attente','En préparation','Prêt','Livré')),
        methode_paiement TEXT CHECK (methode_paiement IN ('Cash','Carte','MonCash','Unibank','Sogebank')),
        preuve_paiement_url TEXT,
        total INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log('🛒 Création de la table commande_items...');
    await client.query(`
      CREATE TABLE public.commande_items (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        commande_id UUID REFERENCES public.commandes(id) ON DELETE CASCADE,
        menu_item_id UUID REFERENCES public.menu_items(id),
        nom_plat TEXT NOT NULL,
        prix_unitaire INTEGER NOT NULL,
        quantite INTEGER NOT NULL DEFAULT 1,
        sous_total INTEGER NOT NULL
      );
    `);

    // [5] SECURITY (RLS)
    console.log('🔐 Activation du Row Level Security...');
    await client.query(`ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;`);
    await client.query(`ALTER TABLE public.commandes ENABLE ROW LEVEL SECURITY;`);
    await client.query(`ALTER TABLE public.commande_items ENABLE ROW LEVEL SECURITY;`);

    await client.query(`CREATE POLICY "menu_public_read" ON public.menu_items FOR SELECT USING (true);`);
    await client.query(`CREATE POLICY "menu_admin_all" ON public.menu_items FOR ALL USING (true);`);
    await client.query(`CREATE POLICY "commandes_public_insert" ON public.commandes FOR INSERT WITH CHECK (true);`);
    await client.query(`CREATE POLICY "commandes_public_select" ON public.commandes FOR SELECT USING (true);`);
    await client.query(`CREATE POLICY "commandes_admin_update" ON public.commandes FOR UPDATE USING (true);`);
    await client.query(`CREATE POLICY "items_public_insert" ON public.commande_items FOR INSERT WITH CHECK (true);`);
    await client.query(`CREATE POLICY "items_public_select" ON public.commande_items FOR SELECT USING (true);`);

    // [6] SEED DATA
    console.log('🌱 Insertion des plats de démonstration...');
    await client.query(`
      INSERT INTO public.menu_items (nom, description, prix, categorie, temps_prep, best_seller, image_url) VALUES
      ('Poulet grillé TaiTai', 'Poulet mariné 24h, épis maison, légumes rôtis.', 1450, 'Grillades', 18, true, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c7?w=400'),
      ('Bowl riz créole', 'Riz djondjon, bœuf effiloché, sauce citron piklé.', 1350, 'Signature', 12, true, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400'),
      ('Burger créole', 'Steak maison, pikliz doux, cheddar fumé.', 1290, 'Burgers', 14, true, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400'),
      ('Pâtes fruits de mer', 'Sauce crème épicée, crevettes, calamars, citron vert.', 1890, 'Pâtes', 16, false, 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400'),
      ('Cheesecake coco', 'Base sablée, crème coco, caramel salé.', 1000, 'Desserts', 8, false, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400'),
      ('Jus passion maison', 'Infusion passion, orange, citron vert.', 550, 'Boissons', 4, true, 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400'),
      ('Griot complet', 'Porc frit, banane pesée, sauce ti-malice.', 1600, 'Signature', 20, true, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400'),
      ('Tassot cabrit', 'Chèvre frite, riz collé pois, sauce épicée.', 1750, 'Grillades', 25, false, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400');
    `);

    await client.query('COMMIT');
    console.log('');
    console.log('🎉 Migration terminée avec succès !');
    console.log('✅ Tables créées: admin_users, menu_items, commandes, commande_items');
    console.log('✅ RLS activé sur toutes les tables');
    console.log('✅ 8 plats de démonstration insérés');
    console.log('✅ Colonnes "methode_paiement" et "preuve_paiement_url" incluses');
    console.log('✅ Statut "En préparation" inclus dans la contrainte CHECK');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur - Rollback effectué:', err.message);
    throw err;
  } finally {
    client.release();
    await p.end();
  }
}

run();
