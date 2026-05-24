import { Router } from "express";
import { getNearbyMetroStations } from "../controllers/metroController.js";

const metroRouter = Router();

// Public route
metroRouter.get("/", getNearbyMetroStations);

export default metroRouter;
