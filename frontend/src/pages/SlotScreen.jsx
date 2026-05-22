import { useState } from "react";
import Badge from "../components/ui/Badge";
import StarRating from "../components/ui/StarRating";
import AppFonts from "../components/ui/AppFonts";
import { AMENITY_COLORS } from "../constants/amenities";

export default function SlotScreen({ lot, onSelectSlot, onBack }) {
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [duration, setDuration] = useState(2);

  const types = ["All", "Standard", "EV", "Disabled"];
  const visibleSlots = lot.slots.filter((slot) => filter === "All" || slot.type === filter);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'DM Sans', sans-serif",
        background: "#0f172a",
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
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ← Back to results
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 20,
                fontWeight: 800,
                color: "#f1f5f9",
                margin: 0,
              }}
            >
              {lot.name}
            </h2>
            <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>
              {lot.address} · {lot.distance} km away
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#10b981" }}>
              ₹{lot.pricePerHour}
              <span style={{ fontSize: 13, color: "#64748b" }}>/hr</span>
            </div>
            <StarRating rating={lot.rating} />
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10 }}>
          {lot.amenities.map((amenity) => {
            const [bg, tc] = AMENITY_COLORS[amenity] || ["#1e293b", "#94a3b8"];
            return <Badge key={amenity} label={amenity} color={bg} textColor={tc} />;
          })}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", gap: 0, overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
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
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>
                Duration (hours)
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={duration}
                onChange={(e) => setDuration(+e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
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

          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                style={{
                  padding: "5px 14px",
                  borderRadius: 20,
                  fontSize: 12,
                  cursor: "pointer",
                  background: filter === type ? "rgba(16,185,129,0.2)" : "transparent",
                  border: filter === type ? "1px solid #10b981" : "1px solid #334155",
                  color: filter === type ? "#10b981" : "#94a3b8",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {type}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 16, marginBottom: 16, fontSize: 12, color: "#64748b" }}>
            {[
              ["#1a3a2a", "#10b981", "Available"],
              ["#1e293b", "#334155", "Occupied"],
              ["#10b981", "#10b981", "Selected"],
            ].map(([bg, border, label]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    background: bg,
                    border: `1.5px solid ${border}`,
                    borderRadius: 4,
                  }}
                />
                <span>{label}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 16,
                  height: 16,
                  background: "#1a1f2e",
                  border: "1.5px solid #f59e0b",
                  borderRadius: 4,
                  fontSize: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#f59e0b",
                }}
              >
                ⚡
              </div>
              <span>EV</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))", gap: 8 }}>
            {visibleSlots.map((slot) => {
              const isSelected = selected?.id === slot.id;

              return (
                <div
                  key={slot.id}
                  onClick={() => !slot.occupied && setSelected(isSelected ? null : slot)}
                  style={{
                    height: 52,
                    borderRadius: 10,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1.5px solid ${isSelected ? "#10b981" : slot.occupied ? "#1e293b" : "#1e4d35"}`,
                    background: isSelected ? "#10b981" : slot.occupied ? "#1e293b" : "#0d2b1e",
                    cursor: slot.occupied ? "not-allowed" : "pointer",
                    transition: "all 0.15s",
                    opacity: slot.occupied ? 0.4 : 1,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: isSelected ? "#fff" : slot.occupied ? "#475569" : "#10b981",
                    }}
                  >
                    {slot.id}
                  </span>
                  {slot.type === "EV" && (
                    <span style={{ fontSize: 9, color: isSelected ? "#fff" : "#f59e0b" }}>⚡EV</span>
                  )}
                  {slot.type === "Disabled" && (
                    <span style={{ fontSize: 9, color: isSelected ? "#fff" : "#94a3b8" }}>♿</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div
          style={{
            width: 260,
            borderLeft: "1px solid #334155",
            padding: 20,
            background: "#1e293b",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h3
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 16,
              fontWeight: 700,
              color: "#f1f5f9",
              marginBottom: 16,
            }}
          >
            Booking Summary
          </h3>

          <div style={{ flex: 1 }}>
            {[
              ["Availability", `${lot.availableSlots} / ${lot.totalSlots} free`],
              ["Date", date || "—"],
              ["Duration", `${duration} hr${duration > 1 ? "s" : ""}`],
            ].map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: "1px solid #334155",
                }}
              >
                <span style={{ fontSize: 13, color: "#64748b" }}>{key}</span>
                <span style={{ fontSize: 13, color: "#f1f5f9", fontWeight: 500 }}>{value}</span>
              </div>
            ))}

            {selected && (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  background: "rgba(16,185,129,0.1)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  borderRadius: 10,
                }}
              >
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Selected Slot</div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#10b981",
                    fontFamily: "'Syne', sans-serif",
                  }}
                >
                  {selected.id}
                </div>
                {selected.type !== "Standard" && (
                  <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 2 }}>
                    {selected.type === "EV" ? "⚡ EV Charging" : "♿ Accessible"}
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: 16, padding: 14, background: "#0f172a", borderRadius: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>
                  ₹{lot.pricePerHour} × {duration} hr{duration > 1 ? "s" : ""}
                </span>
                <span style={{ fontSize: 13, color: "#f1f5f9" }}>₹{lot.pricePerHour * duration}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#64748b" }}>Service fee</span>
                <span style={{ fontSize: 13, color: "#f1f5f9" }}>
                  ₹{Math.round(lot.pricePerHour * duration * 0.1)}
                </span>
              </div>
              <div style={{ height: 1, background: "#334155", margin: "8px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>Total</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: "#10b981" }}>
                  ₹{Math.round(lot.pricePerHour * duration * 1.1)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => selected && onSelectSlot(selected, date, duration)}
            disabled={!selected}
            style={{
              marginTop: 16,
              padding: "13px 0",
              borderRadius: 12,
              border: "none",
              background: selected ? "linear-gradient(135deg, #10b981, #059669)" : "#1e293b",
              color: selected ? "#fff" : "#475569",
              fontSize: 14,
              fontWeight: 600,
              cursor: selected ? "pointer" : "not-allowed",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {selected ? `Book Slot ${selected.id} →` : "Select a slot to continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
