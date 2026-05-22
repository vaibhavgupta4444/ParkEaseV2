import { Router } from "express";
import { getAdminSummary } from "../controllers/adminController.js";
import { authenticate, authorizeRoles } from "../middlewares/authenticate.js";

const adminRouter = Router();

adminRouter.get("/summary", authenticate, authorizeRoles("admin", "operator", "vendor"), getAdminSummary);

export default adminRouter;
