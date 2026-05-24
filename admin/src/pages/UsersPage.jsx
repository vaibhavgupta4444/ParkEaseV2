import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { toast } from "react-hot-toast";
import {
  Search,
  Filter,
  Download,
  Eye,
  UserX,
  UserCheck,
  ShieldCheck,
  Trash2,
  X,
  Wallet,
  Calendar,
  Layers,
} from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    status: "all",
    verified: "all",
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({ total: 0, pages: 0 });
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers(filters);
      setUsers(res.data);
      setPagination(res.pagination);
    } catch (err) {
      toast.error(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters.page, filters.role, filters.status, filters.verified]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    fetchUsers();
  };

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    setDrawerOpen(true);
    setDetailLoading(true);
    try {
      const res = await api.getUserDetails(user._id);
      setUserDetail(res.data);
    } catch (err) {
      toast.error("Failed to load user booking data");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSuspend = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Suspend User Account",
      message: "Are you sure you want to suspend this user? They will not be able to log in to their account.",
      onConfirm: async () => {
        try {
          await api.suspendUser(id);
          toast.success("User account suspended");
          fetchUsers();
          if (selectedUser?._id === id) setDrawerOpen(false);
        } catch (err) {
          toast.error(err.message);
        }
      }
    });
  };

  const handleReactivate = async (id) => {
    try {
      await api.reactivateUser(id);
      toast.success("User account reactivated successfully");
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleChangeRole = async (id, role) => {
    setConfirmModal({
      isOpen: true,
      title: "Change User Role",
      message: `Are you sure you want to change this user's role to ${role}?`,
      onConfirm: async () => {
        try {
          await api.changeUserRole(id, role);
          toast.success(`Role updated successfully to ${role}`);
          fetchUsers();
        } catch (err) {
          toast.error(err.message);
        }
      }
    });
  };

  const handleDelete = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Soft-Delete User Profile",
      message: "Are you sure you want to soft-delete this user? All profile info will be anonymized, but bookings remain for accounting.",
      onConfirm: async () => {
        try {
          await api.deleteUser(id);
          toast.success("User account successfully deleted and anonymized");
          fetchUsers();
          setDrawerOpen(false);
        } catch (err) {
          toast.error(err.message);
        }
      }
    });
  };

  const handleExport = () => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    window.open(baseUrl + "/admin/users/export?token=" + localStorage.getItem("admin_token"));
    toast.success("User spreadsheet downloading!");
  };

  return (
    <div className="space-y-6">
      {/* Header and export controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">User Account Manager</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Audit, verify, promote, or restrict user activities across the portal
          </p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 py-2.5 px-4 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-slate-850 active:scale-98 transition-all cursor-pointer w-fit"
        >
          <Download className="w-4 h-4" />
          Export Database (CSV)
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute inset-y-0 left-3 flex items-center w-4 h-4 text-slate-400 my-auto" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="py-2 px-4 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Find
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filters</span>
          </div>

          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="vendor">Vendor</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={filters.verified}
            onChange={(e) => setFilters({ ...filters, verified: e.target.value, page: 1 })}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white"
          >
            <option value="all">All Verifications</option>
            <option value="yes">Verified Email</option>
            <option value="no">Unverified Email</option>
          </select>
        </div>
      </div>

      {/* Main Users Table Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="py-4 px-6">Avatar & Name</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Account Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                    No users match your specific filters.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
                        {user.name?.slice(0, 2).toUpperCase() || "GU"}
                      </div>
                      <div>
                        <span className="block font-bold text-slate-800 truncate max-w-40">{user.name}</span>
                        <span className="block text-slate-400 text-xs mt-0.5">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs">{user.email}</td>
                    <td className="py-4 px-6 capitalize">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          user.role === "admin"
                            ? "bg-purple-50 text-purple-600 border border-purple-100"
                            : user.role === "vendor"
                            ? "bg-amber-50 text-amber-600 border border-amber-100"
                            : "bg-blue-50 text-blue-600 border border-blue-100"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          user.isActive
                            ? "bg-green-50 text-green-600 border border-green-200"
                            : "bg-red-50 text-red-600 border border-red-200"
                        }`}
                      >
                        {user.isActive ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer"
                        title="View Profile Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {user.isActive ? (
                        <button
                          onClick={() => handleSuspend(user._id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                          title="Suspend Account"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(user._id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-green-500 hover:bg-green-50 transition-all cursor-pointer"
                          title="Reactivate Account"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(user._id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
                        title="Delete User"
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

        {/* Pagination bar */}
        {pagination.pages > 1 && (
          <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Total {pagination.total} users registered
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={filters.page === 1}
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                className="py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-slate-600 px-3">
                Page {filters.page} of {pagination.pages}
              </span>
              <button
                disabled={filters.page === pagination.pages}
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                className="py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide Drawer for User Profile view */}
      {drawerOpen && selectedUser && (
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
                {selectedUser.name?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">{selectedUser.name}</h3>
                <span className="block text-slate-400 text-xs">{selectedUser.email}</span>
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 ${
                    selectedUser.isActive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                  }`}
                >
                  {selectedUser.isActive ? "ACTIVE SESSION" : "SUSPENDED"}
                </span>
              </div>
            </div>

            {detailLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="flex-1 space-y-6">


                {/* Profile Stats blocks */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                    <span className="block text-xs text-slate-400 font-bold uppercase">Total Bookings</span>
                    <span className="text-lg font-bold text-slate-700 block mt-1">
                      {userDetail?.bookings?.length || 0}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                    <span className="block text-xs text-slate-400 font-bold uppercase">Accumulated Spent</span>
                    <span className="text-lg font-bold text-emerald-600 block mt-1">
                      ₹{userDetail?.totalSpent || 0}
                    </span>
                  </div>
                </div>

                {/* Role Promotion / Demotion console */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3.5">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Console Role Assignment Actions
                  </h4>
                  <div className="flex gap-2">
                    {selectedUser.role !== "vendor" && (
                      <button
                        onClick={() => handleChangeRole(selectedUser._id, "vendor")}
                        className="flex-1 py-2 px-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold shadow-xs hover:bg-slate-100 cursor-pointer"
                      >
                        Promote to Vendor
                      </button>
                    )}
                    {selectedUser.role !== "user" && (
                      <button
                        onClick={() => handleChangeRole(selectedUser._id, "user")}
                        className="flex-1 py-2 px-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold shadow-xs hover:bg-slate-100 cursor-pointer"
                      >
                        Demote to User
                      </button>
                    )}
                    {selectedUser.role !== "admin" && (
                      <button
                        onClick={() => handleChangeRole(selectedUser._id, "admin")}
                        className="flex-1 py-2 px-3 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-xs font-bold hover:bg-blue-100 cursor-pointer"
                      >
                        Promote to Admin
                      </button>
                    )}
                  </div>
                </div>

                {/* Bookings log list */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Bookings Logs Audit
                  </h4>
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-white max-h-56 overflow-y-auto">
                    {(userDetail?.bookings || []).map((booking) => (
                      <div key={booking._id} className="p-3 flex justify-between items-center text-xs gap-3">
                        <div>
                          <span className="block font-bold text-slate-700">
                            {booking.parkingLot?.name || booking.chargingStation?.name}
                          </span>
                          <span className="block text-slate-400 mt-0.5">
                            {new Date(booking.startTime).toLocaleDateString()}
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
                    {(userDetail?.bookings || []).length === 0 && (
                      <div className="py-6 text-center text-slate-400 text-xs font-semibold">
                        This user hasn't made any bookings yet.
                      </div>
                    )}
                  </div>
                </div>
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
