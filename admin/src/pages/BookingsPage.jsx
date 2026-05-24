import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { toast } from "react-hot-toast";
import {
  Search,
  Filter,
  Download,
  Eye,
  AlertTriangle,
  CheckSquare,
  X,
  Calendar,
  Layers,
  MapPin,
} from "lucide-react";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Cancellation Reason Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelBookingId, setCancelBookingId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.getBookings();
      setBookings(res.data);
    } catch (err) {
      toast.error("Failed to fetch bookings list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenCancelModal = (id) => {
    setCancelBookingId(id);
    setCancelReason("");
    setCancelModalOpen(true);
  };

  const handleForceCancel = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) {
      toast.error("Please enter a cancellation reason");
      return;
    }

    try {
      await api.forceCancelBooking(cancelBookingId, cancelReason);
      toast.success("Booking force-cancelled. Funds successfully refunded to user's wallet!");
      setCancelModalOpen(false);
      fetchBookings();
      if (selectedBooking?._id === cancelBookingId) setDrawerOpen(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleMarkComplete = async (id) => {
    if (!window.confirm("Mark this booking as completed?")) return;
    try {
      await api.manuallyCompleteBooking(id);
      toast.success("Booking status marked as completed!");
      fetchBookings();
      if (selectedBooking?._id === id) setDrawerOpen(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setDrawerOpen(true);
  };

  const handleExport = () => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    window.open(baseUrl + "/admin/bookings/export?token=" + localStorage.getItem("admin_token"));
    toast.success("Bookings spreadsheet downloading!");
  };

  // Client filtering
  const filteredBookings = bookings.filter((b) => {
    const facilityName = b.parkingLot?.name || b.chargingStation?.name || "";
    const matchesSearch =
      b.bookingRef?.toLowerCase().includes(search.toLowerCase()) ||
      b.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
      facilityName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || b.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-6">
      {/* Header and export controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Platform Bookings Audit Console</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Audit transactional booking logs, enforce cancellations, or verify check-in slots
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 py-2.5 px-4 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-slate-850 active:scale-98 transition-all cursor-pointer w-fit"
        >
          <Download className="w-4 h-4" />
          Export Bookings (CSV)
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute inset-y-0 left-3 flex items-center w-4 h-4 text-slate-400 my-auto" />
          <input
            type="text"
            placeholder="Search booking ref, user email, or facility name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filters</span>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white"
          >
            <option value="all">All Payment Statuses</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Bookings Table Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="py-4 px-6">Booking Ref</th>
                <th className="py-4 px-6">User / Customer</th>
                <th className="py-4 px-6">Location Facility</th>
                <th className="py-4 px-6">Amount (INR)</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No bookings found matching filters.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-bold text-slate-800">{b.bookingRef}</td>
                    <td className="py-4 px-6 truncate max-w-40">{b.user?.email || "Anonymized"}</td>
                    <td className="py-4 px-6">
                      <span className="block font-bold text-slate-800 truncate max-w-40">
                        {b.parkingLot?.name || b.chargingStation?.name || "Deleted"}
                      </span>
                      <span className="block text-slate-400 text-xs capitalize mt-0.5">{b.bookingType}</span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">₹{b.totalPrice}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          b.status === "completed"
                            ? "bg-green-50 text-green-600 border border-green-200"
                            : b.status === "cancelled"
                            ? "bg-red-50 text-red-600 border border-red-200"
                            : b.status === "confirmed"
                            ? "bg-blue-50 text-blue-600 border border-blue-200"
                            : "bg-amber-50 text-amber-600 border border-amber-200"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetails(b)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer"
                        title="View detailed logs"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {b.status !== "cancelled" && b.status !== "completed" && (
                        <>
                          <button
                            onClick={() => handleMarkComplete(b._id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-green-600 hover:bg-green-50 transition-all cursor-pointer"
                            title="Mark completed"
                          >
                            <CheckSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenCancelModal(b._id)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                            title="Force cancel + Refund"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Force Cancellation reason Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 w-full max-w-md shadow-2xl relative animate-scale-up">
            <h3 className="text-base font-bold text-slate-800 mb-2">Administrative Booking Revocation</h3>
            <p className="text-xs text-slate-400 mb-4">
              Specify the revocation cancellation comments. The customer will be credited automatically in their online wallet.
            </p>
            <form onSubmit={handleForceCancel} className="space-y-4">
              <textarea
                required
                rows={3}
                placeholder="Merchant reported slot issue, or administrative moderation override..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-red-650 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Revoke & Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking detail Slide Drawer */}
      {drawerOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col p-6 animate-slide-right relative">
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Drawer Summary */}
            <div className="flex items-center gap-4 border-b border-slate-100 pb-5 mb-6">
              <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-extrabold text-blue-600 text-lg">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">Booking Summary Audit</h3>
                <span className="block text-slate-400 font-mono text-xs mt-0.5">Ref: {selectedBooking.bookingRef}</span>
              </div>
            </div>

            <div className="flex-1 space-y-6">
              {/* Stats blocks */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Facility Listing</span>
                  <span className="font-bold text-slate-700">
                    {selectedBooking.parkingLot?.name || selectedBooking.chargingStation?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Type</span>
                  <span className="font-semibold text-slate-600 capitalize">{selectedBooking.bookingType}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Allocated Slot</span>
                  <span className="font-mono font-bold text-slate-700">{selectedBooking.slotId || "S1"}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Check-In</span>
                  <span className="font-medium text-slate-600">
                    {new Date(selectedBooking.startTime).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Check-Out</span>
                  <span className="font-medium text-slate-600">
                    {new Date(selectedBooking.endTime).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Settled Amount</span>
                  <span className="font-extrabold text-slate-800 text-sm">₹{selectedBooking.totalPrice}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Payment Status</span>
                  <span className="font-bold text-emerald-600 capitalize">{selectedBooking.paymentStatus}</span>
                </div>
              </div>

              {/* User credentials */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3.5">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Customer Contact Card
                </h4>
                <div className="text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Email Address</span>
                    <span className="font-mono text-slate-700">{selectedBooking.user?.email || "Anonymized"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Name</span>
                    <span className="text-slate-700 font-semibold">{selectedBooking.user?.name || "Anonymized"}</span>
                  </div>
                </div>
              </div>

              {/* Administrative actions in drawer */}
              {selectedBooking.status !== "cancelled" && selectedBooking.status !== "completed" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleMarkComplete(selectedBooking._id)}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Mark completed
                  </button>
                  <button
                    onClick={() => handleOpenCancelModal(selectedBooking._id)}
                    className="flex-1 py-2.5 px-4 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Force cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
