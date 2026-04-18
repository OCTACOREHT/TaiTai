"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { SectionCard } from "@/components/common/CmsShared";
import Badge from "@/components/ui/badge/Badge";
import Loader from "@/components/common/Loader";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { EyeIcon, TrashBinIcon, CheckCircleIcon } from "@/icons";
import { useCms } from "@/context/CmsContext";
import Image from "next/image";

// ─── Friendly field label mapping ───────────────────────────────────────────

const FIELD_LABELS: Record<string, string> = {
  // Contact
  nom: "Nom de famille",
  prenom: "Prénom",
  email: "Adresse email",
  message: "Message",

  // Fan
  first_name: "Prénom",
  last_name: "Nom de famille",
  phone: "Numéro de téléphone",
  department: "Département / Région",
  address: "Adresse",
  consent_contact: "Accepte d'être contacté",

  // Joueur — identité enfant
  program: "Programme choisi",
  child_first_name: "Prénom de l'enfant",
  child_last_name: "Nom de famille de l'enfant",
  child_birth_date: "Date de naissance",
  child_gender: "Genre",
  child_address: "Adresse de l'enfant",
  child_school: "École fréquentée",
  child_soccer_experience: "Expérience en football",

  // Joueur — tuteur
  guardian_name: "Nom du tuteur/parent",
  guardian_email: "Email du tuteur",
  guardian_phone: "Téléphone du tuteur",
  guardian_address: "Adresse du tuteur",

  // Joueur — urgence
  emergency_name: "Personne de contact d'urgence",
  emergency_relation: "Relation avec l'enfant",
  emergency_phone: "Téléphone d'urgence",
  emergency_email: "Email d'urgence",
  emergency_address: "Adresse d'urgence",

  // Joueur — uniforme & paiement
  uniform_top_size: "Taille du maillot (haut)",
  uniform_short_size: "Taille du short",
  preferred_numbers: "Numéros préférés",
  payment_plan: "Plan de paiement",
  payment_method: "Méthode de paiement",
  parent_signature: "Signature du parent",

  // Consentements
  consents: "Consentements",
  consent_media: "Autorisation médias",
  consent_health: "Autorisation soins médicaux",
  consent_emergency: "Autorisation d'urgence",
  consent_accuracy: "Exactitude des informations",
};

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  contact: { label: "Message", color: "info" },
  fan: { label: "Devenir Fan", color: "success" },
  joueur: { label: "Inscription Joueur", color: "warning" },
};

function friendlyLabel(key: string) {
  return FIELD_LABELS[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function friendlyValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Oui ✓" : "Non ✗";
  if (key === "child_birth_date" && typeof value === "string") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toLocaleDateString("fr-FR");
  }
  if (key === "program") {
    return value === "tiToro" ? "Ti Toro (2–5 ans)" : value === "fcToro" ? "FC Toro (6–18 ans)" : String(value);
  }
  if (typeof value === "object") {
    if (Array.isArray(value)) return value.join(", ");
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `${friendlyLabel(k)}: ${friendlyValue(k, v)}`)
      .join(" | ");
  }
  return String(value);
}

// ─── Types ───────────────────────────────────────────────────────────────────

type Demande = {
  id: string;
  type: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  payload: Record<string, unknown> | null;
  is_read: boolean;
  status: string | null;
  created_at: string;
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function DemandesPage() {
  const { refreshUnreadDemandesCount } = useCms();
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"contact" | "joueur" | "fan">("contact");
  const [selectedDemande, setSelectedDemande] = useState<Demande | null>(null);

  // Reply state
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [replyStatus, setReplyStatus] = useState<"idle" | "success" | "error">("idle");

  // Compose state
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeSending, setComposeSending] = useState(false);
  const [composeStatus, setComposeStatus] = useState<"idle" | "success" | "error">("idle");

  // Portal state
  const [mounted, setMounted] = useState(false);

  // Chat UI state
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchDemandes();
  }, []);

  // reset reply form when switching demande
  useEffect(() => {
    setReplySubject("");
    setReplyBody("");
    setReplyStatus("idle");
  }, [selectedDemande?.id]);

  const fetchDemandes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/demandes");
      if (res.ok) {
        const json = await res.json();
        setDemandes(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      refreshUnreadDemandesCount();
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/demandes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, is_read: true }),
      });
      if (res.ok) {
        setDemandes((prev) =>
          prev.map((d) => (d.id === id ? { ...d, status, is_read: true } : d))
        );
        if (selectedDemande?.id === id) {
          setSelectedDemande((prev) => prev ? { ...prev, status, is_read: true } : null);
        }
        refreshUnreadDemandesCount();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAsRead = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/demandes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_read: !currentStatus }),
      });
      if (res.ok) {
        setDemandes((prev) =>
          prev.map((d) => (d.id === id ? { ...d, is_read: !currentStatus } : d))
        );
        refreshUnreadDemandesCount();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteDemande = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette demande définitivement ?")) return;
    try {
      const res = await fetch(`/api/demandes?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setDemandes((prev) => prev.filter((d) => d.id !== id));
        setSelectedDemande(null);
        refreshUnreadDemandesCount();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendReply = async () => {
    if (!selectedDemande?.email || !replySubject || !replyBody) return;
    setReplySending(true);
    setReplyStatus("idle");
    try {
      const res = await fetch("/api/send-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selectedDemande.email,
          toName: selectedDemande.name,
          subject: replySubject,
          replyMessage: replyBody,
          messageId: selectedDemande.id,
        }),
      });
      if (res.ok) {
        setReplyStatus("success");
        setReplyBody("");
        // Optimistically update local state to show the reply immediately
        setDemandes((prev) => prev.map(d => {
           if (d.id === selectedDemande.id) {
              const newReplies = [...(d.payload?.replies || []), {
                 role: 'admin',
                 message: replyBody,
                 subject: replySubject,
                 timestamp: new Date().toISOString()
              }];
              return { ...d, payload: { ...d.payload, replies: newReplies } };
           }
           return d;
        }));
        setReplySubject("");
      } else {
        setReplyStatus("error");
      }
    } catch {
      setReplyStatus("error");
    } finally {
      setReplySending(false);
    }
  };

  const sendNewMessage = async () => {
    if (!composeTo || !composeSubject || !composeBody) return;
    setComposeSending(true);
    setComposeStatus("idle");
    try {
      const res = await fetch("/api/send-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: composeTo,
          toName: composeTo.split("@")[0], // fallback name
          subject: composeSubject,
          replyMessage: composeBody,
        }),
      });
      if (res.ok) {
        setComposeStatus("success");
        setComposeBody("");
        setComposeSubject("");
        setComposeTo("");
        setTimeout(() => {
          setIsComposeOpen(false);
          setComposeStatus("idle");
        }, 1500);
      } else {
        setComposeStatus("error");
      }
    } catch {
      setComposeStatus("error");
    } finally {
      setComposeSending(false);
    }
  };

  const filteredDemandes = demandes.filter((d) => d.type === activeTab);
  const unreadCountForTab = (type: string) => demandes.filter((d) => d.type === type && !d.is_read).length;

  const tabs = [
    { id: "contact" as const, label: "Messages" },
    { id: "joueur" as const, label: "Inscriptions Joueur" },
    { id: "fan" as const, label: "Devenir Fan" },
  ];

  const typeInfo = (type: string) =>
    TYPE_LABELS[type] ?? { label: type.toUpperCase(), color: "info" };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Boîte de réception" />

      {/* TABS NAVIGATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
         <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl w-fit">
            {tabs.map((tab) => {
               const count = unreadCountForTab(tab.id);
               return (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`relative px-4 py-2 text-sm font-bold transition-all rounded-lg flex items-center gap-2 ${
                        activeTab === tab.id
                           ? "bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-sm"
                           : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                     }`}
                  >
                     {tab.label}
                     {count > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] text-white">
                           {count}
                        </span>
                     )}
                  </button>
               );
            })}
         </div>
      </div>

      <SectionCard
        title={tabs.find(t => t.id === activeTab)?.label || ""}
        description={`Consultez et gérez les ${activeTab === 'joueur' ? "inscriptions des nouveaux joueurs" : activeTab === 'fan' ? "demandes d'adhésion au club des fans" : "messages de contact"}.`}
      >
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-y border-gray-100 dark:border-gray-800">
                <TableRow>
                  {["Statut", "Type / Aperçu", "Contact", "Date", "Actions"].map((h) => (
                    <TableCell key={h} isHeader className="py-3 text-start text-xs font-medium text-gray-500">
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <TableRow>
                    <td colSpan={5} className="py-12">
                       <div className="flex flex-col items-center justify-center gap-4">
                          <Loader />
                          <p className="text-sm font-medium text-gray-400">Récupération des données...</p>
                       </div>
                    </td>
                  </TableRow>
                ) : filteredDemandes.length === 0 ? (
                  <TableRow>
                    <td colSpan={5} className="py-20 flex flex-col items-center justify-center text-center">
                       <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-full mb-4">
                          <EyeIcon className="w-8 h-8 text-gray-300" />
                       </div>
                       <p className="text-gray-400 font-medium">Aucun résultat dans cette catégorie.</p>
                    </td>
                  </TableRow>
                ) : (
                  filteredDemandes.map((d) => {
                    const { label, color } = typeInfo(d.type);
                    return (
                      <TableRow key={d.id} className={!d.is_read ? "bg-brand-50/50 dark:bg-brand-900/10" : ""}>
                        <TableCell className="py-3 text-sm">
                          <Badge size="sm" color={d.is_read ? "success" : "warning"}>
                            {d.is_read ? "Lu" : "Nouveau"}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 text-sm">
                          <Badge size="sm" color={color as any} className="mb-1">{label}</Badge>
                          <div className="text-gray-500 dark:text-gray-400 line-clamp-1 w-[180px] text-xs">
                            {d.message || "—"}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-sm text-gray-900 dark:text-white">
                          <div className="font-semibold">{d.name}</div>
                          <div className="text-xs text-gray-500">
                            {d.email}{d.phone ? ` | ${d.phone}` : ""}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-xs text-gray-500">
                          {new Date(d.created_at).toLocaleDateString("fr-FR", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                          <div>{new Date(d.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</div>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                             {d.type === 'joueur' && (
                                <button 
                                   onClick={(e) => { e.stopPropagation(); window.open(`/api/demandes/pdf?id=${d.id}`, '_blank'); }}
                                   className="text-gray-500 hover:text-brand-500 transition-colors" 
                                   title="Télécharger Dossier PDF"
                                >
                                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                                </button>
                             )}
                             <button onClick={() => { setSelectedDemande(d); if (!d.is_read) markAsRead(d.id, false); }}
                               className="text-gray-500 hover:text-brand-500 transition-colors" title="Voir & Répondre">
                               <EyeIcon className="h-5 w-5" />
                             </button>
                             <button onClick={() => deleteDemande(d.id)}
                               className="text-gray-500 hover:text-error-500 transition-colors" title="Supprimer">
                               <TrashBinIcon className="h-5 w-5" />
                             </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </SectionCard>

      {/* ── CHAT MODAL ── */}
      {selectedDemande && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-[6px] p-4 transition-all duration-300">
          <div className={`w-full ${showDetails ? 'max-w-3xl' : 'max-w-md'} rounded-3xl bg-white shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col transition-all duration-300 max-h-[92vh] animate-in zoom-in-95 duration-200`}>
            
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 shrink-0">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center border border-brand-100 dark:border-brand-900/30">
                     <Image src="/images/logo/fc-toro.png" alt="Logo" width={24} height={24} className="object-contain" />
                  </div>
                  <div>
                     <div className="text-sm font-black text-gray-900 dark:text-white truncate max-w-[150px]">{selectedDemande.name}</div>
                     <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{typeInfo(selectedDemande.type).label}</div>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowDetails(!showDetails)}
                    className={`p-2 rounded-xl transition-all ${showDetails ? 'bg-brand-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400'}`}
                  >
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  </button>
                  <button onClick={() => { setSelectedDemande(null); setShowDetails(false); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-400">✕</button>
               </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
               <div className="flex-1 flex flex-col bg-gray-50/30 dark:bg-white/[0.01]">
                  <div className="flex-1 overflow-y-auto p-5 space-y-6">
                     {/* INITIAL MESSAGE */}
                     {selectedDemande.message && (
                        <div className="flex flex-col gap-1 max-w-[85%] animate-in slide-in-from-left-2 duration-300">
                           <div className="text-[10px] text-gray-400 font-bold ml-3 mb-1 uppercase tracking-tighter">Message reçu</div>
                           <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                              {selectedDemande.message}
                           </div>
                           <div className="text-[10px] text-gray-400 ml-3 mt-1">
                              {new Date(selectedDemande.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                           </div>
                        </div>
                     )}

                     {/* CONVERSATION HISTORY */}
                     {selectedDemande.payload?.replies?.map((reply: any, idx: number) => (
                        <div key={idx} className={`flex flex-col gap-1 max-w-[85%] animate-in ${reply.role === 'admin' ? 'ml-auto items-end' : 'items-start'} duration-300`}>
                           <div className={`text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-tighter ${reply.role === 'admin' ? 'text-right mr-3' : 'ml-3'}`}>
                              {reply.role === 'admin' ? 'Vous' : 'Réponse Client'}
                           </div>
                           <div className={`p-3.5 px-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                              reply.role === 'admin' 
                                 ? 'bg-brand-500 text-white rounded-tr-none shadow-brand-500/20' 
                                 : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                           }`}>
                              {reply.message}
                           </div>
                           <div className={`text-[10px] text-gray-400 mt-1 ${reply.role === 'admin' ? 'mr-3' : 'ml-3'}`}>
                              {new Date(reply.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                           </div>
                        </div>
                     ))}

                     {!selectedDemande.message && (!selectedDemande.payload?.replies || selectedDemande.payload.replies.length === 0) && (
                        <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 opacity-50">
                           <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                              <EyeIcon className="w-6 h-6 text-gray-400" />
                           </div>
                           <p className="text-sm font-medium text-gray-500 italic">Aucun message écrit direct.<br/>Consultez les détails via l'icône (i).</p>
                        </div>
                     )}

                     {replyStatus === "success" && (
                       <div className="mx-auto bg-success-50 dark:bg-success-900/10 text-success-700 dark:text-success-400 text-[11px] font-bold py-2 px-4 rounded-full border border-success-200 dark:border-success-900/30 animate-in zoom-in">
                          ✓ Réponse envoyée
                       </div>
                     )}
                  </div>

                  {selectedDemande.type !== "fan" && selectedDemande.email ? (
                     <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3">
                        <input
                           type="text"
                           value={replySubject}
                           onChange={(e) => setReplySubject(e.target.value)}
                           placeholder="Objet de la réponse..."
                           className="w-full text-xs font-bold border-none bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2 outline-none focus:bg-white transition-all"
                        />
                        <div className="flex gap-2">
                           <textarea
                              rows={2}
                              value={replyBody}
                              onChange={(e) => setReplyBody(e.target.value)}
                              placeholder="Écrivez votre réponse ici..."
                              className="flex-1 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 outline-none focus:bg-white dark:focus:bg-gray-800 border border-transparent focus:border-brand-500 transition-all resize-none"
                           />
                           <button 
                              onClick={sendReply}
                              disabled={replySending || !replySubject || !replyBody}
                              className="h-[52px] w-[52px] bg-brand-500 hover:bg-brand-600 rounded-xl flex items-center justify-center text-white transition-all active:scale-90 shadow-lg shadow-brand-500/30 disabled:opacity-50"
                           >
                              {replySending ? (
                                 <div className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                              ) : (
                                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                              )}
                           </button>
                        </div>
                     </div>
                  ) : selectedDemande.type === "fan" && (
                      <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                         {selectedDemande.status && selectedDemande.status !== "pending" ? (
                            <div className={`p-3 rounded-xl text-center text-xs font-bold uppercase tracking-wider ${selectedDemande.status === 'accepted' ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'}`}>
                               Demande {selectedDemande.status === 'accepted' ? 'Acceptée' : 'Refusée'}
                               <button onClick={() => updateStatus(selectedDemande.id, "pending")} className="block mx-auto mt-1 text-[10px] underline opacity-70">Annuler</button>
                            </div>
                         ) : (
                            <div className="flex gap-2">
                               <button onClick={() => updateStatus(selectedDemande.id, "accepted")} className="flex-1 py-3 bg-success-600 hover:bg-success-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-success-900/20">Accepter</button>
                               <button onClick={() => updateStatus(selectedDemande.id, "rejected")} className="flex-1 py-3 bg-error-600 hover:bg-error-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-error-900/20">Refuser</button>
                            </div>
                         )}
                      </div>
                  )}
               </div>

               {showDetails && (
                  <div className="w-[320px] border-l border-gray-100 dark:border-gray-800 overflow-y-auto p-5 space-y-6 animate-in slide-in-from-right-2 duration-300 shrink-0">
                     <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Informations de contact</h4>
                        <div className="space-y-3">
                           {[
                              ["Nom", selectedDemande.name],
                              ["Email", selectedDemande.email || "—"],
                              ["Téléphone", selectedDemande.phone || "—"],
                           ].map(([label, val]) => (
                              <div key={label}>
                                 <div className="text-[10px] font-bold text-gray-500">{label}</div>
                                 <div className="text-sm text-gray-900 dark:text-gray-100 font-medium break-words">{val}</div>
                              </div>
                           ))}
                        </div>
                     </div>

                     {selectedDemande.payload && Object.keys(selectedDemande.payload).length > 0 && (
                        <div>
                           <h4 className="text-[10px] font-black uppercase tracking-widest text-brand-500 mb-4">Détails du formulaire</h4>
                           <div className="space-y-3">
                              {Object.entries(selectedDemande.payload).map(([key, value]) => (
                                <div key={key} className="pb-2 border-b border-gray-100 dark:border-gray-800 last:border-0 text-sm">
                                   <div className="text-[10px] font-bold text-gray-400 mb-1">{friendlyLabel(key)}</div>
                                   <div className="text-xs text-gray-900 dark:text-gray-100 leading-relaxed break-words">{friendlyValue(key, value)}</div>
                                </div>
                              ))}
                           </div>
                        </div>
                     )}

                     <div className="pt-4 space-y-3">
                        {selectedDemande.type === "joueur" && (
                           <button 
                              onClick={() => window.open(`/api/demandes/pdf?id=${selectedDemande.id}`, '_blank')}
                              className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-[11px] font-black uppercase tracking-widest text-white transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 mb-2"
                           >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                              Dossier PDF
                           </button>
                        )}
                        <button 
                           onClick={() => deleteDemande(selectedDemande.id)}
                           className="w-full py-2.5 rounded-xl bg-error-50 dark:bg-error-900/10 text-[11px] font-bold text-error-600 hover:bg-error-100 dark:hover:bg-error-900/20 transition-colors"
                        >
                           Supprimer définitivement
                        </button>
                     </div>
                  </div>
               )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── COMPOSE MODAL ── */}
      {isComposeOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-[6px] p-4 transition-all duration-300">
          <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row max-h-[92vh] animate-in zoom-in-95 duration-200">
            
             {/* Sidebar: Message History */}
             <div className="hidden md:flex w-80 border-r border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-white/[0.01] flex-col overflow-hidden shrink-0">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Historique Récent</h4>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                   {demandes.filter(d => d.type === 'contact').slice(0, 10).map((d) => (
                      <button 
                         key={d.id} 
                         onClick={() => setComposeTo(d.email || "")}
                         className="w-full text-left p-4 rounded-2xl hover:bg-white dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700 group shadow-sm hover:shadow-md"
                      >
                         <div className="flex items-center justify-between mb-1">
                            <div className="font-bold text-sm text-gray-900 dark:text-white truncate group-hover:text-brand-500 transition-colors">{d.name}</div>
                            <div className="text-[9px] text-gray-400 font-bold uppercase">{new Date(d.created_at).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })}</div>
                         </div>
                         <div className="text-[11px] text-gray-500 truncate mb-2">{d.email}</div>
                         <div className="text-[10px] text-gray-400 italic line-clamp-1 bg-gray-100/50 dark:bg-white/5 p-2 rounded-lg border border-gray-100/50 dark:border-white/5">{d.message || "Aucun message"}</div>
                      </button>
                   ))}
                </div>
             </div>

             {/* Main Content */}
             <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900">
                <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 shrink-0">
                   <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-2xl bg-brand-50 dark:bg-brand-900/10 p-2.5 flex items-center justify-center border border-brand-100 dark:border-brand-900/30 shadow-inner">
                         <Image src="/images/logo/fc-toro.png" alt="FC Toro" width={40} height={40} className="object-contain" />
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-1">Nouveau Message</h3>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rédaction Administrative</p>
                      </div>
                   </div>
                   <button onClick={() => setIsComposeOpen(false)} className="h-10 w-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-400 border border-transparent hover:border-gray-100 dark:hover:border-gray-700">✕</button>
                </div>

               <div className="p-6 space-y-5 overflow-y-auto flex-1">
                  {composeStatus === "success" && (
                    <div className="rounded-2xl bg-success-50 border border-success-200 p-4 text-sm text-success-700 font-bold animate-in zoom-in duration-300 flex items-center gap-3">
                       <CheckCircleIcon className="w-5 h-5" /> Message envoyé avec succès !
                    </div>
                  )}
                  {composeStatus === "error" && (
                    <div className="rounded-2xl bg-error-50 border border-error-200 p-4 text-sm text-error-700 font-bold">
                       ✕ Échec de l'envoi. Veuillez vérifier les champs.
                    </div>
                  )}

                  <div className="space-y-5">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                           <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Destinataire (Email)</label>
                           <input
                              type="email"
                              value={composeTo}
                              onChange={(e) => setComposeTo(e.target.value)}
                              placeholder="exemple@email.com"
                              className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-5 py-4 text-sm focus:border-brand-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all shadow-sm"
                           />
                        </div>
                        <div>
                           <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Objet</label>
                           <input
                              type="text"
                              value={composeSubject}
                              onChange={(e) => setComposeSubject(e.target.value)}
                              placeholder="Sujet du message..."
                              className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-5 py-4 text-sm focus:border-brand-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all shadow-sm"
                           />
                        </div>
                     </div>
                     <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Message</label>
                        <textarea
                           rows={10}
                           value={composeBody}
                           onChange={(e) => setComposeBody(e.target.value)}
                           placeholder="Rédigez votre message ici..."
                           className="w-full resize-none rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-5 py-4 text-sm focus:border-brand-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all shadow-sm leading-relaxed"
                        />
                     </div>
                  </div>
               </div>

                <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-white/[0.01] flex gap-4 shrink-0">
                   <button 
                      onClick={() => setIsComposeOpen(false)}
                      className="px-8 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center justify-center min-w-[140px] bg-white dark:bg-gray-900 shadow-sm"
                   >
                      Annuler
                   </button>
                   <button 
                      onClick={sendNewMessage}
                      disabled={composeSending || !composeTo || !composeSubject || !composeBody}
                      className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-brand-500/30 transition-all disabled:opacity-50 disabled:scale-100 active:scale-95 flex items-center justify-center gap-3"
                   >
                      {composeSending ? (
                        <div className="h-4 w-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          Envoyer le message
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        </>
                      )}
                   </button>
                </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
