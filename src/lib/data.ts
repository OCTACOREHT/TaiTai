import { supabase } from "./supabase-client";

export type DashboardMetricKind = "currency" | "number";
export type OrderStatus = "En attente" | "En préparation" | "Prêt" | "Livré" | "Annulee";
export type OrderChannel = "Livraison";
export type StockStatus = "Normal" | "Faible" | "Critique";

export interface SalesPoint {
  label: string;
  total: number;
}

export interface HourlyVolume {
  hour: string;
  orders: number;
}

export interface DishSale {
  name: string;
  category: string;
  quantity: number;
  revenue: number;
  trend: "up" | "down" | "stable";
}

export type CustomerSegment = "Nouveau" | "RÃ©gulier" | "VIP" | "Inactif";

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  avatar: string;
  visits: number;
  lifetimeSpend: number;
  lastOrder: string;
  favoriteDish: string;
  segment: CustomerSegment;
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
  stockQuantity: number;
}

export interface RestaurantOrder {
  id: string;
  numero: string;
  customer: string;
  table: string;
  total: number;
  status: OrderStatus;
  channel: OrderChannel;
  placedAt: string;
  date: string;
  items: any[];
  paymentMethod?: string | null;
  paymentProofUrl?: string | null;
  paymentStatus?: string | null;
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
  specialty?: string;
  nextDelivery?: string;
  reliability?: number;
}

export const orderStatusOptions: OrderStatus[] = ["En attente", "En préparation", "Prêt", "Livré", "Annulee"];
export const orderChannelOptions: OrderChannel[] = ["Livraison"];
export const stockStatusOptions: StockStatus[] = ["Normal", "Faible", "Critique"];
export const customerSegmentOptions: CustomerSegment[] = ["Nouveau", "RÃ©gulier", "VIP", "Inactif"];

export const clientAvatarPool = [
  "/images/user/user-01.jpg",
  "/images/user/user-02.jpg",
  "/images/user/user-03.jpg",
  "/images/user/user-04.jpg",
  "/images/user/user-05.jpg",
];

export const formatCurrency = (value: number) =>
  `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value)} HTG`;

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value);

export function formatMetricValue(value: number, kind: DashboardMetricKind) {
  return kind === "currency" ? formatCurrency(value) : formatNumber(value);
}

// Supabase fetching functions
export async function getMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .is("deleted_at", null);
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
    disponible: item.disponible,
    stockQuantity: item.stock_quantity ?? 0,
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
    placedAt: new Date(cmd.created_at).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' }),
    date: cmd.created_at,
    items: cmd.commande_items.map((item: any) => ({
      name: item.nom_plat,
      quantity: item.quantite,
      price: item.prix_unitaire,
      category: "Divers" // This would ideally come from the join
    })),
    paymentMethod: cmd.payment_method ?? null,
    paymentProofUrl: cmd.payment_proof_url ?? null,
    paymentStatus: cmd.payment_status ?? null,
  }));
}

export function aggregateSalesTrend(orders: RestaurantOrder[]): SalesPoint[] {
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const trend: Record<string, number> = {};
  days.forEach(d => trend[d] = 0);

  orders.forEach(order => {
    const d = new Date(order.date);
    const dayName = days[(d.getDay() + 6) % 7]; // Map 0-6 (Sun-Sat) to 0-6 (Mon-Sun)
    trend[dayName] += order.total;
  });

  return days.map(label => ({ label, total: trend[label] }));
}

export function aggregateDishSales(orders: RestaurantOrder[]): DishSale[] {
  const sales: Record<string, { name: string, category: string, quantity: number, revenue: number }> = {};

  orders.forEach(order => {
    order.items.forEach(item => {
      if (!sales[item.name]) {
        sales[item.name] = { name: item.name, category: item.category || "Divers", quantity: 0, revenue: 0 };
      }
      sales[item.name].quantity += item.quantity;
      sales[item.name].revenue += item.price * item.quantity;
    });
  });

  return Object.values(sales)
    .sort((a, b) => b.revenue - a.revenue)
    .map(s => ({ ...s, trend: "stable" as const }));
}

export function aggregatePeakHours(orders: RestaurantOrder[]): HourlyVolume[] {
  const hours: Record<string, number> = {};
  for (let i = 8; i <= 23; i++) hours[`${i}h`] = 0;

  orders.forEach(order => {
    const h = new Date(order.date).getHours();
    const label = `${h}h`;
    if (hours[label] !== undefined) {
      hours[label]++;
    }
  });

  return Object.entries(hours).map(([hour, orders]) => ({ hour, orders }));
}

// Keep mock data for metrics and others to avoid breaks
export const dashboardMetrics: DashboardMetric[] = [
  { id: "revenue", label: "Revenu total", value: 0, note: "RÃ©el Supabase", kind: "currency" },
  { id: "orders", label: "Commandes du jour", value: 0, note: "En direct", kind: "number" },
  { id: "customers", label: "Nouveaux clients", value: 0, note: "+0% vs hier", kind: "number" },
  { id: "averageTicket", label: "Panier moyen", value: 0, note: "CalculÃ©", kind: "currency" },
];

export const salesTrend: SalesPoint[] = [
  { label: "Lun", total: 45000 },
  { label: "Mar", total: 52000 },
  { label: "Mer", total: 38000 },
  { label: "Jeu", total: 61000 },
  { label: "Ven", total: 89000 },
  { label: "Sam", total: 124000 },
  { label: "Dim", total: 95000 }
];

export const dishSales: DishSale[] = [
  { name: "Griot Complet", category: "Signature", quantity: 142, revenue: 120700, trend: "up" },
  { name: "Tassot Cabrit", category: "Grillades", quantity: 98, revenue: 107800, trend: "up" },
  { name: "Poulet aux Noix", category: "Signature", quantity: 76, revenue: 64600, trend: "stable" },
  { name: "Lambi en Sauce", category: "Fruits de Mer", quantity: 45, revenue: 58500, trend: "down" },
  { name: "Burger CrÃ©ole", category: "Burgers", quantity: 112, revenue: 50400, trend: "up" },
];

export const peakHours: HourlyVolume[] = [
  { hour: "11h", orders: 12 },
  { hour: "12h", orders: 45 },
  { hour: "13h", orders: 38 },
  { hour: "14h", orders: 15 },
  { hour: "18h", orders: 22 },
  { hour: "19h", orders: 54 },
  { hour: "20h", orders: 62 },
  { hour: "21h", orders: 28 },
];

export const suppliers: Supplier[] = [
  { id: "sup-1", name: "MarchÃ© Local", contact: "+509 1234-5678", category: "LÃ©gumes", specialty: "Fruits & LÃ©gumes", nextDelivery: "Lundi 09:00", reliability: 98 },
  { id: "sup-2", name: "Boucherie Centrale", contact: "+509 8765-4321", category: "Viande", specialty: "Viande rouge", nextDelivery: "Mardi 10:30", reliability: 95 },
];

export const stockItems: StockItem[] = [];
export const customers: CustomerRecord[] = [
  { 
    id: "1", 
    name: "Jean Baptiste", 
    email: "jean.b@example.com",
    avatar: "/images/user/user-01.jpg",
    visits: 12, 
    lifetimeSpend: 45600,
    lastOrder: "Il y a 2 jours",
    favoriteDish: "Griot Complet",
    segment: "VIP"
  },
  { 
    id: "2", 
    name: "Marie Claire", 
    email: "m.claire@example.com",
    avatar: "/images/user/user-02.jpg",
    visits: 8, 
    lifetimeSpend: 32400,
    lastOrder: "Il y a 5 jours",
    favoriteDish: "Poulet aux Noix",
    segment: "RÃ©gulier"
  },
  { 
    id: "3", 
    name: "Pierre Richard", 
    email: "p.richard@example.com",
    avatar: "/images/user/user-03.jpg",
    visits: 15, 
    lifetimeSpend: 58200,
    lastOrder: "Hier",
    favoriteDish: "Tassot Cabrit",
    segment: "VIP"
  },
  { 
    id: "4", 
    name: "Naomi Petit", 
    email: "naomi.p@example.com",
    avatar: "/images/user/user-04.jpg",
    visits: 5, 
    lifetimeSpend: 18900,
    lastOrder: "Il y a 1 semaine",
    favoriteDish: "Burger CrÃ©ole",
    segment: "Nouveau"
  },
  { 
    id: "5", 
    name: "Luc Saint-Eloi", 
    email: "luc.se@example.com",
    avatar: "/images/user/user-05.jpg",
    visits: 10, 
    lifetimeSpend: 38500,
    lastOrder: "Il y a 3 jours",
    favoriteDish: "Griot Complet",
    segment: "RÃ©gulier"
  },
];
export const restaurantOrders: RestaurantOrder[] = [];
export const menuItems: MenuItem[] = [];


