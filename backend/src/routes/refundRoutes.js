import { Router } from "express";
import { requestRefund, getMyRefunds } from "../controllers/refundController.js";
import { authenticate } from "../middlewares/authenticate.js";

const refundRouter = Router();

refundRouter.post("/", authenticate, requestRefund);
refundRouter.get("/mine", authenticate, getMyRefunds);

export default refundRouter;
