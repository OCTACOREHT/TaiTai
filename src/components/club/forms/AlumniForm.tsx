"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlumniFormValues } from "@/types/club";

interface AlumniFormProps {
  initialValues?: Partial<AlumniFormValues>;
  onSubmit: (values: AlumniFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
}

const inputClassName =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const defaultValues: AlumniFormValues = {
  nom: "",
  anneeEntree: 2018,
  anneeSortie: 2023,
  poste: "",
  situationActuelle: "",
};

export default function AlumniForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Enregistrer",
}: AlumniFormProps) {
  const [formValues, setFormValues] = useState<AlumniFormValues>({
    ...defaultValues,
    ...initialValues,
  });

  useEffect(() => {
    setFormValues({
      ...defaultValues,
      ...initialValues,
    });
  }, [initialValues]);

  const updateField = <K extends keyof AlumniFormValues>(
    key: K,
    value: AlumniFormValues[K],
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
        <div className="md:col-span-2 xl:col-span-3">
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
            Annee d&apos;entree
          </label>
          <input
            type="number"
            min={1990}
            max={2100}
            value={formValues.anneeEntree}
            onChange={(event) =>
              updateField("anneeEntree", Number(event.target.value))
            }
            className={inputClassName}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Annee de sortie
          </label>
          <input
            type="number"
            min={1990}
            max={2100}
            value={formValues.anneeSortie}
            onChange={(event) =>
              updateField("anneeSortie", Number(event.target.value))
            }
            className={inputClassName}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Poste
          </label>
          <input
            value={formValues.poste}
            onChange={(event) => updateField("poste", event.target.value)}
            className={inputClassName}
          />
        </div>
        <div className="xl:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Situation actuelle
          </label>
          <input
            value={formValues.situationActuelle}
            onChange={(event) =>
              updateField("situationActuelle", event.target.value)
            }
            className={inputClassName}
          />
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
