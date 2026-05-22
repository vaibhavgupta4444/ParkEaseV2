import MapPicker from "./MapPicker";
import { Checkbox, Field, FormHeader } from "./FormFields";

export default function ParkingForm({ form, setForm, editing, onCancel, onSubmit, loading }) {
  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
      <FormHeader title={`${editing ? "Update" : "Add"} Parking Lot`} onCancel={editing ? onCancel : null} />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field name="name" value={form.name} onChange={setForm} placeholder="Parking lot name" required />
        <Field name="imageUrl" value={form.imageUrl} onChange={setForm} placeholder="Image URL" />
        <Field name="street" value={form.street} onChange={setForm} placeholder="Street address" required wide />
        <Field name="city" value={form.city} onChange={setForm} placeholder="City" required />
        <Field name="state" value={form.state} onChange={setForm} placeholder="State" required />
        <Field name="zipCode" value={form.zipCode} onChange={setForm} placeholder="Zip code" />
        <Field name="lat" type="number" value={form.lat} onChange={setForm} placeholder="Latitude" required />
        <Field name="lng" type="number" value={form.lng} onChange={setForm} placeholder="Longitude" required />
        <MapPicker lat={form.lat} lng={form.lng} onPick={(lat, lng) => setForm((p) => ({ ...p, lat: lat.toFixed(6), lng: lng.toFixed(6) }))} />
        <Field name="hourlyRate" type="number" value={form.hourlyRate} onChange={setForm} placeholder="Hourly rate" required />
        <Field name="currency" value={form.currency} onChange={setForm} placeholder="Currency" />
        <Field name="total" type="number" value={form.total} onChange={setForm} placeholder="Total slots" required />
        <Field name="available" type="number" value={form.available} onChange={setForm} placeholder="Available slots" required />
        <Field name="amenities" value={form.amenities} onChange={setForm} placeholder="Amenities comma separated" wide />
        <Field name="description" value={form.description} onChange={setForm} placeholder="Description" wide />
        <Checkbox name="is24Hours" checked={form.is24Hours} onChange={setForm} label="Open 24 hours" />
        <Field name="opens" value={form.opens} onChange={setForm} placeholder="Opens at" />
        <Field name="closes" value={form.closes} onChange={setForm} placeholder="Closes at" />
        <Checkbox name="isActive" checked={form.isActive} onChange={setForm} label="Active listing" />
      </div>
      <button disabled={loading} className="mt-4 w-full rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 px-4 py-2 font-semibold text-white">
        {loading ? "Saving..." : editing ? "Update Parking Lot" : "Create Parking Lot"}
      </button>
    </form>
  );
}
