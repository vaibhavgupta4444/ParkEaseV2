import { Router } from "express";
import {
  createChargingStation,
  deleteChargingStation,
  getMyChargingStations,
  updateChargingStation,
} from "../controllers/chargingController.js";
import {
  cancelVendorBooking,
  completeVendorBooking,
  createCoupon,
  createFacilitySlot,
  deleteCoupon,
  deleteFacilitySlot,
  exportVendorBookings,
  getCoupons,
  getNotifications,
  getFacilitySlots,
  getVendorAnalytics,
  getVendorBookingDetails,
  getVendorBookings,
  getVendorOverview,
  getVendorProfile,
  markNotificationRead,
  updateParkingPricing,
  updateFacilitySlot,
  upsertVendorProfile,
} from "../controllers/vendorController.js";
import { authenticate, authorizeRoles } from "../middlewares/authenticate.js";
import { requireVerifiedVendor } from "../middlewares/requireVerifiedVendor.js";

const vendorRouter = Router();

vendorRouter.use(authenticate, authorizeRoles("vendor", "operator", "admin"));

vendorRouter.get("/overview", getVendorOverview);

vendorRouter.get("/ev-stations", getMyChargingStations);
vendorRouter.post("/ev-stations", requireVerifiedVendor, createChargingStation);
vendorRouter.put("/ev-stations/:id", requireVerifiedVendor, updateChargingStation);
vendorRouter.delete("/ev-stations/:id", requireVerifiedVendor, deleteChargingStation);

vendorRouter.get("/:type/:id/slots", getFacilitySlots);
vendorRouter.post("/:type/:id/slots", requireVerifiedVendor, createFacilitySlot);
vendorRouter.put("/:type/:id/slots/:slotId", requireVerifiedVendor, updateFacilitySlot);
vendorRouter.delete("/:type/:id/slots/:slotId", requireVerifiedVendor, deleteFacilitySlot);
vendorRouter.put("/parking/:id/pricing", requireVerifiedVendor, updateParkingPricing);

vendorRouter.get("/bookings/export", exportVendorBookings);
vendorRouter.get("/bookings", getVendorBookings);
vendorRouter.get("/bookings/:id", getVendorBookingDetails);
vendorRouter.put("/bookings/:id/complete", completeVendorBooking);
vendorRouter.put("/bookings/:id/cancel", cancelVendorBooking);

vendorRouter.get("/analytics", getVendorAnalytics);

vendorRouter.post("/coupons", requireVerifiedVendor, createCoupon);
vendorRouter.get("/coupons", getCoupons);
vendorRouter.delete("/coupons/:id", requireVerifiedVendor, deleteCoupon);

vendorRouter.get("/profile", getVendorProfile);
vendorRouter.put("/profile", upsertVendorProfile);

vendorRouter.get("/notifications", getNotifications);
vendorRouter.put("/notifications/:id/read", markNotificationRead);

export default vendorRouter;
