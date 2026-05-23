import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { CalendarDays, ChevronRight, Navigation } from "lucide-react";
import BackButton from "../../components/ui/BackButton";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import Skeleton from "../../components/ui/Skeleton";
import { getBookingHistory } from "../../services/bookingService";
import { formatCurrency, formatDateTime, getApiErrorMessage } from "../../utils/formatters";

export default function BookingHistory({ token }) {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getBookingHistory(token);
      setBookings(response.data || []);
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadHistory();
    }
  }, [token, loadHistory]);

  return (
    <div className="page-shell text-textPrimary">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <BackButton label="Back to Map" to="/map" />
          <h2 className="text-2xl font-bold text-secondary">My Bookings</h2>
        </div>
        <p className="mt-1 text-sm text-textSecondary">Click any booking to view full details or manage payment</p>
      </div>

      {error && <div className="mt-4"><ErrorState message={error} onRetry={loadHistory} /></div>}

      {loading ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => <Skeleton key={item} className="h-56" />)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<CalendarDays size={32} />}
            title="No bookings yet"
            description="Start by finding a parking spot near you"
            action={<a href="/map" className="btn-primary inline-flex">Find Parking</a>}
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {bookings.map((booking) => {
            const isParking = booking.bookingType === "parking";
            const item = isParking ? booking.parkingLot : booking.chargingStation;
            const isPendingPayment = booking.paymentStatus === "pending" || booking.paymentStatus === "unpaid";
            const canNavigate = booking.status === "confirmed" && new Date(booking.endTime) > new Date();
            return (
              <div
                key={booking._id}
                onClick={() => navigate(`/bookings/${booking._id}`)}
                className="app-card group flex min-h-64 cursor-pointer flex-col transition-all hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-secondary group-hover:text-primary transition-colors">{item?.name || "Booking"}</h3>
                    <span className="text-xs text-textSecondary">{isParking ? "Parking" : "EV Charging"}</span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${
                        booking.status === "confirmed"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : booking.status === "cancelled"
                          ? "bg-red-50 text-error border-red-200"
                          : "bg-yellow-50 text-warning border-yellow-200"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid flex-1 gap-1.5 text-sm text-textSecondary">
                  <div className="flex justify-between">
                    <span className="font-medium text-textPrimary">Entry</span>
                    <span>{formatDateTime(booking.startTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-textPrimary">Exit</span>
                    <span>{formatDateTime(booking.endTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-textPrimary">Amount</span>
                    <span className="font-bold text-primary">{formatCurrency(booking.totalPrice)}</span>
                  </div>
                  {booking.slotId && (
                    <div className="flex justify-between">
                      <span className="font-medium text-textPrimary">Slot</span>
                      <span className="font-mono font-semibold">{booking.slotId}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 border-t border-border pt-3">
                  {isPendingPayment && booking.status !== "cancelled" ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/payment/${booking._id}`, { state: { booking } });
                      }}
                      className="btn-primary mb-3 flex w-full items-center justify-center py-3"
                    >
                      Pay Now
                    </button>
                  ) : null}
                  {canNavigate ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/navigate/${booking._id}`);
                      }}
                      className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-blue-50"
                    >
                      <Navigation size={14} />
                      Get Directions
                    </button>
                  ) : null}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-textSecondary">Ref: {booking.bookingRef}</span>
                    <ChevronRight size={16} className="text-textSecondary group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
