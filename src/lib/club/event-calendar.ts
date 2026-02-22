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
  if (type === "match") {
    return "Danger";
  }
  if (type === "entrainement") {
    return "Success";
  }
  return "Primary";
};

export const calendarColorClass = (color: EventCalendarColor) =>
  `fc-bg-${color.toLowerCase()}`;
