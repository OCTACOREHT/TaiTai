import { EventType, PaymentStatus, PlayerStatus } from "@/types/club";

export const playerStatusLabel: Record<PlayerStatus, string> = {
  actif: "Actif",
  blesse: "Blesse",
  suspendu: "Suspendu",
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  paid: "Paye",
  pending: "En attente",
  late: "En retard",
};

export const eventTypeLabel: Record<EventType, string> = {
  match: "Match",
  entrainement: "Entrainement",
  reunion: "Reunion",
};

export const colorFromPlayerStatus = (
  status: PlayerStatus,
): "success" | "warning" | "error" => {
  if (status === "actif") {
    return "success";
  }
  if (status === "blesse") {
    return "warning";
  }
  return "error";
};

export const colorFromPaymentStatus = (
  status: PaymentStatus,
): "success" | "warning" | "error" => {
  if (status === "paid") {
    return "success";
  }
  if (status === "pending") {
    return "warning";
  }
  return "error";
};

export const colorFromEventType = (
  type: EventType,
): "primary" | "warning" | "info" => {
  if (type === "match") {
    return "primary";
  }
  if (type === "entrainement") {
    return "warning";
  }
  return "info";
};
