"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";

const inputClassName = "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClassName = "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400";

export default function EliteForm({ initialData = null, playerId = null }: { initialData?: any, playerId?: string | null }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    no: initialData?.number || initialData?.no || "",
    nom: initialData?.last_name || initialData?.nom || "",
    prenom: initialData?.first_name || initialData?.prenom || "",
    poste: initialData?.position || initialData?.poste || "",
    club: initialData?.club || "",
    poids: initialData?.weight || initialData?.poids || "",
    hauteur: initialData?.height || initialData?.hauteur || "",
    videoUrl: initialData?.video_url || initialData?.videoUrl || "",
    photoUrl: initialData?.photo_url || initialData?.photoUrl || "",
  });

  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoError("Selectionnez un fichier image valide.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result !== "string") {
        setPhotoError("Impossible de charger l'image.");
        return;
      }
      
      const img = new globalThis.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        
        const MAX_SIZE = 1600;
        if (width > height && width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        
        if (ctx) {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
        }
        
        const compressedDataUrl = canvas.toDataURL("image/webp", 0.95);
        
        updateField("photoUrl", compressedDataUrl);
        setSelectedFileName(file.name);
        setPhotoError(null);
      };
      
      img.onerror = () => {
        setPhotoError("Fichier d'image corrompu.");
      };
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      setPhotoError("Impossible de lire ce fichier.");
    };
    reader.readAsDataURL(file);
  };

  const handleVideoFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/mp4")) {
      alert("Seules les vidéos MP4 sont acceptées.");
      return;
    }

    setIsUploadingVideo(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await fetch("/api/club/elite/upload", {
        method: "POST",
        body: uploadData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur upload");

      updateField("videoUrl", json.data.url);
      alert("Vidéo chargée avec succès !");
    } catch (e: any) {
      alert("Erreur: " + e.message);
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.photoUrl) {
      alert("La photo du joueur est obligatoire.");
      return;
    }
    setIsSubmitting(true);

    try {
      const dbPayload = {
        number: formData.no,
        first_name: formData.prenom,
        last_name: formData.nom,
        position: formData.poste,
        club: formData.club,
        weight: formData.poids,
        height: formData.hauteur,
        photo_url: formData.photoUrl,
        video_url: formData.videoUrl,
      };

      const endpoint = playerId ? `/api/club/elite/${playerId}` : "/api/club/elite";
      const method = playerId ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: dbPayload }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Erreur de sauvegarde");
      }

      alert(playerId ? "Joueur modifié avec succès !" : "Joueur enregistré avec succès !");
      router.push("/club/elite");
      router.refresh();
      
    } catch (error: any) {
      alert(error.message || "Impossible de sauvegarder.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className={labelClassName}>Photo du Joueur (Fond détruit/uni recommandé)</label>
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-gray-300 p-6 sm:flex-row dark:border-white/10">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5">
            {formData.photoUrl ? (
              <Image
                src={formData.photoUrl}
                alt="Aperçu"
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                Aucune
              </div>
            )}
          </div>
          
          <div className="flex flex-1 flex-col justify-center">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handlePhotoFileChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openFileDialog}
              className="w-max"
            >
              Choisir une photo
            </Button>
            {selectedFileName && (
              <p className="mt-2 text-xs text-gray-500">{selectedFileName}</p>
            )}
            {photoError && (
              <p className="mt-2 text-xs font-medium text-red-500">
                {photoError}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className={labelClassName}>No (Numéro)</label>
          <input
            className={inputClassName}
            required
            value={formData.no}
            onChange={(e) => updateField("no", e.target.value)}
            type="number"
            min="0"
            placeholder="Ex: 10"
          />
        </div>
        <div>
          <label className={labelClassName}>Nom</label>
          <input
            className={inputClassName}
            required
            value={formData.nom}
            onChange={(e) => updateField("nom", e.target.value)}
            type="text"
            placeholder="Ex: WENDY"
          />
        </div>
        <div>
          <label className={labelClassName}>Prénom</label>
          <input
            className={inputClassName}
            required
            value={formData.prenom}
            onChange={(e) => updateField("prenom", e.target.value)}
            type="text"
            placeholder="Ex: PIERRE"
          />
        </div>
        <div>
          <label className={labelClassName}>Poste</label>
          <input
            className={inputClassName}
            required
            value={formData.poste}
            onChange={(e) => updateField("poste", e.target.value)}
            type="text"
            placeholder="Ex: MILIEU DEFENSIF"
          />
        </div>
        <div>
          <label className={labelClassName}>Club Actuel</label>
          <input
            className={inputClassName}
            required
            value={formData.club}
            onChange={(e) => updateField("club", e.target.value)}
            type="text"
            placeholder="Ex: FC TORO"
          />
        </div>
        <div>
          <label className={labelClassName}>Poids</label>
          <input
            className={inputClassName}
            required
            value={formData.poids}
            onChange={(e) => updateField("poids", e.target.value)}
            type="text"
            placeholder="Ex: 58KG"
          />
        </div>
        <div>
          <label className={labelClassName}>Hauteur</label>
          <input
            className={inputClassName}
            required
            value={formData.hauteur}
            onChange={(e) => updateField("hauteur", e.target.value)}
            type="text"
            placeholder="Ex: 1M30"
          />
        </div>
        <div>
          <label className={labelClassName}>Vidéo (.MP4) (Optionnel)</label>
          <input
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-900/20 dark:file:text-brand-400"
            type="file"
            accept="video/mp4"
            onChange={handleVideoFileChange}
            disabled={isUploadingVideo}
          />
          {isUploadingVideo && <p className="mt-1 text-xs text-brand-500">Upload en cours...</p>}
          {formData.videoUrl && <p className="mt-1 text-xs text-green-500">Vidéo prête ! ({formData.videoUrl})</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-gray-100 pt-6 dark:border-white/10">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/club/elite")}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : "Enregistrer Joueur"}
        </Button>
      </div>
    </form>
  );
}
