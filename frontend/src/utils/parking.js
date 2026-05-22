export const getAvailabilityColor = (percentage) => {
  if (percentage > 50) return "#10b981";
  if (percentage > 20) return "#f59e0b";
  return "#ef4444";
};

export const calculateBookingTotal = (pricePerHour, duration) =>
  Math.round(pricePerHour * duration * 1.1);
