import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Wallet, Building, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import BackButton from "../components/ui/BackButton";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { getApiErrorMessage, formatCurrency } from "../utils/formatters";
import { getBookingById } from "../services/bookingService";

export default function RefundPage({ token }) {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);
  const [submitting, setSubmitting] = useState(false);
  const [method, setMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [bankDetails, setBankDetails] = useState({
    accountName: "",
    accountNumber: "",
    ifscCode: ""
  });

  useEffect(() => {
    if (booking || !token || !bookingId) return;
    setLoading(true);
    getBookingById(bookingId, token)
      .then(res => setBooking(res.data))
      .catch(err => {
        toast.error(getApiErrorMessage(err));
        navigate("/bookings");
      })
      .finally(() => setLoading(false));
  }, [booking, bookingId, token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (method === "upi" && !upiId.trim()) {
      toast.error("Please enter a valid UPI ID");
      return;
    }
    if (method === "bank_transfer" && (!bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.ifscCode)) {
      toast.error("Please fill all bank details");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/refunds`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          bookingId: booking._id,
          amount: booking.totalPrice,
          paymentMethod: method,
          upiId: method === "upi" ? upiId : undefined,
          bankDetails: method === "bank_transfer" ? bankDetails : undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to request refund");
      }

      toast.success("Refund request submitted successfully!");
      navigate(`/bookings/${booking._id}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!booking || booking.status !== "cancelled") {
    return (
      <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <AlertCircle size={40} className="text-error" />
        <p className="font-semibold text-textPrimary">Invalid refund request.</p>
        <button onClick={() => navigate("/bookings")} className="btn-primary">Back to My Bookings</button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 md:py-12 animate-fadeIn">
      <div className="mb-8 flex items-start gap-4">
        <BackButton label="Back" />
        <div className="pt-1">
          <h1 className="text-2xl font-bold leading-none text-secondary">Request Refund</h1>
          <p className="mt-2 text-sm text-textSecondary">Provide your details to receive your refund</p>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <h3 className="font-bold text-blue-900">Refund Amount: {formatCurrency(booking.totalPrice)}</h3>
        <p className="mt-1 text-sm text-blue-800">Booking Ref: {booking.bookingRef}</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="mb-6 flex gap-2 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${
              method === "upi" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setMethod("upi")}
          >
            <div className="flex items-center justify-center gap-2">
              <Wallet size={18} /> UPI
            </div>
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all ${
              method === "bank_transfer" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
            onClick={() => setMethod("bank_transfer")}
          >
            <div className="flex items-center justify-center gap-2">
              <Building size={18} /> Bank Transfer
            </div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {method === "upi" ? (
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@upi"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Account Holder Name</label>
                <input
                  type="text"
                  value={bankDetails.accountName}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Account Number</label>
                <input
                  type="text"
                  value={bankDetails.accountNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">IFSC Code</label>
                <input
                  type="text"
                  value={bankDetails.ifscCode}
                  onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary mt-2 flex w-full items-center justify-center gap-2 py-3.5"
          >
            {submitting ? <><LoadingSpinner /> Submitting...</> : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
