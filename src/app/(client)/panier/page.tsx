"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  Trash2, Plus, Minus, ArrowRight, ShoppingCart,
  Info, MapPin, ChevronDown, MessageCircle, Tag
} from "lucide-react";

const WHATSAPP_NUMBER = "50948095613";

type OrderPromotion = {
  id: string;
  title: string;
  code: string | null;
  scope: "order";
  discount_type: "percent" | "fixed";
  discount_value: number;
  active: boolean;
};

const getDiscountAmount = (base: number, promotion: OrderPromotion | null) => {
  if (!promotion) return 0;
  const discount =
    promotion.discount_type === "percent"
      ? Math.round((base * promotion.discount_value) / 100)
      : promotion.discount_value;

  return Math.min(base, Math.max(0, discount));
};

// Zones de livraison avec frais (en HTG)
const ZONES_LIVRAISON = [
  { zone: "PV",               frais: 300,  label: "PV — 300 HTG" },
  { zone: "Puits B",          frais: 300,  label: "Puits B — 300 HTG" },
  { zone: "Routes Frères",    frais: 300,  label: "Routes Frères — 300 HTG" },
  { zone: "Delmas",           frais: 350,  label: "Delmas — 350 HTG" },
  { zone: "Limite Turgeau",   frais: 400,  label: "Limite Turgeau — 400 HTG" },
  { zone: "Centre Ville",     frais: 500,  label: "Centre Ville — 500 HTG" },
  { zone: "Rte Aéroport",     frais: 500,  label: "Rte Aéroport — 500 HTG" },
  { zone: "Cazeau",           frais: 500,  label: "Cazeau — 500 HTG" },
  { zone: "Gérald Bataille",  frais: 500,  label: "Gérald Bataille — 500 HTG" },
  { zone: "Tabarre",          frais: 875,  label: "Tabarre — 750-1000 HTG" },
  { zone: "Clercine",         frais: 875,  label: "Clercine — 750-1000 HTG" },
  { zone: "Thomassin",        frais: 875,  label: "Thomassin — 750-1000 HTG" },
];

const canalLabels: Record<"Salle" | "Livraison" | "A emporter", string> = {
  Livraison: "Livrezon",
  "A emporter": "Pou pote ale",
  Salle: "Sou plas",
};

export default function PanierPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<OrderPromotion | null>(null);
  const [promoMessage, setPromoMessage] = useState("");

  const [formData, setFormData] = useState({
    client_nom: "",
    client_tel: "",
    canal: "Livraison" as "Salle" | "Livraison" | "A emporter",
    zone_livraison: "",
    adresse_livraison: "",
    table_numero: "",
    notes: "",
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        client_nom: prev.client_nom || user.nom,
        client_tel: prev.client_tel || user.telephone,
      }));
    }
  }, [user]);

  const selectedZone = ZONES_LIVRAISON.find(z => z.zone === formData.zone_livraison);
  const fraisLivraison = formData.canal === "Livraison" && selectedZone ? selectedZone.frais : 0;
  const sousTotal = cart.reduce((acc, item) => acc + item.prix * item.quantity, 0);
  const discountTotal = getDiscountAmount(sousTotal, appliedPromo);
  const total = Math.max(0, sousTotal - discountTotal) + fraisLivraison;

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

  const buildWhatsAppMessage = (numeroCommande: string) => {
    const canalEmoji = formData.canal === "Livraison" ? "🛵" : formData.canal === "Salle" ? "🪑" : "🥡";
    const lignesArticles = cart
      .map(item => `  • ${item.nom} x${item.quantity} — ${item.prix * item.quantity} HTG`)
      .join("\n");

    let livraison = "";
    if (formData.canal === "Livraison") {
      livraison = `📍 *Zon:* ${formData.zone_livraison}${selectedZone ? ` (${selectedZone.frais} HTG)` : ""}\n📌 *Adrès:* ${formData.adresse_livraison}\n`;
    } else if (formData.canal === "Salle") {
      livraison = `🪑 *Tab:* ${formData.table_numero}\n`;
    }

    const message =
      `🍽️ *NOUVO KÒMANN TAITAI* 🍽️\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `📋 *Nimewo kòmann:* ${numeroCommande}\n` +
      `👤 *Kliyan:* ${formData.client_nom}\n` +
      `📞 *Telefòn:* ${formData.client_tel}\n` +
      `${canalEmoji} *Fason:* ${canalLabels[formData.canal]}\n` +
      livraison +
      `━━━━━━━━━━━━━━━━━━\n` +
      `🛒 *ATIK:*\n${lignesArticles}\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `💰 Sou-total: ${sousTotal} HTG\n` +
      (fraisLivraison > 0 ? `🚚 Livrezon: ${fraisLivraison} HTG\n` : "") +
      `💳 *TOTAL: ${total} HTG*\n` +
      (formData.notes ? `📝 *Nòt:* ${formData.notes}\n` : "") +
      `━━━━━━━━━━━━━━━━━━\n` +
      `_Voye depi aplikasyon TaiTai_`;

    return encodeURIComponent(message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (formData.canal === "Livraison" && !formData.zone_livraison) {
      alert("Tanpri chwazi zon livrezon ou.");
      return;
    }

    setLoading(true);
    const numero_commande = "TT-" + Date.now().toString().slice(-5);

    const menuItemIds = cart.map((item) => item.id);
    const { data: stockRows, error: stockError } = await supabase
      .from("menu_items")
      .select("id, nom, stock_quantity")
      .in("id", menuItemIds);

    if (stockError) {
      alert("Nou pa ka verifye stok la: " + stockError.message);
      setLoading(false);
      return;
    }

    const stockById = new Map((stockRows || []).map((item) => [item.id, item]));
    const unavailableItems = cart.filter((item) => {
      const stock = stockById.get(item.id)?.stock_quantity ?? 0;
      return stock < item.quantity;
    });

    if (unavailableItems.length > 0) {
      alert(
        "Stok la pa sifi pou: " +
          unavailableItems.map((item) => item.nom).join(", ") +
          ". Tanpri ajiste panyen ou.",
      );
      setLoading(false);
      return;
    }

    // 1. Sauvegarder dans Supabase
    const { data: commande, error: cmdError } = await supabase
      .from("commandes")
      .insert({
        numero_commande,
        client_nom: formData.client_nom,
        client_tel: formData.client_tel,
        client_user_id: user?.id ?? null,
        canal: formData.canal,
        adresse_livraison:
          formData.canal === "Livraison"
            ? `${formData.zone_livraison} — ${formData.adresse_livraison}`
            : null,
        table_numero: formData.canal === "Salle" ? formData.table_numero : null,
        notes: formData.notes,
        total,
        statut: "En attente",
      })
      .select()
      .single();

    if (cmdError) {
      alert("Erè pandan kòmann nan: " + cmdError.message);
      setLoading(false);
      return;
    }

    // 2. Sauvegarder les articles
    const itemsToInsert = cart.map(item => ({
      commande_id: commande.id,
      menu_item_id: item.id,
      nom_plat: item.nom,
      prix_unitaire: item.prix,
      quantite: item.quantity,
      sous_total: item.prix * item.quantity,
    }));

    const { error: itemsError } = await supabase.from("commande_items").insert(itemsToInsert);

    if (itemsError) {
      alert("Erè pandan anrejistreman plat yo: " + itemsError.message);
      setLoading(false);
      return;
    }

    await Promise.all(
      cart.map((item) => {
        const currentStock = stockById.get(item.id)?.stock_quantity ?? 0;
        return supabase
          .from("menu_items")
          .update({ stock_quantity: Math.max(0, currentStock - item.quantity) })
          .eq("id", item.id);
      }),
    );

    // 3. Historique local
    const orderHistory = JSON.parse(localStorage.getItem("taitai-orders-history") || "[]");
    orderHistory.unshift({
      id: commande.id,
      numero: commande.numero_commande,
      date: new Date().toISOString(),
      total,
    });
    localStorage.setItem("taitai-orders-history", JSON.stringify(orderHistory.slice(0, 5)));

    clearCart();

    // 4. Rediriger directement vers WhatsApp (ouvre l'app avec le texte pré-rempli)
    const waMsg = buildWhatsAppMessage(numero_commande);
    window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`;
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center space-y-8">
        <div className="h-28 w-28 rounded-3xl bg-gray-50 flex items-center justify-center text-[#98A2B3] border border-gray-100">
          <ShoppingCart size={56} />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-[#101828]">Panyen ou vid</h1>
          <p className="text-[#667085] text-lg font-medium">Chwazi youn nan espesyalite nou yo !</p>
        </div>
        <button
          onClick={() => router.push("/menu")}
          className="rounded-2xl bg-[#F4A640] px-10 py-5 font-bold text-white shadow-lg shadow-[#F4A640]/20 transition hover:scale-105 active:scale-95"
        >
          Gade meni an
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-16 lg:grid-cols-2">
      {/* ── Récapitulatif des articles ─────────────────── */}
      <div className="space-y-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-[#101828]">Rezime</h1>
          <p className="text-[#667085] font-medium">Verifye atik ou yo avan ou valide.</p>
        </div>

        <div className="space-y-5">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100">
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
              <div className="flex-grow space-y-2">
                <h3 className="text-lg font-bold text-[#101828]">{item.nom}</h3>
                <p className="text-sm font-black text-[#F4A640]">
                  {item.prix} HTG
                  {"original_prix" in item && item.original_prix ? (
                    <span className="ml-2 text-xs text-gray-400 line-through">{item.original_prix} HTG</span>
                  ) : null}
                </p>
                {"promotion_title" in item && item.promotion_title ? (
                  <p className="text-xs font-bold text-red-600">{item.promotion_title}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-1.5 border border-gray-100">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="p-1.5 rounded-lg bg-white shadow-sm text-[#101828] hover:text-[#F4A640] transition"
                >
                  <Minus size={16} strokeWidth={3} />
                </button>
                <span className="w-6 text-center font-black text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="p-1.5 rounded-lg bg-white shadow-sm text-[#101828] hover:text-[#F4A640] transition"
                >
                  <Plus size={16} strokeWidth={3} />
                </button>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="p-3 text-[#98A2B3] hover:text-red-500 transition hover:bg-red-50 rounded-xl"
              >
                <Trash2 size={22} />
              </button>
            </div>
          ))}
        </div>

        {/* Totaux */}
        <div className="rounded-3xl bg-[#101828] p-8 space-y-5 text-white shadow-xl">
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
                className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-white px-4 text-sm font-bold uppercase text-[#101828] outline-none focus:ring-4 focus:ring-[#F4A640]/20"
              />
              <button
                type="button"
                onClick={applyPromoCode}
                className="rounded-xl bg-[#F4A640] px-4 text-sm font-black text-white transition hover:bg-[#db8923]"
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
              <span>Rabè {appliedPromo?.code}</span>
              <span>-{discountTotal} HTG</span>
            </div>
          )}
          {formData.canal === "Livraison" && (
            <div className="flex justify-between text-gray-400 font-medium">
              <span className="flex items-center gap-2">
                <MapPin size={15} />
                Frè livrezon{selectedZone ? ` (${selectedZone.zone})` : ""}
              </span>
              <span className={selectedZone ? "text-[#F4A640]" : "text-gray-500"}>
                {selectedZone ? `${selectedZone.frais} HTG` : "Chwazi yon zon"}
              </span>
            </div>
          )}
          <div className="h-px bg-white/10" />
          <div className="flex justify-between text-2xl font-black">
            <span>Total pou peye</span>
            <span className="text-[#F4A640]">{total} HTG</span>
          </div>
          {selectedZone?.zone && ["Tabarre", "Clercine", "Thomassin"].includes(selectedZone.zone) && (
            <p className="text-xs text-gray-400 italic">
              * Frè egzak pou zon sa a ap konfime pa livrè a (750-1000 HTG).
            </p>
          )}
        </div>
      </div>

      {/* ── Formulaire de commande ─────────────────────── */}
      <div className="space-y-10">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-[#101828]">Validasyon</h2>
          <p className="text-[#667085] font-medium">Ki jan ou vle resevwa kòmann nan ?</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-100 bg-white p-10 space-y-8 shadow-xl">
          {/* Canal */}
          <div className="space-y-4">
            <label className="block text-sm font-black uppercase tracking-widest text-[#98A2B3]">
              Fason pou resevwa
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["Livraison", "A emporter", "Salle"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, canal: type, zone_livraison: "" })}
                  className={`rounded-2xl py-4 text-sm font-bold transition-all ${
                    formData.canal === type
                      ? "bg-[#101828] text-white shadow-lg"
                      : "bg-gray-50 text-[#667085] border border-transparent hover:border-gray-200"
                  }`}
                >
                  {canalLabels[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Zone de livraison */}
          {formData.canal === "Livraison" && (
            <div className="space-y-4 rounded-3xl bg-orange-50/50 p-6 border border-orange-100">
              <label className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#98A2B3]">
                <MapPin size={16} className="text-[#F4A640]" />
                Zon livrezon
              </label>
              <div className="relative">
                <select
                  required
                  value={formData.zone_livraison}
                  onChange={(e) => setFormData({ ...formData, zone_livraison: e.target.value })}
                  className="w-full appearance-none rounded-2xl border border-gray-200 bg-white px-5 py-4 pr-12 text-sm font-bold text-[#101828] focus:border-[#F4A640] focus:outline-none focus:ring-4 focus:ring-[#F4A640]/10 transition-all"
                >
                  <option value="">Chwazi zon ou...</option>
                  {ZONES_LIVRAISON.map((z) => (
                    <option key={z.zone} value={z.zone}>{z.label}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
              </div>
              {selectedZone && (
                <p className="text-sm font-bold text-[#F4A640]">
                  Frè livrezon : {selectedZone.frais} HTG
                </p>
              )}
            </div>
          )}

          {/* Infos client */}
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <label className="text-sm font-bold text-[#101828]">Non konplè</label>
                <input
                  required
                  type="text"
                  placeholder="Egzanp: Jean Dupont"
                  value={formData.client_nom}
                  onChange={(e) => setFormData({ ...formData, client_nom: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 focus:border-[#F4A640] focus:ring-4 focus:ring-[#F4A640]/10 focus:outline-none transition-all font-medium"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-[#101828]">Telefòn</label>
                <input
                  required
                  type="tel"
                  placeholder="+509 ..."
                  value={formData.client_tel}
                  onChange={(e) => setFormData({ ...formData, client_tel: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 focus:border-[#F4A640] focus:ring-4 focus:ring-[#F4A640]/10 focus:outline-none transition-all font-medium"
                />
              </div>
            </div>

            {formData.canal === "Livraison" && (
              <div className="space-y-3">
                <label className="text-sm font-bold text-[#101828]">Adrès presi</label>
                <textarea
                  required
                  placeholder="Ri, katye, referans presi..."
                  value={formData.adresse_livraison}
                  onChange={(e) => setFormData({ ...formData, adresse_livraison: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 focus:border-[#F4A640] focus:ring-4 focus:ring-[#F4A640]/10 focus:outline-none transition-all font-medium min-h-[100px]"
                />
              </div>
            )}

            {formData.canal === "Salle" && (
              <div className="space-y-3">
                <label className="text-sm font-bold text-[#101828]">Nimewo tab</label>
                <input
                  required
                  type="text"
                  placeholder="Egzanp: Tab 12"
                  value={formData.table_numero}
                  onChange={(e) => setFormData({ ...formData, table_numero: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 focus:border-[#F4A640] focus:ring-4 focus:ring-[#F4A640]/10 focus:outline-none transition-all font-medium"
                />
              </div>
            )}

            <div className="space-y-3">
              <label className="text-sm font-bold text-[#101828]">Enstriksyon (opsyonèl)</label>
              <input
                type="text"
                placeholder="Egzanp: San zonyon, sòs apa..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 focus:border-[#F4A640] focus:ring-4 focus:ring-[#F4A640]/10 focus:outline-none transition-all font-medium"
              />
            </div>
          </div>

          {/* Bouton commander */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-[#F4A640] py-6 text-xl font-black text-white transition-all hover:bg-[#101828] hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-xl shadow-[#F4A640]/20 hover:shadow-none"
          >
            {loading ? (
              "Konfimasyon ap fèt..."
            ) : (
              <>
                <MessageCircle size={24} strokeWidth={2.5} />
                Kòmande sou WhatsApp ({total} HTG)
                <ArrowRight size={22} strokeWidth={3} />
              </>
            )}
          </button>

          <div className="flex items-center gap-3 justify-center text-[#98A2B3] text-xs font-bold uppercase tracking-tighter">
            <Info size={14} />
            <span>Kòmann ou ap konfime sou WhatsApp</span>
          </div>
        </form>
      </div>
    </div>
  );
}
