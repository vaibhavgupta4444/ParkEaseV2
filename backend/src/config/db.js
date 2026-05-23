import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    // Re-throw instead of process.exit() — exiting inside a Vercel serverless
    // function tears down the container and prevents error responses being sent.
    throw error;
  }
};
