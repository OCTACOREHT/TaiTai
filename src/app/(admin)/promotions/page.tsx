"use client";

import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { SelectInput, TextInput } from "@/components/common/CmsShared";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { supabase } from "@/lib/supabase-client";
import { Loader2, PlusIcon, Tag, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

type MenuOption = {
  id: string;
  nom: string;
};

type Promotion = {
  id: string;
  title: string;
  code: string | null;
  scope: "item" | "order";
  menu_item_id: string | null;
  discount_type: "percent" | "fixed";
  discount_value: number;
  active: boolean;
  created_at: string;
};

const emptyDraft = {
  title: "",
  code: "",
  scope: "item" as "item" | "order",
  menu_item_id: "",
  discount_type: "percent" as "percent" | "fixed",
  discount_value: "",
  active: true,
};

const formatDiscount = (promotion: Promotion) =>
  promotion.discount_type === "percent"
    ? `${promotion.discount_value}%`
    : `${promotion.discount_value} HTG`;

export default function PromotionsPage() {
  const [menuItems, setMenuItems] = useState<MenuOption[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const menuById = useMemo(
    () => new Map(menuItems.map((item) => [item.id, item.nom])),
    [menuItems],
  );

  const loadData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const [menuResult, promoResult] = await Promise.all([
      supabase
        .from("menu_items")
        .select("id, nom")
        .eq("disponible", true)
        .is("deleted_at", null)
        .order("nom", { ascending: true }),
      supabase
        .from("promotions")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    if (menuResult.error) {
      alert("Erreur menu : " + menuResult.error.message);
    } else {
      setMenuItems(menuResult.data || []);
    }

    if (promoResult.error) {
      alert("Erreur promotions : " + promoResult.error.message);
    } else {
      setPromotions((promoResult.data || []) as Promotion[]);
    }

    if (showLoading) setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useAutoRefresh(() => loadData(false), { enabled: !saving });

  const createPromotion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const discountValue = Number(draft.discount_value);

    if (!draft.title.trim() || !Number.isFinite(discountValue) || discountValue <= 0) {
      alert("Veuillez saisir un titre et une reduction valide.");
      return;
    }

    if (draft.scope === "item" && !draft.menu_item_id) {
      alert("Veuillez choisir le plat concerne.");
      return;
    }

    if (draft.scope === "order" && !draft.code.trim()) {
      alert("Veuillez saisir un code promo.");
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from("promotions")
      .insert({
        title: draft.title.trim(),
        code: draft.scope === "order" ? draft.code.trim().toUpperCase() : null,
        scope: draft.scope,
        menu_item_id: draft.scope === "item" ? draft.menu_item_id : null,
        discount_type: draft.discount_type,
        discount_value: Math.round(discountValue),
        active: draft.active,
      })
      .select("*")
      .single();

    setSaving(false);

    if (error) {
      alert("Erreur lors de la creation : " + error.message);
      return;
    }

    setPromotions((current) => [data as Promotion, ...current]);
    setDraft(emptyDraft);
  };

  const togglePromotion = async (promotion: Promotion) => {
    const nextActive = !promotion.active;
    setPromotions((current) =>
      current.map((item) => (item.id === promotion.id ? { ...item, active: nextActive } : item)),
    );

    const { error } = await supabase
      .from("promotions")
      .update({ active: nextActive })
      .eq("id", promotion.id);

    if (error) {
      alert("Erreur de mise a jour : " + error.message);
      setPromotions((current) =>
        current.map((item) => (item.id === promotion.id ? promotion : item)),
      );
    }
  };

  const deletePromotion = async (promotion: Promotion) => {
    const confirmed = window.confirm(`Supprimer la promotion "${promotion.title}" ?`);
    if (!confirmed) return;

    const previousPromotions = promotions;
    setPromotions((current) => current.filter((item) => item.id !== promotion.id));

    const { error } = await supabase.from("promotions").delete().eq("id", promotion.id);

    if (error) {
      alert("Erreur de suppression : " + error.message);
      setPromotions(previousPromotions);
    }
  };

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Promotions" />

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-brand-500">Codes et reductions</p>
        <h1 className="mt-4 text-3xl font-semibold text-gray-900 dark:text-white/90">
          Gestion des promotions TaiTai
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-500 dark:text-gray-400">
          Creez une reduction automatique sur un plat ou un code promo a partager pour toute une commande.
        </p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">
            Nouvelle promotion
          </h3>
        </div>
        <form onSubmit={createPromotion} className="grid gap-4 p-5 sm:p-6 xl:grid-cols-6">
          <TextInput
            className="xl:col-span-2"
            placeholder="Titre de la promotion"
            value={draft.title}
            onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
          />
          <SelectInput
            value={draft.scope}
            onChange={(event) =>
              setDraft((current) => ({ ...current, scope: event.target.value as "item" | "order" }))
            }
          >
            <option value="item">Promo sur un plat</option>
            <option value="order">Code sur commande</option>
          </SelectInput>
          {draft.scope === "item" ? (
            <SelectInput
              value={draft.menu_item_id}
              onChange={(event) =>
                setDraft((current) => ({ ...current, menu_item_id: event.target.value }))
              }
            >
              <option value="">Choisir un plat</option>
              {menuItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nom}
                </option>
              ))}
            </SelectInput>
          ) : (
            <TextInput
              placeholder="Code ex: TAITAI10"
              value={draft.code}
              onChange={(event) => setDraft((current) => ({ ...current, code: event.target.value }))}
            />
          )}
          <SelectInput
            value={draft.discount_type}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                discount_type: event.target.value as "percent" | "fixed",
              }))
            }
          >
            <option value="percent">Pourcentage</option>
            <option value="fixed">Reduction fixe</option>
          </SelectInput>
          <div className="flex gap-3">
            <TextInput
              type="number"
              min={1}
              placeholder={draft.discount_type === "percent" ? "10" : "250"}
              value={draft.discount_value}
              onChange={(event) =>
                setDraft((current) => ({ ...current, discount_value: event.target.value }))
              }
            />
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 min-w-32 items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white transition hover:bg-brand-600 disabled:bg-brand-300"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusIcon className="h-4 w-4" />}
              Ajouter
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 px-5 py-5 dark:border-gray-800 sm:px-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white/90">
            Promotions actives et archivees
          </h3>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-9 w-9 animate-spin text-brand-500" />
          </div>
        ) : promotions.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Aucune promotion pour le moment.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {promotions.map((promotion) => (
              <div key={promotion.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
                    <Tag className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white/90">{promotion.title}</p>
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">
                        {formatDiscount(promotion)}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        promotion.active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                      }`}>
                        {promotion.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {promotion.scope === "item"
                        ? `Plat: ${menuById.get(promotion.menu_item_id || "") || "Plat supprime"}`
                        : `Code: ${promotion.code}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => togglePromotion(promotion)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    {promotion.active ? "Desactiver" : "Activer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePromotion(promotion)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
