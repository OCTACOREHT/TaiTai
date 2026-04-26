import { supabase } from "./supabase-client";

export type DashboardMetricKind = "currency" | "number";
export type OrderStatus = "En attente" | "Prêt" | "Livré";
export type OrderChannel = "Salle" | "Livraison" | "A emporter";
export type PaymentMethod = "Cash" | "Carte" | "MonCash";
export type StockStatus = "Normal" | "Faible" | "Critique";

export interface SalesPoint {
  label: string;
  total: number;
}

export interface DashboardMetric {
  id: "revenue" | "orders" | "customers" | "averageTicket";
  label: string;
  value: number;
  note: string;
  kind: DashboardMetricKind;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  maxStock: number;
  prepTime: string;
  featured: boolean;
  image?: string;
  disponible?: boolean;
}

export interface RestaurantOrder {
  id: string;
  numero: string;
  customer: string;
  table: string;
  total: number;
  status: OrderStatus;
  channel: OrderChannel;
  paymentMethod: PaymentMethod;
  placedAt: string;
  items: any[];
}

export interface StockItem {
  id: string;
  name: string;
  status: StockStatus;
  quantity: number;
  unit: string;
  reorderLevel: number;
  supplier: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  category: string;
}

export const orderStatusOptions: OrderStatus[] = ["En attente", "Prêt", "Livré"];
export const orderChannelOptions: OrderChannel[] = ["Salle", "Livraison", "A emporter"];
export const paymentMethodOptions: PaymentMethod[] = ["Cash", "Carte", "MonCash"];
export const stockStatusOptions: StockStatus[] = ["Normal", "Faible", "Critique"];

export const formatCurrency = (value: number) =>
  `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value)} HTG`;

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value);

export function formatMetricValue(value: number, kind: DashboardMetricKind) {
  return kind === "currency" ? formatCurrency(value) : formatNumber(value);
}

// Supabase fetching functions
export async function getMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await supabase.from("menu_items").select("*");
  if (error) throw error;
  
  return (data || []).map(item => ({
    id: item.id,
    name: item.nom,
    category: item.categorie,
    description: item.description,
    price: item.prix,
    stock: 10,
    maxStock: 20,
    prepTime: `${item.temps_prep} min`,
    featured: item.best_seller,
    image: item.image_url,
    disponible: item.disponible
  }));
}

export async function getCommandes(): Promise<RestaurantOrder[]> {
  const { data, error } = await supabase
    .from("commandes")
    .select("*, commande_items(*)")
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map(cmd => ({
    id: cmd.id,
    numero: cmd.numero_commande,
    customer: cmd.client_nom,
    table: cmd.table_numero || cmd.adresse_livraison || cmd.canal,
    total: cmd.total,
    status: cmd.statut as OrderStatus,
    channel: cmd.canal as OrderChannel,
    paymentMethod: "Cash",
    placedAt: new Date(cmd.created_at).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' }),
    items: cmd.commande_items.map((item: any) => ({
      name: item.nom_plat,
      quantity: item.quantite,
      price: item.prix_unitaire
    }))
  }));
}

// Keep mock data for metrics and others to avoid breaks
export const dashboardMetrics: DashboardMetric[] = [
  { id: "revenue", label: "Revenu total", value: 0, note: "Réel Supabase", kind: "currency" },
  { id: "orders", label: "Commandes du jour", value: 0, note: "En direct", kind: "number" },
  { id: "customers", label: "Nouveaux clients", value: 0, note: "+0% vs hier", kind: "number" },
  { id: "averageTicket", label: "Panier moyen", value: 0, note: "Calculé", kind: "currency" },
];

export const salesTrend: SalesPoint[] = [
  { label: "Lun", total: 0 }, { label: "Mar", total: 0 }, { label: "Mer", total: 0 },
  { label: "Jeu", total: 0 }, { label: "Ven", total: 0 }, { label: "Sam", total: 0 }, { label: "Dim", total: 0 }
];

export const suppliers: Supplier[] = [
  { id: "sup-1", name: "Marché Local", contact: "+509 1234-5678", category: "Légumes" },
  { id: "sup-2", name: "Boucherie Centrale", contact: "+509 8765-4321", category: "Viande" }
];

export const stockItems: StockItem[] = [];
export const customers = [];
export const restaurantOrders: RestaurantOrder[] = [];
export const menuItems: MenuItem[] = [];
