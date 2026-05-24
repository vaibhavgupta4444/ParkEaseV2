import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Navigation, Download } from "lucide-react";
import BackButton from "../components/ui/BackButton";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorState from "../components/ui/ErrorState";
import { getBookingById, cancelBooking } from "../services/bookingService";
import { formatCurrency, formatDateTime, getApiErrorMessage } from "../utils/formatters";

export default function BookingDetailsPage({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadBooking = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getBookingById(id, token);
      setBooking(res.data);
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await cancelBooking(id, token);
      toast.success("Booking cancelled successfully");
      await loadBooking(); // refresh to show updated status
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  useEffect(() => {
    if (token && id) {
      loadBooking();
    }
    // eslint-disable-next-line
  }, [id, token]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-8 lg:px-8">
        <div className="mb-6">
          <BackButton label="Back to Bookings" to="/bookings" />
        </div>
        <div className="flex min-h-72 items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-8 lg:px-8">
        <div className="mb-6">
          <BackButton label="Back to Bookings" to="/bookings" />
        </div>
        <div className="mt-8">
          <ErrorState message={error || "Booking not found"} onRetry={loadBooking} />
        </div>
      </div>
    );
  }

  const facility = booking.bookingType === "parking" ? booking.parkingLot : booking.chargingStation;
  const isPendingPayment = booking.paymentStatus === "pending" || booking.paymentStatus === "unpaid";
  const isCancelable = booking.status !== "cancelled" && booking.status !== "completed" && new Date(booking.startTime) > new Date();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 animate-fadeIn md:py-8 lg:px-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="flex items-start gap-4">
          <BackButton label="Back to Bookings" to="/bookings" />
          <div className="pt-1">
            <h1 className="text-3xl font-bold leading-none text-secondary">Booking Details</h1>
            <p className="mt-2 text-sm font-semibold text-textSecondary uppercase tracking-wider">
              Ref: {booking.bookingRef}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className={`inline-flex items-center rounded-full px-3 py-1 font-semibold uppercase text-xs tracking-wide border ${
            booking.status === "confirmed" ? "bg-green-50 text-green-700 border-green-200" :
            booking.status === "cancelled" ? "bg-red-50 text-error border-red-200" :
            "bg-yellow-50 text-warning border-yellow-200"
          }`}>
            {booking.status}
          </span>
          <span className={`inline-flex items-center rounded-full px-3 py-1 font-semibold uppercase text-xs tracking-wide border ${
            booking.paymentStatus === "paid" ? "bg-blue-50 text-primary border-blue-200" :
            "bg-gray-100 text-textSecondary border-border"
          }`}>
            {booking.paymentStatus}
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden">
            <div className="bg-secondary p-6 text-white">
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-white/70">
                {booking.bookingType === "parking" ? "Parking Facility" : "EV Charging Station"}
              </p>
              <h2 className="text-2xl font-bold">{facility?.name || "Unknown Facility"}</h2>
              {facility?.location?.address && (
                <p className="mt-2 text-sm text-white/80">
                  {facility.location.address.street}, {facility.location.address.city}
                </p>
              )}
            </div>
            <div className="p-6">
              <h3 className="mb-4 border-b border-border pb-2 text-lg font-bold text-secondary">Schedule</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-gray-50 p-4">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-textSecondary">Entry</p>
                  <p className="font-bold text-textPrimary text-sm sm:text-base">{formatDateTime(booking.startTime)}</p>
                </div>
                <div className="rounded-xl border border-border bg-gray-50 p-4">
                  <p className="mb-1 text-xs font-bold uppercase tracking-wider text-textSecondary">Exit</p>
                  <p className="font-bold text-textPrimary text-sm sm:text-base">{formatDateTime(booking.endTime)}</p>
                </div>
              </div>

              <h3 className="mt-8 mb-4 border-b border-border pb-2 text-lg font-bold text-secondary">Slot Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-4 rounded-xl border border-border bg-gray-50 p-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-lg font-bold text-primary shadow-inner border border-blue-100">
                    {booking.slotId}
                  </div>
                  <div>
                    <p className="font-semibold text-textPrimary">Reserved Slot</p>
                    <p className="text-sm text-textSecondary capitalize">{booking.bookingType} Spot</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border border-border bg-gray-50 p-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-sm font-black text-secondary shadow-inner border border-border">
                    {(booking.vehicleNumber || "N/A").slice(0, 4)}
                  </div>
                  <div>
                    <p className="font-semibold text-textPrimary">Vehicle Number</p>
                    <p className="font-mono text-sm font-bold uppercase tracking-wider text-textSecondary">
                      {booking.vehicleNumber || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-border bg-gray-50 p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-secondary">Payment Summary</h3>
            <div className="space-y-3 text-sm font-medium text-textSecondary">
              <div className="flex justify-between">
                <span>Total Amount</span>
                <span className="font-bold text-textPrimary">{formatCurrency(booking.totalPrice)}</span>
              </div>
            </div>
            <div className="mt-6 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <span className="font-bold uppercase tracking-wide text-textPrimary">Final Price</span>
                <span className="text-2xl font-black text-primary">{formatCurrency(booking.totalPrice)}</span>
              </div>
            </div>

            {isPendingPayment && booking.status !== "cancelled" && (
              <button
                type="button"
                onClick={() => navigate(`/payment/${booking._id}`, { state: { booking } })}
                className="btn-primary mt-6 w-full py-3 print:hidden"
              >
                Pay Now
              </button>
            )}
            
            {booking.status === "confirmed" && new Date(booking.endTime) > new Date() && (
              <button
                type="button"
                onClick={() => navigate(`/navigate/${booking._id}`)}
                className="btn-primary mt-3 flex w-full items-center justify-center gap-2 py-3 print:hidden"
              >
                <Navigation size={18} />
                Get Directions
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="btn-ghost mt-3 flex w-full items-center justify-center gap-2 border border-border bg-white text-textPrimary hover:bg-gray-50 print:hidden"
            >
              <Download size={18} />
              Download Invoice
            </button>

            {isCancelable && (
              <button
                type="button"
                onClick={handleCancelBooking}
                className="btn-ghost mt-3 w-full border border-border bg-white text-error hover:bg-red-50 hover:border-red-200 print:hidden"
              >
                Cancel Booking
              </button>
            )}

            {booking.status === "cancelled" && booking.paymentStatus === "paid" && (
              <button
                type="button"
                onClick={() => navigate(`/refund/${booking._id}`, { state: { booking } })}
                className="btn-ghost mt-3 w-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 print:hidden"
              >
                Request Refund
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
