import { useState } from "react";
import AppFonts from "../components/ui/AppFonts";
import { calculateBookingTotal } from "../utils/parking";

export default function ConfirmationScreen({ lot, slot, date, duration, driver, onHome }) {
  const [bookingRef] = useState(() => `PK${Math.random().toString(36).slice(2, 10).toUpperCase()}`);
  const [copied, setCopied] = useState(false);

  const total = calculateBookingTotal(lot.pricePerHour, duration);

  const copyReference = () => {
    navigator.clipboard?.writeText(bookingRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        fontFamily: "'DM Sans', sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <AppFonts />

      <div style={{ maxWidth: 460, width: "100%" }}>
        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ background: "linear-gradient(135deg, #10b981, #059669)", padding: "32px 24px", textAlign: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                background: "rgba(255,255,255,0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path
                  d="M6 17l7 7 13-14"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>
              Booking Confirmed!
            </h1>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, margin: 0 }}>Your parking slot has been reserved</p>
          </div>

          <div style={{ padding: 24 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Booking Reference</div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: 10,
                  padding: "8px 16px",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#10b981",
                    letterSpacing: 2,
                  }}
                >
                  {bookingRef}
                </span>
                <button
                  onClick={copyReference}
                  style={{
                    background: "none",
                    border: "none",
                    color: copied ? "#10b981" : "#64748b",
                    cursor: "pointer",
                    fontSize: 12,
                    padding: 0,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              {[
                ["Parking Lot", lot.name],
                ["Slot", slot.id],
                ["Date", date],
                ["Duration", `${duration} hrs`],
                ["Vehicle", driver.vehicle.toUpperCase()],
                ["Amount Paid", `₹${total}`],
              ].map(([key, value]) => (
                <div key={key} style={{ padding: "10px 12px", background: "#0f172a", borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>{key}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>{value}</div>
                </div>
              ))}
            </div>

            <div
              style={{
                padding: 16,
                background: "#0f172a",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  background: "#1e293b",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  {[0, 0, 10, 0, 20, 0, 0, 10, 10, 20, 20, 10, 0, 20, 20, 20]
                    .reduce((acc, _, i, arr) => {
                      if (i % 2 === 0) return [...acc, [arr[i], arr[i + 1]]];
                      return acc;
                    }, [])
                    .map(([x, y], i) => (
                      <rect
                        key={i}
                        x={4 + x}
                        y={4 + y}
                        width="8"
                        height="8"
                        rx="1"
                        fill="#10b981"
                        opacity={0.3 + (i % 3) * 0.35}
                      />
                    ))}
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#f1f5f9" }}>Show QR at entry</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>Scan to access parking</div>
              </div>
            </div>

            <button
              onClick={onHome}
              style={{
                width: "100%",
                padding: "13px 0",
                background: "linear-gradient(135deg, #10b981, #059669)",
                border: "none",
                borderRadius: 12,
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Book Another Parking →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
