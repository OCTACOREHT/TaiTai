"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { PaymentStatus, PlayerFormValues, PlayerStatus } from "@/types/club";
import { normalizePlayerFormValues } from "@/lib/club/player-form";

interface PlayerFormProps {
  initialValues?: Partial<PlayerFormValues>;
  categories?: string[];
  onSubmit: (values: PlayerFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
}

const inputClassName =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const selectClassName =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const defaultValues: PlayerFormValues = {
  photoUrl: "",
  nom: "",
  prenom: "",
  dateNaissance: "",
  poste: "",
  categorie: "U15",
  telephone: "",
  email: "",
  adresse: "",
  statut: "actif",
  cotisationMontant: 180,
  cotisationStatut: "pending",
};

export default function PlayerForm({
  initialValues,
  categories = ["U15", "U17", "Senior"],
  onSubmit,
  onCancel,
  submitLabel = "Enregistrer",
}: PlayerFormProps) {
  const [formValues, setFormValues] = useState<PlayerFormValues>({
    ...defaultValues,
    ...initialValues,
  });

  useEffect(() => {
    setFormValues({
      ...defaultValues,
      ...initialValues,
    });
  }, [initialValues]);

  const fullNameSeed = useMemo(
    () => `${formValues.prenom} ${formValues.nom}`.trim() || "Nouveau Joueur",
    [formValues.nom, formValues.prenom],
  );

  const updateField = <K extends keyof PlayerFormValues>(
    key: K,
    value: PlayerFormValues[K],
  ) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(normalizePlayerFormValues(formValues));
  };

  const assignGeneratedAvatar = (provider: "dicebear" | "ui-avatars") => {
    if (provider === "dicebear") {
      updateField(
        "photoUrl",
        `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(
          fullNameSeed,
        )}`,
      );
      return;
    }

    updateField(
      "photoUrl",
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        fullNameSeed,
      )}&background=0D8ABC&color=fff`,
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="md:col-span-2 xl:col-span-3">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Photo (URL)
          </label>
          <input
            value={formValues.photoUrl}
            onChange={(event) => updateField("photoUrl", event.target.value)}
            placeholder="https://..."
            className={inputClassName}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              onClick={() => assignGeneratedAvatar("dicebear")}
            >
              Avatar DiceBear
            </button>
            <button
              type="button"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              onClick={() => assignGeneratedAvatar("ui-avatars")}
            >
              Avatar Initiales
            </button>
            <input
              type="file"
              className="block text-xs text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-xs file:font-medium file:text-gray-700 hover:file:bg-gray-200 dark:text-gray-400 dark:file:bg-gray-800 dark:file:text-gray-300"
            />
          </div>
        </div>

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
            Date de naissance
          </label>
          <input
            required
            type="date"
            value={formValues.dateNaissance}
            onChange={(event) => updateField("dateNaissance", event.target.value)}
            className={inputClassName}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Poste
          </label>
          <input
            required
            value={formValues.poste}
            onChange={(event) => updateField("poste", event.target.value)}
            className={inputClassName}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Categorie
          </label>
          <select
            value={formValues.categorie}
            onChange={(event) => updateField("categorie", event.target.value)}
            className={selectClassName}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
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

        <div className="md:col-span-2 xl:col-span-3">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Adresse
          </label>
          <input
            value={formValues.adresse}
            onChange={(event) => updateField("adresse", event.target.value)}
            className={inputClassName}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Statut
          </label>
          <select
            value={formValues.statut}
            onChange={(event) =>
              updateField("statut", event.target.value as PlayerStatus)
            }
            className={selectClassName}
          >
            <option value="actif">Actif</option>
            <option value="blesse">Blesse</option>
            <option value="suspendu">Suspendu</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Montant cotisation (EUR)
          </label>
          <input
            type="number"
            min={0}
            value={formValues.cotisationMontant}
            onChange={(event) =>
              updateField("cotisationMontant", Number(event.target.value))
            }
            className={inputClassName}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Statut paiement
          </label>
          <select
            value={formValues.cotisationStatut}
            onChange={(event) =>
              updateField("cotisationStatut", event.target.value as PaymentStatus)
            }
            className={selectClassName}
          >
            <option value="paid">Paye</option>
            <option value="pending">En attente</option>
            <option value="late">En retard</option>
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
