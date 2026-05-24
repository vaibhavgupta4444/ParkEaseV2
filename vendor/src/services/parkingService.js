import { request } from "./vendorService.js";

export const getMyParkingLots = (token) => request("/parking/mine", { token });
export const createParkingLot = (parkingLotData, token) => request("/parking", { method: "POST", payload: parkingLotData, token });
export const updateParkingLot = (id, parkingLotData, token) => request(`/parking/${id}`, { method: "PUT", payload: parkingLotData, token });
export const deleteParkingLot = (id, token) => request(`/parking/${id}`, { method: "DELETE", token });
