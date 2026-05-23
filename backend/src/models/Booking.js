import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookingType: {
      type: String,
      enum: ["parking", "charging"],
      required: true,
    },
    parkingLot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParkingLot",
    },
    chargingStation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChargingStation",
    },
    slotId: {
      type: String,
      trim: true,
    },
    vehicleNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending", "paid", "failed", "refunded"],
      default: "unpaid",
    },
    bookingRef: {
      type: String,
      unique: true,
      sparse: true,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.pre("validate", function assignBookingRef(next) {
  if (!this.bookingRef) {
    this.bookingRef = `PK${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  }
  next();
});

export default mongoose.model("Booking", bookingSchema);
