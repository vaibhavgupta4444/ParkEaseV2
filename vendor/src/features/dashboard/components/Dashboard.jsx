import { AlertCircle, CalendarCheck, IndianRupee, LayoutList, ParkingSquare, Zap } from "lucide-react";
import BookingTable from "./BookingTable";
import { formatCurrency } from "../utils";

const MOCK_TOTALS = {
  parkingLots: 12,
  evStations: 5,
  bookings: 1420,
  revenue: 85400,
  activeListings: 15,
  pendingIssues: 3,
};

const MOCK_OCCUPANCY = [
  { id: "1", name: "Downtown Central Parking", total: 150, occupied: 127 },
  { id: "2", name: "Airport Terminal B", total: 300, occupied: 285 },
  { id: "3", name: "City Mall EV Charging Station", total: 20, occupied: 9 },
  { id: "4", name: "Westside Premium Slots", total: 50, occupied: 12 },
];

export default function Dashboard({ overview, onViewAllBookings }) {
  const totals = overview?.totals?.parkingLots ? overview.totals : MOCK_TOTALS;
  const occupancyList = overview?.occupancy?.length > 0 ? overview.occupancy : MOCK_OCCUPANCY;
  const cards = [
    {
      label: "Parking Lots",
      value: totals.parkingLots || 0,
      subtitle: "Total registered lots",
      icon: ParkingSquare,
      iconBg: "bg-blue-50",
      iconColor: "text-primary",
    },
    {
      label: "EV Stations",
      value: totals.evStations || 0,
      subtitle: "Charging points active",
      icon: Zap,
      iconBg: "bg-green-50",
      iconColor: "text-success",
    },
    {
      label: "Bookings",
      value: totals.bookings || 0,
      subtitle: "All time bookings",
      icon: CalendarCheck,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "Revenue",
      value: formatCurrency(totals.revenue),
      subtitle: "Total earnings",
      icon: IndianRupee,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Active Listings",
      value: totals.activeListings || 0,
      subtitle: "Currently live",
      icon: LayoutList,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
    },
    {
      label: "Pending Issues",
      value: totals.pendingIssues || 0,
      subtitle: "Requires attention",
      icon: AlertCircle,
      iconBg: "bg-red-50",
      iconColor: "text-error",
    },
  ];

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {cards.map(({ label, value, subtitle, icon: Icon, iconBg, iconColor }) => (
          <div key={label} className="bg-surface rounded-xl border border-border shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-textSecondary">{label}</span>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
                <Icon size={18} className={iconColor} />
              </div>
            </div>
            <div className="text-3xl font-bold text-secondary">{value}</div>
            <div className="text-xs text-textMuted mt-1">{subtitle}</div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="min-w-0 rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h3 className="text-lg font-bold text-secondary">Recent Bookings</h3>
          <BookingTable bookings={overview?.recentBookings || []} compact />
          {(overview?.recentBookings || []).length > 0 && (
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={onViewAllBookings} className="text-sm font-medium text-primary hover:underline">
                View All
              </button>
            </div>
          )}
        </div>
        <div className="min-w-0 rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <h3 className="text-lg font-bold text-secondary">Occupancy Overview</h3>
          <div className="mt-4 grid gap-4">
            {occupancyList.map((facility) => {
              const total = Number(facility.total || 0);
              const occupied = Number(facility.occupied || 0);
              const percent = total ? Math.round((occupied / total) * 100) : 0;
              const barColor = percent > 80 ? "bg-error" : percent >= 50 ? "bg-warning" : "bg-primary";
              return (
                <div key={facility.id} className="mt-2">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-textPrimary">{facility.name}</span>
                    <span className="text-xs font-semibold text-primary">{occupied}/{total}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className={`${barColor} rounded-full h-2.5 transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="text-xs text-textMuted mt-1">{percent}% occupied</div>
                </div>
              );
            })}
            {occupancyList.length === 0 && (
              <p className="text-sm text-textMuted">No occupancy data yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
