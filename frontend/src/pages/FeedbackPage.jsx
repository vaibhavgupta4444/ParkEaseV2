import { useState } from "react";
import { MessageSquare, ThumbsUp, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import BackButton from "../components/ui/BackButton";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { getApiErrorMessage } from "../utils/formatters";

export default function FeedbackPage({ token }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "feature_request",
    message: "",
    rating: 5,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit feedback");
      }

      toast.success("Feedback submitted successfully. Thank you!");
      setForm({ type: "feature_request", message: "", rating: 5 });
      setTimeout(() => navigate("/home"), 1500);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 md:py-12 animate-fadeIn">
      <div className="mb-8 flex items-start gap-4">
        <BackButton label="Back" />
        <div className="pt-1">
          <h1 className="text-2xl font-bold leading-none text-secondary">Feedback &amp; Suggestions</h1>
          <p className="mt-2 text-sm text-textSecondary">Help us improve your ParkEase experience</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Type of Feedback</label>
            <div className="flex flex-wrap gap-3">
              {[
                { id: "feature_request", icon: ThumbsUp, label: "Suggestion" },
                { id: "bug", icon: AlertCircle, label: "Report Issue" },
                { id: "general", icon: MessageSquare, label: "General" }
              ].map(type => (
                <label 
                  key={type.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 transition-colors ${
                    form.type === type.id 
                      ? "border-blue-600 bg-blue-50 text-blue-700" 
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type.id}
                    checked={form.type === type.id}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="sr-only"
                  />
                  <type.icon size={18} />
                  <span className="text-sm font-semibold">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Rate your experience</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setForm({ ...form, rating: star })}
                  className={`text-2xl transition-transform hover:scale-110 ${
                    form.rating >= star ? "text-amber-400" : "text-slate-200"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="message" className="mb-2 block text-sm font-bold text-slate-700">Message</label>
            <textarea
              id="message"
              rows={5}
              className="w-full rounded-xl border border-slate-300 p-4 text-sm focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              placeholder="Tell us what you think..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-2 flex w-full items-center justify-center gap-2 py-3.5"
          >
            {loading ? <><LoadingSpinner /> Submitting...</> : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
}
