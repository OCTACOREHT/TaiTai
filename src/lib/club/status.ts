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
  live_diffusion: "Live Diffusion",
  vertieres_cup: "Vertieres Cup",
  flag_day: "Flag Day",
  intrasquad: "Intrasquad",
  international: "International",
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
): "primary" | "warning" | "info" | "success" | "error" => {
  if (type === "match" || type === "live_diffusion") {
    return "error";
  }
  if (type === "entrainement" || type === "vertieres_cup" || type === "flag_day") {
    return "success";
  }
  if (type === "intrasquad" || type === "international") {
    return "warning";
  }
  return "info";
};
