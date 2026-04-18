"use client";

import React, { useEffect, useState } from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { SectionCard } from "@/components/common/CmsShared";
import Badge from "@/components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { EyeIcon, TrashBinIcon, CheckCircleIcon } from "@/icons";

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
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDemande, setSelectedDemande] = useState<Demande | null>(null);

  // Reply state
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [replyStatus, setReplyStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
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
        }),
      });
      if (res.ok) {
        setReplyStatus("success");
        setReplyBody("");
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

  const typeInfo = (type: string) =>
    TYPE_LABELS[type] ?? { label: type.toUpperCase(), color: "info" };

  const unread = demandes.filter((d) => !d.is_read).length;

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Boîte de réception" />

      <SectionCard
        title={`Messagerie & Inscriptions${unread > 0 ? ` (${unread} nouveau${unread > 1 ? "x" : ""})` : ""}`}
        description="Gérez les formulaires de joueurs, fans, et contacts directement depuis le site public."
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
                    <td colSpan={5} className="py-6 text-center text-sm text-gray-500">Chargement...</td>
                  </TableRow>
                ) : demandes.length === 0 ? (
                  <TableRow>
                    <td colSpan={5} className="py-6 text-center text-sm text-gray-500">Aucune demande trouvée.</td>
                  </TableRow>
                ) : (
                  demandes.map((d) => {
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
                            <button onClick={() => { setSelectedDemande(d); if (!d.is_read) markAsRead(d.id, false); }}
                              className="text-gray-500 hover:text-brand-500" title="Voir & Répondre">
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => markAsRead(d.id, d.is_read)}
                              className="text-gray-500 hover:text-success-500"
                              title={d.is_read ? "Marquer non lu" : "Marquer comme lu"}>
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => deleteDemande(d.id)}
                              className="text-gray-500 hover:text-error-500" title="Supprimer">
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

      {/* ── MODAL ── */}
      {selectedDemande && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-gray-900 flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge size="sm" color={typeInfo(selectedDemande.type).color as any}>
                    {typeInfo(selectedDemande.type).label}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    {new Date(selectedDemande.created_at).toLocaleString("fr-FR")}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedDemande.name}</h3>
                <p className="text-sm text-gray-500">{selectedDemande.email}</p>
              </div>
              <button onClick={() => setSelectedDemande(null)}
                className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 ml-4">
                ✕
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              {/* Contact row */}
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4 grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Nom", selectedDemande.name],
                  ["Email", selectedDemande.email || "—"],
                  ["Téléphone", selectedDemande.phone || "—"],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-0.5">{label}</div>
                    <div className="font-medium text-gray-900 dark:text-gray-100 break-words">{val}</div>
                  </div>
                ))}
              </div>

              {/* Message if present */}
              {selectedDemande.message && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Message</div>
                  <p className="text-gray-800 dark:text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">
                    {selectedDemande.message}
                  </p>
                </div>
              )}

              {/* Payload with friendly labels */}
              {selectedDemande.payload && Object.keys(selectedDemande.payload).length > 0 && (
                <div className="rounded-xl border border-brand-100 bg-brand-50/30 dark:border-brand-900/30 dark:bg-brand-900/10 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-3">
                    Détails du formulaire
                  </div>
                  <div className="space-y-2">
                    {Object.entries(selectedDemande.payload).map(([key, value]) => (
                      <div key={key} className="flex flex-col sm:flex-row sm:gap-3 pb-2 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0 text-sm">
                        <span className="text-gray-500 dark:text-gray-400 font-medium sm:w-2/5 shrink-0">
                          {friendlyLabel(key)}
                        </span>
                        <span className="text-gray-900 dark:text-gray-100 sm:w-3/5 break-words">
                          {friendlyValue(key, value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── Action for Fan vs Reply for others ─── */}
              {selectedDemande.type === "fan" ? (
                <div className="rounded-xl border border-brand-100 bg-brand-50/20 dark:border-brand-900/30 dark:bg-brand-900/5 p-6 text-center space-y-4 shadow-sm">
                  <div className="flex flex-col items-center">
                    <div className="text-xs font-bold uppercase tracking-[0.1em] text-brand-600 dark:text-brand-400 mb-1">
                      Gestion de la Demande Fan
                    </div>
                    <div className="h-1 w-12 bg-brand-500 rounded-full mb-4"></div>
                  </div>
                  
                  {selectedDemande.status && selectedDemande.status !== "pending" ? (
                    <div className="flex flex-col items-center py-2 animate-in fade-in duration-500">
                      <div className={`flex items-center gap-2 px-6 py-3 rounded-2xl border-2 font-bold text-lg mb-2 shadow-sm ${
                        selectedDemande.status === "accepted" 
                          ? "bg-success-50 border-success-200 text-success-700 dark:bg-success-900/10 dark:border-success-900/30 dark:text-success-400" 
                          : "bg-error-50 border-error-200 text-error-700 dark:bg-error-900/10 dark:border-error-900/30 dark:text-error-400"
                      }`}>
                        {selectedDemande.status === "accepted" ? (
                          <><CheckCircleIcon className="w-6 h-6" /> Demande Acceptée</>
                        ) : (
                          <><TrashBinIcon className="w-6 h-6" /> Demande Refusée</>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[280px]">
                        {selectedDemande.status === "accepted" 
                          ? "Ce membre fait maintenant partie des fans officiels du FC Toro." 
                          : "Cette demande a été rejetée."}
                      </p>
                      <button 
                        onClick={() => updateStatus(selectedDemande.id, "pending")}
                        className="mt-4 text-xs font-semibold text-gray-400 hover:text-brand-500 transition-colors uppercase tracking-wider"
                      >
                        Annuler la décision
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Voulez-vous accepter ce membre dans le club des fans ?</p>
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => updateStatus(selectedDemande.id, "accepted")}
                          className="flex items-center gap-2 px-8 py-3 bg-success-600 hover:bg-success-700 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-success-900/20"
                        >
                          <CheckCircleIcon className="w-5 h-5" /> Accepter
                        </button>
                        <button
                          onClick={() => updateStatus(selectedDemande.id, "rejected")}
                          className="flex items-center gap-2 px-8 py-3 bg-error-600 hover:bg-error-700 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-error-900/20"
                        >
                          <TrashBinIcon className="w-5 h-5" /> Refuser
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : selectedDemande.email ? (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                    ✉️ Répondre à {selectedDemande.name}
                  </div>

                  {replyStatus === "success" && (
                    <div className="mb-3 rounded-lg bg-green-50 border border-green-200 px-4 py-2.5 text-sm font-medium text-green-700">
                      Réponse envoyée avec succès !
                    </div>
                  )}
                  {replyStatus === "error" && (
                    <div className="mb-3 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700">
                      Échec de l'envoi. Vérifiez la configuration SMTP.
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Objet</label>
                      <input
                        type="text"
                        value={replySubject}
                        onChange={(e) => setReplySubject(e.target.value)}
                        placeholder={`Re: votre demande · FC TORO`}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Message</label>
                      <textarea
                        rows={5}
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        placeholder="Saisissez votre réponse..."
                        className="w-full resize-none rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:focus:ring-brand-900/30"
                      />
                    </div>
                    <button
                      onClick={sendReply}
                      disabled={replySending || !replySubject || !replyBody}
                      className="w-full rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed py-2.5 text-sm font-bold text-white transition-colors shadow-sm"
                    >
                      {replySending ? "Envoi en cours..." : "Envoyer la réponse"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-400 text-center">
                  Pas d'adresse email disponible — réponse impossible.
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between gap-3 p-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
              <button
                onClick={() => deleteDemande(selectedDemande.id)}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Supprimer
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => markAsRead(selectedDemande.id, selectedDemande.is_read)}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {selectedDemande.is_read ? "Marquer non lu" : "Marquer comme lu"}
                </button>
                <button
                  onClick={() => setSelectedDemande(null)}
                  className="rounded-lg bg-gray-900 dark:bg-gray-100 px-5 py-2 text-sm font-bold text-white dark:text-gray-900 hover:bg-gray-800 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
