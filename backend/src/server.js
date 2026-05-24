import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { startBookingExpiryScheduler } from "./services/bookingExpiry.js";

const startServer = async () => {
  try {
    await connectDB();

    // Start the background job that auto-expires overdue bookings and frees slots
    startBookingExpiryScheduler();

    // Bind to 0.0.0.0 so Render (and other PaaS) can route traffic correctly.
    app.listen(env.PORT, "0.0.0.0", () => {
      logger.info(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

// Catch unhandled rejections so Render shows the actual error reason.
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
  process.exit(1);
});

startServer();

