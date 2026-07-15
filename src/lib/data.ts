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
  image_url?: string | null;
  disponible?: boolean;
  stockQuantity: number;
  jour?: string | null;
}

export interface RestaurantOrder {
  id: string;
  numero: string;
  customer: string;
  clientEmail?: string | null;
  clientUserId?: string | null;
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

export type PeriodType = "day" | "week" | "month" | "year" | "all";

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
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  
  return (data || []).map(item => ({
    id: item.id,
    name: item.nom,
    category: item.categorie,
    description: item.description || "",
    price: item.prix,
    stock: 10,
    maxStock: 20,
    prepTime: `${item.temps_prep} min`,
    featured: item.best_seller,
    image_url: item.image_url,
    disponible: item.disponible,
    stockQuantity: item.stock_quantity ?? 0,
    jour: item.jour ?? null,
  }));
}

export async function getCommandes(): Promise<RestaurantOrder[]> {
  const { data, error } = await supabase
    .from("commandes")
    .select("*, commande_items(*)")
    .order("created_at", { ascending: false });
  
  if (error) throw error;

  const orders = data || [];
  const missing = orders.filter((cmd: any) => !cmd.client_email && cmd.client_user_id);
  const clientEmails: Record<string, string> = {};

  if (missing.length > 0) {
    const userIds = [...new Set(missing.map((cmd: any) => cmd.client_user_id as string))];
    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .select("id, email")
      .in("id", userIds);

    if (!clientsError && clients) {
      clients.forEach((client: { id: string; email: string | null }) => {
        clientEmails[client.id] = String(client.email || "");
      });
    }
  }

  return orders.map((cmd: any) => ({
    id: cmd.id,
    numero: cmd.numero_commande,
    customer: cmd.client_nom,
    clientEmail:
      (cmd.client_email as string | null) ??
      (cmd.client_user_id ? clientEmails[cmd.client_user_id] ?? null : null),
    clientUserId: cmd.client_user_id ?? null,
    table: cmd.table_numero || cmd.adresse_livraison || cmd.canal,
    total: cmd.total,
    status: cmd.statut as OrderStatus,
    channel: cmd.canal as OrderChannel,
    placedAt: new Date(cmd.created_at).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' }),
    date: cmd.created_at,
    items: (cmd.commande_items ?? []).map((item: any) => ({
      name: item.nom_plat,
      quantity: Number(item.quantite) || 0,
      price: Number(item.prix_unitaire) || 0,
      category: "Divers",
    })),
    paymentMethod: cmd.payment_method ?? null,
    paymentProofUrl: cmd.payment_proof_url ?? null,
    paymentStatus: cmd.payment_status ?? null,
  }));
}

export function aggregateSalesTrend(orders: RestaurantOrder[]): SalesPoint[] {
  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  // Construire les 7 derniers jours (aujourd'hui inclus)
  const slots: { start: Date; end: Date; label: string; total: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const start = new Date();
    start.setDate(start.getDate() - i);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    slots.push({ start, end, label: dayNames[start.getDay()], total: 0 });
  }

  const windowStart = slots[0].start;

  orders.forEach(order => {
    const d = new Date(order.date);
    if (d < windowStart) return;
    const slot = slots.find(s => d >= s.start && d <= s.end);
    if (slot) slot.total += order.total;
  });

  return slots.map(s => ({ label: s.label, total: s.total }));
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
    .sort((a, b) => b.quantity - a.quantity)
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

// Période-based aggregation functions
export function aggregateSalesByPeriod(orders: RestaurantOrder[], period: PeriodType): { revenue: number; label: string; orders: number } {
  const now = new Date();
  let startDate = new Date();
  let label = "";

  switch (period) {
    case "day":
      startDate.setHours(0, 0, 0, 0);
      label = "Aujourd'hui";
      break;
    case "week":
      startDate.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
      startDate.setHours(0, 0, 0, 0);
      label = "Cette semaine";
      break;
    case "month":
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      label = "Ce mois";
      break;
    case "year":
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      label = "Cette année";
      break;
    case "all":
      startDate = new Date(0);
      label = "Tout le temps";
      break;
  }

  const filteredOrders = orders.filter(order => new Date(order.date) >= startDate);
  const revenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);

  return {
    revenue,
    label,
    orders: filteredOrders.length,
  };
}

export function aggregateSalesTrendByPeriod(orders: RestaurantOrder[], period: PeriodType): SalesPoint[] {
  if (period === "day") {
    // Par heure pour le jour
    const hours: Record<string, number> = {};
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    for (let i = 0; i < 24; i++) {
      hours[`${i}h`] = 0;
    }

    orders.forEach(order => {
      const orderDate = new Date(order.date);
      if (orderDate.toDateString() === now.toDateString()) {
        const hour = orderDate.getHours();
        hours[`${hour}h`] += order.total;
      }
    });

    return Object.entries(hours).map(([label, total]) => ({ label, total }));
  } else if (period === "week") {
    // Par jour pour la semaine
    const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const slots: { start: Date; end: Date; label: string; total: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - i);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      slots.push({ start, end, label: dayNames[start.getDay()], total: 0 });
    }

    const windowStart = slots[0].start;

    orders.forEach(order => {
      const d = new Date(order.date);
      if (d < windowStart) return;
      const slot = slots.find(s => d >= s.start && d <= s.end);
      if (slot) slot.total += order.total;
    });

    return slots.map(s => ({ label: s.label, total: s.total }));
  } else if (period === "month") {
    // Par semaine pour le mois
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const weeks: { start: Date; end: Date; label: string; total: number }[] = [];

    let weekStart = new Date(monthStart);
    let weekNumber = 1;

    while (weekStart <= monthEnd) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      if (weekEnd > monthEnd) weekEnd.setTime(monthEnd.getTime());

      weeks.push({
        start: new Date(weekStart),
        end: new Date(weekEnd),
        label: `Sem ${weekNumber}`,
        total: 0,
      });

      weekStart.setDate(weekStart.getDate() + 7);
      weekNumber++;
    }

    orders.forEach(order => {
      const d = new Date(order.date);
      const week = weeks.find(w => d >= w.start && d <= w.end);
      if (week) week.total += order.total;
    });

    return weeks.map(w => ({ label: w.label, total: w.total }));
  } else if (period === "year") {
    // Par mois pour l'année
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    const months: { start: Date; end: Date; label: string; total: number }[] = [];

    for (let i = 0; i < 12; i++) {
      const start = new Date(new Date().getFullYear(), i, 1);
      const end = new Date(new Date().getFullYear(), i + 1, 0);
      months.push({ start, end, label: monthNames[i], total: 0 });
    }

    orders.forEach(order => {
      const d = new Date(order.date);
      const month = months.find(m => d >= m.start && d <= m.end);
      if (month) month.total += order.total;
    });

    return months.map(m => ({ label: m.label, total: m.total }));
  } else {
    // "all" - par mois sur toute l'historique
    const monthMap: Record<string, { start: Date; label: string; total: number }> = {};

    orders.forEach(order => {
      const date = new Date(order.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      const key = `${year}-${month}`;

      if (!monthMap[key]) {
        const monthStart = new Date(year, month, 1);
        const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
        monthMap[key] = {
          start: monthStart,
          label: `${monthNames[month]} ${year}`,
          total: 0,
        };
      }

      monthMap[key].total += order.total;
    });

    return Object.values(monthMap)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .map(m => ({ label: m.label, total: m.total }));
  }
}

// Keep mock data for metrics and others to avoid breaks
export const dashboardMetrics: DashboardMetric[] = [
  { id: "revenue", label: "Revenu (7 jours)", value: 0, note: "Reel Supabase", kind: "currency" },
  { id: "orders", label: "Commandes du jour", value: 0, note: "En direct", kind: "number" },
  { id: "customers", label: "Ventes du jour", value: 0, note: "Aujourd'hui", kind: "currency" },
  { id: "averageTicket", label: "Panier moyen", value: 0, note: "7 derniers jours", kind: "currency" },
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


