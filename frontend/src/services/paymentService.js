const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const request = async (path, options = {}) => {
  const { method = "POST", payload, token } = options;
  const headers = { "Content-Type": "application/json" };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || "Payment request failed");
  }

  return data;
};

export const createPaymentOrder = (bookingId, token) =>
  request("/payments/create-order", {
    payload: { bookingId },
    token,
  });

export const verifyPayment = ({ bookingId, paymentIntentId }, token) =>
  request("/payments/verify", {
    payload: { bookingId, paymentIntentId },
    token,
  });

export const getPaymentTransactions = (token) =>
  request("/payments/transactions", {
    method: "GET",
    token,
  });
