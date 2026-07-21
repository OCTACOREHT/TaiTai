-- ============================================
-- SCRIPT DE NETTOYAGE COMPLET DE LA BASE
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- ATTENTION: Ce script supprime TOUTES les données
-- Seul le compte admin principal sera conservé

-- [1] Supprimer les commandes et leurs items
DELETE FROM public.commande_items;
DELETE FROM public.commandes;

-- [2] Supprimer les clients
DELETE FROM public.clients;

-- [3] Supprimer les avis clients
DELETE FROM public.avis_clients;

-- [3] Supprimer les promotions
DELETE FROM public.promotions;

-- [4] Supprimer les menu_items
DELETE FROM public.menu_items;

-- [5] Supprimer les supplements
DELETE FROM public.supplements;

-- [6] Supprimer les fournisseurs
DELETE FROM public.fournisseurs;

-- [7] Vérification
SELECT 
  'menu_items' as table_name, COUNT(*) as count FROM public.menu_items
UNION ALL
SELECT 
  'commandes' as table_name, COUNT(*) as count FROM public.commandes
UNION ALL
SELECT 
  'commande_items' as table_name, COUNT(*) as count FROM public.commande_items
UNION ALL
SELECT 
  'promotions' as table_name, COUNT(*) as count FROM public.promotions
UNION ALL
SELECT 
  'supplements' as table_name, COUNT(*) as count FROM public.supplements
UNION ALL
SELECT 
  'avis_clients' as table_name, COUNT(*) as count FROM public.avis_clients
UNION ALL
SELECT 
  'fournisseurs' as table_name, COUNT(*) as count FROM public.fournisseurs
UNION ALL
SELECT 
  'clients' as table_name, COUNT(*) as count FROM public.clients;

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Toutes les tables doivent afficher 0 (sauf admin_users)
-- Le compte admin (taitai@gmail.com) reste intact