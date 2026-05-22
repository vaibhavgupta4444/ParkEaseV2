const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const request = async (path, options = {}) => {
  const { method = "GET", payload, token } = options;
  const headers = { "Content-Type": "application/json" };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

export const getMyChargingStations = (token) => request("/charging/mine", { token });
export const createChargingStation = (stationData, token) => request("/charging", { method: "POST", payload: stationData, token });
export const updateChargingStation = (id, stationData, token) => request(`/charging/${id}`, { method: "PUT", payload: stationData, token });
export const deleteChargingStation = (id, token) => request(`/charging/${id}`, { method: "DELETE", token });
