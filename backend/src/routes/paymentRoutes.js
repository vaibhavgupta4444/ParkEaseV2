import { Router } from "express";
import { createPaymentOrder, getPaymentTransactions, verifyPayment } from "../controllers/paymentController.js";
import { authenticate } from "../middlewares/authenticate.js";

const paymentRouter = Router();

paymentRouter.post("/create-order", authenticate, createPaymentOrder);
paymentRouter.post("/verify", authenticate, verifyPayment);
paymentRouter.get("/transactions", authenticate, getPaymentTransactions);

export default paymentRouter;
