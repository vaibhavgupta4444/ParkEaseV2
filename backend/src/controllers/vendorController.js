import Booking from "../models/Booking.js";
import ChargingStation from "../models/ChargingStation.js";
import Coupon from "../models/Coupon.js";
import Notification from "../models/Notification.js";
import ParkingLot from "../models/ParkingLot.js";
import VendorProfile from "../models/VendorProfile.js";

const vendorFacilityFilter = (req) => (req.user.role === "admin" ? {} : { owner: req.userId });

const isOwner = (req, resource) =>
  req.user.role === "admin" || resource?.owner?.toString() === req.userId;

const normalizeSlot = (slot) => {
  if (!slot.status) {
    slot.status = slot.isAvailable ? "available" : "booked";
  }
  slot.isAvailable = slot.status === "available";
  return slot;
};

const syncCapacityFromSlots = (resource) => {
  resource.slots.forEach(normalizeSlot);
  resource.capacity.total = resource.slots.length;
  resource.capacity.available = resource.slots.filter((slot) => slot.status === "available").length;
  resource.capacity.reserved = resource.capacity.total - resource.capacity.available;
};

const getScopedBookings = async (req) => {
  const bookings = await Booking.find()
    .populate("user", "name email")
    .populate("parkingLot", "name owner location")
    .populate("chargingStation", "name owner location")
    .sort({ createdAt: -1 });

  if (req.user.role === "admin") return bookings;

  return bookings.filter(
    (booking) =>
      booking.parkingLot?.owner?.toString() === req.userId ||
      booking.chargingStation?.owner?.toString() === req.userId
  );
};

export const getVendorOverview = async (req, res) => {
  try {
    const [parkingLots, chargingStations, bookings, profile, notifications] = await Promise.all([
      ParkingLot.find(vendorFacilityFilter(req)).select("name capacity isActive"),
      ChargingStation.find(vendorFacilityFilter(req)).select("name capacity isActive"),
      getScopedBookings(req),
      VendorProfile.findOne({ userId: req.userId }),
      Notification.find({ userId: req.userId, read: false }),
    ]);

    const paidBookings = bookings.filter((booking) => booking.paymentStatus === "paid");
    const facilities = [...parkingLots, ...chargingStations];

    return res.status(200).json({
      message: "Vendor overview retrieved",
      data: {
        totals: {
          parkingLots: parkingLots.length,
          evStations: chargingStations.length,
          bookings: bookings.length,
          revenue: paidBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0),
          activeListings: facilities.filter((facility) => facility.isActive).length,
          pendingIssues: notifications.length,
        },
        verificationStatus: profile?.verificationStatus || "unverified",
        recentBookings: bookings.slice(0, 10),
        occupancy: facilities.map((facility) => ({
          id: facility._id,
          name: facility.name,
          total: facility.capacity?.total || 0,
          available: facility.capacity?.available || 0,
          occupied: Math.max((facility.capacity?.total || 0) - (facility.capacity?.available || 0), 0),
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getFacilityModel = (type) => (type === "charging" ? ChargingStation : ParkingLot);

export const getFacilitySlots = async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = getFacilityModel(type);
    const facility = await Model.findById(id);
    if (!facility) return res.status(404).json({ message: "Facility not found" });
    if (!isOwner(req, facility)) return res.status(403).json({ message: "Unauthorized" });

    facility.slots.forEach(normalizeSlot);
    await facility.save();

    return res.status(200).json({ message: "Slots retrieved", data: facility.slots, capacity: facility.capacity });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createFacilitySlot = async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = getFacilityModel(type);
    const facility = await Model.findById(id);
    if (!facility) return res.status(404).json({ message: "Facility not found" });
    if (!isOwner(req, facility)) return res.status(403).json({ message: "Unauthorized" });

    const nextNumber = facility.slots.length + 1;
    const slot = {
      slotId: req.body.slotId?.trim() || `${type === "charging" ? "EV" : "P"}-${nextNumber}`,
      type: req.body.type || (type === "charging" ? "EV" : "car"),
      status: req.body.status || "available",
      isAvailable: (req.body.status || "available") === "available",
      pricePerHour: Number(req.body.pricePerHour || facility.pricing?.hourlyRate || facility.pricing?.rate || 0),
    };

    if (facility.slots.some((item) => item.slotId === slot.slotId)) {
      return res.status(409).json({ message: "Slot ID already exists" });
    }

    facility.slots.push(slot);
    syncCapacityFromSlots(facility);
    await facility.save();

    return res.status(201).json({ message: "Slot created", data: facility.slots, capacity: facility.capacity });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateFacilitySlot = async (req, res) => {
  try {
    const { type, id, slotId } = req.params;
    const Model = getFacilityModel(type);
    const facility = await Model.findById(id);
    if (!facility) return res.status(404).json({ message: "Facility not found" });
    if (!isOwner(req, facility)) return res.status(403).json({ message: "Unauthorized" });

    const slot = facility.slots.find((item) => item.slotId === slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    if (req.body.type) slot.type = req.body.type;
    if (req.body.status) slot.status = req.body.status;
    if (req.body.pricePerHour !== undefined) slot.pricePerHour = Number(req.body.pricePerHour);
    normalizeSlot(slot);
    syncCapacityFromSlots(facility);
    await facility.save();

    return res.status(200).json({ message: "Slot updated", data: facility.slots, capacity: facility.capacity });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteFacilitySlot = async (req, res) => {
  try {
    const { type, id, slotId } = req.params;
    const Model = getFacilityModel(type);
    const facility = await Model.findById(id);
    if (!facility) return res.status(404).json({ message: "Facility not found" });
    if (!isOwner(req, facility)) return res.status(403).json({ message: "Unauthorized" });

    const activeBooking = await Booking.exists({
      [type === "charging" ? "chargingStation" : "parkingLot"]: facility._id,
      slotId: slotId,
      status: { $in: ["pending", "confirmed"] },
    });
    if (activeBooking) return res.status(409).json({ message: "Cannot delete a slot with an active booking" });

    facility.slots = facility.slots.filter((slot) => slot.slotId !== slotId);
    syncCapacityFromSlots(facility);
    await facility.save();

    return res.status(200).json({ message: "Slot deleted", data: facility.slots, capacity: facility.capacity });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getVendorBookings = async (req, res) => {
  try {
    const { status, facilityId, search } = req.query;
    let bookings = await getScopedBookings(req);

    if (status) bookings = bookings.filter((booking) => booking.status === status);
    if (facilityId) {
      bookings = bookings.filter(
        (booking) =>
          booking.parkingLot?._id?.toString() === facilityId ||
          booking.chargingStation?._id?.toString() === facilityId
      );
    }
    if (search) {
      const term = search.toLowerCase();
      bookings = bookings.filter(
        (booking) =>
          booking.bookingRef?.toLowerCase().includes(term) ||
          booking.user?.email?.toLowerCase().includes(term)
      );
    }

    return res.status(200).json({ message: "Vendor bookings retrieved", data: bookings });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getVendorBookingDetails = async (req, res) => {
  try {
    const bookings = await getScopedBookings(req);
    const booking = bookings.find((item) => item._id.toString() === req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    return res.status(200).json({ message: "Booking retrieved", data: booking });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const completeVendorBooking = async (req, res) => {
  try {
    const bookings = await getScopedBookings(req);
    const booking = bookings.find((item) => item._id.toString() === req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = "completed";
    await booking.save();

    const model = booking.parkingLot ? ParkingLot : ChargingStation;
    const resourceId = booking.parkingLot || booking.chargingStation;
    if (resourceId) {
      await model.findByIdAndUpdate(resourceId, {
        $inc: { revenue: booking.totalPrice || 0, totalBookings: 1 },
      });
      const facility = await model.findById(resourceId);
      if (facility && booking.slotId) {
        const slot = facility.slots.find(s => s.slotId === booking.slotId);
        if (slot) {
          slot.status = "available";
          slot.isAvailable = true;
          syncCapacityFromSlots(facility);
          await facility.save();
        }
      }
    }

    return res.status(200).json({ message: "Booking completed", data: booking });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const cancelVendorBooking = async (req, res) => {
  try {
    const bookings = await getScopedBookings(req);
    const booking = bookings.find((item) => item._id.toString() === req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const model = booking.bookingType === "parking" ? ParkingLot : ChargingStation;
    const resourceId = booking.bookingType === "parking" ? booking.parkingLot?._id : booking.chargingStation?._id;
    const resource = resourceId ? await model.findById(resourceId) : null;

    if (resource && booking.slotId) {
      const slot = resource.slots.find((item) => item.slotId === booking.slotId);
      if (slot) {
        slot.status = "available";
        slot.isAvailable = true;
        syncCapacityFromSlots(resource);
        await resource.save();
      }
    }

    booking.status = "cancelled";
    booking.cancelReason = req.body.reason;
    await booking.save();

    return res.status(200).json({ message: "Booking cancelled", data: booking });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const exportVendorBookings = async (req, res) => {
  try {
    const bookings = await getScopedBookings(req);
    const rows = [
      "Booking Ref,User Email,Facility,Slot,Start,End,Amount,Payment Status,Booking Status",
      ...bookings.map((booking) => {
        const facility = booking.parkingLot?.name || booking.chargingStation?.name || "";
        return [
          booking.bookingRef,
          booking.user?.email || "",
          facility,
          booking.slotId || "",
          booking.startTime?.toISOString?.() || "",
          booking.endTime?.toISOString?.() || "",
          booking.totalPrice || 0,
          booking.paymentStatus,
          booking.status,
        ].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",");
      }),
    ];

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=vendor-bookings.csv");
    return res.status(200).send(rows.join("\n"));
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getVendorAnalytics = async (req, res) => {
  try {
    const bookings = await getScopedBookings(req);
    const bucket = new Map();

    bookings.forEach((booking) => {
      const day = booking.createdAt.toISOString().slice(0, 10);
      const current = bucket.get(day) || { date: day, revenue: 0, bookings: 0 };
      current.bookings += 1;
      if (booking.paymentStatus === "paid") current.revenue += booking.totalPrice || 0;
      bucket.set(day, current);
    });

    const facilityRevenue = new Map();
    bookings.forEach((booking) => {
      const facility = booking.parkingLot?.name || booking.chargingStation?.name || "Unknown";
      facilityRevenue.set(facility, (facilityRevenue.get(facility) || 0) + (booking.totalPrice || 0));
    });

    const topFacility = [...facilityRevenue.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, revenue]) => ({ name, revenue }))[0] || null;

    const hourFreq = Array.from({ length: 7 }, () => Array(24).fill(0));
    bookings.forEach((b) => {
      if (b.status === "cancelled") return;
      const start = new Date(b.startTime);
      const end = new Date(b.endTime);
      for (let d = new Date(start); d <= end; d.setHours(d.getHours() + 1)) {
        const dayIdx = d.getDay();
        const hourIdx = d.getHours();
        if (hourFreq[dayIdx] !== undefined) hourFreq[dayIdx][hourIdx] += 1;
      }
    });

    const occupancyRate = [...bucket.values()].map((d) => {
      const activeBookings = bookings.filter((b) => {
        const bDay = b.createdAt.toISOString().slice(0, 10);
        return bDay === d.date && b.status !== "cancelled";
      }).length;
      return { date: d.date, rate: activeBookings };
    });

    return res.status(200).json({
      message: "Vendor analytics retrieved",
      data: {
        period: req.query.period || "weekly",
        revenueByDay: [...bucket.values()],
        bookingsByDay: [...bucket.values()],
        topFacility,
        peakHours: hourFreq,
        occupancyRate,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateParkingPricing = async (req, res) => {
  try {
    const lot = await ParkingLot.findById(req.params.id);
    if (!lot) return res.status(404).json({ message: "Parking lot not found" });
    if (!isOwner(req, lot)) return res.status(403).json({ message: "Unauthorized" });

    const existingPricing = lot.pricing?.toObject?.() || lot.pricing || {};
    lot.pricing = { ...existingPricing, ...req.body };
    await lot.save();
    return res.status(200).json({ message: "Pricing updated", data: lot.pricing });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create({ ...req.body, vendorId: req.userId });
    return res.status(201).json({ message: "Coupon created", data: coupon });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ vendorId: req.userId }).sort({ createdAt: -1 });
    return res.status(200).json({ message: "Coupons retrieved", data: coupons });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    await Coupon.deleteOne({ _id: req.params.id, vendorId: req.userId });
    return res.status(200).json({ message: "Coupon deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getVendorProfile = async (req, res) => {
  try {
    const profile = await VendorProfile.findOne({ userId: req.userId });
    return res.status(200).json({ message: "Vendor profile retrieved", data: profile });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const upsertVendorProfile = async (req, res) => {
  try {
    const currentProfile = await VendorProfile.findOne({ userId: req.userId });
    let verificationStatus = currentProfile?.verificationStatus || "unverified";

    if (req.body.documents && req.body.documents.length > 0) {
      if (verificationStatus === "unverified" || verificationStatus === "rejected") {
        verificationStatus = "pending";
      }
    }

    const profile = await VendorProfile.findOneAndUpdate(
      { userId: req.userId },
      { ...req.body, userId: req.userId, verificationStatus },
      { new: true, upsert: true, runValidators: true }
    );
    return res.status(200).json({ message: "Vendor profile saved", data: profile });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(50);
    return res.status(200).json({ message: "Notifications retrieved", data: notifications });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { read: true },
      { new: true }
    );
    return res.status(200).json({ message: "Notification updated", data: notification });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
