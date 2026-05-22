import { format } from "date-fns";

export const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : format(date, "dd MMM yyyy");
};

export const formatTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : format(date, "hh:mm a").toUpperCase();
};

export const formatDateTime = (value) => {
  if (!value) return "-";
  return `${formatDate(value)}, ${formatTime(value)}`;
};

export const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return `₹${amount.toFixed(2)}`;
};

export const getApiErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong. Please try again.";
