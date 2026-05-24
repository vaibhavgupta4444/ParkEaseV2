import { request } from "./vendorService.js";

export const createPaymentOrder = (bookingId, token) =>
  request("/payments/create-order", {
    method: "POST",
    payload: { bookingId },
    token,
  });

export const verifyPayment = ({ bookingId, paymentIntentId }, token) =>
  request("/payments/verify", {
    method: "POST",
    payload: { bookingId, paymentIntentId },
    token,
  });

export const getPaymentTransactions = (token) =>
  request("/payments/transactions", {
    method: "GET",
    token,
  });
