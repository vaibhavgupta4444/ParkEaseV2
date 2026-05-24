import React from "react";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "./BrandLogo";

export default function Navbar({ onLogin, onSignup, user, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/home") }>
            <BrandLogo size="large" />
          </div>

          {user && (
            <div className="hidden md:flex items-center space-x-7">
              <button onClick={() => navigate('/home')} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Home</button>
              <button onClick={() => navigate('/map')} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Map</button>
              <button onClick={() => navigate('/bookings')} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">My Bookings</button>
              <button onClick={() => navigate('/profile')} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Profile</button>
            </div>
          )}

          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-textPrimary">{user.name}</p>
                  <p className="text-xs text-textSecondary">{user.email}</p>
                </div>
                <button onClick={onLogout} className="text-sm text-error font-semibold ml-2">Log Out</button>
              </>
            ) : (
              <>
                <button onClick={onLogin} className="hidden sm:block px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-full">Sign In</button>
                <button onClick={onSignup} className="px-4 py-2 bg-secondary text-white font-bold rounded-full">Get Started</button>
              </>
            )}

            <button onClick={() => setMobileOpen((s) => !s)} className="md:hidden p-2">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {user && (
              <>
                <button onClick={() => { navigate('/home'); setMobileOpen(false); }} className="block w-full text-left px-4 py-3 text-sm font-semibold text-slate-600">Home</button>
                <button onClick={() => { navigate('/map'); setMobileOpen(false); }} className="block w-full text-left px-4 py-3 text-sm font-semibold text-slate-600">Map</button>
                <button onClick={() => { navigate('/bookings'); setMobileOpen(false); }} className="block w-full text-left px-4 py-3 text-sm font-semibold text-slate-600">My Bookings</button>
                <button onClick={() => { navigate('/profile'); setMobileOpen(false); }} className="block w-full text-left px-4 py-3 text-sm font-semibold text-slate-600">Profile</button>
              </>
            )}
            {!user && <button onClick={() => { onLogin(); setMobileOpen(false); }} className="w-full text-center py-3 font-bold text-blue-600">Sign In</button>}
          </div>
        </div>
      )}
    </nav>
  );
}
