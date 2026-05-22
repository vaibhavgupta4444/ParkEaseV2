import { Router } from "express";
import { cancelBooking, createBooking, getAllBookings, getUserBookings } from "../controllers/bookingController.js";
import { authenticate, authorizeRoles } from "../middlewares/authenticate.js";

const bookingRouter = Router();

bookingRouter.post("/", authenticate, createBooking);
bookingRouter.get("/me", authenticate, getUserBookings);
bookingRouter.get("/all", authenticate, authorizeRoles("admin", "operator", "vendor"), getAllBookings);
bookingRouter.get("/user/:userId", authenticate, getUserBookings);
bookingRouter.delete("/:id", authenticate, cancelBooking);

export default bookingRouter;
