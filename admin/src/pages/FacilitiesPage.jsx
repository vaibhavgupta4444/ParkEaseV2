import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { toast } from "react-hot-toast";
import { Search, Filter, MapPin, Eye, ShieldAlert, CheckCircle, Trash2, X } from "lucide-react";

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all | parking | ev
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | suspended

  const [selectedFacility, setSelectedFacility] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const res = await api.getFacilities();
      setFacilities(res.data);
    } catch (err) {
      toast.error("Failed to load facilities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleToggleStatus = async (facility) => {
    const isSuspended = !facility.isActive;
    const confirmMsg = isSuspended
      ? `Are you sure you want to restore ${facility.name} listing? It will immediately show up on the public map.`
      : `Are you sure you want to suspend ${facility.name}? It will be hidden from the public map.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      if (isSuspended) {
        await api.restoreFacility(facility._id, facility.type);
        toast.success("Facility listing successfully restored!");
      } else {
        await api.suspendFacility(facility._id, facility.type);
        toast.success("Facility listing successfully suspended.");
      }
      fetchFacilities();
      if (selectedFacility?._id === facility._id) setDrawerOpen(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id, type, name) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete ${name}? This cannot be undone and is only allowed if no active/confirmed bookings exist.`
      )
    )
      return;

    try {
      await api.deleteFacility(id, type);
      toast.success("Facility successfully deleted");
      fetchFacilities();
    } catch (err) {
      toast.error(err.message || "Failed to delete. Ensure there are no active bookings.");
    }
  };

  const handleViewDetails = async (facility) => {
    setSelectedFacility(facility);
    setDrawerOpen(true);
    setDrawerLoading(true);
    try {
      const res = await api.getFacilityDetails(facility._id, facility.type);
      setBookings(res.data.bookings);
    } catch (err) {
      toast.error("Failed to fetch detailed slot layout or bookings history");
    } finally {
      setDrawerLoading(false);
    }
  };

  // Client filtering
  const filteredFacilities = facilities.filter((f) => {
    const matchesSearch =
      f.name?.toLowerCase().includes(search.toLowerCase()) ||
      f.city?.toLowerCase().includes(search.toLowerCase()) ||
      f.owner?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === "all" || f.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || (statusFilter === "active" ? f.isActive : !f.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800">Platform Facility Listings</h2>
        <p className="text-slate-400 text-xs mt-0.5">
          Audit, moderate, and suspend merchant parking lots or EV charging points platform-wide
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute inset-y-0 left-3 flex items-center w-4 h-4 text-slate-400 my-auto" />
          <input
            type="text"
            placeholder="Search facility name, city, or merchant owner..."
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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white"
          >
            <option value="all">All Types</option>
            <option value="parking">Parking Lots</option>
            <option value="ev">EV Charging</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active (On Map)</option>
            <option value="suspended">Suspended (Hidden)</option>
          </select>
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="py-4 px-6">Facility Details</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Availability</th>
                <th className="py-4 px-6">Map Status</th>
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
              ) : filteredFacilities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    No facilities listed match your selection.
                  </td>
                </tr>
              ) : (
                filteredFacilities.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="block font-bold text-slate-800">{f.name}</span>
                      <span className="block text-slate-400 text-xs mt-0.5">
                        Merchant: {f.owner?.name || "Corporate Partner"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="block font-medium text-slate-700">{f.city}</span>
                      <span className="block text-slate-400 text-xs truncate max-w-40 mt-0.5" title={f.address}>
                        {f.address}
                      </span>
                    </td>
                    <td className="py-4 px-6 capitalize">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          f.type === "ev"
                            ? "bg-purple-50 text-purple-600 border border-purple-100"
                            : "bg-blue-50 text-blue-600 border border-blue-100"
                        }`}
                      >
                        {f.type === "ev" ? "EV Station" : "Parking lot"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-700">
                        {f.slots?.filter((s) => s.isAvailable !== false).length || f.totalSlots || 0} Slots Available
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          f.isActive
                            ? "bg-green-50 text-green-600 border border-green-200"
                            : "bg-red-50 text-red-600 border border-red-200"
                        }`}
                      >
                        {f.isActive ? "Visible" : "Suspended"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleViewDetails(f)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer"
                        title="View details & slot layout"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {f.isActive ? (
                        <button
                          onClick={() => handleToggleStatus(f)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                          title="Suspend visual map status"
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(f)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-green-500 hover:bg-green-50 transition-all cursor-pointer"
                          title="Restore visual map status"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(f._id, f.type, f.name)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Facility detail drawer */}
      {drawerOpen && selectedFacility && (
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
                {selectedFacility.name?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">{selectedFacility.name}</h3>
                <span className="block text-slate-400 text-xs">
                  Merchant: {selectedFacility.owner?.name}
                </span>
                <span className="block text-[10px] font-bold text-blue-600 uppercase mt-1">
                  Type: {selectedFacility.type}
                </span>
              </div>
            </div>

            {drawerLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="flex-1 space-y-6">
                {/* Visual slot layout grid */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    Detailed Slot Availability Grid
                  </h4>
                  <div className="grid grid-cols-5 gap-2.5">
                    {(selectedFacility.slots || []).map((slot, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-lg border text-center font-mono text-xs font-bold ${
                          slot.isAvailable !== false
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                        title={slot.type ? `Type: ${slot.type}` : "Standard Slot"}
                      >
                        {slot.id || `S${idx + 1}`}
                      </div>
                    ))}
                    {(selectedFacility.slots || []).length === 0 && (
                      <div className="col-span-full text-center text-slate-400 text-xs italic py-2">
                        No physical slots configured for this location.
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking History logs */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    Recent Bookings logs at this location
                  </h4>
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-white max-h-60 overflow-y-auto">
                    {bookings.map((b) => (
                      <div key={b._id} className="p-3.5 flex justify-between items-center text-xs gap-3">
                        <div>
                          <span className="block font-bold text-slate-700">{b.user?.name}</span>
                          <span className="block text-slate-400 mt-0.5 font-mono">Ref: {b.bookingRef}</span>
                        </div>
                        <div className="text-right">
                          <span className="block font-bold text-slate-800">₹{b.totalPrice}</span>
                          <span className="block text-[9px] font-bold text-indigo-500 uppercase mt-0.5">
                            {b.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {bookings.length === 0 && (
                      <div className="py-8 text-center text-slate-400 text-xs font-medium">
                        No bookings logged at this facility yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
