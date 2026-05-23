import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

const startServer = async () => {
  try {
    await connectDB();
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
