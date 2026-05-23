import { useState } from "react";
import AppFonts from "../components/ui/AppFonts";
import { calculateBookingTotal } from "../utils/parking";
import { validateField } from "../utils/validation";

function FormField({ label, field, value, error, placeholder, type = "text", onChange }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(field, e.target.value)}
        required={label.includes("*")}
        style={{
          width: "100%",
          padding: "10px 14px",
          background: "#1e293b",
          border: `1px solid ${error ? "#ef4444" : "#334155"}`,
          borderRadius: 10,
          color: "#f1f5f9",
          fontSize: 14,
          fontFamily: "'DM Sans', sans-serif",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      {error && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{error}</div>}
    </div>
  );
}

export default function BookingForm({ lot, slot, date, duration, onPay, onBack }) {
  const [form, setForm] = useState({ name: "", phone: "", vehicle: "", email: "" });
  const [errors, setErrors] = useState({});

  const total = calculateBookingTotal(lot.pricePerHour, duration);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const validationErrors = {};

    validationErrors.name = validateField("name", form.name);
    validationErrors.phone = validateField("phone", form.phone);
    validationErrors.vehicle = validateField("vehicleNumber", form.vehicle);
    validationErrors.email = validateField("email", form.email, { required: false });

    Object.keys(validationErrors).forEach((key) => {
      if (!validationErrors[key]) delete validationErrors[key];
    });
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        fontFamily: "'DM Sans', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppFonts />

      <div style={{ background: "#1e293b", borderBottom: "1px solid #334155", padding: "14px 20px" }}>
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            fontSize: 14,
            padding: 0,
            marginBottom: 10,
          }}
        >
          ← Back
        </button>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>
          Complete Booking
        </h1>
        <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>Step 2 of 3 — Enter your details</p>
      </div>

      <div style={{ flex: 1, display: "flex", gap: 0, overflow: "auto" }}>
        <div style={{ flex: 1, padding: 24, maxWidth: 480 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9", marginBottom: 16 }}>Driver Details</h3>

          <FormField
            label="Full Name *"
            field="name"
            value={form.name}
            error={errors.name}
            placeholder="Rahul Sharma"
            onChange={updateField}
          />
          <FormField
            label="Phone Number *"
            field="phone"
            value={form.phone}
            error={errors.phone}
            placeholder="9876543210"
            type="tel"
            onChange={updateField}
          />
          <FormField
            label="Vehicle Number *"
            field="vehicle"
            value={form.vehicle}
            error={errors.vehicle}
            placeholder="DL 01 AB 1234"
            onChange={updateField}
          />
          <FormField
            label="Email (for receipt)"
            field="email"
            value={form.email}
            error={errors.email}
            placeholder="rahul@email.com"
            type="email"
            onChange={updateField}
          />

          <button
            onClick={() => validate() && onPay(form)}
            style={{
              width: "100%",
              padding: "14px 0",
              background: "linear-gradient(135deg, #10b981, #059669)",
              border: "none",
              borderRadius: 12,
              color: "#fff",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              marginTop: 8,
            }}
          >
            Proceed to Payment →
          </button>
        </div>

        <div style={{ width: 280, borderLeft: "1px solid #334155", padding: 24, background: "#1e293b" }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9", marginBottom: 16 }}>Booking Details</h3>
          <div style={{ padding: 14, background: "#0f172a", borderRadius: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>Parking Lot</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{lot.name}</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{lot.address}</div>
          </div>
          {[
            ["Slot", slot.id],
            ["Date", date],
            ["Duration", `${duration} hrs`],
            ["Rate", `₹${lot.pricePerHour}/hr`],
          ].map(([key, value]) => (
            <div
              key={key}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid #334155",
              }}
            >
              <span style={{ fontSize: 13, color: "#64748b" }}>{key}</span>
              <span style={{ fontSize: 13, color: "#f1f5f9", fontWeight: 500 }}>{value}</span>
            </div>
          ))}
          <div
            style={{
              marginTop: 12,
              padding: 12,
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: 10,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>Subtotal</span>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>₹{lot.pricePerHour * duration}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>Service fee (10%)</span>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>
                ₹{Math.round(lot.pricePerHour * duration * 0.1)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>Total</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#10b981" }}>₹{total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
