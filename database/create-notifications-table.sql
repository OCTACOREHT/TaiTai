-- Script pour créer la table des notifications

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('order', 'comment', 'stock_critical', 'stock_low')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_notifications_read_created ON public.notifications(read, created_at DESC);

-- Trigger pour créer une notification lors d'une nouvelle commande
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (type, title, message, link)
  VALUES (
    'order',
    'Nouvelle commande',
    'Commande #' || NEW.numero_commande || ' - ' || NEW.client_nom || ' - ' || NEW.total || ' HTG',
    '/commandes'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_new_order ON public.commandes;
CREATE TRIGGER trigger_notify_new_order
  AFTER INSERT ON public.commandes
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();

-- Trigger pour créer une notification quand un stock est critique (0)
CREATE OR REPLACE FUNCTION notify_stock_critical()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stock_quantity = 0 AND NEW.disponible = true THEN
    INSERT INTO public.notifications (type, title, message, link)
    VALUES (
      'stock_critical',
      'Stock critique',
      'Rupture de stock: ' || NEW.nom,
      '/stocks'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_stock_critical ON public.menu_items;
CREATE TRIGGER trigger_notify_stock_critical
  AFTER UPDATE OF stock_quantity ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION notify_stock_critical();

-- Trigger pour créer une notification quand un stock est faible (<= 5)
CREATE OR REPLACE FUNCTION notify_stock_low()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stock_quantity > 0 AND NEW.stock_quantity <= 5 AND NEW.disponible = true THEN
    INSERT INTO public.notifications (type, title, message, link)
    VALUES (
      'stock_low',
      'Stock faible',
      'Stock bas: ' || NEW.nom || ' (' || NEW.stock_quantity || ' restants)',
      '/stocks'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_stock_low ON public.menu_items;
CREATE TRIGGER trigger_notify_stock_low
  AFTER UPDATE OF stock_quantity ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION notify_stock_low();

-- Trigger pour créer une notification quand un nouveau commentaire est créé
CREATE OR REPLACE FUNCTION notify_new_comment()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (type, title, message, link)
  VALUES (
    'comment',
    'Nouveau commentaire',
    'Commentaire de ' || NEW.nom || ' sur un plat',
    '/moderation'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_new_comment ON public.avis_clients;
CREATE TRIGGER trigger_notify_new_comment
  AFTER INSERT ON public.avis_clients
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_comment();

-- Fonction pour nettoyer les anciennes notifications (optionnel, à exécuter périodiquement)
CREATE OR REPLACE FUNCTION clean_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE read = true
    AND created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
