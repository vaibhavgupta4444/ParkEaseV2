import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency, formatDate } from "../utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MOCK_ANALYTICS = {
  revenueByDay: [
    { date: "2026-05-15", revenue: 1200 },
    { date: "2026-05-16", revenue: 1540 },
    { date: "2026-05-17", revenue: 1100 },
    { date: "2026-05-18", revenue: 1800 },
    { date: "2026-05-19", revenue: 2100 },
    { date: "2026-05-20", revenue: 1950 },
    { date: "2026-05-21", revenue: 2300 },
  ],
  occupancyRate: [
    { date: "2026-05-15", rate: 45 },
    { date: "2026-05-16", rate: 52 },
    { date: "2026-05-17", rate: 48 },
    { date: "2026-05-18", rate: 70 },
    { date: "2026-05-19", rate: 85 },
    { date: "2026-05-20", rate: 65 },
    { date: "2026-05-21", rate: 78 },
  ],
  bookingsByDay: [
    { date: "2026-05-15", bookings: 12 },
    { date: "2026-05-16", bookings: 16 },
    { date: "2026-05-17", bookings: 14 },
    { date: "2026-05-18", bookings: 22 },
    { date: "2026-05-19", bookings: 28 },
    { date: "2026-05-20", bookings: 20 },
    { date: "2026-05-21", bookings: 24 },
  ],
  topFacility: {
    name: "Downtown Central Parking",
    revenue: 12500
  },
  peakHours: [
    [2, 1, 0, 0, 1, 2, 4, 12, 18, 22, 19, 15, 14, 16, 20, 24, 21, 15, 10, 8, 5, 3, 2, 1], // Sun
    [1, 0, 0, 1, 3, 8, 25, 42, 38, 20, 15, 18, 22, 19, 15, 18, 35, 45, 28, 15, 8, 4, 2, 1], // Mon
    [1, 0, 0, 1, 2, 9, 28, 45, 40, 22, 16, 17, 24, 20, 16, 19, 38, 48, 30, 16, 9, 5, 2, 1], // Tue
    [2, 1, 0, 1, 3, 8, 26, 44, 39, 21, 15, 19, 23, 21, 15, 17, 36, 46, 29, 15, 8, 5, 3, 1], // Wed
    [1, 1, 0, 0, 2, 8, 24, 40, 36, 20, 16, 18, 22, 20, 16, 18, 34, 42, 27, 14, 9, 6, 3, 2], // Thu
    [2, 1, 1, 1, 2, 7, 20, 35, 32, 24, 18, 22, 28, 25, 22, 25, 30, 38, 42, 35, 25, 18, 12, 5], // Fri
    [4, 3, 2, 1, 1, 2, 6, 15, 22, 28, 32, 35, 38, 34, 30, 28, 25, 22, 24, 28, 25, 18, 10, 6], // Sat
  ]
};

export default function AnalyticsTab({ analytics }) {
  const revenueData = analytics?.revenueByDay?.length > 0 ? analytics.revenueByDay : MOCK_ANALYTICS.revenueByDay;
  const occupancyData = analytics?.occupancyRate?.length > 0 ? analytics.occupancyRate : MOCK_ANALYTICS.occupancyRate;
  const bookingsData = analytics?.bookingsByDay?.length > 0 ? analytics.bookingsByDay : MOCK_ANALYTICS.bookingsByDay;
  const peakHours = analytics?.peakHours?.length > 0 ? analytics.peakHours : MOCK_ANALYTICS.peakHours;
  const topFacility = analytics?.topFacility?.name ? analytics.topFacility : MOCK_ANALYTICS.topFacility;
  
  const formatAxisDate = (value) => formatDate(value);

  const maxFreq = Math.max(...peakHours.flat(), 1);

  return (
    <div className="mt-6 grid gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
          <h3 className="text-lg font-bold">Revenue Chart</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={formatAxisDate} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip labelFormatter={formatAxisDate} formatter={(value) => [formatCurrency(value), "Revenue"]} />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
          <h3 className="text-lg font-bold">Occupancy Rate</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={formatAxisDate} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip labelFormatter={formatAxisDate} />
                <Area type="monotone" dataKey="rate" stroke="#0ea5e9" fill="#e0f2fe" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
          <h3 className="text-lg font-bold">Bookings Count</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={formatAxisDate} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip labelFormatter={formatAxisDate} />
                <Bar dataKey="bookings" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
          <h3 className="text-lg font-bold">Top Performing Facility</h3>
          <div className="mt-4 flex h-64 flex-col justify-center text-center">
            <p className="text-4xl font-bold text-slate-900">{topFacility?.name || "None"}</p>
            <p className="mt-2 text-xl text-blue-600 font-semibold">{formatCurrency(topFacility?.revenue)}</p>
            <p className="mt-1 text-sm text-slate-500 uppercase tracking-wider">Total Revenue Generated</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
        <h3 className="text-lg font-bold">Peak Hours Heatmap (Weekly)</h3>
        <p className="text-sm text-slate-500 mb-4">Darker blue indicates higher booking density for that hour.</p>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-[60px_repeat(24,1fr)] gap-1">
              <div />
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="text-[10px] text-center text-slate-400">{i}h</div>
              ))}
              {peakHours.map((hours, dIdx) => (
                <div key={dIdx} className="contents">
                  <div className="text-xs font-bold text-slate-600 flex items-center">{DAYS[dIdx]}</div>
                  {hours.map((f, hIdx) => {
                    const opacity = Math.max(0.05, f / maxFreq);
                    return (
                      <div 
                        key={hIdx} 
                        className="h-8 rounded-sm transition hover:ring-2 hover:ring-blue-400" 
                        style={{ backgroundColor: `rgba(37, 99, 235, ${opacity})` }}
                        title={`${DAYS[dIdx]} ${hIdx}:00 - ${f} bookings`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
