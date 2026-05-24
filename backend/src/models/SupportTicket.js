import mongoose from "mongoose";

const supportMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["user", "vendor", "operator", "admin"],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const supportTicketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      required: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    submittedByRole: {
      type: String,
      enum: ["user", "vendor"],
      required: true,
    },
    issueType: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    bookingRef: {
      type: String,
      trim: true,
    },
    messages: [supportMessageSchema],
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("SupportTicket", supportTicketSchema);
