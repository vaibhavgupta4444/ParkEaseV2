import { useState } from "react";
import AuthInput from "./AuthInput";
import { apiRegister } from "../../../services/authService";

export default function RegisterForm({ onSuccess, onToggle }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiRegister(form);
      onSuccess(res.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">Partner with Us</h2>
      <p className="mt-2 text-slate-500">Register your business and start managing parking assets.</p>

      {error && (
        <div className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-600 border border-rose-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <AuthInput label="Full Name" value={form.name} onChange={(v) => setForm(f => ({ ...f, name: v }))} placeholder="John Doe" />
        <AuthInput label="Email address" type="email" value={form.email} onChange={(v) => setForm(f => ({ ...f, email: v }))} placeholder="business@parkease.com" />
        <AuthInput label="Phone Number" value={form.phone} onChange={(v) => setForm(f => ({ ...f, phone: v }))} placeholder="+1 (555) 000-0000" />
        <AuthInput label="Password" type="password" value={form.password} onChange={(v) => setForm(f => ({ ...f, password: v }))} placeholder="••••••••" />
        
        <button
          disabled={loading}
          className="mt-4 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-4 font-bold text-white shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Start Business Journey"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <button onClick={onToggle} className="font-bold text-blue-600 hover:underline">
          Sign in instead
        </button>
      </p>
    </div>
  );
}
