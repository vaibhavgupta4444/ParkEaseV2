export default function SlotManager({
  lot,
  slotData,
  selectedSlots,
  setSelectedSlots,
  slotForm,
  setSlotForm,
  onAdd,
  onBulk,
  onUpdate,
  onDelete,
  onClose,
}) {
  const booked = slotData.slots.filter((slot) => slot.status === "booked" || (!slot.status && !slot.isAvailable)).length;
  const available = slotData.slots.filter((slot) => slot.status === "available" || (!slot.status && slot.isAvailable)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-3 backdrop-blur-sm">
      <div className="max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold">Manage Slots: {lot.name}</h3>
            <p className="text-sm text-slate-500">
              {booked} booked, {available} free, {slotData.slots.length} total
            </p>
          </div>
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-3 py-2">
            Close
          </button>
        </div>
        <form onSubmit={onAdd} className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-4">
          <input value={slotForm.slotId} onChange={(e) => setSlotForm((p) => ({ ...p, slotId: e.target.value }))} placeholder="Slot ID optional" className="rounded-xl border border-slate-300 px-3 py-2" />
          <select value={slotForm.type} onChange={(e) => setSlotForm((p) => ({ ...p, type: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2">
            <option value="car">Car</option>
            <option value="bike">Bike</option>
            <option value="EV">EV</option>
            <option value="disabled">Accessible</option>
          </select>
          <select value={slotForm.status} onChange={(e) => setSlotForm((p) => ({ ...p, status: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2">
            <option value="available">Available</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <button className="rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 px-4 py-2 font-semibold text-white">Add Slot</button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          <button disabled={!selectedSlots.length} onClick={() => onBulk({ status: "available" })} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 disabled:opacity-50">Mark Available</button>
          <button disabled={!selectedSlots.length} onClick={() => onBulk({ status: "maintenance" })} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 disabled:opacity-50">Mark Maintenance</button>
          <button disabled={!selectedSlots.length} onClick={() => onBulk({ type: "EV" })} className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 disabled:opacity-50">Set EV Type</button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {slotData.slots.map((slot) => {
            const status = slot.status || (slot.isAvailable ? "available" : "booked");
            const selected = selectedSlots.includes(slot.slotId);
            return (
              <div key={slot.slotId} className={`rounded-2xl border p-3 ${selected ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-white"}`}>
                <label className="flex items-start gap-2">
                  <input type="checkbox" checked={selected} onChange={() => setSelectedSlots((prev) => selected ? prev.filter((id) => id !== slot.slotId) : [...prev, slot.slotId])} />
                  <span>
                    <span className="block font-bold">{slot.slotId}</span>
                    <span className="text-xs capitalize text-slate-500">{slot.type} · {status}</span>
                  </span>
                </label>
                <div className="mt-3 flex gap-1">
                  <button onClick={() => onUpdate(slot.slotId, { status: status === "maintenance" ? "available" : "maintenance" })} className="rounded-lg border border-slate-200 px-2 py-1 text-xs">Toggle</button>
                  <button disabled={status === "booked"} onClick={() => onDelete(slot.slotId)} className="rounded-lg border border-rose-200 px-2 py-1 text-xs text-rose-700 disabled:opacity-40">Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
