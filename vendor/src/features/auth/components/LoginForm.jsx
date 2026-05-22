import { useState } from "react";
import AuthInput from "./AuthInput";
import { apiLogin } from "../../../services/authService";

export default function LoginForm({ onSuccess, onToggle }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiLogin(email, password);
      onSuccess(res.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
      <p className="mt-2 text-slate-500">Access your vendor dashboard and manage your facilities.</p>

      {error && (
        <div className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-600 border border-rose-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <AuthInput label="Email address" type="email" value={email} onChange={setEmail} placeholder="vendor@parkease.com" />
        <AuthInput label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
        
        <button
          disabled={loading}
          className="mt-2 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-4 font-bold text-white shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign into Console"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Don't have a vendor account?{" "}
        <button onClick={onToggle} className="font-bold text-blue-600 hover:underline">
          Create one now
        </button>
      </p>
    </div>
  );
}
