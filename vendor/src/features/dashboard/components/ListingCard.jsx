import { DEFAULT_IMAGE_URL } from "../constants";
import { formatAddress, formatCurrency } from "../utils";

export default function ListingCard({ item, kind, onEdit, onDelete, onManage, onToggle }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">
      <div className="grid sm:grid-cols-[9rem_1fr]">
        <img src={item.imageUrl || DEFAULT_IMAGE_URL} alt={item.name} className="h-36 w-full object-cover sm:h-full" loading="lazy" />
        <div className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h4 className="font-bold">{item.name}</h4>
              <p className="mt-1 text-sm text-slate-500">{formatAddress(item.location) || "No address"}</p>
            </div>
            <button
              onClick={onToggle}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                item.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
              }`}
            >
              {item.isActive ? "Active" : "Inactive"}
            </button>
          </div>
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
            <span>Total: {item.capacity?.total || 0}</span>
            <span>Available: {item.capacity?.available || 0}</span>
            <span>
              {kind === "ev" ? "Rate" : "Hourly"}: {formatCurrency(item.pricing?.hourlyRate || item.pricing?.rate)}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={onEdit} className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
              Edit
            </button>
            <button onClick={onManage} className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-700">
              {kind === "ev" ? "Manage Points" : "Manage Slots"}
            </button>
            <button onClick={onDelete} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
