const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const request = async (path, options = {}) => {
  const { method = "GET", payload, token, raw = false } = options;
  const headers = {};

  if (!raw) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    ...(payload && { body: raw ? payload : JSON.stringify(payload) }),
  });

  if (path.includes("/export")) {
    if (!response.ok) throw new Error("Export failed");
    return response.text();
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

export const getVendorOverview = (token) => request("/vendor/overview", { token });
export const getParkingSlots = (parkingId, token) => request(`/vendor/parking/${parkingId}/slots`, { token });
export const createParkingSlot = (parkingId, payload, token) =>
  request(`/vendor/parking/${parkingId}/slots`, { method: "POST", payload, token });
export const updateParkingSlot = (parkingId, slotId, payload, token) =>
  request(`/vendor/parking/${parkingId}/slots/${slotId}`, { method: "PUT", payload, token });
export const deleteParkingSlot = (parkingId, slotId, token) =>
  request(`/vendor/parking/${parkingId}/slots/${slotId}`, { method: "DELETE", token });
export const getVendorBookings = (token, filters = {}) => {
  const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
  return request(`/vendor/bookings${params.toString() ? `?${params}` : ""}`, { token });
};
export const completeVendorBooking = (bookingId, token) =>
  request(`/vendor/bookings/${bookingId}/complete`, { method: "PUT", token });
export const cancelVendorBooking = (bookingId, reason, token) =>
  request(`/vendor/bookings/${bookingId}/cancel`, { method: "PUT", payload: { reason }, token });
export const exportVendorBookings = (token) => request("/vendor/bookings/export", { token });
export const getVendorAnalytics = (token, period = "weekly") =>
  request(`/vendor/analytics?period=${period}`, { token });
export const getCoupons = (token) => request("/vendor/coupons", { token });
export const createCoupon = (payload, token) => request("/vendor/coupons", { method: "POST", payload, token });
export const deleteCoupon = (couponId, token) => request(`/vendor/coupons/${couponId}`, { method: "DELETE", token });
export const getVendorProfile = (token) => request("/vendor/profile", { token });
export const saveVendorProfile = (payload, token) => request("/vendor/profile", { method: "PUT", payload, token });
export const getNotifications = (token) => request("/vendor/notifications", { token });
export const markNotificationRead = (notificationId, token) =>
  request(`/vendor/notifications/${notificationId}/read`, { method: "PUT", token });
