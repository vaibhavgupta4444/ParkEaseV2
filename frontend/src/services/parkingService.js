import { request } from "./vendorService.js";

/**
 * Get nearby parking lots
 */
export const getNearbyParkingLots = (latitude, longitude, options = {}) => {
  const { radius = 5, maxPrice, minRating = 0 } = options;
  const params = new URLSearchParams({
    latitude,
    longitude,
    radius,
    ...(maxPrice && { maxPrice }),
    minRating,
  });

  return request(`/parking/nearby?${params.toString()}`);
};

/**
 * Get all parking lots with pagination
 */
export const getAllParkingLots = (options = {}) => {
  const { page = 1, limit = 10, minRating = 0 } = options;
  const params = new URLSearchParams({
    page,
    limit,
    minRating,
  });

  return request(`/parking/all?${params.toString()}`);
};

/**
 * Get parking lots owned by the logged-in vendor
 */
export const getMyParkingLots = (token) => {
  return request("/parking/mine", { token });
};

/**
 * Get parking lot details
 */
export const getParkingLotDetails = (id) => {
  return request(`/parking/${id}`);
};

/**
 * Create a new parking lot (admin/owner)
 */
export const createParkingLot = (parkingLotData, token) => {
  return request("/parking", {
    method: "POST",
    payload: parkingLotData,
    token,
  });
};

/**
 * Update parking lot (owner only)
 */
export const updateParkingLot = (id, parkingLotData, token) => {
  return request(`/parking/${id}`, {
    method: "PUT",
    payload: parkingLotData,
    token,
  });
};

/**
 * Delete parking lot (owner only)
 */
export const deleteParkingLot = (id, token) => {
  return request(`/parking/${id}`, {
    method: "DELETE",
    token,
  });
};

export default {
  getNearbyParkingLots,
  getAllParkingLots,
  getParkingLotDetails,
  getMyParkingLots,
  createParkingLot,
  updateParkingLot,
  deleteParkingLot,
};
