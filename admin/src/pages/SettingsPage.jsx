import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { toast } from "react-hot-toast";
import { Settings, Save, AlertTriangle, ShieldCheck, Mail, ShieldAlert } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    commissionRate: 10,
    minWithdrawalAmount: 500,
    supportEmail: "support@parkease.com",
    maintenanceMode: false,
    maintenanceMessage: "ParkEase is currently undergoing scheduled systems upgrade. We will be back shortly!",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [maintSubmitting, setMaintSubmitting] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.getSettings();
      if (res.data) {
        setSettings({
          commissionRate: res.data.commissionRate ?? 10,
          minWithdrawalAmount: res.data.minWithdrawalAmount ?? 500,
          supportEmail: res.data.supportEmail ?? "support@parkease.com",
          maintenanceMode: res.data.maintenanceMode ?? false,
          maintenanceMessage: res.data.maintenanceMessage ?? "",
        });
      }
    } catch (err) {
      toast.error("Failed to load settings from DB");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.updateSettings({
        commissionRate: Number(settings.commissionRate),
        minWithdrawalAmount: Number(settings.minWithdrawalAmount),
        supportEmail: settings.supportEmail,
      });
      toast.success("Global configurations updated successfully!");
      fetchSettings();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleMaintenance = async () => {
    const confirmMsg = settings.maintenanceMode
      ? "Turn OFF system maintenance mode and restore all user-facing systems publicly?"
      : "Turn ON system maintenance mode? Non-administrative users will immediately see the maintenance landing screens.";

    if (!window.confirm(confirmMsg)) return;

    setMaintSubmitting(true);
    try {
      const targetState = !settings.maintenanceMode;
      await api.toggleMaintenance(targetState, settings.maintenanceMessage);
      toast.success(`Platform maintenance mode turned ${targetState ? "ON" : "OFF"}`);
      fetchSettings();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setMaintSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm font-semibold">Resolving system configs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Primary Configuration form column */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 lg:col-span-2 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-800">Global Financial & Portal Rules</h3>
          <p className="text-slate-400 text-xs mt-1">
            These values immediately dictate commission distributions and settlement rates across all transaction records
          </p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                Merchant Booking Commission Rate (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={0}
                  max={100}
                  value={settings.commissionRate}
                  onChange={(e) => setSettings({ ...settings, commissionRate: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 font-bold text-sm">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                Minimum Wallet Payout Threshold (INR)
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min={0}
                  value={settings.minWithdrawalAmount}
                  onChange={(e) => setSettings({ ...settings, minWithdrawalAmount: e.target.value })}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 font-bold text-sm">
                  ₹
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
              System Helpline Enquiries Destination Email
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 py-3 px-5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-850 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Commit Configurations
              </>
            )}
          </button>
        </form>
      </div>

      {/* Maintenance Mode column */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-800">Platform Lockdown Override</h3>
          <p className="text-slate-400 text-xs mt-1">
            Block public check-ins, EV updates, and booking requests globally during database migrations
          </p>
        </div>

        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex gap-3 text-xs text-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="leading-normal font-medium">
            Locking systems down immediately displays the lockdown landing screens to all mobile users.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
              Scheduled maintenance message to display
            </label>
            <textarea
              rows={3}
              placeholder="System migration updates running..."
              value={settings.maintenanceMessage}
              onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
              className="w-full p-3 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleToggleMaintenance}
            disabled={maintSubmitting}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
              settings.maintenanceMode
                ? "bg-green-600 hover:bg-green-500 text-white shadow-green-500/10"
                : "bg-red-650 hover:bg-red-600 text-white shadow-red-500/10"
            }`}
          >
            {maintSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : settings.maintenanceMode ? (
              <>
                <ShieldCheck className="w-4 h-4" />
                Resume Public System Visibility
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4" />
                Initiate Systems Lockdown
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
