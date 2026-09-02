"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { exportToExcel } from "@/lib/export-excel";
import { supabase } from "@/lib/supabase-client";
import {
  ArrowUpDown,
  Clock,
  Download,
  Filter,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCcw,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Trophy,
  UserRound,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { ErrorModal } from "@/components/ui/ErrorModal";

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
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string; details?: string }>({
    isOpen: false,
    title: "Erreur",
    message: "",
  });

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartement, setSelectedDepartement] = useState("");
  const [selectedVille, setSelectedVille] = useState("");
  const [minOrders, setMinOrders] = useState<number | "">("");
  const [sortBy, setSortBy] = useState<"orders" | "spent" | "name" | "last_login">("orders");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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
      setErrorModal({
        isOpen: true,
        title: "Erreur de chargement",
        message: "Erreur lors du chargement des clients : " + error.message,
        details: "Veuillez rafraîchir la page.",
      });
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

  // Extract unique departments / zones
  const departements = useMemo(() => {
    const set = new Set<string>();
    clients.forEach((c) => {
      if (c.departement?.trim()) set.add(c.departement.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
  }, [clients]);

  // Extract unique cities / communes (filtered by department if selected)
  const villes = useMemo(() => {
    const set = new Set<string>();
    clients.forEach((c) => {
      if (
        selectedDepartement &&
        c.departement?.trim().toLowerCase() !== selectedDepartement.trim().toLowerCase()
      ) {
        return;
      }
      if (c.ville?.trim()) set.add(c.ville.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
  }, [clients, selectedDepartement]);

  // Compute filtered & sorted clients
  const filteredClients = useMemo(() => {
    let result = [...clients];

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.nom?.toLowerCase().includes(q) ||
          c.telephone?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.adresse?.toLowerCase().includes(q) ||
          c.ville?.toLowerCase().includes(q) ||
          c.departement?.toLowerCase().includes(q),
      );
    }

    if (selectedDepartement) {
      result = result.filter(
        (c) => c.departement?.trim().toLowerCase() === selectedDepartement.trim().toLowerCase(),
      );
    }

    if (selectedVille) {
      result = result.filter(
        (c) => c.ville?.trim().toLowerCase() === selectedVille.trim().toLowerCase(),
      );
    }

    if (minOrders !== "" && !isNaN(Number(minOrders))) {
      result = result.filter((c) => c.order_count >= Number(minOrders));
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "orders") {
        cmp = a.order_count - b.order_count;
      } else if (sortBy === "spent") {
        cmp = a.total_spent - b.total_spent;
      } else if (sortBy === "name") {
        cmp = (a.nom || "").localeCompare(b.nom || "", "fr");
      } else if (sortBy === "last_login") {
        const aTime = a.last_login_at ? new Date(a.last_login_at).getTime() : 0;
        const bTime = b.last_login_at ? new Date(b.last_login_at).getTime() : 0;
        cmp = aTime - bTime;
      }

      return sortOrder === "desc" ? -cmp : cmp;
    });

    return result;
  }, [clients, searchTerm, selectedDepartement, selectedVille, minOrders, sortBy, sortOrder]);

  const hasActiveFilters =
    Boolean(searchTerm) ||
    Boolean(selectedDepartement) ||
    Boolean(selectedVille) ||
    minOrders !== "";

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedDepartement("");
    setSelectedVille("");
    setMinOrders("");
    setSortBy("orders");
    setSortOrder("desc");
  };

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
    if (filteredClients.length === 0) {
      setErrorModal({
        isOpen: true,
        title: "Export impossible",
        message: "Aucun client à exporter.",
        details: "La liste filtrée des clients est vide.",
      });
      return;
    }

    exportToExcel({
      filename: `clients-taitai-${new Date().toISOString().slice(0, 10)}.xls`,
      sheetName: "Clients",
      headers: [
        "Rang",
        "Nom",
        "Telephone",
        "Email",
        "Adresse",
        "Departement/Zone",
        "Commune/Ville",
        "Commandes",
        "Total depense HTG",
        "Derniere connexion",
        "Inscription",
        "ID client",
      ],
      rows: filteredClients.map((client, index) => [
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
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal((prev) => ({ ...prev, isOpen: false }))}
        title={errorModal.title}
        message={errorModal.message}
        details={errorModal.details}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageBreadCrumb pageTitle="Clients" />
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={exportClients}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600"
          >
            <Download className="h-4 w-4" />
            Exporter Excel ({filteredClients.length})
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
          Gestion & Recherche des clients
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500 dark:text-gray-400">
          Recherchez par zone, commune, nom, téléphone ou filtrez par nombre de commandes pour analyser vos meilleurs clients.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Clients enregistres" value={metrics.total} icon={<UserRound />} />
        <MetricCard label="Connexions aujourd'hui" value={metrics.connectedToday} icon={<Clock />} />
        <MetricCard label="Commandes clients" value={metrics.totalOrders} icon={<ShoppingBag />} />
      </div>

      {/* Barre de Recherche et Filtres par Zone */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone, email, adresse, zone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 pl-10 pr-10 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
            >
              <X className="h-3.5 w-3.5 text-gray-500" />
              Réinitialiser les filtres
            </button>
          )}
        </div>

        {/* Grille des filtres avancés */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-2 border-t border-gray-100 dark:border-gray-800">
          {/* Filtre Zone / Département */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Zone / Département
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <select
                value={selectedDepartement}
                onChange={(e) => {
                  setSelectedDepartement(e.target.value);
                  setSelectedVille(""); // reset city when department changes
                }}
                className="w-full rounded-xl border border-gray-200 bg-white pl-8 pr-3 py-2 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">Toutes les zones ({departements.length})</option>
                {departements.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filtre Commune / Ville */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Commune / Ville
            </label>
            <select
              value={selectedVille}
              onChange={(e) => setSelectedVille(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">Toutes les communes ({villes.length})</option>
              {villes.map((ville) => (
                <option key={ville} value={ville}>
                  {ville}
                </option>
              ))}
            </select>
          </div>

          {/* Commandes min. */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Commandes min.
            </label>
            <input
              type="number"
              min="0"
              placeholder="Ex: 1"
              value={minOrders}
              onChange={(e) => setMinOrders(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          {/* Tri */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Trier par
            </label>
            <div className="flex items-center gap-1.5">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="orders">Nombre de commandes</option>
                <option value="spent">Total dépensé</option>
                <option value="name">Nom client (A-Z)</option>
                <option value="last_login">Dernière connexion</option>
              </select>
              <button
                type="button"
                title={sortOrder === "desc" ? "Ordre décroissant" : "Ordre croissant"}
                onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">
              Liste des clients ({filteredClients.length} / {clients.length})
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {hasActiveFilters
                ? `Résultats filtrés selon vos critères de recherche.`
                : `Classement des clients par nombre de commandes.`}
            </p>
          </div>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-brand-500" />
          </div>
        ) : clients.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Aucun client connecté pour le moment.
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500 space-y-3">
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              Aucun client ne correspond à vos critères de recherche.
            </p>
            <p className="text-xs text-gray-400">
              Essayez de modifier votre recherche ou de réinitialiser vos filtres.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              <X className="h-3.5 w-3.5" />
              Réinitialiser les filtres
            </button>
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
                  <th className="px-5 py-4">Total dépensé</th>
                  <th className="px-5 py-4">Dernière connexion</th>
                  <th className="px-5 py-4">Inscription</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredClients.map((client, index) => (
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
                          {client.telephone || "Non renseigné"}
                        </p>
                        <p className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {client.email || "Non renseigné"}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="max-w-[220px] space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <p className="font-semibold text-gray-900 dark:text-white/90">
                          {[client.departement, client.ville].filter(Boolean).join(" - ") || "Non renseigné"}
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
