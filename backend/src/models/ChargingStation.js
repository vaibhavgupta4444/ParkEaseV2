import mongoose from "mongoose";

const evSlotSchema = new mongoose.Schema(
  {
    slotId: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["EV"],
      default: "EV",
    },
    chargerType: {
      type: String,
    },
    speedKw: {
      type: Number,
      default: 22,
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

const chargingStationSchema = new mongoose.Schema(
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
    chargerTypes: [
      {
        type: String,
        enum: ["Type 1", "Type 2", "CCS", "CHAdeMO", "GB/T", "Level 1", "Level 2", "DC Fast Charging", "Tesla Supercharger"],
      },
    ],
    chargerType: {
      type: String,
      enum: ["Type 1", "Type 2", "CCS", "CHAdeMO", "GB/T", "Level 1", "Level 2", "DC Fast Charging", "Tesla Supercharger"],
    },
    speedKw: {
      type: Number,
      default: 22,
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
    pricing: {
      type: {
        type: String,
        enum: ["per_kwh", "per_hour", "per_session"],
        default: "per_kwh",
      },
      rate: {
        type: Number,
        required: true,
      },
      perKwhRate: Number,
      perSessionRate: Number,
      currency: {
        type: String,
        default: "USD",
      },
    },
    pricePerSession: Number,
    slots: [evSlotSchema],
    connectorDetails: [
      {
        type: {
          type: String,
        },
        available: Number,
        reserved: Number,
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
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
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
    provider: String, // Tesla, ChargePoint, Electrify America, etc.
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
chargingStationSchema.index({ location: "2dsphere" });

chargingStationSchema.pre("validate", function syncChargingSlots(next) {
  if (!this.chargerType && this.chargerTypes?.length) {
    this.chargerType = this.chargerTypes[0];
  }

  if (!this.pricePerSession && this.pricing?.type === "per_session") {
    this.pricePerSession = this.pricing.rate;
  }

  if (!this.slots?.length && this.capacity?.total && this.pricing?.rate) {
    this.slots = Array.from({ length: this.capacity.total }, (_, index) => ({
      slotId: `EV-${index + 1}`,
      type: "EV",
      chargerType: this.chargerTypes?.[0],
      speedKw: this.speedKw,
      isAvailable: index < this.capacity.available,
      pricePerHour: this.pricing.rate,
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

export default mongoose.model("ChargingStation", chargingStationSchema);
