import { request } from "./vendorService.js";

export const getMyChargingStations = (token) => request("/charging/mine", { token });
export const createChargingStation = (stationData, token) => request("/charging", { method: "POST", payload: stationData, token });
export const updateChargingStation = (id, stationData, token) => request(`/charging/${id}`, { method: "PUT", payload: stationData, token });
export const deleteChargingStation = (id, token) => request(`/charging/${id}`, { method: "DELETE", token });
