export const UNIT_TYPES = ["STUDIO", "1BR", "2BR"] as const;
export type UnitType = (typeof UNIT_TYPES)[number];
export const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  STUDIO: "Studio",
  "1BR": "1BR",
  "2BR": "2BR",
};

export const PAYMENT_STATUS_LABELS = {
  IN_PROGRESS: "In progress",
  PAID_OFF: "Paid off",
} as const;

export const LEAD_STATUS_LABELS = {
  NEW: "New",
  CONVERTED: "Converted",
} as const;
