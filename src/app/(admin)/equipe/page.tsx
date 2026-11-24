
"use client";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { SelectInput, TextInput } from "@/components/common/CmsShared";
import {
  fetchTeamUsersFromSupabase,
  createTeamUserInSupabase,
  deleteTeamUserInSupabase,
  updateTeamUserPasswordInSupabase,
  syncLocalTeamUsersToSupabase,
  roleLabels,
  type StoredTeamUser,
} from "@/lib/admin-team";
import { getAdminSession } from "@/lib/admin-auth";
import { updateAdminPassword } from "@/lib/admin-passwords";
import { supabase } from "@/lib/supabase-client";
import { CheckCircle2, KeyRound, ShieldCheck, Trash2, UserPlus, UsersRound, X, Edit3, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ErrorModal } from "@/components/ui/ErrorModal";
import { SuccessModal } from "@/components/ui/SuccessModal";

const emptyDraft = {
  name: "",
  email: "",
  password: "",
  role: "caissier" as "admin" | "caissier",
};

export default function EquipePage() {
  const [users, setUsers] = useState<StoredTeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StoredTeamUser | null>(null);
  const [resetTarget, setResetTarget] = useState<StoredTeamUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string; details?: string }>({
    isOpen: false,
    title: "Erreur",
    message: "",
  });
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; title: string; message: string; details?: string }>({
    isOpen: false,
    title: "Succès",
    message: "",
  });

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const session = await getAdminSession();
        if (isMounted) {
          setCurrentUserId(session?.user?.id || null);
        }

        // Synchroniser les anciens comptes en localStorage vers Supabase s'il y en a
        await syncLocalTeamUsersToSupabase();

        // Récupérer la liste à jour depuis Supabase
        const dbUsers = await fetchTeamUsersFromSupabase();
        if (isMounted) {
          setUsers(dbUsers);
        }
      } catch (error) {
        console.error("Erreur chargement équipe Supabase:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    // Écoute en temps réel Supabase
    const channel = supabase
      .channel("admin_users_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_users" },
        async () => {
          const fresh = await fetchTeamUsersFromSupabase();
          if (isMounted) {
            setUsers(fresh);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const metrics = useMemo(
    () => ({
      total: users.length + 1,
      admins: users.filter((user) => user.role === "admin").length + 1,
      cashiers: users.filter((user) => user.role === "caissier").length,
    }),
    [users],
  );

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = draft.name.trim();
    const email = draft.email.trim().toLowerCase();
    const password = draft.password.trim();

    if (!name || !email || !password) {
      setErrorModal({
        isOpen: true,
        title: "Champs manquants",
        message: "Veuillez remplir le nom, l'email et le mot de passe.",
        details: "Tous les champs sont obligatoires pour créer un compte.",
      });
      return;
    }

    const emailAlreadyUsed =
      email === "taitai@gmail.com" || users.some((user) => user.email.toLowerCase() === email);

    if (emailAlreadyUsed) {
      setErrorModal({
        isOpen: true,
        title: "Email déjà utilisé",
        message: "Cet email est déjà utilisé par un compte existant.",
        details: "Veuillez utiliser une adresse email différente.",
      });
      return;
    }

    try {
      setSubmitting(true);
      const newUser = await createTeamUserInSupabase({
        name,
        email,
        password,
        role: draft.role,
      });

      setUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id)]);
      setDraft(emptyDraft);

      setSuccessModal({
        isOpen: true,
        title: "Membre ajouté avec succès",
        message: `Le compte de ${name} (${roleLabels[draft.role]}) a bien été enregistré sur Supabase.`,
        details: "La personne peut dès maintenant se connecter depuis n'importe quel ordinateur ou téléphone.",
      });
    } catch (err: any) {
      setErrorModal({
        isOpen: true,
        title: "Erreur d'enregistrement",
        message: err?.message || "Impossible d'enregistrer l'utilisateur sur Supabase.",
        details: "Veuillez vérifier votre connexion et réessayer.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      await deleteTeamUserInSupabase(deleteTarget.id);
      setUsers((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      const deletedName = deleteTarget.name;
      setDeleteTarget(null);

      setSuccessModal({
        isOpen: true,
        title: "Compte supprimé",
        message: `Le compte de ${deletedName} a été supprimé de Supabase avec succès.`,
        details: "L'accès au tableau de bord pour ce compte a été révoqué.",
      });
    } catch (err: any) {
      setErrorModal({
        isOpen: true,
        title: "Erreur de suppression",
        message: err?.message || "Impossible de supprimer ce compte de Supabase.",
        details: "Veuillez réessayer.",
      });
    } finally {
      setDeleting(false);
    }
  };

  const confirmResetPassword = async () => {
    if (!resetTarget || !newPassword.trim()) return;

    try {
      setResetting(true);

      // Handle owner password change
      if (resetTarget.id === "owner-01") {
        const session = await getAdminSession();
        const saved = await updateAdminPassword("owner-01", newPassword.trim());

        if (!saved) {
          setErrorModal({
            isOpen: true,
            title: "Erreur",
            message: "Impossible de sauvegarder le mot de passe dans la base de données.",
            details: "Veuillez réessayer ou contacter le support.",
          });
          return;
        }

        if (session && session.user.id === "owner-01") {
          const updatedSession = {
            ...session,
            user: {
              ...session.user,
              password: newPassword.trim(),
            },
          };
          const remember = typeof window !== "undefined" && !!window.localStorage.getItem("taitai-admin-session-persistent");
          if (remember) {
            window.localStorage.setItem("taitai-admin-session-persistent", JSON.stringify(updatedSession));
          } else {
            window.sessionStorage.setItem("taitai-admin-session", JSON.stringify(updatedSession));
          }
        }

        setResetTarget(null);
        setNewPassword("");
        setShowPassword(false);
        setSuccessModal({
          isOpen: true,
          title: "Mot de passe mis à jour",
          message: "Le mot de passe de l'administrateur principal a été modifié avec succès sur Supabase.",
          details: "Utilisez le nouveau mot de passe pour vous connecter.",
        });
        return;
      }

      // Handle team member password change in Supabase
      await updateTeamUserPasswordInSupabase(resetTarget.id, newPassword.trim());

      setResetTarget(null);
      setNewPassword("");
      setShowPassword(false);
      setSuccessModal({
        isOpen: true,
        title: "Mot de passe mis à jour",
        message: `Le mot de passe de ${resetTarget.name} a été mis à jour avec succès sur Supabase.`,
        details: "La personne pourra se connecter immédiatement avec ce nouveau mot de passe.",
      });
    } catch (err: any) {
      setErrorModal({
        isOpen: true,
        title: "Erreur de modification",
        message: err?.message || "Impossible de mettre à jour le mot de passe sur Supabase.",
        details: "Veuillez réessayer.",
      });
    } finally {
      setResetting(false);
    }
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
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal((prev) => ({ ...prev, isOpen: false }))}
        title={successModal.title}
        message={successModal.message}
        details={successModal.details}
      />
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
            disabled={submitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Ajouter
              </>
            )}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">
              Comptes equipe
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              L'administrateur principal peut modifier son mot de passe en cliquant sur le bouton "Modifier".
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[820px] w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800">
                <th className="px-5 py-4">Nom</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">Acces</th>
                <th className="px-5 py-4 text-right">Actions</th>
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
                onResetPassword={() => {
                  setResetTarget({
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
                  });
                  setNewPassword("");
                  setShowPassword(false);
                }}
              />
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
                      <span>Chargement des comptes depuis Supabase...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <TeamRow
                    key={user.id}
                    user={user}
                    currentUserId={currentUserId}
                    onDelete={() => setDeleteTarget(user)}
                    onResetPassword={() => { setResetTarget(user); setNewPassword(""); setShowPassword(false); }}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal — Confirmer suppression */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <Trash2 className="h-5 w-5" />
                </span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Supprimer le compte</h2>
              </div>
              <button onClick={() => setDeleteTarget(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Voulez-vous vraiment supprimer le compte de{" "}
              <span className="font-semibold text-gray-900 dark:text-white">{deleteTarget.name}</span> ?
              Cette action est irréversible.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  "Supprimer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal — Réinitialiser le mot de passe */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <KeyRound className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Nouveau mot de passe</h2>
                  <p className="text-xs text-gray-500">{resetTarget.name}</p>
                </div>
              </div>
              <button onClick={() => setResetTarget(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Saisissez un nouveau mot de passe pour ce compte. La personne pourra se connecter immédiatement avec ce mot de passe.
            </p>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nouveau mot de passe"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-24 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-brand-500 hover:text-brand-700"
              >
                {showPassword ? "Masquer" : "Afficher"}
              </button>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setResetTarget(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmResetPassword}
                disabled={!newPassword.trim() || resetting}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {resetting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamRow({
  user,
  currentUserId,
  onDelete,
  onResetPassword,
}: {
  user: StoredTeamUser;
  currentUserId: string | null;
  onDelete?: () => void;
  onResetPassword?: () => void;
}) {
  const isFullAccess = user.role === "super_admin" || user.role === "admin";
  const isCurrentUser = user.id === currentUserId;

  return (
    <tr className="transition hover:bg-gray-50/60 dark:hover:bg-white/5">
      <td className="px-5 py-4">
        <p className="font-semibold text-gray-900 dark:text-white/90">{user.name}</p>
        {isCurrentUser ? <p className="mt-1 text-xs font-bold text-brand-500">Session actuelle</p> : null}
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
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-red-50 px-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </button>
          ) : isCurrentUser && user.role === "super_admin" && onResetPassword ? (
            <button
              type="button"
              onClick={onResetPassword}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-brand-50 px-3 text-sm font-bold text-brand-600 transition hover:bg-brand-100"
              title="Modifier le mot de passe"
            >
              <Edit3 className="h-4 w-4" />
              Modifier
            </button>
          ) : onResetPassword ? (
            <button
              type="button"
              onClick={onResetPassword}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-amber-50 px-3 text-sm font-bold text-amber-600 transition hover:bg-amber-100"
            >
              <KeyRound className="h-4 w-4" />
              Mot de passe
            </button>
          ) : isCurrentUser ? (
            <span className="text-xs font-bold text-gray-400">Compte actuel</span>
          ) : (
            <span className="text-xs font-bold text-gray-400">Protégé</span>
          )}
        </div>
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
