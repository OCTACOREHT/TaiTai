"use client";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { SelectInput, TextInput } from "@/components/common/CmsShared";
import { createTeamUser, getStoredTeamUsers, roleLabels, saveStoredTeamUsers, type StoredTeamUser } from "@/lib/admin-team";
import { getAdminSession } from "@/lib/admin-auth";
import { CheckCircle2, ShieldCheck, Trash2, UserPlus, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

const emptyDraft = {
  name: "",
  email: "",
  password: "",
  role: "caissier" as "admin" | "caissier",
};

export default function EquipePage() {
  const [users, setUsers] = useState<StoredTeamUser[]>([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    setUsers(getStoredTeamUsers());
    setCurrentUserId(getAdminSession()?.user?.id || null);
  }, []);

  const metrics = useMemo(
    () => ({
      total: users.length + 1,
      admins: users.filter((user) => user.role === "admin").length + 1,
      cashiers: users.filter((user) => user.role === "caissier").length,
    }),
    [users],
  );

  const persistUsers = (nextUsers: StoredTeamUser[]) => {
    setUsers(nextUsers);
    saveStoredTeamUsers(nextUsers);
  };

  const handleCreateUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = draft.name.trim();
    const email = draft.email.trim().toLowerCase();
    const password = draft.password.trim();

    if (!name || !email || !password) {
      alert("Veuillez remplir le nom, l'email et le mot de passe.");
      return;
    }

    const emailAlreadyUsed =
      email === "taitai@gmail.com" || users.some((user) => user.email.toLowerCase() === email);

    if (emailAlreadyUsed) {
      alert("Cet email est deja utilise par un compte admin.");
      return;
    }

    const nextUser = createTeamUser({ name, email, password, role: draft.role });
    persistUsers([nextUser, ...users]);
    setDraft(emptyDraft);
  };

  const deleteUser = (user: StoredTeamUser) => {
    const confirmed = window.confirm(`Supprimer le compte de ${user.name} ?`);
    if (!confirmed) return;

    persistUsers(users.filter((item) => item.id !== user.id));
  };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Equipe" />

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-brand-500">Acces administrateur</p>
        <h1 className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white/90">
          Gestion de l'equipe
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500 dark:text-gray-400">
          Creez des comptes admin avec acces complet ou des comptes caissier limites a Commandes, Validation et Menu.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Comptes actifs" value={metrics.total} icon={<UsersRound />} />
        <MetricCard label="Admins complets" value={metrics.admins} icon={<ShieldCheck />} />
        <MetricCard label="Caissiers" value={metrics.cashiers} icon={<CheckCircle2 />} />
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">
            Ajouter un membre
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Admin voit tout. Caissier voit seulement Commandes, Validation et Menu.
          </p>
        </div>

        <form onSubmit={handleCreateUser} className="grid gap-4 p-5 sm:p-6 xl:grid-cols-[1fr_1fr_1fr_220px_auto]">
          <TextInput
            placeholder="Nom complet"
            value={draft.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
          />
          <TextInput
            type="email"
            placeholder="Email"
            value={draft.email}
            onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
          />
          <TextInput
            type="password"
            placeholder="Mot de passe"
            value={draft.password}
            onChange={(event) => setDraft((current) => ({ ...current, password: event.target.value }))}
          />
          <SelectInput
            value={draft.role}
            onChange={(event) =>
              setDraft((current) => ({ ...current, role: event.target.value as "admin" | "caissier" }))
            }
          >
            <option value="caissier">Caissier</option>
            <option value="admin">Admin complet</option>
          </SelectInput>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600"
          >
            <UserPlus className="h-4 w-4" />
            Ajouter
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">
            Comptes equipe
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[820px] w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800">
                <th className="px-5 py-4">Nom</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Acces</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              <TeamRow
                user={{
                  id: "owner-01",
                  name: "TaïTaï Admin",
                  email: "taitai@gmail.com",
                  password: "",
                  role: "super_admin",
                  title: "Proprietaire",
                  avatar: "/images/user/owner.jpg",
                  bio: "",
                  active: true,
                  lastLoginAt: null,
                }}
                currentUserId={currentUserId}
              />
              {users.map((user) => (
                <TeamRow
                  key={user.id}
                  user={user}
                  currentUserId={currentUserId}
                  onDelete={() => deleteUser(user)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function TeamRow({
  user,
  currentUserId,
  onDelete,
}: {
  user: StoredTeamUser;
  currentUserId: string | null;
  onDelete?: () => void;
}) {
  const isFullAccess = user.role === "super_admin" || user.role === "admin";

  return (
    <tr className="transition hover:bg-gray-50/60 dark:hover:bg-white/5">
      <td className="px-5 py-4">
        <p className="font-semibold text-gray-900 dark:text-white/90">{user.name}</p>
        {user.id === currentUserId ? <p className="mt-1 text-xs font-bold text-brand-500">Session actuelle</p> : null}
      </td>
      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">{user.email}</td>
      <td className="px-5 py-4">
        <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">
          {roleLabels[user.role]}
        </span>
      </td>
      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
        {isFullAccess ? "Toutes les pages admin" : "Commandes, Validation, Menu"}
      </td>
      <td className="px-5 py-4 text-right">
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-red-50 px-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </button>
        ) : (
          <span className="text-xs font-bold text-gray-400">Protege</span>
        )}
      </td>
    </tr>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-3xl font-black text-gray-900 dark:text-white/90">{value}</p>
    </div>
  );
}
