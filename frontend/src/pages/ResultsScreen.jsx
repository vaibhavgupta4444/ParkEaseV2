import { useState } from "react";
import Badge from "../components/ui/Badge";
import StarRating from "../components/ui/StarRating";
import AppFonts from "../components/ui/AppFonts";
import { AMENITY_COLORS } from "../constants/amenities";
import { getAvailabilityColor } from "../utils/parking";

export default function ResultsScreen({ query, lots, onSelectLot, onBack }) {
  const [sortBy, setSortBy] = useState("distance");
  const [filterPrice, setFilterPrice] = useState(100);
  const [filterOpen247, setFilterOpen247] = useState(false);
  const [filterEV, setFilterEV] = useState(false);
  const [filterCovered, setFilterCovered] = useState(false);
  const [hoveredLot, setHoveredLot] = useState(null);
  const [selectedPin, setSelectedPin] = useState(null);

  const filteredLots = lots
    .filter((lot) => lot.pricePerHour <= filterPrice)
    .filter((lot) => !filterOpen247 || lot.amenities.includes("24/7"))
    .filter((lot) => !filterEV || lot.amenities.includes("EV Charging"))
    .filter(
      (lot) => !filterCovered || lot.amenities.includes("Covered") || lot.amenities.includes("Underground")
    )
    .sort((a, b) => {
      if (sortBy === "distance") return a.distance - b.distance;
      if (sortBy === "price") return a.pricePerHour - b.pricePerHour;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "availability") return b.availableSlots - a.availableSlots;
      return 0;
    });

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'DM Sans', sans-serif",
        background: "#0f172a",
      }}
    >
      <AppFonts />

      <div
        style={{
          background: "#1e293b",
          borderBottom: "1px solid #334155",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            fontSize: 20,
            padding: "4px 8px",
          }}
        >
          ←
        </button>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#0f172a",
            borderRadius: 10,
            padding: "8px 14px",
            border: "1px solid #334155",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 500 }}>{query}</span>
        </div>
        <span style={{ color: "#64748b", fontSize: 13 }}>{filteredLots.length} lots found</span>
      </div>

      <div
        style={{
          background: "#1e293b",
          borderBottom: "1px solid #334155",
          padding: "10px 16px",
          display: "flex",
          gap: 8,
          overflowX: "auto",
          alignItems: "center",
        }}
      >
        <span style={{ color: "#64748b", fontSize: 12, whiteSpace: "nowrap" }}>Sort:</span>
        {["distance", "price", "rating", "availability"].map((sortOption) => (
          <button
            key={sortOption}
            onClick={() => setSortBy(sortOption)}
            style={{
              padding: "5px 14px",
              borderRadius: 20,
              fontSize: 12,
              cursor: "pointer",
              whiteSpace: "nowrap",
              background: sortBy === sortOption ? "rgba(16,185,129,0.2)" : "transparent",
              border: sortBy === sortOption ? "1px solid #10b981" : "1px solid #334155",
              color: sortBy === sortOption ? "#10b981" : "#94a3b8",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {sortOption.charAt(0).toUpperCase() + sortOption.slice(1)}
          </button>
        ))}
        <div style={{ width: 1, height: 20, background: "#334155", margin: "0 4px" }} />
        {[
          ["Open 24/7", filterOpen247, setFilterOpen247],
          ["EV Charging", filterEV, setFilterEV],
          ["Covered", filterCovered, setFilterCovered],
        ].map(([label, value, setValue]) => (
          <button
            key={label}
            onClick={() => setValue(!value)}
            style={{
              padding: "5px 14px",
              borderRadius: 20,
              fontSize: 12,
              cursor: "pointer",
              whiteSpace: "nowrap",
              background: value ? "rgba(16,185,129,0.2)" : "transparent",
              border: value ? "1px solid #10b981" : "1px solid #334155",
              color: value ? "#10b981" : "#94a3b8",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {label}
          </button>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 8 }}>
          <span style={{ color: "#64748b", fontSize: 12, whiteSpace: "nowrap" }}>Max ₹{filterPrice}/hr</span>
          <input
            type="range"
            min={20}
            max={100}
            step={10}
            value={filterPrice}
            onChange={(e) => setFilterPrice(+e.target.value)}
            style={{ width: 80, accentColor: "#10b981" }}
          />
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div
          style={{
            width: 360,
            overflowY: "auto",
            borderRight: "1px solid #334155",
            background: "#0f172a",
          }}
        >
          {filteredLots.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: "#64748b" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🅿️</div>
              <div>No lots match your filters</div>
            </div>
          ) : (
            filteredLots.map((lot) => {
              const availablePercentage = Math.round((lot.availableSlots / lot.totalSlots) * 100);
              const isHovered = hoveredLot === lot.id;

              return (
                <div
                  key={lot.id}
                  onMouseEnter={() => setHoveredLot(lot.id)}
                  onMouseLeave={() => setHoveredLot(null)}
                  onClick={() => onSelectLot(lot)}
                  style={{
                    margin: "8px 10px",
                    padding: "14px 16px",
                    borderRadius: 14,
                    border: isHovered ? "1px solid #10b981" : "1px solid #1e293b",
                    background: isHovered ? "#1e293b" : "#0f172a",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 2 }}>{lot.name}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{lot.address}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#10b981" }}>₹{lot.pricePerHour}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>per hour</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
                    <StarRating rating={lot.rating} />
                    <span style={{ color: "#64748b", fontSize: 12 }}>· {lot.distance} km away</span>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                    {lot.amenities.slice(0, 3).map((amenity) => {
                      const [background, textColor] = AMENITY_COLORS[amenity] || ["#1e293b", "#94a3b8"];
                      return <Badge key={amenity} label={amenity} color={background} textColor={textColor} />;
                    })}
                  </div>

                  <div style={{ height: 4, background: "#1e293b", borderRadius: 2, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${availablePercentage}%`,
                        background: getAvailabilityColor(availablePercentage),
                        borderRadius: 2,
                        transition: "width 0.3s",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: "#64748b" }}>{lot.availableSlots} slots available</span>
                    <span style={{ fontSize: 11, color: getAvailabilityColor(availablePercentage) }}>
                      {availablePercentage}% free
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "#1a2535" }}>
            {[
              [28, "h"],
              [55, "h"],
              [72, "h"],
              [30, "v"],
              [60, "v"],
              [80, "v"],
            ].map(([position, direction], index) => (
              <div
                key={index}
                style={{
                  position: "absolute",
                  ...(direction === "h"
                    ? { left: 0, right: 0, top: `${position}%`, height: 24, background: "#243447" }
                    : { top: 0, bottom: 0, left: `${position}%`, width: 24, background: "#243447" }),
                }}
              />
            ))}

            {[
              [5, 5, 22, 20],
              [35, 5, 20, 20],
              [65, 5, 30, 20],
              [5, 35, 20, 15],
              [62, 35, 14, 12],
              [5, 58, 10, 30],
              [35, 58, 20, 30],
            ].map(([left, top, width, height], index) => (
              <div
                key={index}
                style={{
                  position: "absolute",
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${width}%`,
                  height: `${height}%`,
                  background: "#1e3a5f",
                  borderRadius: 4,
                  opacity: 0.5,
                }}
              />
            ))}

            <div style={{ position: "absolute", top: "8%", left: "6%", fontSize: 10, color: "#3a5070", fontWeight: 600 }}>
              COMMERCIAL ZONE
            </div>
            <div style={{ position: "absolute", top: "57%", left: "6%", fontSize: 10, color: "#3a5070", fontWeight: 600 }}>
              METRO STATION
            </div>
            <div style={{ position: "absolute", top: "29%", left: "35%", fontSize: 10, color: "#3a5070", fontWeight: 600 }}>
              INNER CIRCLE RD
            </div>
          </div>

          {filteredLots.map((lot) => {
            const isHovered = hoveredLot === lot.id || selectedPin === lot.id;
            const availablePercentage = Math.round((lot.availableSlots / lot.totalSlots) * 100);

            return (
              <div
                key={lot.id}
                onMouseEnter={() => {
                  setHoveredLot(lot.id);
                  setSelectedPin(lot.id);
                }}
                onMouseLeave={() => {
                  setHoveredLot(null);
                  setSelectedPin(null);
                }}
                onClick={() => onSelectLot(lot)}
                style={{
                  position: "absolute",
                  left: `${lot.x}%`,
                  top: `${lot.y}%`,
                  transform: "translate(-50%, -100%)",
                  cursor: "pointer",
                  zIndex: isHovered ? 10 : 1,
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    background: isHovered ? "#10b981" : "#1e293b",
                    border: `2px solid ${getAvailabilityColor(availablePercentage)}`,
                    borderRadius: isHovered ? "12px 12px 12px 0" : "10px 10px 10px 0",
                    padding: "5px 10px",
                    fontSize: 12,
                    fontWeight: 700,
                    color: isHovered ? "#fff" : "#f1f5f9",
                    boxShadow: isHovered ? "0 4px 20px rgba(16,185,129,0.5)" : "0 2px 8px rgba(0,0,0,0.4)",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                  }}
                >
                  ₹{lot.pricePerHour}
                </div>

                {isHovered && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "calc(100% + 8px)",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: 10,
                      padding: "8px 12px",
                      width: 160,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#f1f5f9", marginBottom: 2 }}>{lot.name}</div>
                    <div style={{ fontSize: 11, color: "#10b981" }}>{lot.availableSlots} slots free</div>
                  </div>
                )}
              </div>
            );
          })}

          <div style={{ position: "absolute", left: "47%", top: "50%", transform: "translate(-50%, -50%)" }}>
            <div
              style={{
                width: 14,
                height: 14,
                background: "#3b82f6",
                borderRadius: "50%",
                border: "3px solid #fff",
                boxShadow: "0 0 0 6px rgba(59,130,246,0.2)",
              }}
            />
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 16,
              right: 16,
              background: "rgba(15,23,42,0.9)",
              border: "1px solid #334155",
              borderRadius: 12,
              padding: "10px 14px",
              fontSize: 11,
              color: "#94a3b8",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 6, color: "#f1f5f9" }}>Availability</div>
            {[
              ["#10b981", "> 50% free"],
              ["#f59e0b", "20–50% free"],
              ["#ef4444", "< 20% free"],
            ].map(([color, label]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <div style={{ width: 8, height: 8, background: color, borderRadius: "50%" }} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
