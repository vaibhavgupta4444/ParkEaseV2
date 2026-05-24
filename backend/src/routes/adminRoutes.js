import { Router } from "express";
import {
  getAdminSummary,
  getUsers,
  getUserDetails,
  suspendUser,
  reactivateUser,
  changeUserRole,
  deleteUser,
  exportUsersCSV,
  getVendors,
  getVendorDetails,
  getPendingVendors,
  approveVendor,
  rejectVendor,
  suspendVendor,
  reactivateVendor,
  revokeVendorVerification,
  getFacilities,
  getFacilityDetails,
  suspendFacility,
  restoreFacility,
  deleteFacility,
  getBookings,
  getBookingDetails,
  forceCancelBooking,
  manuallyCompleteBooking,
  exportBookingsCSV,
  getRevenueSummary,
  getRevenueCharts,
  getTransactions,
  exportTransactionsCSV,
  getRefundsList,
  manuallyTriggerRefund,
  getReviews,
  hideReview,
  restoreReview,
  deleteReview,
  getReportedReviews,
  dismissReviewReport,
  getSupportTickets,
  getTicketDetails,
  replyToSupportTicket,
  updateTicketStatus,
  getPlatformSettings,
  updatePlatformSettings,
  toggleMaintenanceMode,
  getAuditLogs,
  getAdminNotifications,
} from "../controllers/adminController.js";
import { authenticate, authorizeRoles } from "../middlewares/authenticate.js";

const adminRouter = Router();

// Gated standard middleware - Authentication and strict Admin role checks
adminRouter.use(authenticate);
adminRouter.use(authorizeRoles("admin"));

// 1. Dashboard summary stats
adminRouter.get("/summary", getAdminSummary);

// 2. User management
adminRouter.get("/users", getUsers);
adminRouter.get("/users/export", exportUsersCSV);
adminRouter.get("/users/:id", getUserDetails);
adminRouter.put("/users/:id/suspend", suspendUser);
adminRouter.put("/users/:id/reactivate", reactivateUser);
adminRouter.put("/users/:id/role", changeUserRole);
adminRouter.delete("/users/:id", deleteUser);

// 3. Vendor verification queue & partners
adminRouter.get("/vendors", getVendors);
adminRouter.get("/vendors/pending", getPendingVendors);
adminRouter.get("/vendors/:id", getVendorDetails);
adminRouter.put("/vendors/:id/approve", approveVendor);
adminRouter.put("/vendors/:id/reject", rejectVendor);
adminRouter.put("/vendors/:id/suspend", suspendVendor);
adminRouter.put("/vendors/:id/reactivate", reactivateVendor);
adminRouter.put("/vendors/:id/revoke-verification", revokeVendorVerification);

// 4. Facility listings
adminRouter.get("/facilities", getFacilities);
adminRouter.get("/facilities/details", getFacilityDetails);
adminRouter.put("/facilities/suspend", suspendFacility);
adminRouter.put("/facilities/restore", restoreFacility);
adminRouter.delete("/facilities", deleteFacility);

// 5. Booking tracking
adminRouter.get("/bookings", getBookings);
adminRouter.get("/bookings/export", exportBookingsCSV);
adminRouter.get("/bookings/:id", getBookingDetails);
adminRouter.put("/bookings/:id/force-cancel", forceCancelBooking);
adminRouter.put("/bookings/:id/complete", manuallyCompleteBooking);

// 6. Revenue & Financials
adminRouter.get("/revenue/summary", getRevenueSummary);
adminRouter.get("/revenue/charts", getRevenueCharts);
adminRouter.get("/transactions", getTransactions);
adminRouter.get("/transactions/export", exportTransactionsCSV);
adminRouter.get("/refunds", getRefundsList);
adminRouter.post("/refunds/manual", manuallyTriggerRefund);

// 7. Review moderation
adminRouter.get("/reviews", getReviews);
adminRouter.get("/reviews/reported", getReportedReviews);
adminRouter.put("/reviews/:id/hide", hideReview);
adminRouter.put("/reviews/:id/restore", restoreReview);
adminRouter.delete("/reviews/:id", deleteReview);
adminRouter.put("/reviews/:id/dismiss-report", dismissReviewReport);

// 8. Support ticket threads
adminRouter.get("/support", getSupportTickets);
adminRouter.get("/support/:id", getTicketDetails);
adminRouter.post("/support/:id/reply", replyToSupportTicket);
adminRouter.put("/support/:id/status", updateTicketStatus);

// 9. Platform Configuration
adminRouter.get("/settings", getPlatformSettings);
adminRouter.put("/settings", updatePlatformSettings);
adminRouter.put("/settings/maintenance", toggleMaintenanceMode);

// 10. Admin Audit Trail Log logs
adminRouter.get("/audit-logs", getAuditLogs);

// 11. Admin Notifications
adminRouter.get("/notifications", getAdminNotifications);

export default adminRouter;
