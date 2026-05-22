import { useState } from "react";
import AppFonts from "../components/ui/AppFonts";
import { calculateBookingTotal } from "../utils/parking";

const paymentMethods = [
  { id: "upi", label: "UPI", icon: "₹" },
  { id: "card", label: "Card", icon: "💳" },
  { id: "wallet", label: "Wallet", icon: "👜" },
  { id: "netbanking", label: "Net Banking", icon: "🏦" },
];

export default function PaymentScreen({ lot, slot, date, duration, driver, onConfirm, onBack }) {
  const [method, setMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNo, setCardNo] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);

  const total = calculateBookingTotal(lot.pricePerHour, duration);

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onConfirm();
    }, 2200);
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
          Secure Payment
        </h1>
        <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>Step 3 of 3 — Complete your booking</p>
      </div>

      <div style={{ flex: 1, display: "flex", gap: 0, overflow: "auto" }}>
        <div style={{ flex: 1, padding: 24, maxWidth: 480 }}>
          <div
            style={{
              padding: 16,
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: 12,
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 13, color: "#64748b" }}>Amount to pay</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#10b981", fontFamily: "'Syne', sans-serif" }}>₹{total}</div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              {lot.name} · Slot {slot.id}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
            {paymentMethods.map((paymentMethod) => (
              <button
                key={paymentMethod.id}
                onClick={() => setMethod(paymentMethod.id)}
                style={{
                  padding: "12px",
                  borderRadius: 10,
                  border: `1.5px solid ${method === paymentMethod.id ? "#10b981" : "#334155"}`,
                  background: method === paymentMethod.id ? "rgba(16,185,129,0.1)" : "#1e293b",
                  color: method === paymentMethod.id ? "#10b981" : "#94a3b8",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: 500,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {paymentMethod.icon} {paymentMethod.label}
              </button>
            ))}
          </div>

          {method === "upi" && (
            <div>
              <label style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 6 }}>UPI ID</label>
              <input
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: 10,
                  color: "#f1f5f9",
                  fontSize: 14,
                  fontFamily: "'DM Sans', sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                {["GPay", "PhonePe", "Paytm", "BHIM"].map((app) => (
                  <button
                    key={app}
                    onClick={() => setUpiId(`user@${app.toLowerCase()}`)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      border: "1px solid #334155",
                      background: "#1e293b",
                      color: "#94a3b8",
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    {app}
                  </button>
                ))}
              </div>
            </div>
          )}

          {method === "card" && (
            <div>
              {[
                ["Card Number", cardNo, setCardNo, "1234 5678 9012 3456"],
                ["Expiry (MM/YY)", expiry, setExpiry, "12/27"],
              ].map(([label, value, setter, placeholder]) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 6 }}>{label}</label>
                  <input
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    placeholder={placeholder}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: 10,
                      color: "#f1f5f9",
                      fontSize: 14,
                      fontFamily: "'DM Sans', sans-serif",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 13, color: "#94a3b8", display: "block", marginBottom: 6 }}>CVV</label>
                <input
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="•••"
                  type="password"
                  maxLength={3}
                  style={{
                    width: 80,
                    padding: "10px 14px",
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 10,
                    color: "#f1f5f9",
                    fontSize: 14,
                    fontFamily: "'DM Sans', sans-serif",
                    outline: "none",
                  }}
                />
              </div>
            </div>
          )}

          {method === "wallet" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {["Paytm", "Amazon Pay", "Mobikwik", "Freecharge"].map((wallet) => (
                <button
                  key={wallet}
                  style={{
                    padding: 12,
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 10,
                    color: "#94a3b8",
                    cursor: "pointer",
                    fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {wallet}
                </button>
              ))}
            </div>
          )}

          {method === "netbanking" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {["SBI", "HDFC", "ICICI", "Axis", "Kotak", "PNB"].map((bank) => (
                <button
                  key={bank}
                  style={{
                    padding: 12,
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 10,
                    color: "#94a3b8",
                    cursor: "pointer",
                    fontSize: 13,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {bank}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handlePay}
            disabled={processing}
            style={{
              width: "100%",
              marginTop: 20,
              padding: "14px 0",
              background: processing ? "#1e293b" : "linear-gradient(135deg, #10b981, #059669)",
              border: "none",
              borderRadius: 12,
              color: processing ? "#10b981" : "#fff",
              fontSize: 15,
              fontWeight: 600,
              cursor: processing ? "wait" : "pointer",
              fontFamily: "'DM Sans', sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {processing ? (
              <>
                <span
                  style={{
                    display: "inline-block",
                    animation: "spin 1s linear infinite",
                    width: 16,
                    height: 16,
                    border: "2px solid #10b981",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                  }}
                />
                Processing payment...
              </>
            ) : (
              `Pay ₹${total} Securely`
            )}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          <div
            style={{
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              color: "#475569",
              fontSize: 12,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            256-bit SSL encrypted · Powered by mock gateway
          </div>
        </div>

        <div style={{ width: 260, borderLeft: "1px solid #334155", padding: 24, background: "#1e293b" }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9", marginBottom: 16 }}>Order Summary</h3>
          <div style={{ fontSize: 13 }}>
            {[
              ["Driver", driver.name],
              ["Phone", driver.phone],
              ["Vehicle", driver.vehicle.toUpperCase()],
              ["Slot", slot.id],
              ["Date", date],
              ["Duration", `${duration} hrs`],
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
                <span style={{ color: "#64748b" }}>{key}</span>
                <span style={{ color: "#f1f5f9", fontWeight: 500 }}>{value}</span>
              </div>
            ))}
            <div
              style={{
                marginTop: 12,
                textAlign: "center",
                padding: 12,
                background: "rgba(16,185,129,0.1)",
                borderRadius: 10,
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <div style={{ color: "#64748b", fontSize: 12 }}>Grand Total</div>
              <div style={{ color: "#10b981", fontSize: 24, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>
                ₹{total}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
