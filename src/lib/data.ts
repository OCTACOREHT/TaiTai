export type DashboardMetricKind = "currency" | "number";
export type OrderStatus = "En attente" | "Pret" | "Livre";
export type OrderChannel = "Salle" | "Livraison" | "A emporter";
export type PaymentMethod = "Cash" | "Carte" | "MonCash";
export type CustomerSegment = "VIP" | "Top Client" | "Fidele";
export type StockStatus = "Critique" | "A recommander" | "Stable";
export type ScheduleCategory = "Service" | "Livraison" | "Reservation" | "Equipe";

export interface DashboardMetric {
  id: "revenue" | "orders" | "customers" | "averageTicket";
  label: string;
  value: number;
  note: string;
  kind: DashboardMetricKind;
}

export interface SalesPoint {
  label: string;
  total: number;
}

export interface DishSale {
  name: string;
  category: string;
  quantity: number;
  revenue: number;
  trend: "up" | "down" | "stable";
}

export interface HourlyVolume {
  hour: string;
  orders: number;
}

export interface OrderLineItem {
  name: string;
  quantity: number;
  price: number;
}

export interface RestaurantOrder {
  id: string;
  customer: string;
  table: string;
  total: number;
  status: OrderStatus;
  channel: OrderChannel;
  paymentMethod: PaymentMethod;
  placedAt: string;
  items: OrderLineItem[];
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
}

export interface Supplier {
  id: string;
  name: string;
  specialty: string;
  contact: string;
  nextDelivery: string;
  reliability: number;
}

export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  supplier: string;
  status: StockStatus;
}

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

export interface ScheduleEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  time: string;
  category: ScheduleCategory;
  note: string;
}

export const dashboardMetrics: DashboardMetric[] = [
  {
    id: "revenue",
    label: "Revenu total",
    value: 248500,
    note: "+12% vs semaine precedente",
    kind: "currency",
  },
  {
    id: "orders",
    label: "Commandes du jour",
    value: 128,
    note: "31 tickets encore ouverts",
    kind: "number",
  },
  {
    id: "customers",
    label: "Nouveaux clients",
    value: 34,
    note: "8 profils VIP detectes",
    kind: "number",
  },
  {
    id: "averageTicket",
    label: "Panier moyen",
    value: 1940,
    note: "+6% sur le service du midi",
    kind: "currency",
  },
];

export const salesTrend: SalesPoint[] = [
  { label: "Lun", total: 28500 },
  { label: "Mar", total: 31200 },
  { label: "Mer", total: 29800 },
  { label: "Jeu", total: 36100 },
  { label: "Ven", total: 41800 },
  { label: "Sam", total: 46200 },
  { label: "Dim", total: 34900 },
];

export const restaurantOrders: RestaurantOrder[] = [
  {
    id: "TT-1042",
    customer: "Micheline Pierre",
    table: "T12",
    total: 4150,
    status: "En attente",
    channel: "Salle",
    paymentMethod: "Carte",
    placedAt: "11:35",
    items: [
      { name: "Poulet grille TaiTai", quantity: 2, price: 1450 },
      { name: "Jus passion maison", quantity: 1, price: 550 },
      { name: "Frites patates douces", quantity: 1, price: 700 },
    ],
  },
  {
    id: "TT-1041",
    customer: "Jean Robert",
    table: "Liv-07",
    total: 2650,
    status: "Pret",
    channel: "Livraison",
    paymentMethod: "MonCash",
    placedAt: "11:28",
    items: [
      { name: "Bowl riz creole", quantity: 1, price: 1350 },
      { name: "Ailes glacees", quantity: 1, price: 900 },
      { name: "Coleslaw piment doux", quantity: 1, price: 400 },
    ],
  },
  {
    id: "TT-1039",
    customer: "Sarah Noel",
    table: "T08",
    total: 3180,
    status: "Livre",
    channel: "Salle",
    paymentMethod: "Cash",
    placedAt: "11:12",
    items: [
      { name: "Burger creole", quantity: 2, price: 1290 },
      { name: "Citronnade gingembre", quantity: 1, price: 600 },
    ],
  },
  {
    id: "TT-1038",
    customer: "Louissaint Family",
    table: "EMP-03",
    total: 5220,
    status: "En attente",
    channel: "A emporter",
    paymentMethod: "Carte",
    placedAt: "10:56",
    items: [
      { name: "Plateau mix grill", quantity: 1, price: 2850 },
      { name: "Plantains croustillants", quantity: 2, price: 720 },
      { name: "Iced tea hibiscus", quantity: 2, price: 450 },
    ],
  },
  {
    id: "TT-1036",
    customer: "Carla Etienne",
    table: "T03",
    total: 1890,
    status: "Pret",
    channel: "Salle",
    paymentMethod: "Cash",
    placedAt: "10:44",
    items: [
      { name: "Wrap poulet epice", quantity: 1, price: 1190 },
      { name: "Soda artisanal", quantity: 1, price: 700 },
    ],
  },
  {
    id: "TT-1035",
    customer: "Daniel St-Hubert",
    table: "Liv-02",
    total: 2890,
    status: "Livre",
    channel: "Livraison",
    paymentMethod: "MonCash",
    placedAt: "10:31",
    items: [
      { name: "Pates fruits de mer", quantity: 1, price: 1890 },
      { name: "Cheesecake coco", quantity: 1, price: 1000 },
    ],
  },
  {
    id: "TT-1034",
    customer: "Eva Charles",
    table: "T14",
    total: 2340,
    status: "En attente",
    channel: "Salle",
    paymentMethod: "Carte",
    placedAt: "10:18",
    items: [
      { name: "Salade quinoa tropicale", quantity: 1, price: 1040 },
      { name: "Smoothie mangue", quantity: 2, price: 650 },
    ],
  },
];

export const menuItems: MenuItem[] = [
  {
    id: "dish-01",
    name: "Poulet grille TaiTai",
    category: "Grillades",
    description: "Poulet marine 24h, epis maison, legumes rotis.",
    price: 1450,
    stock: 18,
    maxStock: 24,
    prepTime: "18 min",
    featured: true,
    image: "/poulet_grille_taitai_1776618755864.png",
  },
  {
    id: "dish-02",
    name: "Bowl riz creole",
    category: "Signature",
    description: "Riz djondjon, boeuf effiloche, sauce citron pike.",
    price: 1350,
    stock: 11,
    maxStock: 20,
    prepTime: "12 min",
    featured: false,
    image: "/bowl_riz_creole_1776618743221.png",
  },
  {
    id: "dish-03",
    name: "Burger creole",
    category: "Burgers",
    description: "Steak maison, pikliz doux, cheddar fume.",
    price: 1290,
    stock: 14,
    maxStock: 18,
    prepTime: "14 min",
    featured: true,
    image: "/burger_creole_1776618773631.png",
  },
  {
    id: "dish-04",
    name: "Pates fruits de mer",
    category: "Pates",
    description: "Sauce creme epicee, crevettes, calamars et citron vert.",
    price: 1890,
    stock: 7,
    maxStock: 14,
    prepTime: "16 min",
    featured: false,
  },
  {
    id: "dish-05",
    name: "Cheesecake coco",
    category: "Desserts",
    description: "Base sablee, creme coco, caramel sale.",
    price: 1000,
    stock: 9,
    maxStock: 12,
    prepTime: "8 min",
    featured: false,
    image: "/cheesecake_coco_1776618785559.png",
  },
  {
    id: "dish-06",
    name: "Jus passion maison",
    category: "Boissons",
    description: "Infusion passion, orange, citron vert.",
    price: 550,
    stock: 30,
    maxStock: 40,
    prepTime: "4 min",
    featured: true,
  },
];

export const suppliers: Supplier[] = [
  {
    id: "sup-01",
    name: "Prime Fresh Market",
    specialty: "Proteines & volailles",
    contact: "+509 3600-1147",
    nextDelivery: "Demain - 07:30",
    reliability: 96,
  },
  {
    id: "sup-02",
    name: "Racines Tropicales",
    specialty: "Fruits & legumes",
    contact: "+509 3124-8890",
    nextDelivery: "Aujourd'hui - 16:00",
    reliability: 93,
  },
  {
    id: "sup-03",
    name: "Blue Harbor Seafood",
    specialty: "Poissons & fruits de mer",
    contact: "+509 3407-2288",
    nextDelivery: "Mercredi - 09:15",
    reliability: 91,
  },
  {
    id: "sup-04",
    name: "Maison des Saveurs",
    specialty: "Epices & sauces",
    contact: "+509 3661-9002",
    nextDelivery: "Jeudi - 13:30",
    reliability: 98,
  },
];

export const stockItems: StockItem[] = [
  {
    id: "stock-01",
    name: "Filets de poulet",
    quantity: 14,
    unit: "kg",
    reorderLevel: 12,
    supplier: "Prime Fresh Market",
    status: "A recommander",
  },
  {
    id: "stock-02",
    name: "Riz djondjon",
    quantity: 8,
    unit: "sacs",
    reorderLevel: 10,
    supplier: "Maison des Saveurs",
    status: "Critique",
  },
  {
    id: "stock-03",
    name: "Mangues",
    quantity: 28,
    unit: "pieces",
    reorderLevel: 18,
    supplier: "Racines Tropicales",
    status: "Stable",
  },
  {
    id: "stock-04",
    name: "Cheddar fume",
    quantity: 5,
    unit: "blocs",
    reorderLevel: 6,
    supplier: "Prime Fresh Market",
    status: "Critique",
  },
  {
    id: "stock-05",
    name: "Crevettes decortiquees",
    quantity: 9,
    unit: "kg",
    reorderLevel: 7,
    supplier: "Blue Harbor Seafood",
    status: "Stable",
  },
];

export const customers: CustomerRecord[] = [
  {
    id: "cust-01",
    name: "Micheline Pierre",
    email: "micheline@client.ht",
    avatar: "/images/user/user-11.jpg",
    visits: 26,
    lifetimeSpend: 68450,
    lastOrder: "Aujourd'hui - 11:35",
    favoriteDish: "Poulet grille TaiTai",
    segment: "VIP",
  },
  {
    id: "cust-02",
    name: "Jean Robert",
    email: "jr.delivery@client.ht",
    avatar: "/images/user/user-14.jpg",
    visits: 18,
    lifetimeSpend: 42110,
    lastOrder: "Aujourd'hui - 11:28",
    favoriteDish: "Bowl riz creole",
    segment: "Top Client",
  },
  {
    id: "cust-03",
    name: "Sarah Noel",
    email: "sarah.noel@client.ht",
    avatar: "/images/user/user-07.jpg",
    visits: 13,
    lifetimeSpend: 27500,
    lastOrder: "Aujourd'hui - 11:12",
    favoriteDish: "Burger creole",
    segment: "Fidele",
  },
  {
    id: "cust-04",
    name: "Carla Etienne",
    email: "carla@client.ht",
    avatar: "/images/user/user-19.jpg",
    visits: 10,
    lifetimeSpend: 24390,
    lastOrder: "Aujourd'hui - 10:44",
    favoriteDish: "Wrap poulet epice",
    segment: "Fidele",
  },
  {
    id: "cust-05",
    name: "Daniel St-Hubert",
    email: "daniel@client.ht",
    avatar: "/images/user/user-20.jpg",
    visits: 21,
    lifetimeSpend: 50120,
    lastOrder: "Aujourd'hui - 10:31",
    favoriteDish: "Pates fruits de mer",
    segment: "VIP",
  },
];

export const scheduleEvents: ScheduleEvent[] = [
  {
    id: "date-01",
    title: "Service midi premium",
    date: "2026-04-20",
    time: "12:00",
    category: "Service",
    note: "Mise en avant grillades et desserts signature.",
  },
  {
    id: "date-02",
    title: "Livraison Prime Fresh",
    date: "2026-04-21",
    time: "07:30",
    category: "Livraison",
    note: "Controle stock poulet, cheddar et sauces.",
  },
  {
    id: "date-03",
    title: "Reservation groupe corporate",
    date: "2026-04-23",
    time: "19:30",
    category: "Reservation",
    note: "26 couverts, menu fixe et accueil dedie.",
  },
  {
    id: "date-04",
    title: "Brief equipe cuisine",
    date: "2026-04-24",
    time: "09:00",
    category: "Equipe",
    note: "Point process service week-end et commandes fournisseurs.",
  },
];

export const orderStatusOptions: OrderStatus[] = ["En attente", "Pret", "Livre"];
export const orderChannelOptions: OrderChannel[] = ["Salle", "Livraison", "A emporter"];
export const paymentMethodOptions: PaymentMethod[] = ["Cash", "Carte", "MonCash"];
export const customerSegmentOptions: CustomerSegment[] = ["VIP", "Top Client", "Fidele"];
export const stockStatusOptions: StockStatus[] = ["Critique", "A recommander", "Stable"];
export const scheduleCategoryOptions: ScheduleCategory[] = [
  "Service",
  "Livraison",
  "Reservation",
  "Equipe",
];
export const clientAvatarPool = [
  "/images/user/user-01.jpg",
  "/images/user/user-06.jpg",
  "/images/user/user-12.jpg",
  "/images/user/user-18.jpg",
  "/images/user/user-24.jpg",
];

export const dishSales: DishSale[] = [
  { name: "Poulet grille TaiTai", category: "Grillades", quantity: 342, revenue: 495900, trend: "up" },
  { name: "Burger creole", category: "Burgers", quantity: 215, revenue: 277350, trend: "up" },
  { name: "Bowl riz creole", category: "Signature", quantity: 184, revenue: 248400, trend: "stable" },
  { name: "Pates fruits de mer", category: "Pates", quantity: 92, revenue: 173880, trend: "down" },
  { name: "Cheesecake coco", category: "Desserts", quantity: 156, revenue: 156000, trend: "up" },
];

export const peakHours: HourlyVolume[] = [
  { hour: "10:00", orders: 12 },
  { hour: "11:00", orders: 28 },
  { hour: "12:00", orders: 64 },
  { hour: "13:00", orders: 82 },
  { hour: "14:00", orders: 45 },
  { hour: "15:00", orders: 23 },
  { hour: "16:00", orders: 18 },
  { hour: "17:00", orders: 35 },
  { hour: "18:00", orders: 72 },
  { hour: "19:00", orders: 95 },
  { hour: "20:00", orders: 110 },
  { hour: "21:00", orders: 65 },
  { hour: "22:00", orders: 30 },
];

export const formatCurrency = (value: number) =>
  `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value)} HTG`;

export const formatMetricValue = (value: number, kind: DashboardMetricKind) =>
  kind === "currency" ? formatCurrency(value) : new Intl.NumberFormat("fr-FR").format(value);
