import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../services/api.js";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  MapPin,
  CalendarRange,
  TrendingUp,
  MessageSquareText,
  LifeBuoy,
  Settings,
  FileText,
  LogOut,
  Menu,
  X,
  Bell,
  Shield,
  CalendarCheck,
  Star,
  MessageCircle,
  UserCheck,
  Ticket,
  CheckCheck,
} from "lucide-react";

const TYPE_CONFIG = {
  booking:  { icon: CalendarCheck, color: "text-blue-500 bg-blue-50" },
  review:   { icon: Star,          color: "text-amber-500 bg-amber-50" },
  feedback: { icon: MessageCircle, color: "text-purple-500 bg-purple-50" },
  vendor:   { icon: UserCheck,     color: "text-emerald-500 bg-emerald-50" },
  support:  { icon: Ticket,        color: "text-rose-500 bg-rose-50" },
};

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("admin_read_notifs") || "[]"); } catch { return []; }
  });
  const notifRef = useRef(null);

  const menuItems = [
    { name: "Dashboard",  path: "/dashboard", icon: LayoutDashboard },
    { name: "Users",      path: "/users",      icon: Users },
    { name: "Vendors",    path: "/vendors",    icon: Briefcase },
    { name: "Facilities", path: "/facilities", icon: MapPin },
    { name: "Bookings",   path: "/bookings",   icon: CalendarRange },
    { name: "Revenue",    path: "/revenue",    icon: TrendingUp },
    { name: "Reviews",    path: "/reviews",    icon: MessageSquareText },
    { name: "Support",    path: "/support",    icon: LifeBuoy },
    { name: "Settings",   path: "/settings",   icon: Settings },
    { name: "Audit Log",  path: "/audit-log",  icon: FileText },
  ];

  const handleLogout = () => { logout(); navigate("/login"); };

  // Fetch notifications when dropdown opens
  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const res = await api.getAdminNotifications();
      const items = res.data || [];
      setNotifications(items);
      const unread = items.filter((n) => !readIds.includes(n._id)).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Failed to fetch admin notifications:", err);
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleBellClick = () => {
    setNotifOpen((prev) => !prev);
    if (!notifOpen) fetchNotifications();
  };

  const markAllRead = () => {
    const allIds = notifications.map((n) => n._id);
    const merged = [...new Set([...readIds, ...allIds])];
    setReadIds(merged);
    localStorage.setItem("admin_read_notifs", JSON.stringify(merged));
    setUnreadCount(0);
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-lg bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            ParkEase
          </span>
          <span className="block text-xs font-bold text-blue-400 tracking-widest uppercase">
            Admin Console
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 font-semibold"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/40">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-blue-400">
            {user?.name?.slice(0, 2).toUpperCase() || "AD"}
          </div>
          <div className="truncate">
            <span className="block text-sm font-semibold text-white truncate">{user?.name || "ParkEase Admin"}</span>
            <span className="block text-xs text-slate-400 truncate">{user?.email || "admin@parkease.com"}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-red-950/20 text-red-400 border border-red-900/30 hover:bg-red-900 hover:text-white transition-all duration-300 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-slate-900 text-white shrink-0 border-r border-slate-800">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <aside className="w-64 bg-slate-900 text-white flex flex-col h-full shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-slate-800 capitalize">
              {location.pathname.substring(1).replace("-", " ") || "Dashboard"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                id="admin-notif-bell"
                onClick={handleBellClick}
                className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white animate-pulse">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Platform Notifications</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Last 7 days of activity</p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <CheckCheck className="w-3 h-3" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Body */}
                  <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
                    {notifLoading ? (
                      <div className="py-12 flex flex-col items-center gap-3">
                        <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs text-slate-400 font-medium">Loading activity...</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="py-12 text-center">
                        <Bell className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-slate-500">No recent activity</p>
                        <p className="text-xs text-slate-400 mt-1">Platform events will show here</p>
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.booking;
                        const Icon = cfg.icon;
                        const isRead = readIds.includes(notif._id);
                        return (
                          <div
                            key={notif._id}
                            className={`flex items-start gap-3.5 px-5 py-3.5 transition-colors hover:bg-slate-50 ${
                              !isRead ? "bg-blue-50/40" : ""
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                              <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs font-bold text-slate-700">{notif.title}</p>
                                <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                                  {timeAgo(notif.createdAt)}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed truncate">
                                {notif.message}
                              </p>
                            </div>
                            {!isRead && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="border-t border-slate-100 px-5 py-3 text-center">
                      <Link
                        to="/audit-log"
                        onClick={() => setNotifOpen(false)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        View full audit log →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-slate-200" />

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">
                {user?.name?.slice(0, 2).toUpperCase() || "AD"}
              </div>
              <span className="hidden sm:inline text-sm font-semibold text-slate-700">
                {user?.name || "Administrator"}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-screen-2xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
