const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const handleTokenRefresh = async () => {
  const refreshToken = localStorage.getItem("vendor-refresh-token");
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    localStorage.removeItem("vendor-token");
    localStorage.removeItem("vendor-refresh-token");
    window.dispatchEvent(new Event("storage"));
    throw new Error("Session expired. Please log in again.");
  }

  const data = await res.json();
  localStorage.setItem("vendor-token", data.token);
  localStorage.setItem("vendor-refresh-token", data.refreshToken);
  window.dispatchEvent(new Event("storage"));
  return data.token;
};

export const request = async (path, options = {}) => {
  const { method = "GET", payload, token, raw = false } = options;
  const headers = {};

  if (!raw) {
    headers["Content-Type"] = "application/json";
  }

  const activeToken = localStorage.getItem("vendor-token") || token;
  if (activeToken) {
    headers.Authorization = `Bearer ${activeToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    ...(payload && { body: raw ? payload : JSON.stringify(payload) }),
  });

  if (response.status === 401 && !path.includes("/auth/login") && !path.includes("/auth/refresh")) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newAccessToken = await handleTokenRefresh();
        isRefreshing = false;
        onRefreshed(newAccessToken);
      } catch (err) {
        isRefreshing = false;
        refreshSubscribers = [];
        throw err;
      }
    }

    return new Promise((resolve, reject) => {
      subscribeTokenRefresh((newToken) => {
        headers.Authorization = `Bearer ${newToken}`;
        fetch(`${API_BASE_URL}${path}`, {
          method,
          headers,
          ...(payload && { body: raw ? payload : JSON.stringify(payload) }),
        })
          .then(async (res) => {
            try {
              if (path.includes("/export")) {
                if (!res.ok) throw new Error("Export failed");
                resolve(await res.text());
                return;
              }
              const data = await res.json();
              if (!res.ok) {
                reject(new Error(data.message || "Request failed"));
              } else {
                resolve(data);
              }
            } catch (err) {
              reject(err);
            }
          })
          .catch((err) => reject(err));
      });
    });
  }

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
export const getFacilitySlots = (type, id, token) => request(`/vendor/${type}/${id}/slots`, { token });
export const createFacilitySlot = (type, id, payload, token) => request(`/vendor/${type}/${id}/slots`, { method: "POST", payload, token });
export const updateFacilitySlot = (type, id, slotId, payload, token) => request(`/vendor/${type}/${id}/slots/${slotId}`, { method: "PUT", payload, token });
export const deleteFacilitySlot = (type, id, slotId, token) => request(`/vendor/${type}/${id}/slots/${slotId}`, { method: "DELETE", token });
export const updateParkingPricing = (parkingId, payload, token) => request(`/vendor/parking/${parkingId}/pricing`, { method: "PUT", payload, token });
export const getVendorBookings = (token, filters = {}) => {
  const params = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
  return request(`/vendor/bookings${params.toString() ? `?${params}` : ""}`, { token });
};
export const completeVendorBooking = (bookingId, token) => request(`/vendor/bookings/${bookingId}/complete`, { method: "PUT", token });
export const cancelVendorBooking = (bookingId, reason, token) => request(`/vendor/bookings/${bookingId}/cancel`, { method: "PUT", payload: { reason }, token });
export const exportVendorBookings = (token) => request("/vendor/bookings/export", { token });
export const getVendorAnalytics = (token, period = "weekly") => request(`/vendor/analytics?period=${period}`, { token });
export const getCoupons = (token) => request("/vendor/coupons", { token });
export const createCoupon = (payload, token) => request("/vendor/coupons", { method: "POST", payload, token });
export const deleteCoupon = (couponId, token) => request(`/vendor/coupons/${couponId}`, { method: "DELETE", token });
export const getVendorProfile = (token) => request("/vendor/profile", { token });
export const saveVendorProfile = (payload, token) => request("/vendor/profile", { method: "PUT", payload, token });
export const getNotifications = (token) => request("/vendor/notifications", { token });
export const markNotificationRead = (notificationId, token) => request(`/vendor/notifications/${notificationId}/read`, { method: "PUT", token });
