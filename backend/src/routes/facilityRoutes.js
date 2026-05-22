import { Router } from "express";
import { getFacilities, getFacilityDetails } from "../controllers/facilityController.js";

const facilityRouter = Router();

facilityRouter.get("/", getFacilities);
facilityRouter.get("/:id", getFacilityDetails);

export default facilityRouter;
