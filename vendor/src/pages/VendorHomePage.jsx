import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, TrendingUp, Users, LogOut, ArrowRight, ShieldAlert, ShieldCheck } from "lucide-react";
import { getVendorAnalytics, getVendorProfile } from "../services/vendorService";

export default function VendorHomePage({ token, setToken }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, analyticsRes] = await Promise.all([
          getVendorProfile(token),
          getVendorAnalytics(token)
        ]);
        setProfile(profileRes.data);
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("vendor-token");
    localStorage.removeItem("vendor-refresh-token");
    window.dispatchEvent(new Event("storage"));
    setToken("");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const isVerified = profile?.verificationStatus === "verified";

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/vendor/home")}>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              ParkEase
            </span>
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600 border border-blue-100">
              Partner
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-bold tracking-tight text-slate-900">
            Welcome back, {profile?.name || "Partner"}
          </h2>
          <p className="mt-2 text-lg text-slate-500">
            Here's what's happening with your facilities today.
          </p>
        </div>

        {!isVerified && (
          <div className="mb-8 flex items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <ShieldAlert className="mt-1 h-6 w-6 shrink-0 text-amber-600" />
            <div>
              <h3 className="text-lg font-bold text-amber-900">Account Not Verified</h3>
              <p className="mt-1 text-sm text-amber-700">
                Your account is currently unverified. You cannot create new facilities until your documents are approved. Please visit the management portal to upload your verification documents.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between text-blue-600">
              <TrendingUp size={24} />
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold">Today</span>
            </div>
            <p className="mt-4 text-3xl font-bold">{analytics?.dailyRevenue ? `₹${analytics.dailyRevenue}` : "₹0"}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">Daily Revenue</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between text-emerald-600">
              <Users size={24} />
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold">Active</span>
            </div>
            <p className="mt-4 text-3xl font-bold">{analytics?.activeBookings || 0}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">Current Bookings</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between text-indigo-600">
              <Building2 size={24} />
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold">Total</span>
            </div>
            <p className="mt-4 text-3xl font-bold">{analytics?.totalFacilities || 0}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">Facilities Managed</p>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Link 
            to="/vendor/manage" 
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-xl hover:shadow-blue-500/10"
          >
            <div className="relative z-10">
              <div className="mb-4 inline-block rounded-xl bg-blue-50 p-3 text-blue-600">
                <Building2 size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Manage Facilities</h3>
              <p className="mt-2 text-slate-500">Create new parking lots, manage charging stations, set dynamic pricing, and view detailed analytics.</p>
              
              <div className="mt-6 flex items-center font-bold text-blue-600">
                Open Management Portal
                <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-blue-50 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>

          <Link 
            to="/vendor/manage" 
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-xl hover:shadow-indigo-500/10"
          >
            <div className="relative z-10">
              <div className="mb-4 inline-block rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Business Profile</h3>
              <p className="mt-2 text-slate-500">Update your company details, upload verification documents, and configure payout settings.</p>
              
              <div className="mt-6 flex items-center font-bold text-indigo-600">
                View Profile Settings
                <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-indigo-50 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        </div>
      </main>
    </div>
  );
}
