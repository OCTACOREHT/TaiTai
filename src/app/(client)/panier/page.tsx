"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { useCart } from "@/context/CartContext";
import { Trash2, Plus, Minus, ArrowRight, MapPin, ShoppingCart, Info, Camera, Upload } from "lucide-react";

export default function PanierPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeItem, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    client_nom: "",
    client_tel: "",
    canal: "Livraison" as "Salle" | "Livraison" | "A emporter",
    methode_paiement: "Cash" as "Cash" | "Carte" | "MonCash" | "Unibank" | "Sogebank",
    adresse_livraison: "",
    table_numero: "",
    notes: ""
  });
  const [proofFile, setProofFile] = useState<File | null>(null);

  const total = cart.reduce((acc, item) => acc + (item.prix * item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setLoading(true);
    
    const numero_commande = "TT-" + Date.now().toString().slice(-4);

    // 0. Upload Payment Proof if exists
    let proofUrl = null;
    if (proofFile && formData.methode_paiement !== 'Cash') {
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `proofs/${numero_commande}_${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment_proofs')
        .upload(fileName, proofFile);
      
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('payment_proofs')
          .getPublicUrl(fileName);
        proofUrl = publicUrl;
      }
    }
    
    // 1. Insert Commande
    const { data: commande, error: cmdError } = await supabase
      .from("commandes")
      .insert({
        numero_commande,
        client_nom: formData.client_nom,
        client_tel: formData.client_tel,
        canal: formData.canal,
        methode_paiement: formData.methode_paiement,
        preuve_paiement_url: proofUrl,
        adresse_livraison: formData.canal === 'Livraison' ? formData.adresse_livraison : null,
        table_numero: formData.canal === 'Salle' ? formData.table_numero : null,
        notes: formData.notes,
        total,
        statut: "En attente"
      })
      .select()
      .single();

    if (cmdError) {
      if (cmdError.message.includes("methode_paiement") || cmdError.message.includes("preuve_paiement_url")) {
        alert("ERREUR CRITIQUE : Les colonnes 'methode_paiement' et 'preuve_paiement_url' n'ont pas encore été ajoutées à votre table 'commandes' dans Supabase. Veuillez les ajouter pour activer les paiements.");
      } else {
        alert("Erreur lors de la commande: " + cmdError.message);
      }
      setLoading(false);
      return;
    }

    // 2. Insert Commande Items
    const itemsToInsert = cart.map(item => ({
      commande_id: commande.id,
      menu_item_id: item.id,
      nom_plat: item.nom,
      prix_unitaire: item.prix,
      quantite: item.quantity,
      sous_total: item.prix * item.quantity
    }));

    const { error: itemsError } = await supabase.from("commande_items").insert(itemsToInsert);

    if (itemsError) {
      alert("Erreur lors de l'ajout des plats: " + itemsError.message);
      setLoading(false);
      return;
    }

    // 3. Success
    const orderHistory = JSON.parse(localStorage.getItem("taitai-orders-history") || "[]");
    orderHistory.unshift({ 
      id: commande.id, 
      numero: commande.numero_commande, 
      date: new Date().toISOString(),
      total: total
    });
    localStorage.setItem("taitai-orders-history", JSON.stringify(orderHistory.slice(0, 5))); // Keep last 5

    clearCart();
    router.push(`/confirmation/${commande.id}`);
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center space-y-8">
        <div className="h-28 w-28 rounded-3xl bg-gray-50 flex items-center justify-center text-[#98A2B3] border border-gray-100">
          <ShoppingCart size={56} />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-[#101828]">Votre panier est vide</h1>
          <p className="text-[#667085] text-lg font-medium">Laissez-vous tenter par nos spécialités !</p>
        </div>
        <button 
          onClick={() => router.push("/menu")}
          className="rounded-2xl bg-[#F4A640] px-10 py-5 font-bold text-white shadow-lg shadow-[#F4A640]/20 transition hover:scale-105 active:scale-95"
        >
          Consulter le menu
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-16 lg:grid-cols-2">
      {/* List of Items */}
      <div className="space-y-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-[#101828]">Récapitulatif</h1>
          <p className="text-[#667085] font-medium">Vérifiez vos articles avant de valider.</p>
        </div>
        
        <div className="space-y-5">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100">
                <img 
                  src={item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"} 
                  alt={item.nom} 
                  className="h-full w-full object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400";
                  }}
                />
              </div>
              
              <div className="flex-grow space-y-2">
                <h3 className="text-lg font-bold text-[#101828]">{item.nom}</h3>
                <p className="text-sm font-black text-[#F4A640]">{item.prix} HTG</p>
              </div>
              
              <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-1.5 border border-gray-100">
                <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 rounded-lg bg-white shadow-sm text-[#101828] hover:text-[#F4A640] transition">
                  <Minus size={16} strokeWidth={3} />
                </button>
                <span className="w-6 text-center font-black text-sm">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 rounded-lg bg-white shadow-sm text-[#101828] hover:text-[#F4A640] transition">
                  <Plus size={16} strokeWidth={3} />
                </button>
              </div>
              
              <button onClick={() => removeItem(item.id)} className="p-3 text-[#98A2B3] hover:text-red-500 transition hover:bg-red-50 rounded-xl">
                <Trash2 size={22} />
              </button>
            </div>
          ))}
        </div>
        
        <div className="rounded-3xl bg-[#101828] p-8 space-y-6 text-white shadow-xl">
          <div className="flex justify-between text-gray-400 font-medium">
            <span>Sous-total</span>
            <span>{total} HTG</span>
          </div>
          <div className="flex justify-between text-gray-400 font-medium">
            <span>Frais de service</span>
            <span>Gratuit</span>
          </div>
          <div className="h-px bg-white/10"></div>
          <div className="flex justify-between text-2xl font-black">
            <span>Total à payer</span>
            <span className="text-[#F4A640]">{total} HTG</span>
          </div>
        </div>
      </div>

      {/* Checkout Form */}
      <div className="space-y-10">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold text-[#101828]">Validation</h2>
          <p className="text-[#667085] font-medium">Comment souhaitez-vous être servi ?</p>
        </div>
        
        <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-100 bg-white p-10 space-y-8 shadow-xl">
          <div className="space-y-4">
            <label className="block text-sm font-black uppercase tracking-widest text-[#98A2B3]">Canal de commande</label>
            <div className="grid grid-cols-3 gap-3">
              {(['Livraison', 'A emporter', 'Salle'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, canal: type })}
                  className={`rounded-2xl py-4 text-sm font-bold transition-all ${
                    formData.canal === type 
                    ? "bg-[#101828] text-white shadow-lg" 
                    : "bg-gray-50 text-[#667085] border border-transparent hover:border-gray-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-black uppercase tracking-widest text-[#98A2B3]">Mode de paiement</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(['Cash', 'Carte', 'MonCash', 'Unibank', 'Sogebank'] as const).map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setFormData({ ...formData, methode_paiement: method })}
                  className={`rounded-2xl py-4 text-sm font-bold transition-all ${
                    formData.methode_paiement === method 
                    ? "bg-[#101828] text-white shadow-lg" 
                    : "bg-gray-50 text-[#667085] border border-transparent hover:border-gray-200"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {(formData.methode_paiement !== 'Cash') && (
            <div className="space-y-4 rounded-3xl bg-amber-50/50 p-6 border border-amber-100">
               <label className="flex items-center gap-2 text-sm font-bold text-amber-900">
                 <Camera size={18} /> Preuve de paiement (Optionnel)
               </label>
               <p className="text-xs text-amber-600 mb-2">Veuillez télécharger une capture d'écran de votre transfert pour validation rapide.</p>
               <div className="relative">
                 <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-700 transition-all cursor-pointer"
                 />
               </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <label className="text-sm font-bold text-[#101828] flex items-center gap-2">
                   Nom complet
                </label>
                <input 
                  required
                  type="text"
                  placeholder="Ex: Jean Dupont"
                  value={formData.client_nom}
                  onChange={e => setFormData({ ...formData, client_nom: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 focus:border-[#F4A640] focus:ring-4 focus:ring-[#F4A640]/10 focus:outline-none transition-all font-medium"
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-[#101828] flex items-center gap-2">
                   Téléphone
                </label>
                <input 
                  required
                  type="tel"
                  placeholder="+509 ..."
                  value={formData.client_tel}
                  onChange={e => setFormData({ ...formData, client_tel: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 focus:border-[#F4A640] focus:ring-4 focus:ring-[#F4A640]/10 focus:outline-none transition-all font-medium"
                />
              </div>
            </div>

            {formData.canal === 'Livraison' && (
              <div className="space-y-3">
                <label className="text-sm font-bold text-[#101828] flex items-center gap-2">
                   Adresse de livraison
                </label>
                <textarea 
                  required
                  placeholder="Rue, quartier, repères précis..."
                  value={formData.adresse_livraison}
                  onChange={e => setFormData({ ...formData, adresse_livraison: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 focus:border-[#F4A640] focus:ring-4 focus:ring-[#F4A640]/10 focus:outline-none transition-all font-medium min-h-[120px]"
                />
              </div>
            )}

            {formData.canal === 'Salle' && (
              <div className="space-y-3">
                <label className="text-sm font-bold text-[#101828]">Numéro de table</label>
                <input 
                  required
                  type="text"
                  placeholder="Ex: Table 12"
                  value={formData.table_numero}
                  onChange={e => setFormData({ ...formData, table_numero: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 focus:border-[#F4A640] focus:ring-4 focus:ring-[#F4A640]/10 focus:outline-none transition-all font-medium"
                />
              </div>
            )}

            <div className="space-y-3">
              <label className="text-sm font-bold text-[#101828]">Instructions (Optionnel)</label>
              <input 
                type="text"
                placeholder="Ex: Sans oignons, sauce à part..."
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 focus:border-[#F4A640] focus:ring-4 focus:ring-[#F4A640]/10 focus:outline-none transition-all font-medium"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl bg-[#F4A640] py-6 text-xl font-black text-white transition-all hover:bg-[#101828] hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-xl shadow-[#F4A640]/20 hover:shadow-none"
          >
            {loading ? "Confirmation en cours..." : `Confirmer ma commande (${total} HTG)`}
            {!loading && <ArrowRight size={24} strokeWidth={3} />}
          </button>

          <div className="flex items-center gap-3 justify-center text-[#98A2B3] text-xs font-bold uppercase tracking-tighter">
            <Info size={14} />
            <span>Paiement sécurisé à la livraison</span>
          </div>
        </form>
      </div>
    </div>
  );
}
