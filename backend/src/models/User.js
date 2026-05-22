import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "vendor", "operator", "admin"],
      default: "user",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      minlength: 6,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    profilePhoto: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    preferences: {
      vehicleType: String,
      preferredCity: String,
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      smsNotifications: {
        type: Boolean,
        default: false,
      },
      pushNotifications: {
        type: Boolean,
        default: false,
      },
      savedParkingLots: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ParkingLot",
        },
      ],
      savedChargingStations: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ChargingStation",
        },
      ],
      favoriteAmenities: [String],
      preferredChargingTypes: [String],
    },
    vehicles: [
      {
        plateNumber: String,
        type: {
          type: String,
          enum: ["car", "bike", "ev", "sedan", "suv", "hatchback", "truck", "other"],
        },
        make: String,
        model: String,
        isDefault: {
          type: Boolean,
          default: false,
        },
      }
    ],
    vehicleInfo: {
      licensePlate: String,
      vehicleType: {
        type: String,
        enum: ["sedan", "suv", "hatchback", "truck", "other"],
      },
      isElectric: {
        type: Boolean,
        default: false,
      },
    },
    savedPlaces: [
      {
        label: String,
        address: String,
        coordinates: [Number],
      }
    ],
    walletBalance: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("validate", function (next) {
  if (!this.googleId && !this.password) {
    this.invalidate("password", "Password is required");
  }
  if (!this.fullName && this.name) {
    this.fullName = this.name;
  }
  if (this.fullName && !this.name) {
    this.name = this.fullName;
  }
  next();
});

// Create geospatial index for location-based queries
userSchema.index({ location: "2dsphere" });

export default mongoose.model("User", userSchema);
