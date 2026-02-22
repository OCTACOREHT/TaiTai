"use client";

import { FormEvent, useEffect, useState } from "react";
import { ParentFormValues, Player } from "@/types/club";
import { getPlayerFullName } from "@/lib/club/metrics";

interface ParentFormProps {
  players: Player[];
  initialValues?: Partial<ParentFormValues>;
  onSubmit: (values: ParentFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
}

const inputClassName =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const selectClassName =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const defaultValues: ParentFormValues = {
  nom: "",
  prenom: "",
  telephone: "",
  email: "",
  lien: "Pere",
  playerId: "",
};

export default function ParentForm({
  players,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Enregistrer",
}: ParentFormProps) {
  const [formValues, setFormValues] = useState<ParentFormValues>({
    ...defaultValues,
    playerId: players[0]?.id ?? "",
    ...initialValues,
  });

  useEffect(() => {
    setFormValues({
      ...defaultValues,
      playerId: players[0]?.id ?? "",
      ...initialValues,
    });
  }, [initialValues, players]);

  const updateField = <K extends keyof ParentFormValues>(
    key: K,
    value: ParentFormValues[K],
  ) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(formValues);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Nom
          </label>
          <input
            required
            value={formValues.nom}
            onChange={(event) => updateField("nom", event.target.value)}
            className={inputClassName}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Prenom
          </label>
          <input
            required
            value={formValues.prenom}
            onChange={(event) => updateField("prenom", event.target.value)}
            className={inputClassName}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Telephone
          </label>
          <input
            value={formValues.telephone}
            onChange={(event) => updateField("telephone", event.target.value)}
            className={inputClassName}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Email
          </label>
          <input
            required
            type="email"
            value={formValues.email}
            onChange={(event) => updateField("email", event.target.value)}
            className={inputClassName}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Lien avec le joueur
          </label>
          <select
            value={formValues.lien}
            onChange={(event) => updateField("lien", event.target.value)}
            className={selectClassName}
          >
            <option value="Pere">Pere</option>
            <option value="Mere">Mere</option>
            <option value="Tuteur">Tuteur</option>
            <option value="Tutrice">Tutrice</option>
          </select>
        </div>
        <div className="xl:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Joueur associe
          </label>
          <select
            value={formValues.playerId}
            onChange={(event) => updateField("playerId", event.target.value)}
            className={selectClassName}
          >
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {getPlayerFullName(player)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
