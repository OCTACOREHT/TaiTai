import { Player, PlayerFormValues } from "@/types/club";

export const normalizePlayerFormValues = (
  values: PlayerFormValues,
): PlayerFormValues => ({
  photoUrl: (values.photoUrl || '').trim(),
  nom: (values.nom || '').trim(),
  prenom: (values.prenom || '').trim(),
  dateNaissance: (values.dateNaissance || '').trim(),
  poste: (values.poste || '').trim(),
  categorie: (values.categorie || '').trim(),
  statut: (values.statut || 'actif').trim(),
  telephone: (values.telephone || '').trim(),
  email: (values.email || '').trim(),
});

export const toPlayerFormValues = (player: Player): PlayerFormValues => ({
  ...normalizePlayerFormValues({
    photoUrl: player.photoUrl,
    nom: player.nom,
    prenom: player.prenom,
    dateNaissance: player.dateNaissance,
    poste: player.poste,
    categorie: player.categorie,
    statut: (player as any).statut || (player as any).status || 'actif',
    telephone: player.telephone,
    email: player.email,
  }),
});

export const createPlayerFromForm = (
  id: string,
  values: PlayerFormValues,
  dateInscription: string,
): Player => {
  const normalized = normalizePlayerFormValues(values);
  const avatar =
    normalized.photoUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      `${normalized.prenom} ${normalized.nom}`.trim() || "Nouveau Joueur",
    )}&background=0D8ABC&color=fff`;

  return {
    id,
    ...normalized,
    photoUrl: avatar,
    dateInscription,
    dateNaissance: normalized.dateNaissance || "",
    adresse: "",
    cotisationMontant: 0,
    cotisationStatut: "pending",
    dernierPaiement: dateInscription,
  } as Player;
};
