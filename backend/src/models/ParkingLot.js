import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    slotId: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["car", "bike", "EV", "disabled"],
      default: "car",
    },
    status: {
      type: String,
      enum: ["available", "booked", "maintenance"],
      default: "available",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    pricePerHour: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const parkingLotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
      },
    },
    pricing: {
      hourlyRate: {
        type: Number,
        required: true,
      },
      dailyRate: Number,
      monthlyRate: Number,
      peakHourRate: Number,
      weekendRate: Number,
      overnightFlatRate: Number,
      currency: {
        type: String,
        default: "USD",
      },
    },
    capacity: {
      total: {
        type: Number,
        required: true,
      },
      available: {
        type: Number,
        required: true,
      },
      reserved: {
        type: Number,
        default: 0,
      },
    },
    slots: [slotSchema],
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    operatingHours: {
      opens: String,
      closes: String,
      is24Hours: {
        type: Boolean,
        default: false,
      },
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    imageUrl: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    revenue: {
      type: Number,
      default: 0,
    },
    totalBookings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
parkingLotSchema.index({ location: "2dsphere" });

parkingLotSchema.pre("validate", function syncSlots(next) {
  if (!this.slots?.length && this.capacity?.total && this.pricing?.hourlyRate) {
    this.slots = Array.from({ length: this.capacity.total }, (_, index) => ({
      slotId: `P-${index + 1}`,
      type: "car",
      isAvailable: index < this.capacity.available,
      pricePerHour: this.pricing.hourlyRate,
    }));
  }

  if (this.slots?.length) {
    this.slots.forEach((slot) => {
      if (!slot.status) {
        slot.status = slot.isAvailable ? "available" : "booked";
      }
      slot.isAvailable = slot.status === "available";
    });
    this.capacity.total = this.slots.length;
    this.capacity.available = this.slots.filter((slot) => slot.isAvailable).length;
    this.capacity.reserved = this.capacity.total - this.capacity.available;
  }

  next();
});

export default mongoose.model("ParkingLot", parkingLotSchema);
