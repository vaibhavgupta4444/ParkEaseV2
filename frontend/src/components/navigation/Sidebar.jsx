import { useEffect } from "react";
import {
  Bell,
  BookOpen,
  CircleHelp,
  Home,
  LayoutDashboard,
  LogOut,
  MapPinned,
  MessageSquare,
  Settings,
  Shield,
  User,
  Wallet,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const baseLinks = [
  { label: "Home", path: "/map", icon: Home },
  { label: "Find Parking", path: "/map", icon: MapPinned },
  { label: "My Bookings", path: "/bookings", icon: BookOpen },
  { label: "Profile", path: "/profile", icon: User },
  { label: "Settings", path: "/profile?tab=settings", icon: Settings },
  { label: "Feedback", path: "/feedback", icon: MessageSquare },
];

export default function Sidebar({ isOpen, onClose, user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.body.classList.toggle("overflow-hidden", isOpen);
    return () => document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  const links = [
    ...baseLinks,
    ...(user?.role === "admin" ? [{ label: "Admin Panel", path: "/admin", icon: Shield }] : []),
  ];

  const goTo = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-[90] bg-black/50 transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed left-0 top-0 z-[100] flex h-screen w-[280px] flex-col bg-secondary text-white shadow-xl transition-transform duration-300 md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Mobile navigation"
      >
        <div className="flex items-start justify-between border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-base font-bold">
              {(user?.name || "P").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user?.name || "ParkEase"}</p>
              <p className="truncate text-xs text-white/60">{user?.email || "Find parking faster"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {links.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path.split("?")[0];
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => goTo(item.path)}
                className={`flex w-full items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition ${
                  active ? "bg-primary text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && <span className="h-2 w-2 rounded-full bg-error" />}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="flex w-full items-center gap-3 rounded-full px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
