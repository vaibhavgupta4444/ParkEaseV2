import { Router } from "express";
import {
  getNearbyParkingLots,
  getParkingLotDetails,
  getAllParkingLots,
  getMyParkingLots,
  createParkingLot,
  updateParkingLot,
  deleteParkingLot,
} from "../controllers/parkingController.js";
import { authenticate, authorizeRoles } from "../middlewares/authenticate.js";

const parkingRouter = Router();

// Public routes
parkingRouter.get("/nearby", getNearbyParkingLots);
parkingRouter.get("/all", getAllParkingLots);

// Protected routes (require authentication)
parkingRouter.get("/mine", authenticate, authorizeRoles("vendor", "operator", "admin"), getMyParkingLots);
parkingRouter.post("/", authenticate, authorizeRoles("vendor", "operator", "admin"), createParkingLot);
parkingRouter.put("/:id", authenticate, authorizeRoles("vendor", "operator", "admin"), updateParkingLot);
parkingRouter.delete("/:id", authenticate, authorizeRoles("vendor", "operator", "admin"), deleteParkingLot);

// Public route
parkingRouter.get("/:id", getParkingLotDetails);

export default parkingRouter;
