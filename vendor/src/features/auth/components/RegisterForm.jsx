import { useEffect, useState } from "react";
import AuthInput from "./AuthInput";
import { apiRegister, apiSendOTP, apiVerifyOTP } from "../../../services/authService";

export default function RegisterForm({ onSuccess, onToggle }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiSendOTP(form.email);
      setStep(2);
      setTimer(30);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await apiVerifyOTP(form.email, otp);
      const res = await apiRegister(form);
      onSuccess(res.token, res.refreshToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError("");
    try {
      await apiSendOTP(form.email);
      setTimer(30);
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

      {step === 1 ? (
        <form onSubmit={handleSendOTP} className="mt-8 flex flex-col gap-4">
          <AuthInput label="Full Name" value={form.name} onChange={(v) => setForm(f => ({ ...f, name: v }))} placeholder="John Doe" />
          <AuthInput label="Email address" type="email" value={form.email} onChange={(v) => setForm(f => ({ ...f, email: v }))} placeholder="business@parkease.com" />
          <AuthInput label="Phone Number" value={form.phone} onChange={(v) => setForm(f => ({ ...f, phone: v }))} placeholder="+1 (555) 000-0000" />
          <AuthInput label="Password" type="password" value={form.password} onChange={(v) => setForm(f => ({ ...f, password: v }))} placeholder="••••••••" />
          
          <button
            disabled={loading}
            className="mt-4 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-4 font-bold text-white shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Sending OTP..." : "Continue"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyAndRegister} className="mt-8 flex flex-col gap-4">
          <p className="text-sm font-medium text-slate-600">
            Enter the 6-digit code sent to <span className="font-bold">{form.email}</span>
          </p>
          <AuthInput 
            label="Verification Code" 
            type="text" 
            value={otp} 
            onChange={setOtp} 
            placeholder="123456" 
          />
          
          <button
            disabled={loading}
            className="mt-4 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-4 font-bold text-white shadow-xl shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify & Start Business Journey"}
          </button>

          <div className="mt-4 flex justify-between items-center text-sm">
            <button 
              type="button" 
              onClick={() => setStep(1)} 
              className="font-medium text-slate-500 hover:text-slate-700"
            >
              Change Email
            </button>
            <button 
              type="button" 
              onClick={handleResendOTP} 
              disabled={timer > 0 || loading}
              className="font-medium text-blue-600 hover:text-blue-800 disabled:text-slate-400"
            >
              {timer > 0 ? `Resend code in ${timer}s` : "Resend Code"}
            </button>
          </div>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <button onClick={onToggle} className="font-bold text-blue-600 hover:underline">
          Sign in instead
        </button>
      </p>
    </div>
  );
}
