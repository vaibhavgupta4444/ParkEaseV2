const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/**
 * Generic request helper
 */
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

/**
 * Get nearby EV charging stations
 */
export const getNearbyChargingStations = (latitude, longitude, options = {}) => {
  const { radius = 5, chargerType, maxPrice, minRating = 0 } = options;
  const params = new URLSearchParams({
    latitude,
    longitude,
    radius,
    ...(chargerType && { chargerType }),
    ...(maxPrice && { maxPrice }),
    minRating,
  });

  return request(`/charging/nearby?${params.toString()}`);
};

/**
 * Get all charging stations with pagination
 */
export const getAllChargingStations = (options = {}) => {
  const { page = 1, limit = 10, chargerType, minRating = 0 } = options;
  const params = new URLSearchParams({
    page,
    limit,
    ...(chargerType && { chargerType }),
    minRating,
  });

  return request(`/charging/all?${params.toString()}`);
};

/**
 * Get charging stations owned by the logged-in vendor
 */
export const getMyChargingStations = (token) => {
  return request("/charging/mine", { token });
};

/**
 * Get charging station details
 */
export const getChargingStationDetails = (id) => {
  return request(`/charging/${id}`);
};

/**
 * Create a new charging station (admin/owner)
 */
export const createChargingStation = (stationData, token) => {
  return request("/charging", {
    method: "POST",
    payload: stationData,
    token,
  });
};

/**
 * Update charging station (owner only)
 */
export const updateChargingStation = (id, stationData, token) => {
  return request(`/charging/${id}`, {
    method: "PUT",
    payload: stationData,
    token,
  });
};

/**
 * Delete charging station (owner only)
 */
export const deleteChargingStation = (id, token) => {
  return request(`/charging/${id}`, {
    method: "DELETE",
    token,
  });
};

export default {
  getNearbyChargingStations,
  getAllChargingStations,
  getChargingStationDetails,
  getMyChargingStations,
  createChargingStation,
  updateChargingStation,
  deleteChargingStation,
};
