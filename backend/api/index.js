import app from "../src/app.js";
import { connectDB } from "../src/config/db.js";

// Cache the connection promise across warm invocations.
let connectionPromise = null;

const ensureDBConnection = () => {
  if (!connectionPromise) {
    connectionPromise = connectDB().catch((error) => {
      // Reset so the next request retries the connection.
      connectionPromise = null;
      throw error;
    });
  }
  return connectionPromise;
};

export default async function handler(req, res) {
  try {
    await ensureDBConnection();
  } catch (error) {
    console.error("DB connection error:", error.message);
    res.status(503).json({ message: "Service temporarily unavailable. DB connection failed." });
    return;
  }
  return app(req, res);
}
