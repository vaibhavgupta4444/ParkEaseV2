import mongoose from "mongoose";

const refundSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["upi", "bank_transfer"],
      required: true,
    },
    upiId: {
      type: String,
    },
    bankDetails: {
      accountName: String,
      accountNumber: String,
      ifscCode: String,
    },
    status: {
      type: String,
      enum: ["pending", "processed", "rejected"],
      default: "pending",
    },
    adminNotes: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Refund", refundSchema);
