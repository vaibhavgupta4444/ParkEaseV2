export function Field({ name, value, onChange, placeholder, type = "text", required = false, wide = false }) {
  return (
    <input
      name={name}
      type={type}
      step={type === "number" ? "any" : undefined}
      value={value}
      onChange={(event) => onChange((prev) => ({ ...prev, [name]: event.target.value }))}
      placeholder={placeholder}
      required={required}
      className={`rounded-xl border border-slate-300 px-3 py-2 text-sm ${wide ? "sm:col-span-2" : ""}`}
    />
  );
}

export function Checkbox({ name, checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-600">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange((prev) => ({ ...prev, [name]: event.target.checked }))}
      />
      {label}
    </label>
  );
}

export function Checklist({ title, items, values, onToggle }) {
  return (
    <div className="sm:col-span-2">
      <p className="mb-2 text-sm font-semibold text-slate-700">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <label key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm">
            <input type="checkbox" checked={values.includes(item)} onChange={() => onToggle(item)} className="mr-2" />
            {item}
          </label>
        ))}
      </div>
    </div>
  );
}

export function FormHeader({ title, onCancel }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className="text-lg font-bold">{title}</h3>
      {onCancel && (
        <button type="button" onClick={onCancel} className="text-sm font-semibold text-blue-700">
          Cancel edit
        </button>
      )}
    </div>
  );
}
