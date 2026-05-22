import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    facilityType: {
      type: String,
      enum: ["parkingLot", "chargingStation"],
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
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true, // One review per booking
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    photos: [
      {
        type: String,
      },
    ],
    tags: [
      {
        type: String,
        enum: ["lighting", "cleanliness", "safety", "staff", "signage", "accessibility", "equipment"],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Review", reviewSchema);
