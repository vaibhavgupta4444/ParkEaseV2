import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Map, Calendar, ArrowRight, Clock, MapPin } from "lucide-react";

export default function UserHomePage({ user, token }) {
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"}/bookings/my-bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setRecentBookings(data.data.slice(0, 3) || []);
        }
      } catch (err) {
        console.error("Failed to fetch recent bookings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-6 py-12 lg:py-20">
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Welcome back, {user?.name?.split(' ')[0] || "User"}
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl">
            Where are we heading today? Find the perfect spot for your vehicle or manage your upcoming reservations.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          <Link 
            to="/map" 
            className="group relative overflow-hidden rounded-3xl bg-blue-600 p-8 text-white shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1 hover:shadow-blue-600/40"
          >
            <div className="relative z-10">
              <div className="mb-6 inline-flex rounded-2xl bg-white/20 p-4 backdrop-blur-md">
                <Map size={32} className="text-white" />
              </div>
              <h2 className="text-3xl font-bold">Find Parking</h2>
              <p className="mt-2 text-blue-100">Explore interactive maps to find parking and EV charging stations near you.</p>
              <div className="mt-8 flex items-center font-bold">
                Open Map
                <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-2" />
              </div>
            </div>
            <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-blue-500/50 blur-3xl" />
          </Link>

          <Link 
            to="/bookings" 
            className="group relative overflow-hidden rounded-3xl bg-white p-8 border border-slate-200 shadow-xl shadow-slate-200/50 transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-indigo-500/10"
          >
            <div className="relative z-10">
              <div className="mb-6 inline-flex rounded-2xl bg-indigo-50 p-4 text-indigo-600">
                <Calendar size={32} />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">My Bookings</h2>
              <p className="mt-2 text-slate-600">View your active reservations, past parking history, and digital tickets.</p>
              <div className="mt-8 flex items-center font-bold text-indigo-600">
                Manage Bookings
                <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-2" />
              </div>
            </div>
            <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-indigo-50/50 blur-3xl" />
          </Link>
        </div>

        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-900">Recent Activity</h3>
            <Link to="/bookings" className="text-sm font-bold text-blue-600 hover:underline">View All</Link>
          </div>
          
          {loading ? (
            <div className="flex h-32 items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : recentBookings.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentBookings.map(booking => (
                <div key={booking._id} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        booking.status === "active" ? "bg-emerald-100 text-emerald-800" :
                        booking.status === "pending" ? "bg-amber-100 text-amber-800" :
                        "bg-slate-100 text-slate-800"
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      <span className="text-sm font-bold text-slate-900">₹{booking.totalAmount}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 line-clamp-1">{booking.facility?.name || "Facility"}</h4>
                    <div className="mt-2 flex items-center text-sm text-slate-500">
                      <MapPin size={14} className="mr-1.5 shrink-0" />
                      <span className="line-clamp-1">{booking.facility?.location?.address?.street || "Location not available"}</span>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-slate-500">
                      <Clock size={14} className="mr-1.5 shrink-0" />
                      <span>{new Date(booking.startTime).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Link 
                    to={`/bookings/${booking._id}`}
                    className="mt-4 block w-full rounded-xl bg-slate-50 py-2 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    View Details
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white py-16 text-center">
              <div className="mb-4 rounded-full bg-slate-50 p-4">
                <Calendar size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No recent activity</h3>
              <p className="mt-1 text-slate-500">You don't have any recent parking bookings.</p>
              <Link to="/map" className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 font-bold text-white transition hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20">
                Find Parking Now
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
