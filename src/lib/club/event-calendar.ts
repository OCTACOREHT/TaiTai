import { EventCalendarColor, EventType } from "@/types/club";

export const calendarColors: EventCalendarColor[] = [
  "Danger",
  "Success",
  "Primary",
  "Warning",
];

export const calendarColorToType: Record<EventCalendarColor, EventType> = {
  Danger: "match",
  Success: "entrainement",
  Primary: "reunion",
  Warning: "entrainement",
};

export const eventTypeToCalendarColor = (
  type: EventType,
): EventCalendarColor => {
  if (type === "match" || type === "live_diffusion") {
    return "Danger";
  }
  if (type === "entrainement" || type === "vertieres_cup" || type === "flag_day") {
    return "Success";
  }
  if (type === "intrasquad" || type === "international") {
    return "Warning";
  }
  return "Primary";
};

export const calendarColorClass = (color: EventCalendarColor) =>
  `fc-bg-${color.toLowerCase()}`;
