import cors from "cors";
import express from "express";
import authRouter from "./routes/authRoutes.js";
import parkingRouter from "./routes/parkingRoutes.js";
import chargingRouter from "./routes/chargingRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import facilityRouter from "./routes/facilityRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import vendorRouter from "./routes/vendorRoutes.js";
import { env } from "./config/env.js";

const app = express();

const allowedOrigins = new Set([
  env.CLIENT_URL,
  env.VENDOR_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/parking", parkingRouter);
app.use("/api/charging", chargingRouter);
app.use("/api/facilities", facilityRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/admin", adminRouter);
app.use("/api/vendor", vendorRouter);

export default app;
