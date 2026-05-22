import { formatDateTime } from "../utils";

export default function NotificationsPanel({ notifications, onMarkRead, onClose }) {
  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-[20rem] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700">Notifications</h4>
        <button onClick={onClose} className="text-xs text-slate-500">Close</button>
      </div>
      <div className="mt-3 grid gap-3">
        {notifications.length === 0 && <p className="text-sm text-slate-500">No notifications yet.</p>}
        {notifications.map((item) => (
          <div key={item._id} className="rounded-xl border border-slate-200 p-3">
            <p className="text-sm font-semibold text-slate-800">{item.title || "Update"}</p>
            <p className="mt-1 text-xs text-slate-500">{formatDateTime(item.createdAt)}</p>
            <p className="mt-2 text-sm text-slate-600">{item.message || item.body || "New update received."}</p>
            {!item.read && (
              <button onClick={() => onMarkRead(item._id)} className="mt-3 text-xs font-semibold text-blue-700">Mark as read</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
