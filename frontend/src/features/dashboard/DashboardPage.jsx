import { useState } from "react";
import ParkingSearchComponent from "./ParkingSearchComponent";
import ChargingSearchComponent from "./ChargingSearchComponent";
import BookingHistory from "./BookingHistory";
import SettingsPage from "../profile/SettingsPage";

export default function DashboardPage({ user, onLogout, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState("parking");
  const token = localStorage.getItem("token");
  const displayName = user?.name || user?.email || "Guest";

  return (
    <main className="app-light-theme min-h-screen bg-linear-to-b from-slate-50 via-white to-cyan-50 text-slate-900">
      <div className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 shadow-lg shadow-slate-200/50 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 text-xl font-bold text-white">
              P
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight sm:text-xl">ParkEase</h1>
              <p className="text-xs text-slate-500 sm:text-sm">Find parking and EV charging faster</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
            <span className="text-sm text-slate-600">Welcome, {displayName}!</span>
            <button
              className="rounded-full bg-linear-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-5 grid max-w-6xl grid-cols-2 gap-3 px-4 sm:px-6 lg:grid-cols-4">
        {[
          { id: "parking", label: "Find Parking" },
          { id: "charging", label: "Find EV Charging" },
          { id: "bookings", label: "Booking History" },
          { id: "settings", label: "Settings" },
        ].map((tab) => (
          <button
            key={tab.id}
              className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-semibold transition sm:px-4 ${
              activeTab === tab.id
                ? "border-transparent bg-linear-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20"
                : "border-slate-200 bg-white/80 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-0 pb-10">
        {activeTab === "parking" && <ParkingSearchComponent token={token} />}
        {activeTab === "charging" && <ChargingSearchComponent token={token} />}
        {activeTab === "bookings" && <BookingHistory token={token} />}
        {activeTab === "settings" && <SettingsPage user={user} token={token} onUserUpdate={onUserUpdate} />}
      </div>
    </main>
  );
}
