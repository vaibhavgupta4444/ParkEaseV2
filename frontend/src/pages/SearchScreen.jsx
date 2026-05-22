import { useState } from "react";
import AppFonts from "../components/ui/AppFonts";

const suggestions = [
  "Connaught Place, New Delhi",
  "Karol Bagh, New Delhi",
  "Lajpat Nagar, New Delhi",
  "Saket, New Delhi",
];

export default function SearchScreen({ onSearch }) {
  const [query, setQuery] = useState("");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <AppFonts />

      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div
          style={{
            width: 64,
            height: 64,
            background: "linear-gradient(135deg, #10b981, #059669)",
            borderRadius: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 0 40px rgba(16,185,129,0.4)",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="4" width="24" height="24" rx="6" fill="white" opacity="0.9" />
            <text x="9" y="24" fontSize="16" fontWeight="800" fill="#10b981">
              P
            </text>
          </svg>
        </div>
        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 42,
            fontWeight: 800,
            color: "#fff",
            margin: 0,
            letterSpacing: -1,
          }}
        >
          Park<span style={{ color: "#10b981" }}>Easy</span>
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 16, marginTop: 8 }}>
          Find and book parking spots instantly
        </p>
      </div>

      <div
        style={{
          background: "#1e293b",
          borderRadius: 20,
          padding: 8,
          display: "flex",
          gap: 8,
          width: "100%",
          maxWidth: 520,
          border: "1px solid #334155",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 12px",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && query.trim() && onSearch(query)}
            placeholder="Enter location, area or landmark..."
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              fontSize: 15,
              color: "#f1f5f9",
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
        </div>
        <button
          onClick={() => query.trim() && onSearch(query)}
          style={{
            padding: "12px 24px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "#fff",
            border: "none",
            borderRadius: 14,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          Find Parking →
        </button>
      </div>

      <div
        style={{
          marginTop: 20,
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          justifyContent: "center",
          maxWidth: 520,
        }}
      >
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onSearch(s)}
            style={{
              padding: "7px 16px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid #334155",
              borderRadius: 20,
              color: "#94a3b8",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(16,185,129,0.15)";
              e.target.style.color = "#10b981";
              e.target.style.borderColor = "#10b981";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.06)";
              e.target.style.color = "#94a3b8";
              e.target.style.borderColor = "#334155";
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 32, marginTop: 56, color: "#64748b", fontSize: 13 }}>
        {[
          ["500+", "Parking Lots"],
          ["50K+", "Happy Drivers"],
          ["₹20/hr", "Starting Price"],
        ].map(([value, label]) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#10b981",
                fontFamily: "'Syne', sans-serif",
              }}
            >
              {value}
            </div>
            <div>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
