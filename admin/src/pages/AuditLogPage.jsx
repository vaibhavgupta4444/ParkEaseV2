import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { toast } from "react-hot-toast";
import { Search, Filter, Shield, Activity, Calendar, ShieldAlert } from "lucide-react";

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAuditLogs();
      setLogs(res.data);
    } catch (err) {
      toast.error("Failed to load administrative audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Client filtering
  const filteredLogs = logs.filter((log) => {
    const adminName = log.adminId?.name || "System Admin";
    const matchesSearch =
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.details?.toLowerCase().includes(search.toLowerCase()) ||
      adminName.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === "all" || log.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800">Administrative Operations Audit Ledger</h2>
        <p className="text-slate-400 text-xs mt-0.5">
          Read-only cryptographic tamper-proof ledger recording all actions taken by administrators
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute inset-y-0 left-3 flex items-center w-4 h-4 text-slate-400 my-auto" />
          <input
            type="text"
            placeholder="Search action descriptions, admin name, or affected targets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</span>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white"
          >
            <option value="all">All Operations</option>
            <option value="user">User moderation</option>
            <option value="vendor">Vendor moderation</option>
            <option value="facility">Facility moderation</option>
            <option value="booking">Booking force actions</option>
            <option value="review">Review filter moderation</option>
            <option value="support">Support chat responder</option>
            <option value="setting">Global rules modification</option>
            <option value="auth">Admin login gate</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">Executor</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Operation Action</th>
                <th className="py-4 px-6">Network Origin IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-medium">
                    No matching audit operations logged.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 text-slate-400 text-xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-[10px]">
                          {log.adminId?.name?.slice(0, 2).toUpperCase() || "SY"}
                        </div>
                        <span className="font-bold text-slate-800">
                          {log.adminId?.name || "System Automated"}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 capitalize">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          log.category === "auth"
                            ? "bg-purple-50 text-purple-600 border border-purple-100"
                            : log.category === "setting"
                            ? "bg-red-50 text-red-650 border border-red-100"
                            : "bg-blue-50 text-blue-600 border border-blue-100"
                        }`}
                      >
                        {log.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium">
                      <span className="block text-slate-850 font-bold">{log.action}</span>
                      <span className="block text-slate-400 text-xs mt-0.5 leading-relaxed">
                        {log.details}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-400">{log.ipAddress || "127.0.0.1"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
