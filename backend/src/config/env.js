import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || 8000,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  VENDOR_URL: process.env.VENDOR_URL || "http://localhost:5174",
  MONGO_URI: process.env.MONGO_URI || process.env.MONGODB_URI,
};
