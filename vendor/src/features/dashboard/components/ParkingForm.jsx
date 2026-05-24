import MapPicker from "./MapPicker";
import { Checkbox, Field, FormHeader } from "./FormFields";
import ImageUploadField from "./ImageUploadField";

export default function ParkingForm({ form, setForm, editing, onCancel, onSubmit, loading }) {
  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
      <FormHeader title={`${editing ? "Update" : "Add"} Parking Lot`} onCancel={editing ? onCancel : null} />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field name="name" value={form.name} onChange={setForm} placeholder="Parking lot name" required />
        <ImageUploadField value={form.imageUrl} onChange={(url) => setForm((p) => ({ ...p, imageUrl: url }))} />
        <Field name="street" value={form.street} onChange={setForm} placeholder="Street address" required wide />
        <Field name="city" value={form.city} onChange={setForm} placeholder="City" required />
        <Field name="state" value={form.state} onChange={setForm} placeholder="State" required />
        <Field name="zipCode" value={form.zipCode} onChange={setForm} placeholder="Zip code" />
        <MapPicker lat={form.lat} lng={form.lng} onLocationUpdate={(lat, lng, address) => {
          setForm(p => ({ ...p, lat, lng, ...(address || {}) }));
        }} />
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
