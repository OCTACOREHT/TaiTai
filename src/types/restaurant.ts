export interface MenuItem {
  id: string;
  nom: string;
  description: string;
  prix: number;
  categorie: string;
  image_url: string | null;
  disponible: boolean;
  temps_prep: number;
  best_seller: boolean;
  created_at: string;
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
  methode_paiement: 'Cash' | 'Carte' | 'MonCash' | 'Unibank' | 'Sogebank' | null;
  preuve_paiement_url: string | null;
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
}
