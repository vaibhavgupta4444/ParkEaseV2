import { useState } from "react";
import { Outlet, Navigate, useLocation, useNavigate } from "react-router-dom";
import { BookOpen, LogOut, MapPinned, MessageSquare, User, X } from "lucide-react";
import Navbar from "../navigation/Navbar";

const NAV_LINKS = [
  { label: "Home Map", path: "/map", icon: MapPinned },
  { label: "My Bookings", path: "/bookings", icon: BookOpen },
  { label: "Profile", path: "/profile", icon: User },
  { label: "Feedback", path: "/feedback", icon: MessageSquare },
];

export default function UserLayout({ user, token, onLogout }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  if (!user || !token) {
    return <Navigate to="/" replace />;
  }

  const isActive = (path) => {
    if (path === "/map") return location.pathname === "/map";
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const goTo = (path) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-white">
          {(user?.name || "P").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
          <p className="truncate text-xs text-white/60">{user?.email}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {NAV_LINKS.map((item) => {
          const NavIcon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => goTo(item.path)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? "bg-primary text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <NavIcon size={18} />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onLogout={handleLogout} onLogin={() => navigate('/')} onSignup={() => navigate('/register')} />

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-100 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        style={{ width: 260, backgroundColor: "#0F172A" }}
        className={`fixed inset-y-0 left-0 z-101 flex flex-col shadow-xl transition-transform duration-300 md:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={() => setIsMobileOpen(false)}
          className="absolute right-4 top-5 text-white/50 hover:text-white"
        >
          <X size={20} />
        </button>
        {sidebarContent}
      </aside>

      <main className="flex min-h-screen min-w-0 flex-col overflow-hidden pt-24 md:min-h-[calc(100vh-6rem)]">
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
