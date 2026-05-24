import { Router } from "express";
import {
  getNearbyChargingStations,
  getChargingStationDetails,
  getAllChargingStations,
  getMyChargingStations,
  createChargingStation,
  updateChargingStation,
  deleteChargingStation,
} from "../controllers/chargingController.js";
import { authenticate, authorizeRoles } from "../middlewares/authenticate.js";
import { requireVerifiedVendor } from "../middlewares/requireVerifiedVendor.js";

const chargingRouter = Router();

// Public routes
chargingRouter.get("/nearby", getNearbyChargingStations);
chargingRouter.get("/all", getAllChargingStations);

// Protected routes (require authentication)
chargingRouter.get("/mine", authenticate, authorizeRoles("vendor", "operator", "admin"), getMyChargingStations);
chargingRouter.post("/", authenticate, authorizeRoles("vendor", "operator", "admin"), requireVerifiedVendor, createChargingStation);
chargingRouter.put("/:id", authenticate, authorizeRoles("vendor", "operator", "admin"), requireVerifiedVendor, updateChargingStation);
chargingRouter.delete("/:id", authenticate, authorizeRoles("vendor", "operator", "admin"), requireVerifiedVendor, deleteChargingStation);

// Public route
chargingRouter.get("/:id", getChargingStationDetails);

export default chargingRouter;
