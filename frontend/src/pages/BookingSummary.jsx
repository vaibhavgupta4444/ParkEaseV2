import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import BackButton from "../components/ui/BackButton";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { createBooking } from "../services/bookingService";
import { formatCurrency, formatDateTime, getApiErrorMessage } from "../utils/formatters";
import { validateField } from "../utils/validation";

const toLocalInputValue = (date) => {
  const nextDate = new Date(date);
  return new Date(nextDate.getTime() - nextDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const addHours = (value, hours) => {
  const date = new Date(value);
  date.setHours(date.getHours() + hours);
  return toLocalInputValue(date);
};

const addMinutes = (value, minutes) => {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() + minutes);
  return toLocalInputValue(date);
};

export default function BookingSummary({ user, token }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { facility, type, selectedSlot, baseRate: initialBaseRate = 0 } = location.state || {};
  const defaultStartTime = toLocalInputValue(new Date());
  const defaultEndTime = addHours(defaultStartTime, 1);

  const [bookingStartTime, setBookingStartTime] = useState(defaultStartTime);
  const [bookingEndTime, setBookingEndTime] = useState(defaultEndTime);
  const [vehicleNumber, setVehicleNumber] = useState(user?.vehicles?.[0]?.plateNumber || "");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!facility) {
    return (
      <div className="page-shell flex min-h-screen flex-col items-center justify-center text-center">
        <h2 className="mb-4 text-2xl font-bold text-secondary">No Booking Details Found</h2>
        <button onClick={() => navigate("/map")} className="btn-primary">Go back to map</button>
      </div>
    );
  }

  const startDate = new Date(bookingStartTime);
  const endDate = new Date(bookingEndTime);
  const hours = Math.max(0, (endDate - startDate) / (1000 * 60 * 60));
  const baseRate = initialBaseRate || selectedSlot?.pricePerHour || facility.pricing?.hourlyRate || facility.pricing?.rate || 0;
  const isPeak = startDate.getHours() >= 17 && startDate.getHours() <= 21;
  const totalPrice = hours * baseRate * (isPeak ? 1.25 : 1);
  const finalPrice = Math.max(0, totalPrice - discount);
  const minCheckoutTime = addMinutes(bookingStartTime, 1);
  const scheduleError = endDate <= startDate ? "Check out time must be after check in time" : "";

  const updateVehicleNumber = (value) => {
    const next = value.toUpperCase();
    setVehicleNumber(next);
    if (submitted || fieldErrors.vehicleNumber) {
      setFieldErrors((prev) => ({ ...prev, vehicleNumber: validateField("vehicleNumber", next) }));
    }
  };

  const updateCouponCode = (value) => {
    const next = value.toUpperCase();
    setCouponCode(next);
    if (submitted || fieldErrors.couponCode) {
      setFieldErrors((prev) => ({ ...prev, couponCode: validateField("couponCode", next) }));
    }
  };

  const applyCoupon = () => {
    const couponError = validateField("couponCode", couponCode);
    setFieldErrors((prev) => ({ ...prev, couponCode: couponError }));
    if (couponError) {
      toast.error("Please fix the errors below");
      return;
    }

    if (couponCode.toUpperCase() === "PARK10") {
      setDiscount(totalPrice * 0.1);
      setError("");
      toast.success("Coupon applied successfully");
    } else {
      const message = "Invalid or expired coupon code";
      setError(message);
      setDiscount(0);
      toast.error(message);
    }
  };

  const updateStartTime = (value) => {
    setBookingStartTime(value);
    if (new Date(bookingEndTime) <= new Date(value)) {
      setBookingEndTime(addHours(value, 1));
    }
  };

  const updateEndTime = (value) => {
    if (new Date(value) <= new Date(bookingStartTime)) {
      toast.error("Check out time must be after check in time");
      return;
    }
    setBookingEndTime(value);
  };

  const handleConfirmOrder = async () => {
    setSubmitted(true);
    const vehicleError = validateField("vehicleNumber", vehicleNumber);
    setFieldErrors((prev) => ({ ...prev, vehicleNumber: vehicleError }));

    if (vehicleError || scheduleError) {
      toast.error("Please fix the errors below");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await createBooking(
        {
          bookingType: type,
          targetId: facility._id,
          slotId: selectedSlot.slotId,
          startTime: bookingStartTime,
          endTime: bookingEndTime,
          vehicleNumber,
        },
        token
      );

      toast.success("Booking created. Proceeding to payment...");
      navigate(`/payment/${response.data._id}`, {
        state: { paymentBooking: response.data, facility, selectedSlot, startTime: bookingStartTime, endTime: bookingEndTime, finalPrice }
      });
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10 animate-fadeIn md:px-0">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-3">
          <BackButton label="Back to Facility Detail" />
          <h1 className="text-3xl font-bold text-secondary">Booking Summary</h1>
        </div>

        {error && <div className="mb-6 rounded-xl bg-red-50 p-4 font-medium text-error">{error}</div>}

        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
          <div className="grid gap-6 bg-secondary p-6 text-white md:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-blue-100">
                {type === "parking" ? "Parking Facility" : "EV Station"}
              </p>
              <h2 className="text-2xl font-bold">{facility.name}</h2>
              <p className="mt-1 text-white/70">
                {facility.location?.address?.street}, {facility.location?.address?.city}
              </p>
            </div>
            <div className="flex flex-col justify-center rounded-xl border border-white/10 bg-white/10 p-4">
              <p className="text-sm text-white/70">Selected Slot</p>
              <p className="text-2xl font-bold">
                {selectedSlot.slotId} <span className="text-sm font-medium text-white/70">({selectedSlot.type})</span>
              </p>
            </div>
          </div>

          <div className="grid gap-8 p-6 md:grid-cols-12 md:p-8">
            <div className="space-y-8 md:col-span-8">
              <section>
                <h3 className="mb-4 border-b border-border pb-2 text-lg font-bold text-secondary">Schedule</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-border bg-gray-50 p-4">
                    <label className="mb-2 block text-xs font-bold uppercase text-textSecondary" htmlFor="checkInTime">Check In</label>
                    <input
                      id="checkInTime"
                      type="datetime-local"
                      value={bookingStartTime}
                      onChange={(event) => updateStartTime(event.target.value)}
                      className="field-input font-bold"
                    />
                    <p className="mt-2 text-xs font-semibold text-textSecondary">{formatDateTime(bookingStartTime)}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-gray-50 p-4">
                    <label className="mb-2 block text-xs font-bold uppercase text-textSecondary" htmlFor="checkOutTime">Check Out</label>
                    <input
                      id="checkOutTime"
                      type="datetime-local"
                      value={bookingEndTime}
                      min={minCheckoutTime}
                      onChange={(event) => updateEndTime(event.target.value)}
                      className={`field-input font-bold ${scheduleError ? "field-input-error" : ""}`}
                    />
                    <p className="mt-2 text-xs font-semibold text-textSecondary">{formatDateTime(bookingEndTime)}</p>
                  </div>
                </div>
                {scheduleError && <p className="field-error">{scheduleError}</p>}
              </section>

              <section>
                <h3 className="mb-4 border-b border-border pb-2 text-lg font-bold text-secondary">Vehicle Details</h3>
                <label className="field-label">Vehicle Plate Number *</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => updateVehicleNumber(e.target.value)}
                  onBlur={() => setFieldErrors((prev) => ({ ...prev, vehicleNumber: validateField("vehicleNumber", vehicleNumber) }))}
                  placeholder="e.g. MH12AB1234"
                  className={`field-input uppercase font-semibold tracking-wider ${fieldErrors.vehicleNumber ? "field-input-error" : ""}`}
                />
                {fieldErrors.vehicleNumber && <p className="field-error">{fieldErrors.vehicleNumber}</p>}
                <p className="mt-1 text-xs text-textSecondary">This plate number will be verified at entry</p>
              </section>

              <section>
                <h3 className="mb-4 border-b border-border pb-2 text-lg font-bold text-secondary">Offers & Coupons</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => updateCouponCode(e.target.value)}
                    onBlur={() => couponCode && setFieldErrors((prev) => ({ ...prev, couponCode: validateField("couponCode", couponCode) }))}
                    placeholder="Try PARK10"
                    className={`field-input flex-1 uppercase ${fieldErrors.couponCode ? "field-input-error" : ""}`}
                  />
                  <button type="button" onClick={applyCoupon} className="btn-secondary">
                    Apply
                  </button>
                </div>
                {fieldErrors.couponCode && <p className="field-error">{fieldErrors.couponCode}</p>}
                {discount > 0 && <p className="mt-2 text-sm font-bold text-success">Coupon applied! Saved {formatCurrency(discount)}</p>}
              </section>
            </div>

            <div className="rounded-2xl border border-border bg-gray-50 p-6 md:col-span-4 self-start sticky top-24">
              <h3 className="mb-4 border-b border-border pb-2 font-bold text-secondary">Price Breakdown</h3>
              <div className="mb-6 space-y-3 text-sm text-textSecondary">
                <div className="flex justify-between items-center gap-3">
                  <span className="font-semibold text-secondary">Base Rate ({hours.toFixed(1)}h × {formatCurrency(baseRate)})</span>
                  <span className="font-bold text-textPrimary shrink-0">{formatCurrency(totalPrice)}</span>
                </div>
                {isPeak && (
                  <div className="flex justify-between text-error">
                    <span>Peak Hour Surcharge</span>
                    <span className="font-medium">Included</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span className="font-medium">- {formatCurrency(discount)}</span>
                  </div>
                )}
              </div>

              <div className="mb-8 flex items-center justify-between border-t border-border pt-5">
                <p className="text-sm font-black uppercase tracking-tight text-textSecondary">Total Amount</p>
                <p className="text-3xl font-black text-primary">{formatCurrency(finalPrice)}</p>
              </div>

              <button type="button" onClick={handleConfirmOrder} disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2 py-3">
                {loading && <LoadingSpinner />}
                {loading ? "Processing..." : "Confirm Booking & Proceed to Payment"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
