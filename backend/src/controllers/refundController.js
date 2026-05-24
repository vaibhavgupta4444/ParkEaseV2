import Refund from "../models/Refund.js";
import Booking from "../models/Booking.js";

export const requestRefund = async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod, upiId, bankDetails } = req.body;
    const userId = req.userId;

    const booking = await Booking.findOne({ _id: bookingId, user: userId });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "cancelled") {
      return res.status(400).json({ message: "Can only request refund for cancelled bookings" });
    }

    const existingRefund = await Refund.findOne({ bookingId });
    if (existingRefund) {
      return res.status(400).json({ message: "Refund already requested for this booking" });
    }

    const refund = new Refund({
      bookingId,
      userId,
      amount: amount || booking.totalPrice,
      paymentMethod,
      upiId,
      bankDetails,
    });

    await refund.save();

    res.status(201).json({ message: "Refund requested successfully", data: refund });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getMyRefunds = async (req, res) => {
  try {
    const refunds = await Refund.find({ userId: req.userId }).populate("bookingId").sort("-createdAt");
    res.status(200).json({ data: refunds });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
