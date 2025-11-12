import { URGENCY_COLORS } from "../Constants/UrgencyColors";

export const getUrgencyColor = (urgency: number) => {
  if (urgency >= 1) return URGENCY_COLORS.gray;
  if (urgency >= 0.9) return URGENCY_COLORS.bright_red;
  if (urgency >= 0.8) return URGENCY_COLORS.red;
  if (urgency >= 0.7) return URGENCY_COLORS.orange;
  if (urgency >= 0.6) return URGENCY_COLORS.yellow;

  return URGENCY_COLORS.bright_green;
};
