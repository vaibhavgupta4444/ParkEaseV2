import { LayoutDashboard, Car, Zap, BookOpen, BarChart3, Tag, User, LogOut, X, Lock } from "lucide-react";
import { toast } from "react-hot-toast";

export default function VendorSidebar({ activeTab, setActiveTab, onLogout, unreadCount, onClose, isVerified = true, className = "hidden lg:flex border-r border-slate-200 h-[calc(100vh-120px)] sticky top-28 self-start" }) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "parking", label: "Parking Lots", icon: Car },
    { id: "ev", label: "EV Stations", icon: Zap },
    { id: "bookings", label: "Bookings", icon: BookOpen },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "pricing", label: "Pricing & Offers", icon: Tag },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <aside className={`w-64 shrink-0 flex-col bg-white ${className}`}>
      {onClose && (
        <div className="flex items-center justify-between p-4 border-b border-slate-100 lg:hidden">
          <span className="font-bold text-slate-800">Menu</span>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
      )}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isLocked = !isVerified && tab.id !== "profile";
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (isLocked) {
                  toast.error(`Verification required to access ${tab.label}`);
                  return;
                }
                setActiveTab(tab.id);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                isLocked
                  ? "opacity-50 cursor-not-allowed text-slate-400 hover:bg-transparent"
                  : activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon size={20} />
              <span className="flex-1 text-left">{tab.label}</span>
              {isLocked && <Lock size={14} className="text-slate-400 ml-auto" />}
              {!isLocked && tab.id === "bookings" && unreadCount > 0 && (
                <span className="ml-auto bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-rose-600 hover:bg-rose-50 transition-all"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
