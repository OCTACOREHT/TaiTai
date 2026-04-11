"use client";

import { FormEvent, useEffect, useState, useRef } from "react";
import { StaffFormValues, StaffRole } from "@/types/club";

interface StaffFormProps {
  initialValues?: Partial<StaffFormValues>;
  onSubmit: (values: StaffFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
}

const inputClassName =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const selectClassName =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const defaultValues: StaffFormValues = {
  photoUrl: "",
  nom: "",
  role: "Coach",
  telephone: "",
  email: "",
  dateDebut: "",
};

export default function StaffForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = "Enregistrer",
}: StaffFormProps) {
  const [formValues, setFormValues] = useState<StaffFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [selectedFileName, setSelectedFileName] = useState("");
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setFormValues({
      ...defaultValues,
      ...initialValues,
    });
    setSelectedFileName("");
    setPhotoError(null);
  }, [initialValues]);

  const updateField = <K extends keyof StaffFormValues>(
    key: K,
    value: StaffFormValues[K],
  ) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(formValues);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setPhotoError("Selectionnez un fichier image valide.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setPhotoError("Impossible de charger l'image.");
        return;
      }
      updateField("photoUrl", reader.result);
      setSelectedFileName(file.name);
      setPhotoError(null);
    };
    reader.onerror = () => {
      setPhotoError("Impossible de lire ce fichier.");
    };
    reader.readAsDataURL(file);
  };

  const roleOptions: StaffRole[] = ["Coach", "Assistant", "Admin", "Medical"];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-4 mb-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-400">
          Photo du Staff
        </label>
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
            {formValues.photoUrl ? (
              <img
                src={formValues.photoUrl}
                alt="preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
          </div>
          <div>
            <div className="flex flex-col gap-2 relative">
              <input
                type="hidden"
                value={formValues.photoUrl}
                name="photoUrl"
              />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handlePhotoFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={openFileDialog}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Choisir une image
              </button>
            </div>
            {selectedFileName && (
              <p className="mt-1 text-xs text-brand-600 dark:text-brand-400">
                Fichier: {selectedFileName}
              </p>
            )}
            {photoError && (
              <p className="mt-1 text-xs text-error-600">{photoError}</p>
            )}
          </div>
        </div>
      </div>

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
            Role
          </label>
          <select
            value={formValues.role}
            onChange={(event) =>
              updateField("role", event.target.value as StaffRole)
            }
            className={selectClassName}
          >
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Date de debut
          </label>
          <input
            required
            type="date"
            value={formValues.dateDebut}
            onChange={(event) => updateField("dateDebut", event.target.value)}
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
