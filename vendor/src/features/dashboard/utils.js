export const toList = (value) =>
  Array.isArray(value)
    ? value
    : value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

export const toText = (items) => (Array.isArray(items) ? items.join(", ") : "");

export const formatAddress = (location) =>
  [location?.address?.street, location?.address?.city, location?.address?.state, location?.address?.zipCode]
    .filter(Boolean)
    .join(", ");

export const formatCurrency = (amount) => `₹ ${Number(amount || 0).toFixed(2)}`;

export const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const formattedDate = formatDate(value);
  const formattedTime = new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  return `${formattedDate}, ${formattedTime}`;
};

export const durationHours = (booking) => {
  const hours = (new Date(booking.endTime) - new Date(booking.startTime)) / 36e5;
  return `${Math.max(hours, 0).toFixed(1)}h`;
};

export const getMapCenter = (lat, lng) => {
  const parsedLat = Number(lat);
  const parsedLng = Number(lng);
  return !Number.isNaN(parsedLat) && !Number.isNaN(parsedLng) && lat !== "" && lng !== ""
    ? [parsedLat, parsedLng]
    : [26.283, 82.0734];
};
