/**
 * Booking Expiry Scheduler
 *
 * Runs every 60 seconds. Finds all active bookings whose endTime has passed,
 * marks them as "completed", and frees the associated slot on the facility.
 *
 * This is a pure in-process scheduler using setInterval — no third-party
 * dependency (e.g. node-cron) is required.
 */

import Booking from "../models/Booking.js";
import ParkingLot from "../models/ParkingLot.js";
import ChargingStation from "../models/ChargingStation.js";
import { logger } from "../config/logger.js";

const POLL_INTERVAL_MS = 60 * 1000; // 1 minute

/**
 * Free a slot on a facility document and persist the updated counts.
 */
const freeSlot = async (Model, resourceId, slotId) => {
  try {
    const facility = await Model.findById(resourceId);
    if (!facility) return;

    const slot = facility.slots?.find((s) => s.slotId === slotId);
    if (slot) {
      slot.status = "available";
      slot.isAvailable = true;
    }

    // Recompute capacity counters
    const availableCount = facility.slots?.filter(
      (s) => s.status === "available" || (!s.status && s.isAvailable)
    ).length ?? 0;

    facility.capacity.available = availableCount;
    facility.capacity.reserved = facility.capacity.total - availableCount;

    await facility.save();
  } catch (err) {
    logger.error(`[BookingExpiry] Failed to free slot ${slotId} on resource ${resourceId}: ${err.message}`);
  }
};

/**
 * Main expiry routine — called once per tick.
 */
const expireBookings = async () => {
  try {
    const now = new Date();

    // Find all bookings that have gone past their endTime and are still "active"
    const expired = await Booking.find({
      status: { $in: ["pending", "confirmed"] },
      endTime: { $lte: now },
    });

    if (!expired.length) return;

    logger.info(`[BookingExpiry] Found ${expired.length} expired booking(s). Processing...`);

    for (const booking of expired) {
      try {
        // Mark booking completed
        booking.status = "completed";
        await booking.save();

        // Free the slot
        if (booking.bookingType === "parking" && booking.parkingLot && booking.slotId) {
          await freeSlot(ParkingLot, booking.parkingLot, booking.slotId);
        } else if (booking.bookingType === "charging" && booking.chargingStation && booking.slotId) {
          await freeSlot(ChargingStation, booking.chargingStation, booking.slotId);
        }

        logger.info(`[BookingExpiry] Booking ${booking.bookingRef} (${booking._id}) completed & slot freed.`);
      } catch (err) {
        logger.error(`[BookingExpiry] Error processing booking ${booking._id}: ${err.message}`);
      }
    }
  } catch (err) {
    logger.error(`[BookingExpiry] Scheduler tick failed: ${err.message}`);
  }
};

/**
 * Start the scheduler. Call this once after the DB connection is established.
 */
export const startBookingExpiryScheduler = () => {
  logger.info(`[BookingExpiry] Scheduler started (interval: ${POLL_INTERVAL_MS / 1000}s)`);

  // Run once immediately on startup to handle any backlog from downtime
  expireBookings();

  // Then run on every interval
  setInterval(expireBookings, POLL_INTERVAL_MS);
};
