import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
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
} from "lucide-react";

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Users", path: "/users", icon: Users },
    { name: "Vendors", path: "/vendors", icon: Briefcase },
    { name: "Facilities", path: "/facilities", icon: MapPin },
    { name: "Bookings", path: "/bookings", icon: CalendarRange },
    { name: "Revenue", path: "/revenue", icon: TrendingUp },
    { name: "Reviews", path: "/reviews", icon: MessageSquareText },
    { name: "Support", path: "/support", icon: LifeBuoy },
    { name: "Settings", path: "/settings", icon: Settings },
    { name: "Audit Log", path: "/audit-log", icon: FileText },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-slate-900 text-white shrink-0 border-r border-slate-800">
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
              <span className="block text-sm font-semibold text-white truncate">
                {user?.name || "ParkEase Admin"}
              </span>
              <span className="block text-xs text-slate-400 truncate">
                {user?.email || "admin@parkease.com"}
              </span>
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
      </aside>

      {/* Mobile Sidebar (Drawer Overlay) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
          <aside className="w-64 bg-slate-900 text-white flex flex-col h-full animate-slide-right shadow-2xl relative">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 flex items-center gap-3 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg">
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
                  <span className="block text-sm font-semibold text-white truncate">
                    {user?.name || "ParkEase Admin"}
                  </span>
                  <span className="block text-xs text-slate-400 truncate">
                    {user?.email || "admin@parkease.com"}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-red-950/20 text-red-400 border border-red-900/30 hover:bg-red-900 hover:text-white transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Wrapper */}
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
            <div>
              <h1 className="text-lg font-bold text-slate-800 capitalize">
                {location.pathname.substring(1).replace("-", " ") || "Dashboard"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white"></span>
            </button>

            <div className="h-8 w-px bg-slate-200"></div>

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

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-(screen-2xl) mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
