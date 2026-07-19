"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Info,
  Mail,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
  Tag,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { CustomAlert } from "@/components/ui/CustomAlert";

type PaymentMethod = "Sur place" | "MonCash" | "Zelle";

type OrderPromotion = {
  id: string;
  title: string;
  code: string | null;
  scope: "order";
  discount_type: "percent" | "fixed";
  discount_value: number;
  active: boolean;
};

const ZONES_LIVRAISON_DEFAULT = [
  { zone: "PV", frais: 300, label: "PV - 300 HTG" },
  { zone: "Puits B", frais: 300, label: "Puits B - 300 HTG" },
  { zone: "Routes Freres", frais: 300, label: "Routes Freres - 300 HTG" },
  { zone: "Delmas", frais: 350, label: "Delmas - 350 HTG" },
  { zone: "Limite Turgeau", frais: 400, label: "Limite Turgeau - 400 HTG" },
  { zone: "Centre Ville", frais: 500, label: "Centre Ville - 500 HTG" },
  { zone: "Rte Aeroport", frais: 500, label: "Rte Aeroport - 500 HTG" },
  { zone: "Cazeau", frais: 500, label: "Cazeau - 500 HTG" },
  { zone: "Gerald Bataille", frais: 500, label: "Gerald Bataille - 500 HTG" },
  { zone: "Tabarre", frais: 875, label: "Tabarre - 750-1000 HTG" },
  { zone: "Clercine", frais: 875, label: "Clercine - 750-1000 HTG" },
  { zone: "Thomassin", frais: 875, label: "Thomassin - 750-1000 HTG" },
];

const DEPARTMENTS = [
  "Ouest",
  "Artibonite",
  "Centre",
  "Grand'Anse",
  "Nippes",
  "Nord",
  "Nord-Est",
  "Nord-Ouest",
  "Sud",
  "Sud-Est",
];

const paymentLabels: Record<PaymentMethod, string> = {
  "Sur place": "Peman sou plas",
  MonCash: "MonCash",
  Zelle: "Zelle",
};
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DELIVERY_START_HOUR = 12;

const getDiscountAmount = (base: number, promotion: OrderPromotion | null) => {
  if (!promotion) return 0;
  const discount =
    promotion.discount_type === "percent"
      ? Math.round((base * promotion.discount_value) / 100)
      : promotion.discount_value;

  return Math.min(base, Math.max(0, discount));
};

export default function PanierPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<OrderPromotion | null>(null);
  const [promoMessage, setPromoMessage] = useState("");
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    message: string;
    type: "error" | "success" | "warning" | "info";
  }>({
    isOpen: false,
    message: "",
    type: "info",
  });

  const [formData, setFormData] = useState({
    client_nom: "",
    client_tel: "",
    client_email: "",
    departement: "Ouest",
    zone_livraison: "",
    adresse_livraison: "",
    notes: "",
    payment_method: "Sur place" as PaymentMethod,
  });
  const [zonesLivraison, setZonesLivraison] = useState<typeof ZONES_LIVRAISON_DEFAULT>([]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        client_nom: prev.client_nom || user.nom,
        client_tel: prev.client_tel || user.telephone,
        client_email: user.email || prev.client_email || "",
      }));
    }
  }, [user]);

  // Charger les zones de livraison depuis Supabase
  useEffect(() => {
    async function loadDeliveryZones() {
      try {
        const { data, error } = await supabase
          .from("delivery_zones")
          .select("*")
          .eq("active", true)
          .order("departement", { ascending: true })
          .order("frais", { ascending: true });

        if (!error && data && data.length > 0) {
          const zones = data.map((z) => ({
            zone: z.zone,
            frais: z.frais,
            label: z.label,
          }));
          setZonesLivraison(zones);
        } else {
          // Fallback sur les valeurs par défaut
          setZonesLivraison(ZONES_LIVRAISON_DEFAULT);
        }
      } catch (error) {
        console.error("Failed to load delivery zones:", error);
        setZonesLivraison(ZONES_LIVRAISON_DEFAULT);
      }
    }

    loadDeliveryZones();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setCurrentTime(new Date()), 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  const livraisonDisponible = formData.departement === "Ouest";
  const deliveryHasStarted = currentTime.getHours() >= DELIVERY_START_HOUR;
  const selectedZone = zonesLivraison.find((z) => z.zone === formData.zone_livraison);
  const fraisLivraison = livraisonDisponible && selectedZone ? selectedZone.frais : 0;
  const sousTotal = cart.reduce((acc, item) => acc + item.prix * item.quantity, 0);
  const discountTotal = getDiscountAmount(sousTotal, appliedPromo);
  const total = Math.max(0, sousTotal - discountTotal);
  const proofRequired = formData.payment_method === "MonCash" || formData.payment_method === "Zelle";

  const applyPromoCode = async () => {
    const code = promoCode.trim().toUpperCase();
    setPromoMessage("");

    if (!code) {
      setAppliedPromo(null);
      return;
    }

    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .eq("active", true)
      .eq("scope", "order")
      .ilike("code", code)
      .maybeSingle();

    if (error || !data) {
      setAppliedPromo(null);
      setPromoMessage("Kod promo a pa valab.");
      return;
    }

    setAppliedPromo(data as OrderPromotion);
    setPromoMessage("Kod promo a aplike.");
  };

  const uploadPaymentProof = async () => {
    if (!paymentProofFile) return null;

    const payload = new FormData();
    payload.append("proof", paymentProofFile);

    const response = await fetch("/api/uploads/payment-proof", {
      method: "POST",
      body: payload,
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Nou pa ka voye justificatif la.");
    }

    return result.url as string;
  };

  const sendConfirmationEmail = async (orderId: string, email: string) => {
    const response = await fetch("/api/orders/confirmation-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        clientTel: formData.client_tel,
        email,
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Nou pa ka voye email konfimasyon an.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!livraisonDisponible) {
      setAlertConfig({
        isOpen: true,
        message: "Livrezon pa disponib nan zon sa a.",
        type: "error",
      });
      return;
    }

    if (!formData.zone_livraison) {
      setAlertConfig({
        isOpen: true,
        message: "Tanpri chwazi zon livrezon ou.",
        type: "error",
      });
      return;
    }

    if (proofRequired && !paymentProofFile) {
      setAlertConfig({
        isOpen: true,
        message: "Tanpri ajoute jistifikatif peman an pou MonCash/Zelle.",
        type: "error",
      });
      return;
    }

    const clientEmail = user?.email?.trim() || formData.client_email.trim();

    if (!clientEmail) {
      setAlertConfig({
        isOpen: true,
        message: "Tanpri konekte oswa antre imel ou itilize pou enskripsyon an.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    const numero_commande = "TT-" + Date.now().toString().slice(-5);

    try {
      const invalidCartItems = cart.filter((item) => !uuidPattern.test(item.id));
      if (invalidCartItems.length > 0) {
        invalidCartItems.forEach((item) => removeItem(item.id));
        throw new Error("Gen ansyen atik nan panyen an. Nou retire yo, tanpri ajoute plat yo ankò.");
      }

      const menuItemIds = cart.map((item) => item.id);
      const { data: stockRows, error: stockError } = await supabase
        .from("menu_items")
        .select("id, nom, stock_quantity")
        .in("id", menuItemIds);

      if (stockError) throw new Error("Nou pa ka verifye stok la: " + stockError.message);

      const stockById = new Map((stockRows || []).map((item) => [item.id, item]));
      const unavailableItems = cart.filter((item) => {
        const stock = stockById.get(item.id)?.stock_quantity ?? 0;
        return stock < item.quantity;
      });

      if (unavailableItems.length > 0) {
        const outOfStockItems = unavailableItems.filter((item) => {
          const stock = stockById.get(item.id)?.stock_quantity ?? 0;
          return stock === 0;
        });
        
        if (outOfStockItems.length > 0) {
          throw new Error(
            "Sa pa disponib ankò: " +
              outOfStockItems.map((item) => item.nom).join(", ") +
              ". Tanpri retire yo nan panyen ou."
          );
        }
        
        throw new Error(
          "Stok la pa sifi pou: " +
            unavailableItems.map((item) => item.nom).join(", ") +
            ". Tanpri ajiste panyen ou."
        );
      }

      const paymentProofUrl = proofRequired ? await uploadPaymentProof() : null;
      const adresseComplete = [
        formData.departement,
        formData.zone_livraison,
        formData.adresse_livraison,
      ]
        .filter(Boolean)
        .join(" - ");

      const { data: commande, error: cmdError } = await supabase
        .from("commandes")
        .insert({
          numero_commande,
          client_nom: formData.client_nom,
          client_tel: formData.client_tel,
          client_user_id: user?.id ?? null,
          canal: "Livraison",
          adresse_livraison: adresseComplete,
          table_numero: null,
          notes: formData.notes,
          total,
          statut: "En attente",
          payment_method: formData.payment_method,
          payment_proof_url: paymentProofUrl,
          payment_status: proofRequired ? "A verifier" : "Valide",
        })
        .select()
        .single();

      if (cmdError) throw new Error("Ere pandan komann nan: " + cmdError.message);

      const itemsToInsert = cart.map((item) => ({
        commande_id: commande.id,
        menu_item_id: item.id,
        nom_plat: item.nom,
        prix_unitaire: item.prix,
        quantite: item.quantity,
        sous_total: item.prix * item.quantity,
        supplements: item.supplements || [],
      }));

      const { error: itemsError } = await supabase.from("commande_items").insert(itemsToInsert);
      if (itemsError) throw new Error("Ere pandan anrejistreman plat yo: " + itemsError.message);

      await Promise.all(
        cart.map((item) => {
          const currentStock = stockById.get(item.id)?.stock_quantity ?? 0;
          return supabase
            .from("menu_items")
            .update({ stock_quantity: Math.max(0, currentStock - item.quantity) })
            .eq("id", item.id);
        }),
      );

      // La commande est déjà persistée en base. Le panel admin reçoit la nouvelle commande via Supabase Realtime.
      try {
        console.log("✅ Commande enregistrée, attente de l'event Realtime admin pour l'affichage du popup:", commande.id);
      } catch (notifError) {
        console.error("[notification error]", notifError);
      }

      try {
        await sendConfirmationEmail(commande.id, clientEmail);
      } catch (emailError) {
        console.error("[order confirmation email]", emailError);
        setAlertConfig({
          isOpen: true,
          message: `Komann nan pase, men email konfimasyon an pa rive voye: ${(emailError as Error).message}`,
          type: "warning",
        });
      }

      const orderHistory = JSON.parse(localStorage.getItem("taitai-orders-history") || "[]");
      orderHistory.unshift({
        id: commande.id,
        numero: commande.numero_commande,
        date: new Date().toISOString(),
        total,
      });
      localStorage.setItem("taitai-orders-history", JSON.stringify(orderHistory.slice(0, 5)));

      clearCart();
      router.push(`/confirmation/${commande.id}`);
    } catch (err) {
      setAlertConfig({
        isOpen: true,
        message: (err as Error).message,
        type: "error",
      });
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="mx-auto w-full max-w-5xl px-3 py-10 text-center sm:px-5 sm:py-16">
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-gray-100 bg-gray-50 text-[#98A2B3] sm:h-28 sm:w-28">
            <ShoppingCart size={48} className="sm:h-14 sm:w-14" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-[#101828] sm:text-4xl">Panyen ou vid</h1>
            <p className="text-base text-[#667085] font-medium sm:text-lg">Chwazi youn nan espesyalite nou yo !</p>
          </div>
          <button
            onClick={() => router.push("/menu")}
            className="rounded-2xl bg-brand-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition hover:scale-105 active:scale-95 sm:px-10 sm:py-5 sm:text-base"
          >
            Gade meni an
          </button>
        </div>
      </div>
    );
  }

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 lg:px-6">
      <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:gap-16">
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#101828] sm:text-4xl">Rezime</h1>
          <p className="text-[#667085] font-medium">Verifye atik ou yo avan ou valide.</p>
        </div>

        <div className="space-y-5">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:gap-6 sm:p-5"
            >
             <div className="h-56 w-full overflow-hidden rounded-2xl">
                <img
                  src={item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"}
                  alt={item.nom}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400";
                  }}
                />
              </div>
              <div className="w-full min-w-0 flex-grow space-y-2">
                <h3 className="break-words text-lg font-bold text-[#101828]">{item.nom}</h3>
                <p className="text-sm font-black text-brand-500">
                  {item.prix} HTG
                  {"original_prix" in item && item.original_prix ? (
                    <span className="ml-2 text-xs text-gray-400 line-through">{item.original_prix} HTG</span>
                  ) : null}
                </p>
                {"promotion_title" in item && item.promotion_title ? (
                  <p className="text-xs font-bold text-red-600">{item.promotion_title}</p>
                ) : null}
                {"supplements" in item && item.supplements && item.supplements.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-[#98A2B3]">Akòz</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.supplements.map((sup: any) => (
                        <span key={sup.id} className="inline-flex items-center gap-1 rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-bold text-[#101828] border border-orange-100">
                          {sup.nom}
                          <span className="text-[#F4A640]">
                            {Number(sup.prix) === 0 ? "(Gratuit)" : `+${sup.prix} HTG`}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex w-full items-center justify-center gap-4 rounded-xl border border-gray-100 bg-gray-50 p-1.5 sm:w-auto">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="p-1.5 rounded-lg bg-white shadow-sm text-[#101828] hover:text-brand-500 transition"
                >
                  <Minus size={16} strokeWidth={3} />
                </button>
                <span className="w-6 text-center font-black text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="p-1.5 rounded-lg bg-white shadow-sm text-[#101828] hover:text-brand-500 transition"
                >
                  <Plus size={16} strokeWidth={3} />
                </button>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="self-end rounded-xl p-3 text-[#98A2B3] transition hover:bg-red-50 hover:text-red-500 sm:self-auto"
              >
                <Trash2 size={22} />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-5 rounded-3xl bg-[#101828] p-4 text-white shadow-xl sm:p-6 lg:p-8">
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400">
              <Tag size={14} />
              Kod promo
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(event) => setPromoCode(event.target.value.toUpperCase())}
                placeholder="TAITAI10"
                className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-white px-4 text-sm font-bold uppercase text-[#101828] outline-none focus:ring-4 focus:ring-brand-500/20"
              />
              <button
                type="button"
                onClick={applyPromoCode}
                className="h-11 shrink-0 rounded-xl bg-brand-500 px-5 text-sm font-black text-white transition hover:bg-brand-600"
              >
                Aplike
              </button>
            </div>
            {promoMessage ? (
              <p className={`text-xs font-bold ${appliedPromo ? "text-green-300" : "text-red-300"}`}>
                {promoMessage}
              </p>
            ) : null}
          </div>
          <div className="flex justify-between text-gray-400 font-medium">
            <span>Sou-total</span>
            <span>{sousTotal} HTG</span>
          </div>
          {discountTotal > 0 && (
            <div className="flex justify-between font-medium text-green-300">
              <span>Rabe {appliedPromo?.code}</span>
              <span>-{discountTotal} HTG</span>
            </div>
          )}
          <div className="flex justify-between text-gray-400 font-medium">
            <span className="flex items-center gap-2">
              <MapPin size={15} />
              Fre livrezon{selectedZone ? ` (${selectedZone.zone})` : ""}
            </span>
            <span className={selectedZone ? "text-brand-500" : "text-gray-500"}>
              {selectedZone ? `${selectedZone.frais} HTG` : "Chwazi yon zon"}
            </span>
          </div>
          <div className="h-px bg-white/10" />
          <div className="flex flex-col gap-1 text-2xl font-black sm:flex-row sm:justify-between">
            <span>Total pou peye</span>
            <span className="text-brand-500">{total} HTG</span>
          </div>
          {selectedZone?.zone && ["Tabarre", "Clercine", "Thomassin"].includes(selectedZone.zone) && (
            <p className="text-xs text-gray-400 italic">
              * Fre egzak pou zon sa a ap konfime pa livre a (750-1000 HTG).
            </p>
          )}
        </div>
      </div>

      <div className="space-y-10">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-[#101828] sm:text-4xl">Validasyon</h2>
          <p className="text-[#667085] font-medium">Livrezon disponib selman nan depatman Ouest.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-gray-100 bg-white p-4 shadow-xl sm:space-y-8 sm:p-6 lg:p-10">
          {!deliveryHasStarted && (
            <div className="rounded-3xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm font-black leading-6 text-amber-700">
              Livrezon yo kòmanse apati 12h midi. Ou ka prepare kòmann ou kounye a,
              men livrezon an ap disponib sèlman apre midi.
            </div>
          )}

          <div className="space-y-4 rounded-3xl border border-orange-100 bg-orange-50/50 p-4 sm:p-6">
            <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#98A2B3]">
              <MapPin size={16} className="text-brand-500" />
              Adres livrezon
            </label>

            <div className="grid gap-4">
              <div className="relative">
                <select
                  required
                  value={formData.departement}
                  onChange={(e) =>
                    setFormData({ ...formData, departement: e.target.value, zone_livraison: "" })
                  }
                  className="w-full appearance-none rounded-2xl border border-gray-200 bg-white px-5 py-4 pr-12 text-sm font-bold text-[#101828] focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                >
                  {DEPARTMENTS.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
              </div>
            </div>

            {!livraisonDisponible ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-black text-red-600">
                Livrezon indisponib nan zon sa a. TaïTaï livre pou kounye a selman nan Ouest.
              </div>
            ) : (
              <div className="relative">
                <select
                  required
                  value={formData.zone_livraison}
                  onChange={(e) => setFormData({ ...formData, zone_livraison: e.target.value })}
                  className="w-full appearance-none rounded-2xl border border-gray-200 bg-white px-5 py-4 pr-12 text-sm font-bold text-[#101828] focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                >
                  <option value="">Chwazi zon ou...</option>
                  {zonesLivraison.map((z) => (
                    <option key={z.zone} value={z.zone}>
                      {z.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
              </div>
            )}

            {selectedZone && (
              <p className="text-sm font-bold text-brand-500">Fre livrezon : {selectedZone.frais} HTG</p>
            )}
          </div>

          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <label className="text-sm font-bold text-[#101828]">Non konple</label>
                <input
                  required
                  type="text"
                  placeholder="Egzanp: Jean Dupont"
                  value={formData.client_nom}
                  onChange={(e) => setFormData({ ...formData, client_nom: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all font-medium"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-[#101828]">Telefon</label>
                <input
                  required
                  type="tel"
                  placeholder="+509 ..."
                  value={formData.client_tel}
                  onChange={(e) => setFormData({ ...formData, client_tel: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all font-medium"
                />
              </div>
            </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-[#101828]">
                  <Mail size={16} className="text-brand-500" />
                Email pou konfimasyon
                </label>
              {user?.email ? (
                <div className="space-y-2">
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-5 py-4 font-medium text-gray-600 outline-none"
                  />
                  <p className="text-xs font-semibold text-[#667085]">
                    Nou ap itilize imel ki sou kont enskripsyon ou an.
                  </p>
                </div>
              ) : (
                <input
                  required
                  type="email"
                  placeholder="Egzanp: jean@email.com"
                  value={formData.client_email}
                  onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 font-medium transition-all focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                />
              )}
              </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-[#101828]">Adres presi</label>
              <textarea
                required
                placeholder="Ri, katye, referans presi..."
                value={formData.adresse_livraison}
                onChange={(e) => setFormData({ ...formData, adresse_livraison: e.target.value })}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all font-medium min-h-[100px]"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-[#101828]">Enstriksyon espesyal</label>
              <textarea
                placeholder="Egzanp: Pa gen zonyon, alergi ak arachid, manje sipleman kuit..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none transition-all font-medium min-h-[80px]"
              />
              <p className="text-xs text-[#667085]">Mande pou okenn alergi oswa preferans espesyal</p>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-gray-100 bg-gray-50 p-4 sm:p-6">
            <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#98A2B3]">
              <CreditCard size={16} className="text-brand-500" />
              Mwayen peman
            </label>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
              {(["Sur place", "MonCash", "Zelle"] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, payment_method: method });
                    if (method === "Sur place") setPaymentProofFile(null);
                  }}
                  className={`rounded-2xl border px-4 py-4 text-sm font-black transition ${
                    formData.payment_method === method
                      ? "border-[#101828] bg-[#101828] text-white shadow-lg"
                      : "border-gray-200 bg-white text-[#667085] hover:border-brand-500"
                  }`}
                >
                  {paymentLabels[method]}
                </button>
              ))}
            </div>

            {proofRequired ? (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-200 bg-white px-5 py-6 text-center transition hover:border-brand-500">
                {paymentProofFile ? (
                  <CheckCircle2 className="text-green-600" size={28} />
                ) : (
                  <UploadCloud className="text-brand-500" size={30} />
                )}
                <span className="text-sm font-black text-[#101828]">
                  {paymentProofFile ? paymentProofFile.name : "Ajoute jistifikatif peman an"}
                </span>
                <span className="text-xs font-bold text-[#667085]">Image oswa PDF, 8 MB maksimom.</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  className="hidden"
                  onChange={(e) => setPaymentProofFile(e.target.files?.[0] ?? null)}
                />
              </label>
            ) : (
              <p className="rounded-2xl bg-white px-5 py-4 text-sm font-bold text-[#667085]">
                Ou ap peye le livre a rive. Pa bezwen justificatif.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !livraisonDisponible}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 px-4 py-4 text-sm font-black text-white shadow-xl shadow-brand-500/20 transition-all hover:bg-[#101828] hover:shadow-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-3 sm:py-5 sm:text-base lg:py-6 lg:text-xl"
          >
            {loading ? (
              "Konfimasyon ap fet..."
            ) : (
              <>
                Konfime komann nan ({total} HTG)
                <ArrowRight size={22} strokeWidth={3} />
              </>
            )}
          </button>

          <div className="flex items-start justify-center gap-3 text-xs font-bold uppercase tracking-tighter text-[#98A2B3] sm:items-center">
            <Info size={14} />
            <span>Komann nan ap pase sou sit la. Admin nan ap verifye justificatif MonCash/Zelle.</span>
          </div>
        </form>
      </div>

      {/* Custom Alert */}
      <CustomAlert
        isOpen={alertConfig.isOpen}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={closeAlert}
      />
      </div>
    </div>
  );
}
