import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import BackButton from "../components/ui/BackButton";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import StripePaymentPanel from "../components/payment/StripePaymentPanel";
import { createBooking } from "../services/bookingService";
import { formatCurrency, formatDateTime, getApiErrorMessage } from "../utils/formatters";
import { validateField } from "../utils/validation";

export default function BookingSummary({ user, token }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { facility, type, selectedSlot, startTime, endTime, hours = 0, totalPrice = 0, baseRate = 0, isPeak } = location.state || {};

  const [vehicleNumber, setVehicleNumber] = useState(user?.vehicles?.[0]?.plateNumber || "");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentBooking, setPaymentBooking] = useState(null);
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

  const finalPrice = Math.max(0, totalPrice - discount);

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

  const handleConfirmOrder = async () => {
    setSubmitted(true);
    const vehicleError = validateField("vehicleNumber", vehicleNumber);
    setFieldErrors((prev) => ({ ...prev, vehicleNumber: vehicleError }));

    if (vehicleError) {
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
          startTime,
          endTime,
        },
        token
      );

      setPaymentBooking(response.data);
      toast.success("Booking created. Complete payment to confirm.");
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentData) => {
    toast.success("Payment confirmed");
    navigate("/booking/success", {
      state: { paymentData, facility, selectedSlot, startTime, endTime, finalPrice },
    });
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10 animate-fadeIn md:px-0">
      <div className="mx-auto max-w-5xl">
        <BackButton label="Back to Facility Detail" />
        <h1 className="mb-8 text-3xl font-bold text-secondary">Booking Summary</h1>

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
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border bg-gray-50 p-4">
                    <p className="mb-1 text-xs font-bold uppercase text-textSecondary">Check In</p>
                    <p className="font-bold text-textPrimary">{formatDateTime(startTime)}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-gray-50 p-4">
                    <p className="mb-1 text-xs font-bold uppercase text-textSecondary">Check Out</p>
                    <p className="font-bold text-textPrimary">{formatDateTime(endTime)}</p>
                  </div>
                </div>
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

              {!paymentBooking ? (
                <button type="button" onClick={handleConfirmOrder} disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2 py-3">
                  {loading && <LoadingSpinner />}
                  {loading ? "Processing..." : "Proceed to Payment"}
                </button>
              ) : (
                <StripePaymentPanel booking={paymentBooking} token={token} onPaid={handlePaymentSuccess} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
