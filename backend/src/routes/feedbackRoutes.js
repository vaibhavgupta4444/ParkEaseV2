import { Router } from "express";
import { submitFeedback, getFeedback } from "../controllers/feedbackController.js";
import { authenticate } from "../middlewares/authenticate.js";

const feedbackRouter = Router();

feedbackRouter.post("/", authenticate, submitFeedback);
feedbackRouter.get("/", authenticate, getFeedback);

export default feedbackRouter;
