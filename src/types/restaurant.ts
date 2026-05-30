export interface MenuItem {
  id: string;
  nom: string;
  description: string;
  prix: number;
  categorie: string;
  image_url: string | null;
  disponible: boolean;
  stock_quantity: number;
  temps_prep: number;
  best_seller: boolean;
  created_at: string;
  deleted_at?: string | null;
}

export interface Commande {
  id: string;
  numero_commande: string;
  client_nom: string;
  client_tel: string | null;
  canal: 'Salle' | 'Livraison' | 'A emporter';
  table_numero: string | null;
  adresse_livraison: string | null;
  notes: string | null;
  statut: 'En attente' | 'En préparation' | 'Prêt' | 'Livré';
  total: number;
  created_at: string;
}

export interface CommandeItem {
  id: string;
  commande_id: string;
  menu_item_id: string;
  nom_plat: string;
  prix_unitaire: number;
  quantite: number;
  sous_total: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
  original_prix?: number;
  promotion_title?: string;
}
