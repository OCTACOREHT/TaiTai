-- Script pour supprimer tous les comptes clients
-- ATTENTION: Cette action est irréversible!

-- Supprimer toutes les commandes (pour respecter les contraintes de clé étrangère)
DELETE FROM public.commande_items;
DELETE FROM public.commandes;

-- Supprimer tous les clients
DELETE FROM public.clients;

-- Vérifier que les tables sont vides
SELECT COUNT(*) AS clients_restants FROM public.clients;
SELECT COUNT(*) AS commandes_restantes FROM public.commandes;