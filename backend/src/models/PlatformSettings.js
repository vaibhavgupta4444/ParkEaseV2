import mongoose from "mongoose";

const platformSettingsSchema = new mongoose.Schema(
  {
    platformName: {
      type: String,
      default: "ParkEase",
    },
    logoUrl: {
      type: String,
      default: "/logo.png",
    },
    contactEmail: {
      type: String,
      default: "support@parkease.com",
    },
    commissionRate: {
      type: Number,
      default: 10, // 10%
    },
    cancellationPolicy: {
      fullRefundWindowHours: {
        type: Number,
        default: 24,
      },
      partialRefundPercent: {
        type: Number,
        default: 50,
      },
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maintenanceMessage: {
      type: String,
      default: "ParkEase is currently undergoing scheduled maintenance. Please try again later.",
    },
    allowedCities: {
      type: [String],
      default: ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Pune", "Chennai", "Kolkata"],
    },
    featureFlags: {
      walletEnabled: {
        type: Boolean,
        default: true,
      },
      evModuleEnabled: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("PlatformSettings", platformSettingsSchema);
