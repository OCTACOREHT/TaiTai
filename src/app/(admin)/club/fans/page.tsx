"use client";

import React, { useEffect, useState } from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { SectionCard } from "@/components/common/CmsShared";
import Badge from "@/components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { EyeIcon, TrashBinIcon, CheckCircleIcon } from "@/icons";

type Fan = {
  id: string;
  type: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  payload: any;
  is_read: boolean;
  status: string | null;
  created_at: string;
};

export default function FansPage() {
  const [fans, setFans] = useState<Fan[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  
  // Broadcast modal state
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{success: boolean, count: number} | null>(null);

  useEffect(() => {
    fetchFans();
  }, []);

  const fetchFans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/demandes");
      if (res.ok) {
        const json = await res.json();
        const allMessages = json.data || [];
        setFans(allMessages.filter((m: any) => m.type === "fan"));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async () => {
    if (!subject || !message) return;
    setSending(true);
    try {
      const res = await fetch("/api/fans/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setBroadcastResult({ success: true, count: data.sentCount });
        setTimeout(() => {
          setShowBroadcast(false);
          setBroadcastResult(null);
          setSubject("");
          setMessage("");
        }, 3000);
      } else {
        alert(data.error || "Une erreur est survenue.");
      }
    } catch (e) {
      console.error(e);
      alert("Erreur réseau.");
    } finally {
      setSending(false);
    }
  };

  const filteredFans = fans.filter(f => {
    if (filter === "all") return true;
    if (filter === "pending") return !f.status || f.status === "pending";
    return f.status === filter;
  });

  const acceptedCount = fans.filter(f => f.status === "accepted").length;

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Gestion des Fans" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="text-sm font-medium text-gray-500">Total Inscriptions</div>
          <div className="mt-2 text-3xl font-bold">{fans.length}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="text-sm font-medium text-gray-500">Fans Acceptés</div>
          <div className="mt-2 text-3xl font-bold text-success-600">{acceptedCount}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] flex flex-col justify-center">
          <button 
            onClick={() => setShowBroadcast(true)}
            disabled={acceptedCount === 0}
            className="w-full py-3 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-500/20"
          >
            Diffuser un message ({acceptedCount})
          </button>
        </div>
      </div>

      <SectionCard
        title="Liste des Fans"
        description="Consultez et gérez tous les membres qui ont rejoint le club des fans."
      >
        <div className="mb-4 flex gap-2">
          {["all", "pending", "accepted", "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filter === f 
                  ? "bg-brand-500 text-white" 
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-800"
              }`}
            >
              {f === "all" ? "Tous" : f === "pending" ? "En attente" : f === "accepted" ? "Acceptés" : "Refusés"}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-y border-gray-100 dark:border-gray-800">
                <TableRow>
                  {["Membre", "Contact", "Lieu", "Statut", "Date"].map((h) => (
                    <TableCell key={h} isHeader className="py-3 text-start text-xs font-medium text-gray-500">
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <TableRow><td colSpan={5} className="py-6 text-center text-sm">Chargement...</td></TableRow>
                ) : filteredFans.length === 0 ? (
                  <TableRow><td colSpan={5} className="py-6 text-center text-sm">Aucun fan trouvé.</td></TableRow>
                ) : (
                  filteredFans.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="py-3 text-sm font-semibold text-gray-900 dark:text-white">
                        {f.name}
                      </TableCell>
                      <TableCell className="py-3 text-sm text-gray-500">
                        <div>{f.email}</div>
                        <div className="text-xs">{f.phone}</div>
                      </TableCell>
                      <TableCell className="py-3 text-sm text-gray-500">
                        {f.payload?.department || "—"}
                      </TableCell>
                      <TableCell className="py-3 text-sm">
                        <Badge size="sm" color={
                          f.status === "accepted" ? "success" : f.status === "rejected" ? "error" : "warning"
                        }>
                          {f.status === "accepted" ? "Accepté" : f.status === "rejected" ? "Refusé" : "En attente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-xs text-gray-400">
                        {new Date(f.created_at).toLocaleDateString("fr-FR")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </SectionCard>

      {/* Broadcast Modal */}
      {showBroadcast && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-gray-900 p-6">
            <h3 className="text-xl font-bold mb-4">Diffuser un message aux fans</h3>
            <p className="text-sm text-gray-500 mb-6">
              Ce message sera envoyé par email aux <strong>{acceptedCount}</strong> fans acceptés.
            </p>
            
            {broadcastResult ? (
              <div className="py-12 text-center animate-in zoom-in">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-100 text-success-600 mb-4">
                  <CheckCircleIcon className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold">Message envoyé !</h4>
                <p className="text-sm text-gray-500">{broadcastResult.count} emails ont été expédiés.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Objet du message</label>
                  <input 
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ex: Invitation au prochain match..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500/20 dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Corps du message</label>
                  <textarea 
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Bonjour chers fans..."
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand-500/20 dark:bg-gray-800 dark:border-gray-700 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setShowBroadcast(false)}
                    className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleBroadcast}
                    disabled={sending || !subject || !message}
                    className="flex-2 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                  >
                    {sending ? "Envoi en cours..." : "Envoyer maintenant"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
