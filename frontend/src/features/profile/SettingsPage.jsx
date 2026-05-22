import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { changePassword, updateProfile } from "../../services/authService";

export default function SettingsPage({ user, token, onUserUpdate }) {
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    emailNotifications: user?.preferences?.emailNotifications ?? true,
  });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const saveProfile = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await updateProfile(profile, token);
      localStorage.setItem("user", JSON.stringify(response.user));
      onUserUpdate?.(response.user);
      setMessage("Profile updated");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const savePassword = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await changePassword(passwords, token);
      setPasswords({ currentPassword: "", newPassword: "" });
      setMessage("Password changed");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 text-slate-100">
      <h2 className="text-2xl font-semibold">Settings</h2>
      {message && <p className="mt-4 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-emerald-100">{message}</p>}
      {error && <p className="mt-4 rounded-lg border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-rose-100">{error}</p>}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <form onSubmit={saveProfile} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <h3 className="text-lg font-semibold">Profile</h3>
          <div className="mt-4 grid gap-4">
            <label className="grid gap-2 text-sm text-slate-300">
              Display name
              <input
                value={profile.name}
                onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              />
            </label>
            <label className="grid gap-2 text-sm text-slate-300">
              Email
              <input
                type="email"
                value={profile.email}
                onChange={(event) => setProfile((prev) => ({ ...prev, email: event.target.value }))}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={profile.emailNotifications}
                onChange={(event) => setProfile((prev) => ({ ...prev, emailNotifications: event.target.checked }))}
              />
              Email alerts for upcoming bookings
            </label>
          </div>
          <button disabled={loading} className="mt-5 w-full rounded-xl bg-linear-to-r from-emerald-400 to-emerald-600 px-4 py-2 text-sm font-semibold text-slate-900">
            Save profile
          </button>
        </form>

        <form onSubmit={savePassword} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <h3 className="text-lg font-semibold">Password</h3>
          <div className="mt-4 grid gap-4">
            <label className="grid gap-2 text-sm text-slate-300">
              Current password
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwords.currentPassword}
                  onChange={(event) => setPasswords((prev) => ({ ...prev, currentPassword: event.target.value }))}
                  className="w-full border border-border rounded-lg px-4 py-2.5 pr-11 text-sm text-textPrimary bg-surface placeholder:text-textMuted outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textSecondary transition-colors"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>
            <label className="grid gap-2 text-sm text-slate-300">
              New password
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwords.newPassword}
                  onChange={(event) => setPasswords((prev) => ({ ...prev, newPassword: event.target.value }))}
                  className="w-full border border-border rounded-lg px-4 py-2.5 pr-11 text-sm text-textPrimary bg-surface placeholder:text-textMuted outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textSecondary transition-colors"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>
          </div>
          <button disabled={loading} className="mt-5 w-full rounded-xl border border-sky-400/50 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-100">
            Change password
          </button>
        </form>
      </div>
    </div>
  );
}
