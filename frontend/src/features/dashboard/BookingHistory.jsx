import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { CalendarDays } from "lucide-react";
import BackButton from "../../components/ui/BackButton";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import Skeleton from "../../components/ui/Skeleton";
import { cancelBooking, getBookingHistory } from "../../services/bookingService";
import { formatCurrency, formatDateTime, getApiErrorMessage } from "../../utils/formatters";

export default function BookingHistory({ token }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = async () => {
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
  };

  const handleCancel = async (bookingId) => {
    setLoading(true);
    setError("");

    try {
      await cancelBooking(bookingId, token);
      await loadHistory();
      toast.success("Booking cancelled successfully");
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadHistory();
    }
  }, [token]);

  return (
    <div className="page-shell text-textPrimary">
      <BackButton label="Back to Home" to="/map" />
      <h2 className="text-2xl font-bold text-secondary">Booking History</h2>

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
            const isUpcoming = new Date(booking.startTime) > new Date();
            return (
              <div
                key={booking._id}
                className="app-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-secondary">{item?.name || "Booking"}</h3>
                    <span className="text-xs text-textSecondary">
                      {isParking ? "Parking" : "EV Charging"}
                    </span>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-1 text-xs capitalize ${
                      booking.status === "confirmed"
                        ? "bg-blue-100 text-primary"
                        : booking.status === "cancelled"
                        ? "bg-red-100 text-error"
                        : "bg-yellow-100 text-warning"
                    }`}
                  >
                    {booking.status} · {booking.paymentStatus}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-textSecondary">
                  <div className="flex justify-between">
                    <span className="font-semibold text-textPrimary">Start</span>
                    <span>{formatDateTime(booking.startTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-textPrimary">End</span>
                    <span>{formatDateTime(booking.endTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-textPrimary">Total</span>
                    <span>{formatCurrency(booking.totalPrice)}</span>
                  </div>
                  {booking.bookingRef && (
                    <div className="flex justify-between">
                      <span className="font-semibold text-textPrimary">Reference</span>
                      <span>{booking.bookingRef}</span>
                    </div>
                  )}
                </div>
                {isUpcoming && booking.status !== "cancelled" && (
                  <button
                    type="button"
                    onClick={() => handleCancel(booking._id)}
                    className="btn-danger mt-4 w-full"
                  >
                    Cancel booking
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
