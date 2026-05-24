import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    targetType: {
      type: String,
      required: true,
      enum: ["user", "vendor", "facility", "booking", "review", "support", "settings", "other"],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    details: {
      type: String,
      trim: true,
    },
    performedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("AdminLog", adminLogSchema);
