import BookingTable from "./BookingTable";

export default function BookingsTab({ bookings, facilities, filters, setFilters, onApply, onComplete, onCancel, onExport }) {
  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="text-lg font-bold">Bookings</h3>
          <p className="text-sm text-slate-500">Track confirmations, cancellations, and payouts.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-4">
          <input value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} placeholder="Ref or user email" className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
          <select value={filters.facilityId} onChange={(e) => setFilters((p) => ({ ...p, facilityId: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
            <option value="">All facilities</option>
            {facilities.map((facility) => <option key={facility._id} value={facility._id}>{facility.name}</option>)}
          </select>
          <select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2 text-sm">
            <option value="">All status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button onClick={onApply} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Apply</button>
        </div>
        <button onClick={onExport} className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">Export CSV</button>
      </div>
      <BookingTable bookings={bookings} onComplete={onComplete} onCancel={onCancel} />
    </div>
  );
}
