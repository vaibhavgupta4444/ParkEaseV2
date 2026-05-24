const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getHeaders = () => {
  const token = localStorage.getItem("admin_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

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
  const refreshToken = localStorage.getItem("admin_refresh_token");
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const res = await window.fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_refresh_token");
    window.dispatchEvent(new Event("admin-logout"));
    throw new Error("Session expired. Please log in again.");
  }

  const data = await res.json();
  localStorage.setItem("admin_token", data.token);
  localStorage.setItem("admin_refresh_token", data.refreshToken);
  return data.token;
};

const customFetch = async (url, options = {}) => {
  options.headers = {
    ...getHeaders(),
    ...options.headers,
  };

  let response = await window.fetch(url, options);

  if (response.status === 401 && !url.includes("/auth/login") && !url.includes("/auth/refresh")) {
    if (!isRefreshing) {
      isRefreshing = true;
      handleTokenRefresh()
        .then((newAccessToken) => {
          isRefreshing = false;
          onRefreshed(newAccessToken);
        })
        .catch((err) => {
          isRefreshing = false;
          onRefreshed(null); // Notify subscribers of failure
        });
    }

    return new Promise((resolve, reject) => {
      subscribeTokenRefresh((newToken) => {
        if (!newToken) return reject(new Error("Token refresh failed"));
        options.headers["Authorization"] = `Bearer ${newToken}`;
        window.fetch(url, options)
          .then((res) => resolve(res))
          .catch((err) => reject(err));
      });
    });
  }

  return response;
};

const fetch = customFetch;

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
};

export const api = {
  // Authentication
  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  getCurrentUser: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Dashboard / Summary Stats
  getSummary: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/summary`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // User Management
  getUsers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/admin/users?${query}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getUserDetails: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  suspendUser: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}/suspend`, {
      method: "PUT",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  reactivateUser: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}/reactivate`, {
      method: "PUT",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  changeUserRole: async (id, role) => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}/role`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ role }),
    });
    return handleResponse(res);
  },

  deleteUser: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Vendor Management
  getVendors: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/vendors`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getVendorDetails: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/vendors/${id}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getPendingVendors: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/vendors/pending`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  approveVendor: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/vendors/${id}/approve`, {
      method: "PUT",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  rejectVendor: async (id, reason) => {
    const res = await fetch(`${API_BASE_URL}/admin/vendors/${id}/reject`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ reason }),
    });
    return handleResponse(res);
  },

  suspendVendor: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/vendors/${id}/suspend`, {
      method: "PUT",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  reactivateVendor: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/vendors/${id}/reactivate`, {
      method: "PUT",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  revokeVendorVerification: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/vendors/${id}/revoke-verification`, {
      method: "PUT",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Facility Management
  getFacilities: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/facilities`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getFacilityDetails: async (id, type) => {
    const res = await fetch(`${API_BASE_URL}/admin/facilities/details?id=${id}&type=${type}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  suspendFacility: async (id, type) => {
    const res = await fetch(`${API_BASE_URL}/admin/facilities/suspend`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ id, type }),
    });
    return handleResponse(res);
  },

  restoreFacility: async (id, type) => {
    const res = await fetch(`${API_BASE_URL}/admin/facilities/restore`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ id, type }),
    });
    return handleResponse(res);
  },

  deleteFacility: async (id, type) => {
    const res = await fetch(`${API_BASE_URL}/admin/facilities?id=${id}&type=${type}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Booking Moderation
  getBookings: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/bookings`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getBookingDetails: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/bookings/${id}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  forceCancelBooking: async (id, reason) => {
    const res = await fetch(`${API_BASE_URL}/admin/bookings/${id}/force-cancel`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ reason }),
    });
    return handleResponse(res);
  },

  manuallyCompleteBooking: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/bookings/${id}/complete`, {
      method: "PUT",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Revenue & Financials
  getRevenueSummary: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/revenue/summary`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getRevenueCharts: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/revenue/charts`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getTransactions: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/transactions`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getRefunds: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/refunds`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  manuallyTriggerRefund: async (bookingId, amount, reason) => {
    const res = await fetch(`${API_BASE_URL}/admin/refunds/manual`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ bookingId, amount, reason }),
    });
    return handleResponse(res);
  },

  // Review Moderation
  getReviews: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/reviews`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getReportedReviews: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/reviews/reported`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  hideReview: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/reviews/${id}/hide`, {
      method: "PUT",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  restoreReview: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/reviews/${id}/restore`, {
      method: "PUT",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  deleteReview: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/reviews/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  dismissReviewReport: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/reviews/${id}/dismiss-report`, {
      method: "PUT",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Support Tickets
  getSupportTickets: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/support`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getTicketDetails: async (id) => {
    const res = await fetch(`${API_BASE_URL}/admin/support/${id}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  replyToTicket: async (id, message) => {
    const res = await fetch(`${API_BASE_URL}/admin/support/${id}/reply`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ message }),
    });
    return handleResponse(res);
  },

  updateTicketStatus: async (id, status) => {
    const res = await fetch(`${API_BASE_URL}/admin/support/${id}/status`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  // Global settings
  getSettings: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updateSettings: async (settings) => {
    const res = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(settings),
    });
    return handleResponse(res);
  },

  toggleMaintenance: async (maintenanceMode, maintenanceMessage) => {
    const res = await fetch(`${API_BASE_URL}/admin/settings/maintenance`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ maintenanceMode, maintenanceMessage }),
    });
    return handleResponse(res);
  },

  // Audit Logs
  getAuditLogs: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/audit-logs`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Admin Notifications
  getAdminNotifications: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/notifications`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
