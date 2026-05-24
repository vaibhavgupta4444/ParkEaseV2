import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { toast } from "react-hot-toast";
import {
  IndianRupee,
  Download,
  AlertTriangle,
  Send,
  PieChart as PieIcon,
  TrendingUp,
  FileText,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function RevenuePage() {
  const [summary, setSummary] = useState({});
  const [charts, setCharts] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Manual Refund Form
  const [manualRefund, setManualRefund] = useState({
    bookingId: "",
    amount: "",
    reason: "",
  });
  const [refundSubmitting, setRefundSubmitting] = useState(false);

  const initData = async () => {
    setLoading(true);
    try {
      const [sumRes, chartRes, txRes, refRes] = await Promise.all([
        api.getRevenueSummary(),
        api.getRevenueCharts(),
        api.getTransactions(),
        api.getRefunds(),
      ]);
      setSummary(sumRes.data);
      setCharts(chartRes.data);
      setTransactions(txRes.data);
      setRefunds(refRes.data);
    } catch (err) {
      toast.error("Failed to load financial dashboards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  const handleManualRefund = async (e) => {
    e.preventDefault();
    if (!manualRefund.bookingId || !manualRefund.amount || !manualRefund.reason) {
      toast.error("Please fill in all refund fields");
      return;
    }

    setRefundSubmitting(true);
    try {
      await api.manuallyTriggerRefund(
        manualRefund.bookingId,
        manualRefund.amount,
        manualRefund.reason
      );
      toast.success("Wallet credit refund processed successfully!");
      setManualRefund({ bookingId: "", amount: "", reason: "" });
      initData();
    } catch (err) {
      toast.error(err.message || "Failed to trigger refund. Verify booking ID.");
    } finally {
      setRefundSubmitting(false);
    }
  };

  const handleExportTxs = () => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    window.open(
      baseUrl + "/admin/transactions/export?token=" +
        localStorage.getItem("admin_token")
    );
    toast.success("Transactions ledger spreadsheet downloading!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm font-semibold">Consolidating ledger curves...</p>
        </div>
      </div>
    );
  }

  const cards = [
    { name: "Gross Volume Settled", value: `₹${summary.totalRevenue || 0}`, icon: IndianRupee, color: "text-blue-600 bg-blue-50" },
    { name: "Gross Month Volume", value: `₹${summary.revenueThisMonth || 0}`, icon: IndianRupee, color: "text-purple-600 bg-purple-50" },
    { name: "Platform Commissions (10%)", value: `₹${summary.commissionEarned || 0}`, icon: IndianRupee, color: "text-emerald-600 bg-emerald-50" },
    { name: "Refunds Processed", value: `₹${summary.totalRefunds || 0}`, icon: IndianRupee, color: "text-rose-600 bg-rose-50" },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Platform Financial & Settlement Ledger</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Audit payment receipts, commissions pools, and trigger manual settlement overrides
          </p>
        </div>
        <button
          onClick={handleExportTxs}
          className="inline-flex items-center gap-2 py-2.5 px-4 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-slate-850 active:scale-98 transition-all cursor-pointer w-fit"
        >
          <Download className="w-4 h-4" />
          Export Transactions (CSV)
        </button>
      </div>

      {/* Revenue Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.name}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  {card.name}
                </span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <span className="text-2xl font-black text-slate-800 block">{card.value}</span>
            </div>
          );
        })}
      </div>

      {/* Visual Charts and Manual Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Facilities bar charts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-800">Top Revenue-Generating Locations</h3>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 py-1 px-2.5 rounded-lg flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
              Top 10 Locations
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.topFacilities || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip />
                <Bar dataKey="value" name="Revenue Generated (₹)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Manual Refund Form panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-800">Manual Settlement Overrides</h3>
            <p className="text-slate-400 text-xs mt-1">
              Trigger administrative wallet credits or refund adjustments directly to a user's wallet
            </p>
          </div>

          <form onSubmit={handleManualRefund} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Target Booking Object ID
              </label>
              <input
                type="text"
                required
                placeholder="65abcdef1234567890abcdef"
                value={manualRefund.bookingId}
                onChange={(e) => setManualRefund({ ...manualRefund, bookingId: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Adjustment Amount (INR)
              </label>
              <input
                type="number"
                required
                min={1}
                placeholder="250"
                value={manualRefund.amount}
                onChange={(e) => setManualRefund({ ...manualRefund, amount: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Reason Comments
              </label>
              <textarea
                required
                rows={2}
                placeholder="Manual settlement correction adjustment..."
                value={manualRefund.reason}
                onChange={(e) => setManualRefund({ ...manualRefund, reason: e.target.value })}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={refundSubmitting}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 disabled:opacity-50"
            >
              {refundSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Credit Wallet
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Transaction Ledgers table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">Recent Payment Ledger</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="py-4 px-6">Payment Intent</th>
                <th className="py-4 px-6">Customer Email</th>
                <th className="py-4 px-6">Amount Settled</th>
                <th className="py-4 px-6">Date & Hour</th>
                <th className="py-4 px-6">Settlement status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {transactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-mono text-xs font-bold text-slate-800">{tx.paymentId || tx._id}</td>
                  <td className="py-4 px-6 font-medium">{tx.booking?.user?.email || "Guest"}</td>
                  <td className="py-4 px-6 font-bold text-slate-800">₹{tx.amount}</td>
                  <td className="py-4 px-6 text-slate-400 text-xs">
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 capitalize">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        tx.status === "succeeded"
                          ? "bg-green-50 text-green-600 border border-green-200"
                          : tx.status === "failed"
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : "bg-blue-50 text-blue-600 border border-blue-200"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    No payment ledgers resolved yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
