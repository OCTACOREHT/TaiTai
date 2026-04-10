-- Football CMS Database Schema
-- Optimized and normalized for Next.js / Supabase

-- [1] EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- [2] ENUMS / CLEANUP
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.articles CASCADE;
DROP TABLE IF EXISTS public.stages CASCADE;
DROP TABLE IF EXISTS public.partners CASCADE;
DROP TABLE IF EXISTS public.media CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;
DROP TABLE IF EXISTS public.home_page_settings CASCADE;
DROP TABLE IF EXISTS public.home_hero_metrics CASCADE;
DROP TABLE IF EXISTS public.dashboard_preferences CASCADE;
DROP TABLE IF EXISTS public.club_players CASCADE;
DROP TABLE IF EXISTS public.club_staff CASCADE;
DROP TABLE IF EXISTS public.club_events CASCADE;
DROP TABLE IF EXISTS public.club_event_participants CASCADE;
DROP TABLE IF EXISTS public.flagday_competitions CASCADE;
DROP TABLE IF EXISTS public.flagday_teams CASCADE;
DROP TABLE IF EXISTS public.flagday_competition_teams CASCADE;
DROP TABLE IF EXISTS public.flagday_matches CASCADE;
DROP TABLE IF EXISTS public.flagday_categories CASCADE;
DROP TABLE IF EXISTS public.flagday_standings CASCADE;
DROP TABLE IF EXISTS public.flagday_top_scorers CASCADE;
DROP TABLE IF EXISTS public.connexion_logs CASCADE;

DROP TYPE IF EXISTS cms_publish_status CASCADE;
DROP TYPE IF EXISTS cms_user_role CASCADE;
DROP TYPE IF EXISTS cms_stage_work_mode CASCADE;
DROP TYPE IF EXISTS cms_partner_tier CASCADE;
DROP TYPE IF EXISTS club_player_status CASCADE;
DROP TYPE IF EXISTS club_event_type CASCADE;
DROP TYPE IF EXISTS club_event_color CASCADE;
DROP TYPE IF EXISTS flagday_stage CASCADE;

CREATE TYPE cms_publish_status AS ENUM ('draft', 'review', 'published', 'archived');
CREATE TYPE cms_user_role AS ENUM ('admin', 'editor', 'author', 'super_admin');
CREATE TYPE cms_stage_work_mode AS ENUM ('onsite', 'hybrid', 'remote');
CREATE TYPE cms_partner_tier AS ENUM ('principal', 'gold', 'silver', 'media');
CREATE TYPE club_player_status AS ENUM ('actif', 'blesse', 'suspendu');
CREATE TYPE club_event_type AS ENUM ('match', 'entrainement', 'reunion');
CREATE TYPE club_event_color AS ENUM ('Danger', 'Success', 'Primary', 'Warning');
CREATE TYPE flagday_stage AS ENUM ('group', 'barrage', 'final');

-- [3] CMS TABLES

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

CREATE TABLE public.articles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug character varying NOT NULL UNIQUE,
  title_fr character varying NOT NULL,
  title_en character varying,
  content_fr text NOT NULL,
  content_en text,
  excerpt_fr text NOT NULL DEFAULT '',
  excerpt_en text,
  cover_image text NOT NULL DEFAULT '/images/grid-image/image-01.png',
  category character varying NOT NULL DEFAULT 'Actualites',
  tags text[] NOT NULL DEFAULT '{}',
  author_id uuid,
  author_name character varying NOT NULL,
  featured boolean NOT NULL DEFAULT false,
  status cms_publish_status NOT NULL DEFAULT 'draft'::cms_publish_status,
  seo_title character varying NOT NULL DEFAULT '',
  seo_description text NOT NULL DEFAULT '',
  views integer NOT NULL DEFAULT 0,
  link_clicks integer NOT NULL DEFAULT 0,
  shares integer NOT NULL DEFAULT 0,
  leads integer NOT NULL DEFAULT 0,
  published_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT articles_pkey PRIMARY KEY (id),
  CONSTRAINT articles_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.admin_users(id) ON DELETE SET NULL
);

CREATE TABLE public.stages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug character varying NOT NULL UNIQUE,
  title character varying NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  content text NOT NULL,
  cover_image text NOT NULL DEFAULT '/images/grid-image/image-01.png',
  department character varying NOT NULL DEFAULT 'Communication',
  location character varying NOT NULL DEFAULT '',
  work_mode cms_stage_work_mode NOT NULL DEFAULT 'hybrid'::cms_stage_work_mode,
  duration character varying NOT NULL DEFAULT '',
  contact_email character varying NOT NULL DEFAULT '',
  close_date date,
  featured boolean NOT NULL DEFAULT false,
  status cms_publish_status NOT NULL DEFAULT 'draft'::cms_publish_status,
  views integer NOT NULL DEFAULT 0,
  applications integer NOT NULL DEFAULT 0,
  contact_clicks integer NOT NULL DEFAULT 0,
  published_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  -- Additional fields from code
  supervisor text,
  start_date date,
  stage_type text,
  main_group text,
  languages text,
  about_club text,
  about_mission text,
  responsibilities text,
  club_life text,
  profile_searched text,
  category text,
  engagement text,
  CONSTRAINT stages_pkey PRIMARY KEY (id)
);

CREATE TABLE public.partners (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  website text NOT NULL,
  logo text NOT NULL DEFAULT '',
  category character varying NOT NULL DEFAULT 'Media',
  tier cms_partner_tier NOT NULL DEFAULT 'silver'::cms_partner_tier,
  description text NOT NULL DEFAULT '',
  featured boolean NOT NULL DEFAULT false,
  clicks integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT partners_pkey PRIMARY KEY (id)
);

CREATE TABLE public.media (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  filename character varying NOT NULL,
  url text NOT NULL,
  type character varying NOT NULL,
  uploaded_at timestamp with time zone NOT NULL DEFAULT now(),
  uploaded_by uuid,
  CONSTRAINT media_pkey PRIMARY KEY (id),
  CONSTRAINT media_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.admin_users(id) ON DELETE SET NULL
);

-- [4] SITE SETTINGS (Singletons)

CREATE TABLE public.site_settings (
  id boolean NOT NULL DEFAULT true CHECK (id = true),
  site_name character varying NOT NULL DEFAULT 'FC Toro CMS',
  public_tagline text NOT NULL DEFAULT '',
  primary_email character varying NOT NULL DEFAULT '',
  phone character varying NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  footer_text text NOT NULL DEFAULT '',
  partner_page_title character varying NOT NULL DEFAULT 'Partenaires',
  partner_page_intro text NOT NULL DEFAULT '',
  article_page_title character varying NOT NULL DEFAULT 'Articles et actualites',
  article_page_intro text NOT NULL DEFAULT '',
  stage_page_title character varying NOT NULL DEFAULT 'Stages',
  stage_page_intro text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_pkey PRIMARY KEY (id)
);

CREATE TABLE public.home_page_settings (
  id boolean NOT NULL DEFAULT true CHECK (id = true),
  hero_badge character varying NOT NULL DEFAULT 'FC Toro CMS',
  hero_title text NOT NULL DEFAULT '',
  hero_subtitle text NOT NULL DEFAULT '',
  hero_primary_cta_label character varying NOT NULL DEFAULT 'Voir les articles',
  hero_primary_cta_url text NOT NULL DEFAULT '#articles',
  hero_secondary_cta_label character varying NOT NULL DEFAULT 'Connexion CMS',
  hero_secondary_cta_url text NOT NULL DEFAULT '/signin',
  hero_background_image text NOT NULL DEFAULT '/images/grid-image/image-01.png',
  about_title character varying NOT NULL DEFAULT '',
  about_body text NOT NULL DEFAULT '',
  article_section_title character varying NOT NULL DEFAULT 'Articles',
  article_section_intro text NOT NULL DEFAULT '',
  stage_section_title character varying NOT NULL DEFAULT 'Stages',
  stage_section_intro text NOT NULL DEFAULT '',
  partner_section_title character varying NOT NULL DEFAULT 'Partenaires',
  partner_section_intro text NOT NULL DEFAULT '',
  featured_article_ids uuid[] NOT NULL DEFAULT '{}',
  featured_stage_ids uuid[] NOT NULL DEFAULT '{}',
  visits integer NOT NULL DEFAULT 0,
  cta_clicks integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT home_page_settings_pkey PRIMARY KEY (id)
);

CREATE TABLE public.home_hero_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  label character varying NOT NULL,
  value character varying NOT NULL,
  note text,
  sort_order integer NOT NULL DEFAULT 0,
  CONSTRAINT home_hero_metrics_pkey PRIMARY KEY (id)
);

CREATE TABLE public.dashboard_preferences (
  id boolean NOT NULL DEFAULT true CHECK (id = true),
  widgets jsonb NOT NULL DEFAULT '[]',
  player_columns jsonb NOT NULL DEFAULT '[]',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT dashboard_preferences_pkey PRIMARY KEY (id)
);

-- [5] CLUB TABLES

CREATE TABLE public.club_players (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  first_name character varying NOT NULL,
  last_name character varying NOT NULL,
  photo_url text NOT NULL DEFAULT '/images/user/user-01.jpg',
  position character varying NOT NULL,
  category character varying NOT NULL,
  status club_player_status NOT NULL DEFAULT 'actif'::club_player_status,
  phone character varying NOT NULL DEFAULT '',
  email character varying NOT NULL DEFAULT '',
  registration_date date NOT NULL DEFAULT CURRENT_DATE,
  birth_date date NOT NULL,
  address text NOT NULL DEFAULT '',
  -- Metrics derived from app logic if needed, but keeping columns for now as in code
  membership_amount numeric NOT NULL DEFAULT 0,
  membership_status text NOT NULL DEFAULT 'pending',
  last_payment_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT club_players_pkey PRIMARY KEY (id)
);

CREATE TABLE public.club_staff (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  role text NOT NULL, -- or use enum if strictly matched
  phone character varying NOT NULL DEFAULT '',
  email character varying NOT NULL DEFAULT '',
  start_date date NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT club_staff_pkey PRIMARY KEY (id)
);

CREATE TABLE public.club_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  event_date timestamp with time zone NOT NULL,
  location character varying NOT NULL,
  type club_event_type NOT NULL,
  calendar_color club_event_color,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT club_events_pkey PRIMARY KEY (id)
);

CREATE TABLE public.club_event_participants (
  event_id uuid NOT NULL,
  player_id uuid NOT NULL,
  CONSTRAINT club_event_participants_pkey PRIMARY KEY (event_id, player_id),
  CONSTRAINT club_event_participants_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.club_events(id) ON DELETE CASCADE,
  CONSTRAINT club_event_participants_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.club_players(id) ON DELETE CASCADE
);

-- [6] TOURNAMENT / FLAGDAY TABLES

CREATE TABLE public.flagday_competitions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  slug character varying NOT NULL UNIQUE,
  season character varying NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  logo_url text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT flagday_competitions_pkey PRIMARY KEY (id)
);

CREATE TABLE public.flagday_teams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  slug character varying NOT NULL UNIQUE,
  logo_url text NOT NULL DEFAULT '/images/logo/fc-toro.png',
  color character varying NOT NULL DEFAULT '#d11829',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT flagday_teams_pkey PRIMARY KEY (id)
);

CREATE TABLE public.flagday_competition_teams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL,
  team_id uuid NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT flagday_competition_teams_pkey PRIMARY KEY (id),
  CONSTRAINT flagday_competition_teams_competition_id_fkey FOREIGN KEY (competition_id) REFERENCES public.flagday_competitions(id) ON DELETE CASCADE,
  CONSTRAINT flagday_competition_teams_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.flagday_teams(id) ON DELETE CASCADE
);

CREATE TABLE public.flagday_matches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  competition_id uuid, -- Reference to competition table
  round character varying NOT NULL,
  kickoff timestamp with time zone NOT NULL,
  status character varying NOT NULL DEFAULT 'scheduled',
  home_team_id uuid NOT NULL,
  away_team_id uuid NOT NULL,
  home_score integer,
  away_score integer,
  venue text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT flagday_matches_pkey PRIMARY KEY (id),
  CONSTRAINT flagday_matches_competition_id_fkey FOREIGN KEY (competition_id) REFERENCES public.flagday_competitions(id) ON DELETE SET NULL,
  CONSTRAINT flagday_matches_home_team_id_fkey FOREIGN KEY (home_team_id) REFERENCES public.flagday_teams(id),
  CONSTRAINT flagday_matches_away_team_id_fkey FOREIGN KEY (away_team_id) REFERENCES public.flagday_teams(id)
);

-- [7] LOGS

CREATE TABLE public.connexion_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  email_used character varying NOT NULL,
  ip_address inet NOT NULL,
  user_agent text,
  occurred_at timestamp with time zone NOT NULL DEFAULT now(),
  success boolean NOT NULL DEFAULT false,
  CONSTRAINT connexion_logs_pkey PRIMARY KEY (id),
  CONSTRAINT connexion_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.admin_users(id) ON DELETE SET NULL
);

-- [8] FLAG DAY STATISTICS

CREATE TABLE public.flagday_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  competition_id uuid NOT NULL,
  name character varying NOT NULL, 
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  CONSTRAINT flagday_categories_pkey PRIMARY KEY (id),
  CONSTRAINT flagday_categories_competition_id_fkey FOREIGN KEY (competition_id) REFERENCES public.flagday_competitions(id) ON DELETE CASCADE
);

CREATE TABLE public.flagday_standings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL,
  team_id uuid NOT NULL,
  group_name character varying NOT NULL, 
  stage flagday_stage NOT NULL DEFAULT 'group',
  played integer NOT NULL DEFAULT 0,
  won integer NOT NULL DEFAULT 0,
  drawn integer NOT NULL DEFAULT 0,
  lost integer NOT NULL DEFAULT 0,
  goals_for integer NOT NULL DEFAULT 0,
  goals_against integer NOT NULL DEFAULT 0,
  points integer NOT NULL DEFAULT 0,
  rank_position integer, 
  is_qualified boolean NOT NULL DEFAULT false,
  CONSTRAINT flagday_standings_pkey PRIMARY KEY (id),
  CONSTRAINT flagday_standings_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.flagday_categories(id) ON DELETE CASCADE,
  CONSTRAINT flagday_standings_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.flagday_teams(id) ON DELETE CASCADE
);

CREATE TABLE public.flagday_top_scorers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL,
  player_name character varying NOT NULL,
  team_name character varying NOT NULL,
  goals integer NOT NULL DEFAULT 0,
  CONSTRAINT flagday_top_scorers_pkey PRIMARY KEY (id),
  CONSTRAINT flagday_top_scorers_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.flagday_categories(id) ON DELETE CASCADE
);
