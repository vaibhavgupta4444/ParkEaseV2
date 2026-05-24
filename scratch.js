import mongoose from "mongoose";
import Booking from "./backend/src/models/Booking.js";
import dotenv from "dotenv";

dotenv.config({ path: "./backend/.env" });

async function checkBookings() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/parkease");
  const bookings = await Booking.find().sort({ createdAt: -1 }).limit(5);
  console.log("Latest 5 Bookings:");
  bookings.forEach(b => {
    console.log(`- Ref: ${b.bookingRef}, Vehicle: ${b.vehicleNumber}, Created: ${b.createdAt}`);
  });
  process.exit(0);
}

checkBookings();
