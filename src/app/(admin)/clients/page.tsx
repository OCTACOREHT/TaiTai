"use client";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { exportToExcel } from "@/lib/export-excel";
import { supabase } from "@/lib/supabase-client";
import { Clock, Download, Loader2, Mail, Phone, RefreshCcw, ShoppingBag, Trophy, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

type ClientAccount = {
  id: string;
  nom: string;
  telephone: string | null;
  email: string | null;
  adresse: string | null;
  ville: string | null;
  departement: string | null;
  created_at: string | null;
  last_login_at: string | null;
  order_count: number;
  total_spent: number;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "Jamais";

  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const loadClients = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const [{ data, error }, ordersResult] = await Promise.all([
      supabase
      .from("clients")
      .select("id, nom, telephone, email, adresse, ville, departement, created_at, last_login_at")
      .not("last_login_at", "is", null)
      .order("last_login_at", { ascending: false }),
      supabase
        .from("commandes")
        .select("client_user_id, total")
        .not("client_user_id", "is", null),
    ]);

    if (error) {
      alert("Erreur lors du chargement des clients : " + error.message);
    } else {
      const stats = new Map<string, { order_count: number; total_spent: number }>();

      if (!ordersResult.error) {
        (ordersResult.data || []).forEach((order) => {
          const clientId = order.client_user_id as string;
          const current = stats.get(clientId) || { order_count: 0, total_spent: 0 };
          stats.set(clientId, {
            order_count: current.order_count + 1,
            total_spent: current.total_spent + Number(order.total || 0),
          });
        });
      }

      setClients(
        (data || [])
          .map((client) => ({
            ...client,
            order_count: stats.get(client.id)?.order_count || 0,
            total_spent: stats.get(client.id)?.total_spent || 0,
          }))
          .sort((a, b) => b.order_count - a.order_count || b.total_spent - a.total_spent),
      );
    }

    if (showLoading) setLoading(false);
  };

  useEffect(() => {
    loadClients();
  }, []);

  useAutoRefresh(() => loadClients(false));

  const metrics = useMemo(() => {
    const today = new Date().toDateString();
    const connectedToday = clients.filter((client) =>
      client.last_login_at ? new Date(client.last_login_at).toDateString() === today : false,
    ).length;

    return {
      total: clients.length,
      connectedToday,
      totalOrders: clients.reduce((sum, client) => sum + client.order_count, 0),
    };
  }, [clients]);

  const exportClients = () => {
    if (clients.length === 0) {
      alert("Aucun client a exporter.");
      return;
    }

    exportToExcel({
      filename: `clients-taitai-${new Date().toISOString().slice(0, 10)}.xls`,
      sheetName: "Clients",
      headers: [
        "Classement",
        "Nom",
        "Telephone",
        "Email",
        "Adresse",
        "Departement",
        "Commune",
        "Commandes",
        "Total depense HTG",
        "Derniere connexion",
        "Inscription",
        "ID client",
      ],
      rows: clients.map((client, index) => [
        index + 1,
        client.nom,
        client.telephone || "",
        client.email || "",
        client.adresse || "",
        client.departement || "",
        client.ville || "",
        client.order_count,
        client.total_spent,
        formatDateTime(client.last_login_at),
        formatDateTime(client.created_at),
        client.id,
      ]),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageBreadCrumb pageTitle="Clients" />
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={exportClients}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
          >
            <Download className="h-4 w-4" />
            Exporter Excel
          </button>
          <button
            type="button"
            onClick={() => loadClients()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            <RefreshCcw className="h-4 w-4" />
            Actualiser
          </button>
        </div>
      </div>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-brand-500">Utilisateurs du site client</p>
        <h1 className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white/90">
          Classement des clients
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500 dark:text-gray-400">
          Les clients sont classes selon le nombre de commandes passees sur le site TaïTaï.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Clients connectes" value={metrics.total} icon={<UserRound />} />
        <MetricCard label="Connexions aujourd'hui" value={metrics.connectedToday} icon={<Clock />} />
        <MetricCard label="Commandes clients" value={metrics.totalOrders} icon={<ShoppingBag />} />
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">
            Classement par commandes
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Le premier client est celui qui a passe le plus de commandes.
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
          </div>
        ) : clients.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Aucun client connecte pour le moment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1160px] w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800">
                  <th className="px-5 py-4">Client</th>
                  <th className="px-5 py-4">Classement</th>
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Adresse</th>
                  <th className="px-5 py-4">Commandes</th>
                  <th className="px-5 py-4">Total depense</th>
                  <th className="px-5 py-4">Derniere connexion</th>
                  <th className="px-5 py-4">Inscription</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {clients.map((client, index) => (
                  <tr key={client.id} className="transition hover:bg-gray-50/60 dark:hover:bg-white/5">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-sm font-black uppercase text-brand-600 dark:bg-brand-500/10">
                          {client.nom?.slice(0, 2) || "CL"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white/90">{client.nom}</p>
                          <p className="mt-1 text-xs text-gray-500">ID: {client.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${
                        index === 0
                          ? "bg-amber-50 text-amber-700"
                          : index === 1
                            ? "bg-gray-100 text-gray-700"
                            : index === 2
                              ? "bg-orange-50 text-orange-700"
                              : "bg-brand-50 text-brand-600"
                      }`}>
                        <Trophy className="h-3.5 w-3.5" />
                        #{index + 1}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {client.telephone || "Non renseigne"}
                        </p>
                        <p className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {client.email || "Non renseigne"}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="max-w-[220px] space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <p className="font-semibold text-gray-900 dark:text-white/90">
                          {[client.departement, client.ville].filter(Boolean).join(" - ") || "Non renseigne"}
                        </p>
                        {client.adresse ? (
                          <p className="line-clamp-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                            {client.adresse}
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white/90">
                      {client.order_count}
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900 dark:text-white/90">
                      {new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(client.total_spent)} HTG
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white/90">
                      {formatDateTime(client.last_login_at)}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatDateTime(client.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-2xl font-semibold text-gray-900 dark:text-white/90">{value}</p>
    </div>
  );
}
