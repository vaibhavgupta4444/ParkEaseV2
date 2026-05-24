import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import {
  Users,
  Briefcase,
  MapPin,
  Calendar,
  IndianRupee,
  Activity,
  ArrowUpRight,
  TrendingUp,
  FileText,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.getSummary();
        setData(res.data);
      } catch (err) {
        console.error("Failed to load dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-semibold">Generating analytics...</p>
        </div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const stats = [
    { name: "Total Users", value: summary.totalUsers, icon: Users, color: "text-blue-600 bg-blue-50 border-blue-100" },
    { name: "Registered Vendors", value: summary.totalVendors, icon: Briefcase, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
    { name: "Parking Facilities", value: summary.parkingCount, icon: MapPin, color: "text-sky-600 bg-sky-50 border-sky-100" },
    { name: "EV Charging Stations", value: summary.chargingCount, icon: Activity, color: "text-purple-600 bg-purple-50 border-purple-100" },
    { name: "Bookings Today", value: summary.bookingsToday, icon: Calendar, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
    { name: "Live Revenue", value: `₹${summary.totalRevenue || 0}`, icon: IndianRupee, color: "text-rose-600 bg-rose-50 border-rose-100" },
  ];

  const COLORS = ["#3b82f6", "#a855f7"];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-300 flex items-center justify-between"
            >
              <div>
                <span className="text-sm font-semibold text-slate-400 block mb-1">{stat.name}</span>
                <span className="text-2xl font-black text-slate-800">{stat.value}</span>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue and Booking curves */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Financial Growth & Booking Trends</h3>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 py-1 px-2.5 rounded-lg flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
              Last 30 Days Curve
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.trends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-800">Bookings by Facility Type</h3>
          <div className="h-72 w-full flex flex-col justify-between">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={data?.bookingsByFacility || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(data?.bookingsByFacility || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center text-xs font-medium text-slate-400">
              Comparative distribution share
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feeds */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Bookings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-800">Recent Booking Submissions</h3>
            <Link to="/bookings" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
            {(data?.recentBookings || []).map((booking) => (
              <div key={booking._id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <span className="block text-sm font-semibold text-slate-700">
                    {booking.user?.name || "Guest User"}
                  </span>
                  <span className="block text-xs text-slate-400 font-mono mt-0.5">
                    Ref: {booking.bookingRef}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-bold text-slate-800">
                    ₹{booking.totalPrice}
                  </span>
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                      booking.status === "completed"
                        ? "bg-green-50 text-green-600 border border-green-200"
                        : booking.status === "cancelled"
                        ? "bg-red-50 text-red-600 border border-red-200"
                        : "bg-blue-50 text-blue-600 border border-blue-200"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
            {(data?.recentBookings || []).length === 0 && (
              <div className="py-8 text-center text-slate-400 text-sm font-medium">
                No recent bookings recorded.
              </div>
            )}
          </div>
        </div>

        {/* Vendors pending */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-800">Pending Verification Queue</h3>
            <Link to="/vendors" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
              Review Queue <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
            {(data?.pendingVendors || []).map((profile) => (
              <div key={profile._id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <span className="block text-sm font-bold text-slate-700">{profile.businessName}</span>
                  <span className="block text-xs text-slate-400 mt-0.5">
                    Owner: {profile.ownerName || profile.userId?.name}
                  </span>
                </div>
                <div>
                  <Link
                    to="/vendors"
                    className="inline-flex items-center gap-1 py-1.5 px-3 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 text-xs font-bold transition-all duration-300"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Verify
                  </Link>
                </div>
              </div>
            ))}
            {(data?.pendingVendors || []).length === 0 && (
              <div className="py-8 text-center text-slate-400 text-sm font-medium">
                All vendors fully verified! Clean queue.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
