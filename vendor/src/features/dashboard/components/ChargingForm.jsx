import MapPicker from "./MapPicker";
import { Checkbox, Checklist, Field, FormHeader } from "./FormFields";
import { CHARGER_TYPES, EV_AMENITIES } from "../constants";

export default function ChargingForm({ form, setForm, editing, onCancel, onSubmit, loading }) {
  const toggleList = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((item) => item !== value) : [...prev[key], value],
    }));
  };

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
      <FormHeader title={`${editing ? "Update" : "Add"} EV Station`} onCancel={editing ? onCancel : null} />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field name="name" value={form.name} onChange={setForm} placeholder="Station name" required />
        <Field name="imageUrl" value={form.imageUrl} onChange={setForm} placeholder="Image URL" />
        <Field name="street" value={form.street} onChange={setForm} placeholder="Street address" required wide />
        <Field name="city" value={form.city} onChange={setForm} placeholder="City" required />
        <Field name="state" value={form.state} onChange={setForm} placeholder="State" required />
        <Field name="zipCode" value={form.zipCode} onChange={setForm} placeholder="Zip code" />
        <Field name="lat" type="number" value={form.lat} onChange={setForm} placeholder="Latitude" required />
        <Field name="lng" type="number" value={form.lng} onChange={setForm} placeholder="Longitude" required />
        <MapPicker lat={form.lat} lng={form.lng} onPick={(lat, lng) => setForm((p) => ({ ...p, lat: lat.toFixed(6), lng: lng.toFixed(6) }))} />
        <Checklist title="Charger types" items={CHARGER_TYPES} values={form.chargerTypes} onToggle={(value) => toggleList("chargerTypes", value)} />
        <Field name="speedKw" type="number" value={form.speedKw} onChange={setForm} placeholder="Charging speed kW" />
        <Field name="total" type="number" value={form.total} onChange={setForm} placeholder="Charging points" required />
        <Field name="available" type="number" value={form.available} onChange={setForm} placeholder="Available points" required />
        <Field name="pricePerKwh" type="number" value={form.pricePerKwh} onChange={setForm} placeholder="Price per kWh" required />
        <Field name="pricePerSession" type="number" value={form.pricePerSession} onChange={setForm} placeholder="Price per session" />
        <Checklist title="Amenities" items={EV_AMENITIES} values={form.amenities} onToggle={(value) => toggleList("amenities", value)} />
        <Field name="provider" value={form.provider} onChange={setForm} placeholder="Provider" />
        <Field name="currency" value={form.currency} onChange={setForm} placeholder="Currency" />
        <Field name="description" value={form.description} onChange={setForm} placeholder="Description" wide />
        <Checkbox name="is24Hours" checked={form.is24Hours} onChange={setForm} label="Open 24 hours" />
        <Field name="opens" value={form.opens} onChange={setForm} placeholder="Opens at" />
        <Field name="closes" value={form.closes} onChange={setForm} placeholder="Closes at" />
        <Checkbox name="isActive" checked={form.isActive} onChange={setForm} label="Active listing" />
      </div>
      <button disabled={loading} className="mt-4 w-full rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 px-4 py-2 font-semibold text-white">
        {loading ? "Saving..." : editing ? "Update EV Station" : "Create EV Station"}
      </button>
    </form>
  );
}
