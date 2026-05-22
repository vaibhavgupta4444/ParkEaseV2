import { useState } from "react";
import { updateParkingPricing } from "../../../services/vendorService";
import { formatCurrency, formatDate } from "../utils";

export default function PricingTab({ couponForm, setCouponForm, coupons, onCreate, onDelete, facilities, token, onRefresh }) {
  const [selectedFacility, setSelectedFacility] = useState("");
  const [pricingForm, setPricingForm] = useState({
    peakHourRate: "",
    weekendRate: "",
    overnightFlatRate: "",
  });
  const [loading, setLoading] = useState(false);

  const handleFacilitySelect = (e) => {
    const id = e.target.value;
    setSelectedFacility(id);
    const facility = facilities.find((f) => f._id === id);
    if (facility) {
      setPricingForm({
        peakHourRate: facility.pricing?.peakHourRate || "",
        weekendRate: facility.pricing?.weekendRate || "",
        overnightFlatRate: facility.pricing?.overnightFlatRate || "",
      });
    }
  };

  const handlePricingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFacility || !token) return;
    setLoading(true);
    try {
      await updateParkingPricing(selectedFacility, pricingForm, token);
      alert("Pricing updated successfully");
      await onRefresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <form onSubmit={onCreate} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
          <h3 className="text-lg font-bold">Create Coupon</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {["code", "value", "expiryDate", "maxUses"].map((key) => (
              <input key={key} type={key === "expiryDate" ? "date" : key === "value" || key === "maxUses" ? "number" : "text"} value={couponForm[key]} onChange={(e) => setCouponForm((p) => ({ ...p, [key]: e.target.value }))} placeholder={key} className="rounded-xl border border-slate-300 px-3 py-2" />
            ))}
            <select value={couponForm.discountType} onChange={(e) => setCouponForm((p) => ({ ...p, discountType: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2">
              <option value="percentage">Percentage</option>
              <option value="flat">Flat</option>
            </select>
          </div>
          <button className="mt-4 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white">Save Coupon</button>
        </form>

        <form onSubmit={handlePricingSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
          <h3 className="text-lg font-bold">Dynamic Pricing Rules</h3>
          <p className="text-sm text-slate-500 mb-4">Set special rates for specific times.</p>
          <div className="grid gap-4">
            <select value={selectedFacility} onChange={handleFacilitySelect} className="rounded-xl border border-slate-300 px-3 py-4 text-sm font-semibold">
              <option value="">Select Facility</option>
              {facilities.map((f) => (
                <option key={f._id} value={f._id}>{f.name}</option>
              ))}
            </select>
            
            {selectedFacility && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500">Peak Hour Rate ({formatCurrency(pricingForm.peakHourRate)})</label>
                  <input type="number" value={pricingForm.peakHourRate} onChange={(e) => setPricingForm(p => ({ ...p, peakHourRate: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2" placeholder="e.g. 150" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-slate-500">Weekend Rate ({formatCurrency(pricingForm.weekendRate)})</label>
                  <input type="number" value={pricingForm.weekendRate} onChange={(e) => setPricingForm(p => ({ ...p, weekendRate: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2" placeholder="e.g. 120" />
                </div>
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500">Overnight Flat Rate ({formatCurrency(pricingForm.overnightFlatRate)})</label>
                  <input type="number" value={pricingForm.overnightFlatRate} onChange={(e) => setPricingForm(p => ({ ...p, overnightFlatRate: e.target.value }))} className="rounded-xl border border-slate-300 px-3 py-2" placeholder="e.g. 500" />
                </div>
                <button disabled={loading} className="mt-2 sm:col-span-2 rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 px-4 py-2 font-semibold text-white disabled:opacity-50">
                  {loading ? "Saving..." : "Update Pricing Policies"}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
        <h3 className="text-lg font-bold">Active Coupons</h3>
        <div className="mt-4 grid gap-3">
          {coupons.length === 0 && <p className="text-sm text-slate-500">No active coupons.</p>}
          {coupons.map((coupon) => (
            <div key={coupon._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 bg-slate-50 shadow-sm transition hover:shadow-md">
              <div>
                <span className="block font-bold text-blue-700">{coupon.code}</span>
                <span className="text-xs text-slate-500">
                  {coupon.discountType} {coupon.discountType === "flat" ? formatCurrency(coupon.value) : `${coupon.value}%`} · Exp: {formatDate(coupon.expiryDate)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                 <span className="text-xs font-bold text-slate-600">{coupon.usedCount} / {coupon.maxUses} uses</span>
                 <button onClick={() => onDelete(coupon._id)} className="text-sm font-semibold text-rose-700 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
