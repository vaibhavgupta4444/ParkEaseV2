const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const request = async (path, options = {}) => {
  const { method = "GET", payload, token } = options;

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (payload) {
    config.body = JSON.stringify(payload);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const createBooking = (payload, token) =>
  request("/bookings", {
    method: "POST",
    payload,
    token,
  });

export const getBookingHistory = (token) =>
  request("/bookings/me", {
    token,
  });

export const cancelBooking = (bookingId, token) =>
  request(`/bookings/${bookingId}`, {
    method: "DELETE",
    token,
  });

export default {
  createBooking,
  getBookingHistory,
  cancelBooking,
};
