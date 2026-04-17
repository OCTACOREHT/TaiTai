"use client";

import React, { useEffect, useMemo, useState } from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { SectionCard, StatusBadge, TextInput, SelectInput, SectionCard as Card } from "@/components/common/CmsShared";
import Button from "@/components/ui/button/Button";
import { useCms } from "@/context/CmsContext";
import { CmsUser, UserRole } from "@/types/cms";
import { TrashBinIcon, PencilIcon, PlusIcon } from "@/icons";
import { useRouter } from "next/navigation";

export default function EquipePage() {
  const { currentUser, canManageUsers, users, saveUser, deleteUser, hydrated } = useCms();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CmsUser | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "moderator" as UserRole,
    title: "",
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hydrated && !canManageUsers) {
      router.replace("/dashboard");
    }
  }, [hydrated, canManageUsers, router]);

  const filteredUsers = useMemo(() => {
    return (users || []).filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const handleOpenModal = (user: CmsUser | null = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: "", // Hide password for security
        role: user.role,
        title: user.title,
        active: user.active
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "moderator",
        title: "Moderateur",
        active: true
      });
    }
    setError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await saveUser({
        ...formData,
        id: editingUser?.id || "",
        avatar: editingUser?.avatar || "/images/user/owner.jpg",
        bio: editingUser?.bio || "",
        lastLoginAt: editingUser?.lastLoginAt || null,
      });

      if (res.success) {
        setIsModalOpen(false);
      } else {
        setError(res.message || "Une erreur est survenue.");
      }
    } catch (err) {
      setError("Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === currentUser?.id) {
      alert("Vous ne pouvez pas supprimer votre propre compte.");
      return;
    }
    if (confirm("Voulez-vous vraiment supprimer ce compte ?")) {
      await deleteUser(id);
    }
  };

  if (!hydrated || !canManageUsers) return null;

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Equipe Editoriale" />

      <SectionCard 
        title="Gestion des membres" 
        description="Gerez les acces et les rles des membres de l'equipe."
        actions={
          <Button onClick={() => handleOpenModal()}>
            <PlusIcon className="mr-2" /> Nouveau Membre
          </Button>
        }
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
          <div className="flex-1">
            <TextInput 
              placeholder="Rechercher par nom ou email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <SelectInput 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Tous les rles</option>
              <option value="super_admin">Super Admin</option>
              <option value="moderator">Moderateur</option>
            </SelectInput>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 dark:border-gray-800 text-xs uppercase tracking-wider text-gray-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Membre</th>
                <th className="px-4 py-3 font-semibold">Rle</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-600 dark:text-gray-400">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge value={user.role} />
                  </td>
                  <td className="px-4 py-4">
                    {user.active ? (
                      <span className="text-green-500 font-medium">Actif</span>
                    ) : (
                      <span className="text-red-500 font-medium">Inactif</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(user)}
                        className="p-2 text-gray-400 hover:text-brand-500"
                        title="Modifier"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-gray-400 hover:text-red-500"
                        title="Supprimer"
                      >
                        <TrashBinIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingUser ? "Modifier le membre" : "Ajouter un membre"}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom complet</label>
                <TextInput 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Jean Pierre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <TextInput 
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="jean@fctoro.cms"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Mot de passe {editingUser && "(Laissez vide pour conserver)"}
                </label>
                <TextInput 
                  required={!editingUser}
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Rle</label>
                  <SelectInput 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                  >
                    <option value="moderator">Moderateur</option>
                    <option value="super_admin">Super Admin</option>
                  </SelectInput>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Titre</label>
                  <TextInput 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Ex: Webmaster"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-500 font-medium">{error}</div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsModalOpen(false)}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  loading={loading}
                >
                  {editingUser ? "Enregistrer" : "Creer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
