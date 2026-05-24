import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { toast } from "react-hot-toast";
import {
  FileText,
  CheckCircle,
  XCircle,
  Briefcase,
  Layers,
  MapPin,
  Calendar,
  X,
  Plus,
  Eye,
  AlertTriangle,
} from "lucide-react";

export default function VendorsPage() {
  const [activeTab, setActiveTab] = useState("pending"); // pending | all
  const [pendingQueue, setPendingQueue] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorDetail, setVendorDetail] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Reject Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectVendorId, setRejectVendorId] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const fetchPending = async () => {
    try {
      const res = await api.getPendingVendors();
      setPendingQueue(res.data);
    } catch (err) {
      toast.error("Failed to load verification queue");
    }
  };

  const fetchAllVendors = async () => {
    try {
      const res = await api.getVendors();
      setAllVendors(res.data);
    } catch (err) {
      toast.error("Failed to load partner directories");
    }
  };

  const initData = async () => {
    setLoading(true);
    await Promise.all([fetchPending(), fetchAllVendors()]);
    setLoading(false);
  };

  useEffect(() => {
    initData();
  }, []);

  const handleApprove = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Approve Vendor Verification",
      message: "Are you sure you want to approve this vendor? This will verify their status and activate their public booking listings.",
      onConfirm: async () => {
        try {
          await api.approveVendor(id);
          toast.success("Vendor successfully approved and verified!");
          initData();
        } catch (err) {
          toast.error(err.message);
        }
      }
    });
  };

  const handleOpenRejectModal = (id) => {
    setRejectVendorId(id);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error("Please enter a valid rejection reason");
      return;
    }
    try {
      await api.rejectVendor(rejectVendorId, rejectReason);
      toast.success("Vendor verification request rejected");
      setRejectModalOpen(false);
      initData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSuspend = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Suspend Vendor Account",
      message: "Are you sure you want to suspend this vendor? Their login will be blocked and all associated facilities will be hidden.",
      onConfirm: async () => {
        try {
          await api.suspendVendor(id);
          toast.success("Vendor console account suspended");
          initData();
        } catch (err) {
          toast.error(err.message);
        }
      }
    });
  };

  const handleReactivate = async (id) => {
    try {
      await api.reactivateVendor(id);
      toast.success("Vendor console account reactivated");
      initData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRevoke = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Revoke Vendor Verification",
      message: "Are you sure you want to revoke verification for this vendor? Their status will be marked as unverified.",
      onConfirm: async () => {
        try {
          await api.revokeVendorVerification(id);
          toast.success("Vendor verification status revoked");
          initData();
        } catch (err) {
          toast.error(err.message);
        }
      }
    });
  };

  const handleViewProfile = async (vendor) => {
    setSelectedVendor(vendor);
    setDrawerOpen(true);
    setDetailLoading(true);
    try {
      const res = await api.getVendorDetails(vendor._id);
      setVendorDetail(res.data);
    } catch (err) {
      toast.error("Failed to load details");
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800">Vendor & Business Verification Queue</h2>
        <p className="text-slate-400 text-xs mt-0.5">
          Moderate merchant applications, review legal document filings, and unlock verified status
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="border-b border-slate-200 flex gap-6">
        <button
          onClick={() => setActiveTab("pending")}
          className={`py-3 text-sm font-bold border-b-2 transition-all cursor-pointer relative ${
            activeTab === "pending"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Verification Requests
          {pendingQueue.length > 0 && (
            <span className="ml-1.5 py-0.5 px-2 bg-blue-600 text-white rounded-full text-[10px] font-black absolute -top-1 -right-4 shadow-sm shadow-blue-500/20">
              {pendingQueue.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "all" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          All Platform Partners
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : activeTab === "pending" ? (
        /* Pending Queue cards grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pendingQueue.map((vendor) => (
            <div
              key={vendor._id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-800">{vendor.businessName}</h3>
                  <span className="text-slate-400 text-xs">Owner: {vendor.ownerName || vendor.userId?.name}</span>
                </div>
                <span className="text-[10px] font-bold py-0.5 px-2 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                  PENDING AUDIT
                </span>
              </div>

              {/* Legal and bank records review */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    GSTIN Number
                  </span>
                  <span className="block font-bold text-slate-700 font-mono mt-0.5">
                    {vendor.gstNumber || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    Registered Address
                  </span>
                  <span className="block font-medium text-slate-600 truncate mt-0.5" title={vendor.businessAddress}>
                    {vendor.businessAddress || "N/A"}
                  </span>
                </div>
                <div className="col-span-2 border-t border-slate-50 pt-2.5">
                  <span className="block text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    Bank Settlement details
                  </span>
                  <span className="block font-semibold text-slate-600 mt-0.5">
                    {vendor.bankDetails?.bankName} — A/C {vendor.bankDetails?.accountNumber} ({vendor.bankDetails?.ifsc})
                  </span>
                </div>
              </div>

              {/* Uploaded legal documents */}
              <div className="space-y-2">
                <span className="block text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  Uploaded License Docs
                </span>
                <div className="flex flex-wrap gap-2">
                  {(vendor.documents || []).map((doc, idx) => (
                    <a
                      key={idx}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 text-xs font-semibold text-slate-600 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      {doc.type}
                    </a>
                  ))}
                  {(vendor.documents || []).length === 0 && (
                    <span className="text-slate-400 text-xs italic">No documents uploaded.</span>
                  )}
                </div>
              </div>

              {/* Approval actions */}
              <div className="flex gap-3.5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleApprove(vendor._id)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve Application
                </button>
                <button
                  onClick={() => handleOpenRejectModal(vendor._id)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Request
                </button>
              </div>
            </div>
          ))}

          {pendingQueue.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white border border-slate-200 rounded-2xl">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-slate-700 font-bold">Queue Completely Cleared</h3>
              <p className="text-slate-400 text-xs mt-1">No pending verification filings found</p>
            </div>
          )}
        </div>
      ) : (
        /* Partners table listing */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <th className="py-4 px-6">Company Business</th>
                  <th className="py-4 px-6">Owner Name</th>
                  <th className="py-4 px-6">Verification</th>
                  <th className="py-4 px-6">Login Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {allVendors.map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="block font-bold text-slate-800">{vendor.businessName}</span>
                      <span className="block text-slate-400 text-xs mt-0.5">{vendor.email}</span>
                    </td>
                    <td className="py-4 px-6">{vendor.ownerName || vendor.userId?.name}</td>
                    <td className="py-4 px-6 capitalize">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          vendor.verificationStatus === "verified"
                            ? "bg-green-50 text-green-600 border border-green-200"
                            : vendor.verificationStatus === "rejected"
                            ? "bg-red-50 text-red-600 border border-red-200"
                            : "bg-amber-50 text-amber-600 border border-amber-200"
                        }`}
                      >
                        {vendor.verificationStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          vendor.userId?.isActive
                            ? "bg-green-50 text-green-600 border border-green-200"
                            : "bg-red-50 text-red-600 border border-red-200"
                        }`}
                      >
                        {vendor.userId?.isActive ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleViewProfile(vendor)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer"
                        title="View Business Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {vendor.userId?.isActive ? (
                        <button
                          onClick={() => handleSuspend(vendor._id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                          title="Block login"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(vendor._id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-green-500 hover:bg-green-50 transition-all cursor-pointer"
                          title="Restore login"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}

                      {vendor.verificationStatus === "verified" && (
                        <button
                          onClick={() => handleRevoke(vendor._id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-amber-600 hover:bg-amber-50 transition-all cursor-pointer"
                          title="Revoke Verification status"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {allVendors.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                      No merchant partners found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Reason Dialog Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 w-full max-w-md shadow-2xl relative animate-scale-up">
            <h3 className="text-base font-bold text-slate-800 mb-2">Reject Merchant Application</h3>
            <p className="text-xs text-slate-400 mb-4">
              Please enter the explicit verification rejection comments. The vendor will receive these comments in an automated notice.
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                required
                rows={3}
                placeholder="Business registration document blurred, or GST number does not match record..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-500 cursor-pointer"
                >
                  Reject & Notify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Business Details Slide Drawer */}
      {drawerOpen && selectedVendor && (
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
                {selectedVendor.businessName?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">{selectedVendor.businessName}</h3>
                <span className="block text-slate-400 text-xs">
                  Owner: {selectedVendor.ownerName || selectedVendor.userId?.name}
                </span>
                <span className="block text-slate-400 text-[10px] mt-0.5">Email: {selectedVendor.email}</span>
              </div>
            </div>

            {detailLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="flex-1 space-y-6">
                {/* Financial Payouts stats - Only show when verified */}
                {selectedVendor.verificationStatus === "verified" && (
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="block text-xs text-slate-400 font-bold uppercase">Total Revenue</span>
                      <span className="text-lg font-bold text-emerald-600 block mt-1">
                        ₹{vendorDetail?.totalEarned || 0}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <span className="block text-xs text-slate-400 font-bold uppercase">Booking Count</span>
                      <span className="text-lg font-bold text-slate-700 block mt-1">
                        {vendorDetail?.bookings?.length || 0}
                      </span>
                    </div>
                  </div>
                )}

                {/* Business & Settlement Account details - ALWAYS show */}
                <div className="grid grid-cols-2 gap-5 text-sm bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <div className="col-span-2 pb-2 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Business Profile Info
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Owner Email</span>
                    <span className="block font-medium text-slate-800 mt-1 truncate" title={selectedVendor.email}>{selectedVendor.email || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Contact Phone</span>
                    <span className="block font-medium text-slate-800 mt-1">{selectedVendor.phone || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[10px]">GSTIN Number</span>
                    <span className="block font-bold text-slate-800 font-mono mt-1">{selectedVendor.gstNumber || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Current Status</span>
                    <span className={`block mt-1 font-bold capitalize ${
                      selectedVendor.verificationStatus === "verified" ? "text-emerald-600" : "text-amber-600"
                    }`}>
                      {selectedVendor.verificationStatus || "unverified"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Registered Business Address</span>
                    <span className="block font-medium text-slate-700 mt-1 break-words">{selectedVendor.businessAddress || "N/A"}</span>
                  </div>

                  <div className="col-span-2 pt-3 pb-2 border-t border-slate-200 mt-1 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Settlement Bank Account
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Bank Name</span>
                    <span className="block font-medium text-slate-800 mt-1">{selectedVendor.bankDetails?.bankName || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Account Holder</span>
                    <span className="block font-medium text-slate-800 mt-1">{selectedVendor.bankDetails?.accountHolder || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Account Number</span>
                    <span className="block font-semibold text-slate-800 font-mono mt-1">{selectedVendor.bankDetails?.accountNumber || "N/A"}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 font-semibold uppercase tracking-wider text-[10px]">IFSC Code</span>
                    <span className="block font-semibold text-slate-800 font-mono mt-1">{selectedVendor.bankDetails?.ifsc || "N/A"}</span>
                  </div>
                </div>

                {/* Uploaded legal documents - ALWAYS show */}
                <div className="space-y-2.5">
                  <span className="block text-slate-400 font-bold uppercase tracking-wider text-[10px] tracking-widest">
                    Uploaded License Documents
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {(selectedVendor.documents || []).map((doc, idx) => (
                      <a
                        key={idx}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-blue-500" />
                        {doc.type === "business_reg" ? "Business Reg Certificate" : doc.type === "id_proof" ? "Owner ID Proof" : doc.type}
                      </a>
                    ))}
                    {(selectedVendor.documents || []).length === 0 && (
                      <span className="text-slate-400 text-xs italic">No documents uploaded.</span>
                    )}
                  </div>
                </div>

                {/* Facilities List - Only show when verified */}
                {selectedVendor.verificationStatus === "verified" && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      Facilities Owned
                    </h4>
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {/* Parking Lots */}
                      {(vendorDetail?.facilities?.parkingLots || []).map((lot) => (
                        <div
                          key={lot._id}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="block font-bold text-slate-700">{lot.name}</span>
                            <span className="block text-slate-400 mt-0.5">{lot.city}</span>
                          </div>
                          <span className="py-0.5 px-2 rounded-full bg-blue-50 text-blue-600 font-semibold">
                            Parking
                          </span>
                        </div>
                      ))}
                      {/* EV Stations */}
                      {(vendorDetail?.facilities?.chargingStations || []).map((ev) => (
                        <div
                          key={ev._id}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="block font-bold text-slate-700">{ev.name}</span>
                            <span className="block text-slate-400 mt-0.5">{ev.city}</span>
                          </div>
                          <span className="py-0.5 px-2 rounded-full bg-purple-50 text-purple-600 font-semibold">
                            EV Charging
                          </span>
                        </div>
                      ))}
                      {(vendorDetail?.facilities?.parkingLots || []).length === 0 &&
                        (vendorDetail?.facilities?.chargingStations || []).length === 0 && (
                          <div className="py-6 text-center text-slate-400 text-xs font-medium">
                            No facilities listed yet.
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Recent bookings list - Only show when verified */}
                {selectedVendor.verificationStatus === "verified" && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" />
                      Recent Bookings Received
                    </h4>
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl bg-white max-h-56 overflow-y-auto">
                      {(vendorDetail?.bookings || []).map((booking) => (
                        <div key={booking._id} className="p-3 flex justify-between items-center text-xs gap-3">
                          <div>
                            <span className="block font-bold text-slate-700 truncate max-w-40">
                              {booking.parkingLot?.name || booking.chargingStation?.name}
                            </span>
                            <span className="block text-slate-400 mt-0.5">
                              Customer: {booking.user?.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="block font-bold text-slate-800">₹{booking.totalPrice}</span>
                            <span className="block text-[9px] font-bold text-blue-500 uppercase mt-0.5">
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      ))}
                      {(vendorDetail?.bookings || []).length === 0 && (
                        <div className="py-6 text-center text-slate-400 text-xs font-semibold">
                          This vendor has not received any bookings yet.
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {/* Approval actions inside details drawer */}
                {selectedVendor.verificationStatus !== "verified" && (
                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => {
                        handleApprove(selectedVendor._id);
                        setDrawerOpen(false);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve Application
                    </button>
                    <button
                      onClick={() => {
                        handleOpenRejectModal(selectedVendor._id);
                        setDrawerOpen(false);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Request
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Custom Confirmation Popup Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 w-full max-w-sm shadow-2xl relative animate-scale-up">
            <h3 className="text-base font-bold text-slate-800 mb-2">{confirmModal.title || "Confirm Action"}</h3>
            <p className="text-sm text-slate-500 mb-6">{confirmModal.message}</p>
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
                  confirmModal.onConfirm?.();
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
    </div>
  );
}
