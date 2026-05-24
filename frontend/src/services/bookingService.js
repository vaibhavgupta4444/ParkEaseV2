import { request } from "./vendorService.js";

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

export const getBookingById = (bookingId, token) =>
  request(`/bookings/${bookingId}`, { token });

export const getBookingNavigation = (bookingId, token) =>
  request(`/bookings/${bookingId}/navigate`, { token });

export default {
  createBooking,
  getBookingHistory,
  cancelBooking,
  getBookingById,
  getBookingNavigation,
};
