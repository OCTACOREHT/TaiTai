"use client";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { supabase } from "@/lib/supabase-client";
import { Clock, Loader2, Mail, Phone, RefreshCcw, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

type ClientAccount = {
  id: string;
  nom: string;
  telephone: string | null;
  email: string | null;
  created_at: string | null;
  last_login_at: string | null;
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

  const loadClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select("id, nom, telephone, email, created_at, last_login_at")
      .not("last_login_at", "is", null)
      .order("last_login_at", { ascending: false });

    if (error) {
      alert("Erreur lors du chargement des clients : " + error.message);
    } else {
      setClients(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadClients();
  }, []);

  const metrics = useMemo(() => {
    const today = new Date().toDateString();
    const connectedToday = clients.filter((client) =>
      client.last_login_at ? new Date(client.last_login_at).toDateString() === today : false,
    ).length;

    return {
      total: clients.length,
      connectedToday,
    };
  }, [clients]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageBreadCrumb pageTitle="Clients" />
        <button
          type="button"
          onClick={loadClients}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
        >
          <RefreshCcw className="h-4 w-4" />
          Actualiser
        </button>
      </div>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-brand-500">Utilisateurs du site client</p>
        <h1 className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white/90">
          Clients connectes au site
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500 dark:text-gray-400">
          Liste des comptes clients qui se sont connectes ou inscrits depuis le site TaiTai.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard label="Clients connectes" value={metrics.total} icon={<UserRound />} />
        <MetricCard label="Connexions aujourd'hui" value={metrics.connectedToday} icon={<Clock />} />
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">
            Liste des utilisateurs
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Tries par derniere connexion.
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
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800">
                  <th className="px-5 py-4">Client</th>
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Derniere connexion</th>
                  <th className="px-5 py-4">Inscription</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {clients.map((client) => (
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
