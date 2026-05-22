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

export const getMyParkingLots = (token) => request("/parking/mine", { token });
export const createParkingLot = (parkingLotData, token) => request("/parking", { method: "POST", payload: parkingLotData, token });
export const updateParkingLot = (id, parkingLotData, token) => request(`/parking/${id}`, { method: "PUT", payload: parkingLotData, token });
export const deleteParkingLot = (id, token) => request(`/parking/${id}`, { method: "DELETE", token });
