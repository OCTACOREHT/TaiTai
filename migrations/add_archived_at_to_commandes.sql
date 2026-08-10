-- Migration: Add archived_at column to commandes table
-- Run this in Supabase Dashboard > SQL Editor

ALTER TABLE commandes ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL;

-- Optional: create an index for fast filtering of non-archived orders
CREATE INDEX IF NOT EXISTS idx_commandes_archived_at ON commandes (archived_at) WHERE archived_at IS NULL;
