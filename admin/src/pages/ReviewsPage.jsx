import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Trash2, ShieldCheck, Star, AlertTriangle, MessageSquare } from "lucide-react";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [reportedQueue, setReportedQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePane, setActivePane] = useState("all"); // all | reported

  const initData = async () => {
    setLoading(true);
    try {
      const [revRes, repRes] = await Promise.all([api.getReviews(), api.getReportedReviews()]);
      setReviews(revRes.data);
      setReportedQueue(repRes.data);
    } catch (err) {
      toast.error("Failed to load reviews feeds");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  const handleHide = async (id) => {
    try {
      await api.hideReview(id);
      toast.success("Review hidden from public facility maps");
      initData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRestore = async (id) => {
    try {
      await api.restoreReview(id);
      toast.success("Review made visible again publicly!");
      initData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this review?")) return;
    try {
      await api.deleteReview(id);
      toast.success("Review permanently deleted");
      initData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDismissReport = async (id) => {
    try {
      await api.dismissReviewReport(id);
      toast.success("Clear warnings. Report warning flags dismissed.");
      initData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5 text-amber-500">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? "fill-amber-500" : "text-slate-200"}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800">Feedback & Review Moderation</h2>
        <p className="text-slate-400 text-xs mt-0.5">
          Audit customer reviews, inspect reported violations, and filter inappropriate comments
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="border-b border-slate-200 flex gap-6">
        <button
          onClick={() => setActivePane("all")}
          className={`py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activePane === "all" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          All Reviews
        </button>
        <button
          onClick={() => setActivePane("reported")}
          className={`py-3 text-sm font-bold border-b-2 transition-all cursor-pointer relative ${
            activePane === "reported"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Flagged Reports Queue
          {reportedQueue.length > 0 && (
            <span className="ml-1.5 py-0.5 px-2 bg-red-600 text-white rounded-full text-[10px] font-black absolute -top-1 -right-4 shadow-sm shadow-red-500/20 animate-pulse">
              {reportedQueue.length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : activePane === "all" ? (
        /* All Reviews feed */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev._id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-md transition-all duration-300"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4 border-b border-slate-50 pb-2.5">
                  <div>
                    <span className="block font-bold text-slate-800">{rev.userId?.name || "Anonymized"}</span>
                    <span className="block text-slate-400 text-[10px] mt-0.5 font-mono">{rev.userId?.email}</span>
                  </div>
                  <div className="text-right">
                    {renderStars(rev.rating)}
                    <span className="block text-[9px] font-bold text-slate-400 mt-1 uppercase truncate max-w-32">
                      {rev.facilityId?.name || "Facility"}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{rev.comment || "No written review text details."}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-xs">
                <span className="text-slate-400 font-medium">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-1">
                  {rev.isHidden ? (
                    <button
                      onClick={() => handleRestore(rev._id)}
                      className="inline-flex items-center gap-1 py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-600 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-500" />
                      Restore Visible
                    </button>
                  ) : (
                    <button
                      onClick={() => handleHide(rev._id)}
                      className="inline-flex items-center gap-1 py-1.5 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-600 cursor-pointer"
                    >
                      <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                      Hide Listing
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(rev._id)}
                    className="inline-flex items-center gap-1 py-1.5 px-2.5 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg text-[10px] font-bold text-red-650 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {reviews.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white border border-slate-200 rounded-2xl">
              <MessageSquare className="w-12 h-12 text-slate-350 mx-auto mb-3" />
              <h3 className="text-slate-700 font-bold">No Reviews Received</h3>
              <p className="text-slate-400 text-xs mt-1">Platform listings have no ratings yet</p>
            </div>
          )}
        </div>
      ) : (
        /* Flagged Reported Queue */
        <div className="space-y-4">
          {reportedQueue.map((rev) => (
            <div
              key={rev._id}
              className="bg-white p-5 rounded-2xl border border-red-100 bg-red-50/5 shadow-xs space-y-4 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-4 border-b border-red-50 pb-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block font-bold text-slate-800">
                      Report Warnings: {rev.reportCount || 1} Reports Flagged
                    </span>
                    <span className="block text-slate-400 text-[10px] mt-0.5">
                      Reviewer: {rev.userId?.name} ({rev.userId?.email})
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  {renderStars(rev.rating)}
                  <span className="block text-[9px] font-bold text-slate-400 mt-1 uppercase">
                    {rev.facilityId?.name}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                "{rev.comment}"
              </p>

              <div className="flex items-center justify-between pt-2.5 text-xs">
                <span className="text-slate-400 font-medium">
                  Flagged Date: {new Date(rev.updatedAt).toLocaleDateString()}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDismissReport(rev._id)}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-emerald-600 text-white rounded-lg text-[10px] font-bold shadow-sm hover:bg-emerald-500 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Dismiss Report
                  </button>
                  <button
                    onClick={() => handleHide(rev._id)}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-slate-900 text-white rounded-lg text-[10px] font-bold shadow-sm hover:bg-slate-850 cursor-pointer"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    Hide Review
                  </button>
                  <button
                    onClick={() => handleDelete(rev._id)}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 rounded-lg text-[10px] font-bold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Review
                  </button>
                </div>
              </div>
            </div>
          ))}

          {reportedQueue.length === 0 && (
            <div className="py-16 text-center bg-white border border-slate-200 rounded-2xl">
              <ShieldCheck className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-slate-700 font-bold">Report queue clean</h3>
              <p className="text-slate-400 text-xs mt-1">All reviews adhere to platform guidelines</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
