import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Menu, RefreshCw, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { createParkingLot, deleteParkingLot, getMyParkingLots, updateParkingLot } from "../../services/parkingService";
import { createChargingStation, deleteChargingStation, getMyChargingStations, updateChargingStation } from "../../services/chargingService";
import {
  cancelVendorBooking,
  completeVendorBooking,
  createCoupon,
  createFacilitySlot,
  deleteCoupon,
  deleteFacilitySlot,
  exportVendorBookings,
  getCoupons,
  getNotifications,
  getFacilitySlots,
  getVendorAnalytics,
  getVendorBookings,
  getVendorOverview,
  getVendorProfile,
  markNotificationRead,
  saveVendorProfile,
  updateFacilitySlot,
} from "../../services/vendorService";
import { emptyChargingForm, emptyCoupon, emptyParkingForm, emptyProfile } from "./constants";
import { toList, toText } from "./utils";
import AnalyticsTab from "./components/AnalyticsTab";
import BookingsTab from "./components/BookingsTab";
import ChargingForm from "./components/ChargingForm";
import Dashboard from "./components/Dashboard";
import ListingCard from "./components/ListingCard";
import NotificationsPanel from "./components/NotificationsPanel";
import ParkingForm from "./components/ParkingForm";
import PricingTab from "./components/PricingTab";
import ProfileTab from "./components/ProfileTab";
import SlotManager from "./components/SlotManager";
import VendorSidebar from "./components/VendorSidebar";

export default function DashboardPage({ token, onBack }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [parkingLots, setParkingLots] = useState([]);
  const [chargingStations, setChargingStations] = useState([]);
  const [overview, setOverview] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [profile, setProfile] = useState(emptyProfile);
  const [notifications, setNotifications] = useState([]);
  const [parkingForm, setParkingForm] = useState(emptyParkingForm);
  const [chargingForm, setChargingForm] = useState(emptyChargingForm);
  const [couponForm, setCouponForm] = useState(emptyCoupon);
  const [editingParkingId, setEditingParkingId] = useState(null);
  const [editingChargingId, setEditingChargingId] = useState(null);
  const [slotLot, setSlotLot] = useState(null);
  const [slotData, setSlotData] = useState({ slots: [], capacity: null });
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [slotForm, setSlotForm] = useState({ slotId: "", type: "car", status: "available" });
  const [filters, setFilters] = useState({ status: "all", sort: "newest", search: "" });
  const [bookingFilters, setBookingFilters] = useState({ status: "", facilityId: "", search: "" });

  const [loading, setLoading] = useState(false);
  const [refreshingNotifications, setRefreshingNotifications] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    hasInput: false,
    inputPlaceholder: "",
    onConfirm: null,
  });
  const [confirmInputVal, setConfirmInputVal] = useState("");

  const facilities = useMemo(() => [
    ...parkingLots.map(p => ({ ...p, kind: "parking" })),
    ...chargingStations.map(c => ({ ...c, kind: "charging" }))
  ], [parkingLots, chargingStations]);
  const notificationCount = notifications.filter((item) => !item.read).length;
  const pendingBookings = bookings.filter((booking) => booking.status === "pending").length;
  const hasUnverifiedListings = facilities.some((facility) => facility.isVerified === false || facility.verificationStatus === "unverified") || overview?.verificationStatus === "unverified";
  const isVerified = profile?.verificationStatus === "verified";

  const loadVendorData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [parkingRes, chargingRes, overviewRes, bookingsRes, analyticsRes, couponsRes, profileRes, notificationsRes] =
        await Promise.all([
          getMyParkingLots(token),
          getMyChargingStations(token),
          getVendorOverview(token),
          getVendorBookings(token, bookingFilters),
          getVendorAnalytics(token),
          getCoupons(token),
          getVendorProfile(token),
          getNotifications(token),
        ]);
      setParkingLots(parkingRes.data || []);
      setChargingStations(chargingRes.data || []);
      setOverview(overviewRes.data);
      setBookings(bookingsRes.data || []);
      setAnalytics(analyticsRes.data);
      setCoupons(couponsRes.data || []);
      
      const fetchedProfile = profileRes.data || {};
      setProfile({ ...emptyProfile, ...fetchedProfile });
      if (fetchedProfile.verificationStatus !== "verified") {
        setActiveTab("profile");
      }
      
      setNotifications(notificationsRes.data || []);
    } catch (err) {
      toast.error(err.message || "Unable to load vendor data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendorData();
  }, [token]);

  const parkingPayload = {
    name: parkingForm.name.trim(),
    description: parkingForm.description.trim(),
    location: {
      type: "Point",
      coordinates: [Number(parkingForm.lng), Number(parkingForm.lat)],
      address: { street: parkingForm.street.trim(), city: parkingForm.city.trim(), state: parkingForm.state.trim(), zipCode: parkingForm.zipCode.trim() },
    },
    pricing: { hourlyRate: Number(parkingForm.hourlyRate), currency: parkingForm.currency || "INR" },
    capacity: { total: Number(parkingForm.total), available: Number(parkingForm.available) },
    amenities: toList(parkingForm.amenities),
    operatingHours: { is24Hours: parkingForm.is24Hours, opens: parkingForm.opens, closes: parkingForm.closes },
    imageUrl: parkingForm.imageUrl.trim() || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    isActive: parkingForm.isActive,
  };

  const chargingPayload = {
    name: chargingForm.name.trim(),
    description: chargingForm.description.trim(),
    location: {
      type: "Point",
      coordinates: [Number(chargingForm.lng), Number(chargingForm.lat)],
      address: { street: chargingForm.street.trim(), city: chargingForm.city.trim(), state: chargingForm.state.trim(), zipCode: chargingForm.zipCode.trim() },
    },
    chargerTypes: chargingForm.chargerTypes,
    chargerType: chargingForm.chargerTypes[0],
    speedKw: Number(chargingForm.speedKw),
    capacity: { total: Number(chargingForm.total), available: Number(chargingForm.available) },
    pricing: {
      type: "per_kwh",
      rate: Number(chargingForm.pricePerKwh || chargingForm.pricePerSession || 0),
      perKwhRate: Number(chargingForm.pricePerKwh || 0),
      perSessionRate: Number(chargingForm.pricePerSession || 0),
      currency: chargingForm.currency || "INR",
    },
    pricePerSession: Number(chargingForm.pricePerSession || 0),
    amenities: chargingForm.amenities,
    operatingHours: { is24Hours: chargingForm.is24Hours, opens: chargingForm.opens, closes: chargingForm.closes },
    provider: chargingForm.provider,
    imageUrl: chargingForm.imageUrl.trim() || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    isActive: chargingForm.isActive,
  };

  const submitParking = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (editingParkingId) await updateParkingLot(editingParkingId, parkingPayload, token);
      else await createParkingLot(parkingPayload, token);
      setParkingForm(emptyParkingForm);
      setEditingParkingId(null);
      toast.success("Parking lot saved successfully!");
      await loadVendorData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitCharging = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (editingChargingId) await updateChargingStation(editingChargingId, chargingPayload, token);
      else await createChargingStation(chargingPayload, token);
      setChargingForm(emptyChargingForm);
      setEditingChargingId(null);
      toast.success("EV station saved successfully!");
      await loadVendorData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const editParking = (lot) => {
    setEditingParkingId(lot._id);
    setParkingForm({
      name: lot.name || "",
      description: lot.description || "",
      street: lot.location?.address?.street || "",
      city: lot.location?.address?.city || "",
      state: lot.location?.address?.state || "",
      zipCode: lot.location?.address?.zipCode || "",
      lat: lot.location?.coordinates?.[1] ?? "",
      lng: lot.location?.coordinates?.[0] ?? "",
      hourlyRate: lot.pricing?.hourlyRate ?? "",
      currency: lot.pricing?.currency || "INR",
      total: lot.capacity?.total ?? "",
      available: lot.capacity?.available ?? "",
      amenities: toText(lot.amenities),
      is24Hours: Boolean(lot.operatingHours?.is24Hours),
      opens: lot.operatingHours?.opens || "",
      closes: lot.operatingHours?.closes || "",
      imageUrl: lot.imageUrl || "",
      isActive: lot.isActive ?? true,
    });
    setActiveTab("parking");
  };

  const editCharging = (station) => {
    setEditingChargingId(station._id);
    setChargingForm({
      name: station.name || "",
      description: station.description || "",
      street: station.location?.address?.street || "",
      city: station.location?.address?.city || "",
      state: station.location?.address?.state || "",
      zipCode: station.location?.address?.zipCode || "",
      lat: station.location?.coordinates?.[1] ?? "",
      lng: station.location?.coordinates?.[0] ?? "",
      chargerTypes: station.chargerTypes || [],
      speedKw: station.speedKw || 22,
      total: station.capacity?.total ?? "",
      available: station.capacity?.available ?? "",
      pricePerKwh: station.pricing?.perKwhRate || station.pricing?.rate || "",
      pricePerSession: station.pricing?.perSessionRate || station.pricePerSession || "",
      currency: station.pricing?.currency || "INR",
      amenities: station.amenities || [],
      provider: station.provider || "",
      is24Hours: Boolean(station.operatingHours?.is24Hours),
      opens: station.operatingHours?.opens || "",
      closes: station.operatingHours?.closes || "",
      imageUrl: station.imageUrl || "",
      isActive: station.isActive ?? true,
    });
    setActiveTab("ev");
  };

  const openSlots = async (resource, type) => {
    setSlotLot({ ...resource, type });
    const res = await getFacilitySlots(type, resource._id, token);
    setSlotData({ slots: res.data || [], capacity: res.capacity });
    setSelectedSlots([]);
  };

  const refreshSlots = async () => {
    if (!slotLot) return;
    const res = await getFacilitySlots(slotLot.type, slotLot._id, token);
    setSlotData({ slots: res.data || [], capacity: res.capacity });
    await loadVendorData();
  };

  const addSlot = async (event) => {
    event.preventDefault();
    await createFacilitySlot(slotLot.type, slotLot._id, slotForm, token);
    setSlotForm({ slotId: "", type: slotLot.type === "charging" ? "EV" : "car", status: "available" });
    await refreshSlots();
  };

  const bulkUpdateSlots = async (payload) => {
    await Promise.all(selectedSlots.map((slotId) => updateFacilitySlot(slotLot.type, slotLot._id, slotId, payload, token)));
    setSelectedSlots([]);
    await refreshSlots();
  };

  const filteredParking = useMemo(() => {
    const items = parkingLots.filter((lot) => {
      const matchesStatus = filters.status === "all" || String(lot.isActive) === filters.status;
      const matchesSearch = !filters.search || lot.name?.toLowerCase().includes(filters.search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
    return items.sort((a, b) => {
      if (filters.sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (filters.sort === "revenue") return (b.revenue || 0) - (a.revenue || 0);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [parkingLots, filters]);

  const exportBookings = async () => {
    const csv = await exportVendorBookings(token);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vendor-bookings.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const refreshNotifications = async () => {
    if (!token) return;
    setRefreshingNotifications(true);
    try {
      const notificationsRes = await getNotifications(token);
      setNotifications(notificationsRes.data || []);
    } finally {
      setRefreshingNotifications(false);
    }
  };

  const handleMarkRead = async (id) => {
    await markNotificationRead(id, token);
    await refreshNotifications();
  };

  return (
    <main className="app-light-theme min-h-screen bg-linear-to-b from-slate-50 via-white to-cyan-50 text-slate-900">
      <div className="sticky top-0 z-40 border-b border-border bg-white/90 shadow-lg shadow-slate-200/50 backdrop-blur-lg">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-blue-600 transition-colors"
            >
              <Menu size={24} />
            </button>
            <Link to="/vendor/home" className="flex items-center gap-2 cursor-pointer mr-3">
              <img src="/logo.png" alt="ParkEase Logo" className="h-6 w-auto object-contain" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                ParkEase
              </span>
              <span className="hidden sm:inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-100">
                Partner
              </span>
            </Link>
          </div>
          <div className="relative flex items-center gap-2 flex-wrap">
            <button type="button" onClick={() => setShowNotifications((prev) => !prev)} className="relative flex items-center gap-2 border border-border rounded-lg px-3 py-1.5 text-xs font-medium text-textSecondary hover:bg-gray-50 transition-colors">
              <Bell size={14} />
              Notifications
              <span className="absolute -top-1.5 -right-1.5 bg-error text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {notificationCount}
              </span>
            </button>
            {showNotifications && <NotificationsPanel notifications={notifications} onMarkRead={handleMarkRead} onClose={() => setShowNotifications(false)} />}
            <button type="button" onClick={refreshNotifications} className="flex items-center gap-2 border border-border rounded-lg px-3 py-1.5 text-xs font-medium text-textSecondary hover:bg-gray-50 transition-colors">
              <RefreshCw size={14} className={refreshingNotifications ? "animate-spin" : ""} />
              Refresh
            </button>
            <button type="button" className="border border-border rounded-lg px-3 py-1.5 text-xs font-medium text-textSecondary hover:bg-gray-50 transition-colors">
              {hasUnverifiedListings && <span className="w-2 h-2 rounded-full bg-warning inline-block mr-1" />}
              {overview?.verificationStatus || "unverified"}
            </button>
          </div>
        </div>
        </div>
      </div>

      <div className="flex gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-6 lg:px-8 py-6">
        <VendorSidebar 
          activeTab={activeTab} 
          setActiveTab={(tab) => { setActiveTab(tab); setMobileNavOpen(false); }} 
          onLogout={onBack} 
          unreadCount={pendingBookings}
          isVerified={isVerified}
        />

        {/* Mobile Sidebar Overlay */}
        <div className={`fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity ${mobileNavOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={() => setMobileNavOpen(false)} />
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl lg:hidden transition-transform ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <VendorSidebar 
              activeTab={activeTab} 
              setActiveTab={(tab) => { setActiveTab(tab); setMobileNavOpen(false); }} 
              onLogout={onBack} 
              unreadCount={pendingBookings}
              isVerified={isVerified}
              className="flex h-full"
              onClose={() => setMobileNavOpen(false)}
            />
        </div>

        <div className="flex-1 min-w-0 max-w-screen-xl mx-auto px-4 md:px-6">

        {loading && <p className="mt-4 text-sm text-slate-500">Loading...</p>}

        {activeTab === "dashboard" && <Dashboard overview={overview} onViewAllBookings={() => setActiveTab("bookings")} />}
        {activeTab === "parking" && <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.1fr]"><div className="min-w-0"><ParkingForm form={parkingForm} setForm={setParkingForm} editing={Boolean(editingParkingId)} onCancel={() => { setEditingParkingId(null); setParkingForm(emptyParkingForm); }} onSubmit={submitParking} loading={loading} /></div><div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><h3 className="text-lg font-bold">Your Parking Lots</h3><div className="grid gap-2 sm:grid-cols-3"><input value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} placeholder="Search" className="rounded-xl border border-slate-300 px-3 py-2 text-sm" /><select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2 text-sm"><option value="all">All</option><option value="true">Active</option><option value="false">Inactive</option></select><select value={filters.sort} onChange={(e) => setFilters((p) => ({ ...p, sort: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2 text-sm"><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="revenue">Revenue</option></select></div></div><div className="mt-4 grid gap-4">{filteredParking.length === 0 && <p className="text-sm text-slate-500">No parking lots yet.</p>}{filteredParking.map((lot) => <ListingCard key={lot._id} item={lot} kind="parking" onEdit={() => editParking(lot)} onDelete={async () => {
          setConfirmModal({
            isOpen: true,
            title: "Delete Parking Lot",
            message: "Are you sure you want to permanently delete this parking lot? This cannot be undone.",
            hasInput: false,
            onConfirm: async () => {
              try {
                await deleteParkingLot(lot._id, token);
                toast.success("Parking lot deleted successfully");
                await loadVendorData();
              } catch (err) {
                toast.error(err.message || "Failed to delete parking lot");
              }
            }
          });
        }} onManage={() => openSlots(lot, "parking")} onToggle={async () => { await updateParkingLot(lot._id, { isActive: !lot.isActive }, token); await loadVendorData(); }} />)}</div></div></div>}
        {activeTab === "ev" && <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.1fr]"><div className="min-w-0"><ChargingForm form={chargingForm} setForm={setForm => setChargingForm(setForm)} editing={Boolean(editingChargingId)} onCancel={() => { setEditingChargingId(null); setChargingForm(emptyChargingForm); }} onSubmit={submitCharging} loading={loading} /></div><div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60"><h3 className="text-lg font-bold">Your EV Charging Stations</h3><div className="mt-4 grid gap-4">{chargingStations.length === 0 && <p className="text-sm text-slate-500">No charging stations yet.</p>}{chargingStations.map((station) => <ListingCard key={station._id} item={station} kind="ev" onEdit={() => editCharging(station)} onDelete={async () => {
          setConfirmModal({
            isOpen: true,
            title: "Delete Charging Station",
            message: "Are you sure you want to permanently delete this charging station? This cannot be undone.",
            hasInput: false,
            onConfirm: async () => {
              try {
                await deleteChargingStation(station._id, token);
                toast.success("Charging station deleted successfully");
                await loadVendorData();
              } catch (err) {
                toast.error(err.message || "Failed to delete charging station");
              }
            }
          });
        }} onManage={() => openSlots(station, "charging")} onToggle={async () => { await updateChargingStation(station._id, { isActive: !station.isActive }, token); await loadVendorData(); }} />)}</div></div></div>}
        {activeTab === "bookings" && <BookingsTab bookings={bookings} facilities={facilities} filters={bookingFilters} setFilters={setBookingFilters} onApply={async () => setBookings((await getVendorBookings(token, bookingFilters)).data || [])} onComplete={async (id) => { await completeVendorBooking(id, token); await loadVendorData(); }} onCancel={(id) => {
          setConfirmInputVal("");
          setConfirmModal({
            isOpen: true,
            title: "Cancel Booking",
            message: "Are you sure you want to cancel this booking? Please specify the reason below:",
            hasInput: true,
            inputPlaceholder: "Reason for cancellation...",
            onConfirm: async (reason) => {
              if (!reason || !reason.trim()) {
                toast.error("Cancellation reason is required");
                return;
              }
              try {
                await cancelVendorBooking(id, reason, token);
                toast.success("Booking cancelled successfully");
                await loadVendorData();
              } catch (err) {
                toast.error(err.message || "Failed to cancel booking");
              }
            }
          });
        }} onExport={exportBookings} />}
        {activeTab === "analytics" && <AnalyticsTab analytics={analytics} />}
        {activeTab === "pricing" && <PricingTab couponForm={couponForm} setCouponForm={setCouponForm} coupons={coupons} onCreate={async (event) => { event.preventDefault(); await createCoupon({ ...couponForm, value: Number(couponForm.value), maxUses: Number(couponForm.maxUses) }, token); setCouponForm(emptyCoupon); setCoupons((await getCoupons(token)).data || []); }} onDelete={async (id) => { await deleteCoupon(id, token); setCoupons((await getCoupons(token)).data || []); }} facilities={facilities} token={token} onRefresh={loadVendorData} />}
        {activeTab === "profile" && <ProfileTab profile={profile} setProfile={setProfile} onSave={async (event) => { event.preventDefault(); const res = await saveVendorProfile(profile, token); setProfile({ ...emptyProfile, ...res.data }); toast.success("Profile saved successfully!"); }} token={token} />}
      </div>

        {slotLot && <SlotManager lot={slotLot} slotData={slotData} selectedSlots={selectedSlots} setSelectedSlots={setSelectedSlots} slotForm={slotForm} setSlotForm={setSlotForm} onAdd={addSlot} onBulk={bulkUpdateSlots} onUpdate={async (slotId, payload) => { await updateFacilitySlot(slotLot.type, slotLot._id, slotId, payload, token); await refreshSlots(); }} onDelete={async (slotId) => { await deleteFacilitySlot(slotLot.type, slotLot._id, slotId, token); await refreshSlots(); }} onClose={() => setSlotLot(null)} />}
      </div>
      {/* Custom Confirmation Popup Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 w-full max-w-sm shadow-2xl relative animate-scale-up text-left">
            <h3 className="text-base font-bold text-slate-800 mb-2">{confirmModal.title || "Confirm Action"}</h3>
            <p className="text-sm text-slate-500 mb-4">{confirmModal.message}</p>
            {confirmModal.hasInput && (
              <textarea
                value={confirmInputVal}
                onChange={(e) => setConfirmInputVal(e.target.value)}
                placeholder={confirmModal.inputPlaceholder}
                className="w-full min-h-[80px] p-3 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 mb-5"
              />
            )}
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirm?.(confirmInputVal);
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }}
                className="py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
