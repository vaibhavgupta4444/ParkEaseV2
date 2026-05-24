import User from "../models/User.js";
import Booking from "../models/Booking.js";
import ParkingLot from "../models/ParkingLot.js";
import ChargingStation from "../models/ChargingStation.js";
import VendorProfile from "../models/VendorProfile.js";
import Payment from "../models/Payment.js";
import Refund from "../models/Refund.js";
import Review from "../models/Review.js";
import SupportTicket from "../models/SupportTicket.js";
import PlatformSettings from "../models/PlatformSettings.js";
import AdminLog from "../models/AdminLog.js";

// Helper to write audit logs
const logAdminAction = async (adminId, action, targetType, targetId, details) => {
  try {
    await AdminLog.create({
      adminId,
      action,
      targetType,
      targetId,
      details,
    });
  } catch (err) {
    console.error("Failed to log admin action:", err);
  }
};

// 1. Dashboard / Summary Stats
export const getAdminSummary = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalVendors,
      parkingCount,
      chargingCount,
      bookingsToday,
      activeBookings,
      recentBookings,
      recentUsers,
      pendingVendors,
      allPaidBookings,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "vendor" }),
      ParkingLot.countDocuments(),
      ChargingStation.countDocuments(),
      Booking.countDocuments({ createdAt: { $gte: todayStart } }),
      Booking.countDocuments({ status: "confirmed" }),
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("user", "name email"),
      User.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("-password"),
      VendorProfile.find({ verificationStatus: "pending" })
        .limit(5)
        .populate("userId", "name email"),
      Booking.find({ paymentStatus: "paid" }),
    ]);

    // Calculate revenue pools
    const revenueToday = allPaidBookings
      .filter((b) => new Date(b.createdAt) >= todayStart)
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const revenueThisMonth = allPaidBookings
      .filter((b) => new Date(b.createdAt) >= monthStart)
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const totalRevenue = allPaidBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    // Chart trend generation (last 30 days daily data)
    const dailyData = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dailyData[dateStr] = { date: dateStr, bookings: 0, revenue: 0 };
    }

    allPaidBookings.forEach((b) => {
      const dateStr = new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (dailyData[dateStr]) {
        dailyData[dateStr].revenue += b.totalPrice || 0;
      }
    });

    const allBookingsForTrend = await Booking.find({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    allBookingsForTrend.forEach((b) => {
      const dateStr = new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (dailyData[dateStr]) {
        dailyData[dateStr].bookings += 1;
      }
    });

    const trends = Object.values(dailyData);

    // Cumulative user growth trend
    const usersTrend = [];
    const allUsersList = await User.find({ role: "user" }).sort({ createdAt: 1 });
    let cumulativeCount = 0;
    const userGroups = {};

    allUsersList.forEach((u) => {
      const dateStr = new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      userGroups[dateStr] = (userGroups[dateStr] || 0) + 1;
    });

    Object.keys(userGroups).forEach((dateStr) => {
      cumulativeCount += userGroups[dateStr];
      usersTrend.push({ date: dateStr, count: cumulativeCount });
    });

    // Bookings by facility type (pie chart)
    const bookingsByFacility = [
      { name: "Parking", value: allBookingsForTrend.filter((b) => b.bookingType === "parking").length },
      { name: "EV Charging", value: allBookingsForTrend.filter((b) => b.bookingType === "charging").length },
    ];

    return res.status(200).json({
      message: "Admin summary retrieved",
      data: {
        summary: {
          totalUsers,
          totalVendors,
          parkingCount,
          chargingCount,
          bookingsToday,
          revenueToday,
          revenueThisMonth,
          activeBookings,
          totalRevenue,
        },
        trends,
        usersTrend: usersTrend.slice(-30),
        bookingsByFacility,
        recentBookings,
        recentUsers,
        pendingVendors,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 2. User Management
export const getUsers = async (req, res) => {
  try {
    const { search, role, status, verified, page = 1, limit = 20, sortBy = "createdAt", sortOrder = -1 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role && role !== "all") {
      query.role = role;
    }

    if (status && status !== "all") {
      query.isActive = status === "active";
    }

    if (verified && verified !== "all") {
      query.emailVerified = verified === "yes";
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ [sortBy]: Number(sortOrder) })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .select("-password");

    return res.status(200).json({
      message: "Users fetched",
      data: users,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const bookings = await Booking.find({ user: user._id })
      .populate("parkingLot", "name")
      .populate("chargingStation", "name")
      .sort({ createdAt: -1 });

    const totalSpent = bookings
      .filter((b) => b.paymentStatus === "paid")
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    return res.status(200).json({
      message: "User details retrieved",
      data: {
        user,
        bookings,
        totalSpent,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const suspendUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await logAdminAction(req.userId, "Suspend User", "user", user._id, `Suspended user with email ${user.email}`);

    return res.status(200).json({ message: "User suspended successfully", data: user });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const reactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await logAdminAction(req.userId, "Reactivate User", "user", user._id, `Reactivated user with email ${user.email}`);

    return res.status(200).json({ message: "User reactivated successfully", data: user });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "vendor", "operator", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role value" });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await logAdminAction(req.userId, "Change User Role", "user", user._id, `Changed role of user ${user.email} to ${role}`);

    return res.status(200).json({ message: "User role updated successfully", data: user });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Soft delete / anonymize personal credentials but keep booking records intact
    const originalEmail = user.email;
    user.name = "Anonymized User";
    user.fullName = "Anonymized User";
    user.email = `anonymized_${user._id}@parkease.com`;
    user.phone = "0000000000";
    user.isActive = false;
    await user.save();

    await logAdminAction(req.userId, "Delete User (Soft)", "user", user._id, `Anonymized user account with original email ${originalEmail}`);

    return res.status(200).json({ message: "User deleted and anonymized successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const exportUsersCSV = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    let csv = "ID,Name,Email,Phone,Role,Email Verified,Status,Join Date\n";
    users.forEach((u) => {
      csv += `"${u._id}","${u.name || u.fullName}","${u.email}","${u.phone || ""}","${u.role}","${u.emailVerified}","${u.isActive ? "Active" : "Suspended"}","${u.createdAt.toISOString()}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=users_export.csv");
    return res.status(200).send(csv);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 3. Vendor Management
export const getVendors = async (req, res) => {
  try {
    const vendors = await VendorProfile.find().populate("userId", "name email isActive createdAt");
    return res.status(200).json({ message: "Vendors retrieved", data: vendors });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getVendorDetails = async (req, res) => {
  try {
    const vendor = await VendorProfile.findById(req.params.id).populate("userId", "-password");
    if (!vendor) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    const [parkingLots, chargingStations] = await Promise.all([
      ParkingLot.find({ owner: vendor.userId?._id }),
      ChargingStation.find({ owner: vendor.userId?._id }),
    ]);

    const facilityIds = [
      ...parkingLots.map((p) => p._id),
      ...chargingStations.map((c) => c._id),
    ];

    const bookings = await Booking.find({
      $or: [
        { parkingLot: { $in: facilityIds } },
        { chargingStation: { $in: facilityIds } },
      ],
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const totalEarned = bookings
      .filter((b) => b.paymentStatus === "paid")
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    return res.status(200).json({
      message: "Vendor details retrieved",
      data: {
        vendor,
        facilities: { parkingLots, chargingStations },
        bookings,
        totalEarned,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getPendingVendors = async (req, res) => {
  try {
    const pending = await VendorProfile.find({ verificationStatus: "pending" }).populate("userId", "name email");
    return res.status(200).json({ message: "Pending verifications retrieved", data: pending });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const approveVendor = async (req, res) => {
  try {
    const vendor = await VendorProfile.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: "verified" },
      { new: true }
    );
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    await logAdminAction(
      req.userId,
      "Approve Vendor Verification",
      "vendor",
      vendor._id,
      `Approved business document verification status for ${vendor.businessName}`
    );

    return res.status(200).json({ message: "Vendor verified successfully", data: vendor });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const rejectVendor = async (req, res) => {
  try {
    const { reason } = req.body;
    const vendor = await VendorProfile.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: "rejected" },
      { new: true }
    );
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    await logAdminAction(
      req.userId,
      "Reject Vendor Verification",
      "vendor",
      vendor._id,
      `Rejected vendor application for ${vendor.businessName}. Reason: ${reason || "Unspecified doc mismatch"}`
    );

    return res.status(200).json({ message: "Vendor verification rejected", data: vendor });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const suspendVendor = async (req, res) => {
  try {
    const vendor = await VendorProfile.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    await User.findByIdAndUpdate(vendor.userId, { isActive: false });
    await logAdminAction(req.userId, "Suspend Vendor", "vendor", vendor._id, `Suspended vendor owner account for ${vendor.businessName}`);

    return res.status(200).json({ message: "Vendor login suspended successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const reactivateVendor = async (req, res) => {
  try {
    const vendor = await VendorProfile.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    await User.findByIdAndUpdate(vendor.userId, { isActive: true });
    await logAdminAction(req.userId, "Reactivate Vendor", "vendor", vendor._id, `Reactivated vendor owner account for ${vendor.businessName}`);

    return res.status(200).json({ message: "Vendor login reactivated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const revokeVendorVerification = async (req, res) => {
  try {
    const vendor = await VendorProfile.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: "unverified" },
      { new: true }
    );
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    await logAdminAction(
      req.userId,
      "Revoke Vendor Verification",
      "vendor",
      vendor._id,
      `Revoked business verification status for ${vendor.businessName}`
    );

    return res.status(200).json({ message: "Vendor verification revoked", data: vendor });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 4. Facility Management
export const getFacilities = async (req, res) => {
  try {
    const [parkingLots, chargingStations] = await Promise.all([
      ParkingLot.find().populate("owner", "name email"),
      ChargingStation.find().populate("owner", "name email"),
    ]);

    const parkingFacilities = parkingLots.map((p) => ({ ...p.toObject(), type: "parking" }));
    const evStations = chargingStations.map((c) => ({ ...c.toObject(), type: "ev" }));

    return res.status(200).json({
      message: "Facilities retrieved",
      data: [...parkingFacilities, ...evStations],
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getFacilityDetails = async (req, res) => {
  try {
    const { id, type } = req.query;

    let facility = null;
    if (type === "parking") {
      facility = await ParkingLot.findById(id).populate("owner", "name email");
    } else {
      facility = await ChargingStation.findById(id).populate("owner", "name email");
    }

    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    const bookings = await Booking.find({
      $or: [{ parkingLot: id }, { chargingStation: id }],
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Facility details retrieved",
      data: { facility, bookings },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const suspendFacility = async (req, res) => {
  try {
    const { id, type } = req.body;
    let facility = null;

    if (type === "parking") {
      facility = await ParkingLot.findByIdAndUpdate(id, { isActive: false }, { new: true });
    } else {
      facility = await ChargingStation.findByIdAndUpdate(id, { isActive: false }, { new: true });
    }

    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    await logAdminAction(
      req.userId,
      "Suspend Facility",
      "facility",
      facility._id,
      `Suspended visual listing status for ${facility.name} (type: ${type})`
    );

    return res.status(200).json({ message: "Facility suspended successfully", data: facility });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const restoreFacility = async (req, res) => {
  try {
    const { id, type } = req.body;
    let facility = null;

    if (type === "parking") {
      facility = await ParkingLot.findByIdAndUpdate(id, { isActive: true }, { new: true });
    } else {
      facility = await ChargingStation.findByIdAndUpdate(id, { isActive: true }, { new: true });
    }

    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    await logAdminAction(
      req.userId,
      "Restore Facility",
      "facility",
      facility._id,
      `Restored visual listing status for ${facility.name} (type: ${type})`
    );

    return res.status(200).json({ message: "Facility restored successfully", data: facility });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteFacility = async (req, res) => {
  try {
    const { id, type } = req.query;

    const activeBookings = await Booking.countDocuments({
      $or: [{ parkingLot: id }, { chargingStation: id }],
      status: { $in: ["pending", "confirmed"] },
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        message: "Cannot delete facility with active pending or confirmed bookings",
      });
    }

    let deleted = null;
    if (type === "parking") {
      deleted = await ParkingLot.findByIdAndDelete(id);
    } else {
      deleted = await ChargingStation.findByIdAndDelete(id);
    }

    if (!deleted) {
      return res.status(404).json({ message: "Facility not found" });
    }

    await logAdminAction(req.userId, "Delete Facility", "facility", id, `Permanently deleted facility ${deleted.name} (type: ${type})`);

    return res.status(200).json({ message: "Facility deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 5. Bookings Management
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("parkingLot", "name owner")
      .populate("chargingStation", "name owner")
      .sort({ createdAt: -1 });

    return res.status(200).json({ message: "Bookings fetched", data: bookings });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("parkingLot")
      .populate("chargingStation");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.status(200).json({ message: "Booking detail retrieved", data: booking });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const forceCancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    booking.status = "cancelled";
    booking.paymentStatus = "refunded";
    await booking.save();

    // Trigger automatic wallet balance refund
    const user = await User.findById(booking.user);
    if (user) {
      user.walletBalance = (user.walletBalance || 0) + (booking.totalPrice || 0);
      await user.save();
    }

    // Save manual refund audit log
    await Refund.create({
      bookingId: booking._id,
      userId: booking.user,
      amount: booking.totalPrice,
      paymentMethod: "upi",
      upiId: "admin-force-cancel@parkease",
      status: "processed",
      adminNotes: `Administrative force cancellation refund. Reason: ${reason || "Unspecified"}`,
    });

    await logAdminAction(
      req.userId,
      "Force Cancel Booking",
      "booking",
      booking._id,
      `Administrative force cancellation for booking ref ${booking.bookingRef}. Refunded ${booking.totalPrice} to user wallet.`
    );

    return res.status(200).json({ message: "Booking cancelled and refunded successfully", data: booking });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const manuallyCompleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: "completed" }, { new: true });
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await logAdminAction(
      req.userId,
      "Manually Complete Booking",
      "booking",
      booking._id,
      `Manually completed booking ref ${booking.bookingRef}`
    );

    return res.status(200).json({ message: "Booking marked as completed", data: booking });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const exportBookingsCSV = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "email")
      .populate("parkingLot", "name")
      .populate("chargingStation", "name")
      .sort({ createdAt: -1 });

    let csv = "Ref,User Email,Facility,Type,Amount,Status,Payment,Check-In,Check-Out\n";
    bookings.forEach((b) => {
      const facilityName = b.parkingLot?.name || b.chargingStation?.name || "Deleted";
      csv += `"${b.bookingRef}","${b.user?.email || ""}","${facilityName}","${b.bookingType}",${b.totalPrice},"${b.status}","${b.paymentStatus}","${b.startTime.toISOString()}","${b.endTime.toISOString()}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=bookings_export.csv");
    return res.status(200).send(csv);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 6. Revenue & Financial Summary
export const getRevenueSummary = async (req, res) => {
  try {
    const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const paidBookings = await Booking.find({ paymentStatus: "paid" });
    const allRefunds = await Refund.find({ status: "processed" });

    const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const revenueThisMonth = paidBookings
      .filter((b) => new Date(b.createdAt) >= monthStart)
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const revenueThisWeek = paidBookings
      .filter((b) => new Date(b.createdAt) >= weekStart)
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const totalRefunds = allRefunds.reduce((sum, r) => sum + (r.amount || 0), 0);

    // Mock calculations for commission (10%) and payout pools
    const commissionEarned = Number((totalRevenue * 0.1).toFixed(2));
    const pendingPayouts = Number((totalRevenue * 0.9).toFixed(2));

    return res.status(200).json({
      message: "Revenue statistics retrieved",
      data: {
        totalRevenue,
        revenueThisMonth,
        revenueThisWeek,
        totalRefunds,
        commissionEarned,
        pendingPayouts,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getRevenueCharts = async (req, res) => {
  try {
    const paidBookings = await Booking.find({ paymentStatus: "paid" });

    // Top revenue generating facilities list
    const facilityStats = {};
    paidBookings.forEach((b) => {
      const facilityId = b.parkingLot || b.chargingStation;
      if (facilityId) {
        facilityStats[facilityId] = (facilityStats[facilityId] || 0) + (b.totalPrice || 0);
      }
    });

    const topFacilities = [];
    for (const [id, value] of Object.entries(facilityStats)) {
      let f = await ParkingLot.findById(id).select("name");
      if (!f) {
        f = await ChargingStation.findById(id).select("name");
      }
      topFacilities.push({ name: f?.name || "Deleted Facility", value });
    }
    topFacilities.sort((a, b) => b.value - a.value);

    // Monthly breakdown trend (last 12 months)
    const monthlyData = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      monthlyData[label] = { month: label, revenue: 0 };
    }

    paidBookings.forEach((b) => {
      const label = new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (monthlyData[label]) {
        monthlyData[label].revenue += b.totalPrice || 0;
      }
    });

    return res.status(200).json({
      message: "Charts retrieved",
      data: {
        topFacilities: topFacilities.slice(0, 10),
        monthlyRevenue: Object.values(monthlyData),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: "booking",
        populate: { path: "user", select: "name email" },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ message: "Transactions retrieved", data: payments });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const exportTransactionsCSV = async (req, res) => {
  try {
    const payments = await Payment.find().populate({
      path: "booking",
      populate: { path: "user", select: "email" },
    });

    let csv = "Payment ID,Amount,Currency,Status,User,Date\n";
    payments.forEach((p) => {
      csv += `"${p.paymentId || p._id}",${p.amount},"${p.currency}","${p.status}","${p.booking?.user?.email || ""}","${p.createdAt.toISOString()}"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=transactions_export.csv");
    return res.status(200).send(csv);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getRefundsList = async (req, res) => {
  try {
    const refunds = await Refund.find().populate("userId", "name email").populate("bookingId").sort({ createdAt: -1 });
    return res.status(200).json({ message: "Refunds retrieved", data: refunds });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const manuallyTriggerRefund = async (req, res) => {
  try {
    const { bookingId, amount, reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const user = await User.findById(booking.user);
    if (user) {
      user.walletBalance = (user.walletBalance || 0) + Number(amount);
      await user.save();
    }

    const refund = await Refund.create({
      bookingId: booking._id,
      userId: booking.user,
      amount: Number(amount),
      paymentMethod: "bank_transfer",
      status: "processed",
      adminNotes: `Manual administrative wallet credit. Reason: ${reason || "Ad-hoc resolution"}`,
    });

    await logAdminAction(
      req.userId,
      "Manual Refund Trigger",
      "booking",
      booking._id,
      `Manually credited ${amount} back to user wallet for booking ${booking.bookingRef}`
    );

    return res.status(200).json({ message: "Manual refund processed successfully", data: refund });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 7. Reviews Moderation
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "name email")
      .populate("facilityId")
      .sort({ createdAt: -1 });

    return res.status(200).json({ message: "Reviews retrieved", data: reviews });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const hideReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { isHidden: true }, { new: true });
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await logAdminAction(req.userId, "Hide Review", "review", review._id, `Hid user review from public space`);

    return res.status(200).json({ message: "Review hidden from public map", data: review });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const restoreReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { isHidden: false }, { new: true });
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await logAdminAction(req.userId, "Restore Review", "review", review._id, `Restored hidden user review to public display`);

    return res.status(200).json({ message: "Review restored successfully", data: review });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await logAdminAction(req.userId, "Delete Review", "review", req.params.id, `Permanently deleted user review`);

    return res.status(200).json({ message: "Review permanently deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getReportedReviews = async (req, res) => {
  try {
    // Flagged reviews are reviews with report counts or custom report criteria
    const flagged = await Review.find({ reportCount: { $gt: 0 } })
      .populate("userId", "name email")
      .populate("facilityId");

    return res.status(200).json({ message: "Reported reviews retrieved", data: flagged });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const dismissReviewReport = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { reportCount: 0 }, { new: true });
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await logAdminAction(req.userId, "Dismiss Review Report", "review", review._id, `Cleared report warnings on review`);

    return res.status(200).json({ message: "Review report counts cleared", data: review });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 8. Support and Ticket Center
export const getSupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find().populate("submittedBy", "name email").sort({ createdAt: -1 });
    return res.status(200).json({ message: "Support tickets retrieved", data: tickets });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getTicketDetails = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id).populate("submittedBy", "name email");
    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    return res.status(200).json({ message: "Ticket details retrieved", data: ticket });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const replyToSupportTicket = async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    ticket.messages.push({
      sender: "ParkEase Admin Team",
      senderRole: "admin",
      message,
      sentAt: new Date(),
    });

    if (ticket.status === "open") {
      ticket.status = "in_progress";
    }

    await ticket.save();
    await logAdminAction(req.userId, "Reply Support Ticket", "support", ticket._id, `Added admin feedback answer inside thread ${ticket.ticketId}`);

    return res.status(200).json({ message: "Reply added successfully", data: ticket });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["open", "in_progress", "resolved", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!ticket) {
      return res.status(404).json({ message: "Support ticket not found" });
    }

    await logAdminAction(req.userId, "Change Support Ticket Status", "support", ticket._id, `Modified status to ${status}`);

    return res.status(200).json({ message: "Ticket status modified", data: ticket });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 9. Platform Config & Maintenance Settings
export const getPlatformSettings = async (req, res) => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create({});
    }

    return res.status(200).json({ message: "Global settings retrieved", data: settings });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updatePlatformSettings = async (req, res) => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = new PlatformSettings({});
    }

    Object.assign(settings, req.body);
    await settings.save();

    await logAdminAction(req.userId, "Update Platform Settings", "settings", settings._id, "Modified global configurations");

    return res.status(200).json({ message: "Global configurations modified successfully", data: settings });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const toggleMaintenanceMode = async (req, res) => {
  try {
    const { maintenanceMode, maintenanceMessage } = req.body;
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = new PlatformSettings({});
    }

    settings.maintenanceMode = maintenanceMode;
    if (maintenanceMessage) {
      settings.maintenanceMessage = maintenanceMessage;
    }

    await settings.save();
    await logAdminAction(
      req.userId,
      "Toggle Maintenance Mode",
      "settings",
      settings._id,
      `Toggled maintenance mode status to ${maintenanceMode}`
    );

    return res.status(200).json({ message: "Maintenance mode state updated", data: settings });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 10. Audit Logs
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AdminLog.find().populate("adminId", "name email").sort({ createdAt: -1 });
    return res.status(200).json({ message: "Audit logs retrieved", data: logs });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
