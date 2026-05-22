import { CalendarX } from "lucide-react";
import { durationHours, formatCurrency, formatDateTime } from "../utils";

const statusTone = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-blue-50 text-blue-700",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-rose-50 text-rose-700",
  paid: "bg-emerald-50 text-emerald-700",
  failed: "bg-rose-50 text-rose-700",
  refunded: "bg-gray-100 text-gray-700",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${
        statusTone[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status || "-"}
    </span>
  );
}

export default function BookingTable({ bookings, compact = false, onComplete, onCancel }) {
  const headers = [
    "Booking ID",
    "User",
    "Facility",
    "Slot",
    "Date & Time",
    "Duration",
    "Amount",
    "Booking Status",
    "Payment",
    compact ? "" : "Actions",
  ];

  return (
    <div className="mt-4 rounded-xl border border-border bg-white shadow-sm overflow-hidden">
      {bookings.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <CalendarX className="mx-auto mb-3 h-8 w-8 text-textMuted" />
          <p className="font-semibold text-textPrimary">No bookings yet</p>
          <p className="mt-1 text-sm text-textMuted">Bookings from your listings will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-textSecondary uppercase tracking-wide border-b border-border">
              <tr>
                {headers.map((head) => (
                  <th key={head} className="px-4 py-3 whitespace-nowrap">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50 transition-colors text-sm text-textPrimary">
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs font-semibold text-primary">{booking.bookingRef}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {booking.user?.name || "-"}
                    <br />
                    <span className="text-xs text-slate-500">{booking.user?.email}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.parkingLot?.name || booking.chargingStation?.name || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.slotId || "-"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(booking.startTime)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{durationHours(booking)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatCurrency(booking.totalPrice)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge status={booking.paymentStatus} />
                  </td>
                  {!compact && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button onClick={() => onComplete?.(booking._id)} className="text-blue-700">
                          Complete
                        </button>
                        <button onClick={() => onCancel?.(booking._id)} className="text-rose-700">
                          Cancel
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
