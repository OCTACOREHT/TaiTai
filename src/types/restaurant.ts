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
  jour: string | null;
  created_at: string;
  deleted_at?: string | null;
}

export interface Commande {
  id: string;
  numero_commande: string;
  client_nom: string;
  client_tel: string | null;
  client_email: string | null;
  canal: "Livraison";
  table_numero: string | null;
  adresse_livraison: string | null;
  notes: string | null;
  statut: string;
  total: number;
  created_at: string;
  payment_method?: "Sur place" | "MonCash" | "Zelle" | null;
  payment_proof_url?: string | null;
  payment_status?: "A verifier" | "Valide" | "Refuse" | null;
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

export interface Supplement {
  id: string;
  nom: string;
  prix: number;
  disponible: boolean;
  categorie?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
  original_prix?: number;
  promotion_title?: string;
  supplements?: Supplement[];
  supplements_prix_total?: number;
}
