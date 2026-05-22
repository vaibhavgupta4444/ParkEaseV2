import Booking from "../models/Booking.js";
import ChargingStation from "../models/ChargingStation.js";
import ParkingLot from "../models/ParkingLot.js";

export const getAdminSummary = async (req, res) => {
  try {
    const scope = req.user.role === "operator" || req.user.role === "vendor"
      ? { owner: req.userId }
      : {};

    const [parkingCount, chargingCount, allBookings] = await Promise.all([
      ParkingLot.countDocuments(scope),
      ChargingStation.countDocuments(scope),
      Booking.find().populate("parkingLot", "owner").populate("chargingStation", "owner"),
    ]);

    const scopedBookings = allBookings.filter((booking) => {
      if (req.user.role === "admin") return true;
      return (
        booking.parkingLot?.owner?.toString() === req.userId ||
        booking.chargingStation?.owner?.toString() === req.userId
      );
    });

    const revenue = scopedBookings
      .filter((booking) => booking.paymentStatus === "paid")
      .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

    return res.status(200).json({
      message: "Admin summary retrieved",
      data: {
        parkingFacilities: parkingCount,
        evStations: chargingCount,
        bookings: scopedBookings.length,
        revenue,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
