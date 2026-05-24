import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/parkease";

const seedAdmin = async () => {
  try {
    console.log("Connecting to database at:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Database connected successfully.");

    const existingAdmin = await User.findOne({ email: "admin@parkease.com" });
    if (existingAdmin) {
      console.log("Admin account (admin@parkease.com) already exists. Skipping seed.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Admin@1234", 10);
    const admin = new User({
      name: "ParkEase Admin",
      fullName: "ParkEase Admin",
      email: "admin@parkease.com",
      password: hashedPassword,
      role: "admin",
      emailVerified: true,
      phone: "9999999999",
      phoneVerified: true,
    });

    await admin.save();
    console.log("Default admin account successfully seeded!");
    console.log("Email: admin@parkease.com");
    console.log("Password: Admin@1234");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed admin account:", error);
    process.exit(1);
  }
};

seedAdmin();
