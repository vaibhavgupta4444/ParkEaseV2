import Booking from "../models/Booking.js";
import ParkingLot from "../models/ParkingLot.js";
import ChargingStation from "../models/ChargingStation.js";

const calculateDurationHours = (startTime, endTime) => {
  const diffMs = new Date(endTime) - new Date(startTime);
  return Math.max(diffMs / (1000 * 60 * 60), 0);
};

const findAvailableSlot = (resource, requestedSlotId) => {
  if (!resource.slots?.length && resource.capacity?.total) {
    const rate = resource.pricing?.hourlyRate || resource.pricing?.rate || 0;
    const prefix = resource.pricing?.hourlyRate ? "P" : "EV";
    resource.slots = Array.from({ length: resource.capacity.total }, (_, index) => ({
      slotId: `${prefix}-${index + 1}`,
      type: prefix === "EV" ? "EV" : "car",
      isAvailable: index < resource.capacity.available,
      pricePerHour: rate,
    }));
  }

  if (!resource.slots?.length) {
    return null;
  }

  return resource.slots.find((slot) => {
    const isOpen = slot.status ? slot.status === "available" : slot.isAvailable;
    if (requestedSlotId) {
      return slot.slotId === requestedSlotId && isOpen;
    }

    return isOpen;
  });
};

const markSlot = async (resource, slotId, isAvailable) => {
  const slot = resource.slots?.find((item) => item.slotId === slotId);
  if (slot) {
    slot.isAvailable = isAvailable;
    slot.status = isAvailable ? "available" : "booked";
  }

  resource.capacity.available = resource.slots.filter((item) => item.status === "available" || (!item.status && item.isAvailable)).length;
  resource.capacity.reserved = resource.capacity.total - resource.capacity.available;
  await resource.save();
};

export const createBooking = async (req, res) => {
  try {
    const { bookingType, targetId, facilityId, slotId, startTime, endTime } = req.body;
    const resolvedTargetId = targetId || facilityId;
    let resolvedBookingType = bookingType;

    if (!resolvedTargetId || !startTime || !endTime) {
      return res.status(400).json({ message: "facilityId/targetId, startTime, and endTime are required" });
    }

    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    if (!resolvedBookingType) {
      resolvedBookingType = (await ChargingStation.exists({ _id: resolvedTargetId })) ? "charging" : "parking";
    }

    if (resolvedBookingType === "parking") {
      const lot = await ParkingLot.findById(resolvedTargetId);
      if (!lot) {
        return res.status(404).json({ message: "Parking lot not found" });
      }

      const slot = findAvailableSlot(lot, slotId);
      if (!slot) {
        return res.status(409).json({ message: "No available parking spaces" });
      }

      const totalPrice = Math.ceil(calculateDurationHours(startTime, endTime)) * (slot.pricePerHour || lot.pricing?.hourlyRate || 0);

      const booking = await Booking.create({
        user: req.userId,
        bookingType: "parking",
        parkingLot: lot._id,
        slotId: slot.slotId,
        startTime,
        endTime,
        totalPrice,
        currency: lot.pricing?.currency || "USD",
        status: "pending",
        paymentStatus: "pending",
      });

      await markSlot(lot, slot.slotId, false);

      return res.status(201).json({
        message: "Parking slot reserved pending payment",
        data: booking,
      });
    }

    if (resolvedBookingType === "charging") {
      const station = await ChargingStation.findById(resolvedTargetId);
      if (!station) {
        return res.status(404).json({ message: "Charging station not found" });
      }

      const slot = findAvailableSlot(station, slotId);
      if (!slot) {
        return res.status(409).json({ message: "No available chargers" });
      }

      const totalPrice = station.pricing?.type === "per_session"
        ? station.pricing?.rate || slot.pricePerHour || 0
        : Math.ceil(calculateDurationHours(startTime, endTime)) * (slot.pricePerHour || station.pricing?.rate || 0);

      const booking = await Booking.create({
        user: req.userId,
        bookingType: "charging",
        chargingStation: station._id,
        slotId: slot.slotId,
        startTime,
        endTime,
        totalPrice,
        currency: station.pricing?.currency || "USD",
        status: "pending",
        paymentStatus: "pending",
      });

      await markSlot(station, slot.slotId, false);

      return res.status(201).json({
        message: "Charging slot reserved pending payment",
        data: booking,
      });
    }

    return res.status(400).json({ message: "Invalid booking type" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.userId || req.userId })
      .populate("parkingLot", "name location pricing imageUrl")
      .populate("chargingStation", "name location pricing imageUrl provider")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Booking history retrieved",
      data: bookings,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const canManage =
      booking.user.toString() === req.userId || ["admin", "operator", "vendor"].includes(req.user.role);

    if (!canManage) {
      return res.status(403).json({ message: "Unauthorized to cancel this booking" });
    }

    if (booking.status === "cancelled") {
      return res.status(200).json({ message: "Booking already cancelled", data: booking });
    }

    if (booking.bookingType === "parking" && booking.parkingLot) {
      const lot = await ParkingLot.findById(booking.parkingLot);
      if (lot && booking.slotId) {
        await markSlot(lot, booking.slotId, true);
      }
    }

    if (booking.bookingType === "charging" && booking.chargingStation) {
      const station = await ChargingStation.findById(booking.chargingStation);
      if (station && booking.slotId) {
        await markSlot(station, booking.slotId, true);
      }
    }

    booking.status = "cancelled";
    await booking.save();

    return res.status(200).json({ message: "Booking cancelled", data: booking });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllBookings = async (_req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email role")
      .populate("parkingLot", "name owner")
      .populate("chargingStation", "name owner")
      .sort({ createdAt: -1 });

    return res.status(200).json({ message: "Bookings retrieved", data: bookings });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
