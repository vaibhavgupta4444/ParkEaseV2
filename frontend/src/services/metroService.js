import { request } from "./vendorService.js";

/**
 * Fetch nearby metro stations via backend proxy
 */
export async function fetchNearbyMetroStations(lat, lng, radiusMeters = 2000) {
  try {
    const response = await request(`/metro?latitude=${lat}&longitude=${lng}&radius=${radiusMeters}`);
    return response.data || [];
  } catch (error) {
    console.warn("Metro fetch failed:", error);
    return []; // gracefully fallback to empty
  }
}
