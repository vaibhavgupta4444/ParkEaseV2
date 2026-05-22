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

const chargingRouter = Router();

// Public routes
chargingRouter.get("/nearby", getNearbyChargingStations);
chargingRouter.get("/all", getAllChargingStations);

// Protected routes (require authentication)
chargingRouter.get("/mine", authenticate, authorizeRoles("vendor", "operator", "admin"), getMyChargingStations);
chargingRouter.post("/", authenticate, authorizeRoles("vendor", "operator", "admin"), createChargingStation);
chargingRouter.put("/:id", authenticate, authorizeRoles("vendor", "operator", "admin"), updateChargingStation);
chargingRouter.delete("/:id", authenticate, authorizeRoles("vendor", "operator", "admin"), deleteChargingStation);

// Public route
chargingRouter.get("/:id", getChargingStationDetails);

export default chargingRouter;
