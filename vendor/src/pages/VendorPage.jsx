import { useState } from "react";
import DashboardPage from "../features/dashboard/DashboardPage";
import LoginForm from "../features/auth/components/LoginForm";
import RegisterForm from "../features/auth/components/RegisterForm";

const TOKEN_KEY = "vendor-token";

export default function VendorPage() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [showRegister, setShowRegister] = useState(false);

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
  };

  if (!token) {
    return (
      <main className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center p-4">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/40 bg-white/70 shadow-2xl backdrop-blur-2xl lg:grid-cols-2">
          {/* Left Side: Illustration & Branding */}
          <div className="relative hidden flex-col justify-between bg-linear-to-br from-blue-600 to-indigo-700 p-12 text-white lg:flex">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            
            <div className="relative z-10">
              <h1 className="text-4xl font-black italic tracking-tighter">PARKEASE.</h1>
              <p className="mt-4 text-lg font-medium text-blue-100/80">The smart infrastructure for urban mobility management.</p>
            </div>

            <div className="relative z-10 space-y-6">
              <div className="rounded-3xl bg-white/10 p-6 backdrop-blur-md">
                <p className="text-sm font-medium leading-relaxed italic">"Transitioning our parking lot management to ParkEase increased our efficiency by 40% in just two months. A game changer for vendors."</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-400" />
                  <div>
                    <p className="text-sm font-bold">Marcus Chen</p>
                    <p className="text-xs text-blue-200">Regional Manager, Skyline Parking</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-blue-300">© 2026 ParkEase Systems. All rights reserved.</p>
            </div>
          </div>

          {/* Right Side: Auth Forms */}
          <div className="flex flex-col justify-center p-8 sm:p-12 md:p-16">
            <div className="mx-auto w-full max-w-sm">
              {showRegister ? (
                <RegisterForm onSuccess={handleLoginSuccess} onToggle={() => setShowRegister(false)} />
              ) : (
                <LoginForm onSuccess={handleLoginSuccess} onToggle={() => setShowRegister(true)} />
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return <DashboardPage token={token} onBack={handleLogout} />;
}
