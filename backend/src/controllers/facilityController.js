import ParkingLot from "../models/ParkingLot.js";
import ChargingStation from "../models/ChargingStation.js";

const addressToString = (address = {}) =>
  [address.street, address.city, address.state, address.zipCode].filter(Boolean).join(", ");

const parkingSlots = (lot) =>
  lot.slots?.length
    ? lot.slots
    : Array.from({ length: lot.capacity?.total || 0 }, (_, index) => ({
        slotId: `P-${index + 1}`,
        type: "car",
        isAvailable: index < (lot.capacity?.available || 0),
        pricePerHour: lot.pricing?.hourlyRate || 0,
      }));

const evSlots = (station) =>
  station.slots?.length
    ? station.slots
    : Array.from({ length: station.capacity?.total || 0 }, (_, index) => ({
        slotId: `EV-${index + 1}`,
        type: "EV",
        isAvailable: index < (station.capacity?.available || 0),
        pricePerHour: station.pricing?.rate || 0,
      }));

const summarizeParking = (lot) => {
  const slots = parkingSlots(lot);
  return {
    _id: lot._id,
    id: lot._id,
    kind: "parking",
    name: lot.name,
    address: addressToString(lot.location?.address),
    location: lot.location,
    availableSlots: slots.filter((slot) => slot.isAvailable).length,
    totalSlots: slots.length || lot.capacity?.total || 0,
    pricePerHour: lot.pricing?.hourlyRate || 0,
    currency: lot.pricing?.currency || "INR",
    rating: lot.rating,
    imageUrl: lot.imageUrl,
  };
};

const summarizeCharging = (station) => {
  const slots = evSlots(station);
  return {
    _id: station._id,
    id: station._id,
    kind: "ev",
    name: station.name,
    address: addressToString(station.location?.address),
    location: station.location,
    availableSlots: slots.filter((slot) => slot.isAvailable).length,
    totalSlots: slots.length || station.capacity?.total || 0,
    pricePerHour: station.pricing?.rate || 0,
    pricePerSession: station.pricePerSession || station.pricing?.rate || 0,
    currency: station.pricing?.currency || "INR",
    chargerType: station.chargerType || station.chargerTypes?.[0],
    chargerTypes: station.chargerTypes,
    speedKw: station.speedKw,
    rating: station.rating,
    imageUrl: station.imageUrl,
  };
};

export const getFacilities = async (req, res) => {
  try {
    const { type = "both" } = req.query;
    const includeParking = type === "both" || type === "parking";
    const includeEv = type === "both" || type === "ev";

    const [parkingLots, chargingStations] = await Promise.all([
      includeParking ? ParkingLot.find({ isActive: true }).limit(100) : [],
      includeEv ? ChargingStation.find({ isActive: true }).limit(100) : [],
    ]);

    const facilities = [
      ...parkingLots.map(summarizeParking),
      ...chargingStations.map(summarizeCharging),
    ];

    return res.status(200).json({
      message: "Facilities retrieved",
      data: facilities,
      count: facilities.length,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFacilityDetails = async (req, res) => {
  try {
    const [parkingLot, chargingStation] = await Promise.all([
      ParkingLot.findById(req.params.id),
      ChargingStation.findById(req.params.id),
    ]);

    if (parkingLot) {
      const summary = summarizeParking(parkingLot);
      return res.status(200).json({ message: "Facility retrieved", data: { ...summary, slots: parkingSlots(parkingLot) } });
    }

    if (chargingStation) {
      const summary = summarizeCharging(chargingStation);
      return res.status(200).json({ message: "Facility retrieved", data: { ...summary, slots: evSlots(chargingStation) } });
    }

    return res.status(404).json({ message: "Facility not found" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
