import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, TrendingDown, TrendingUp } from "lucide-react";

const MARKET_DATA = [
  {
    model: "iPhone 15 Pro",
    brand: "Apple",
    price: 68000,
    change: +3200,
    trend: "up",
  },
  {
    model: "Samsung S24 Ultra",
    brand: "Samsung",
    price: 92000,
    change: -1500,
    trend: "down",
  },
  {
    model: 'iPad Pro M4 11"',
    brand: "Apple",
    price: 95000,
    change: +2000,
    trend: "up",
  },
  {
    model: "MacBook Pro M3",
    brand: "Apple",
    price: 145000,
    change: +5000,
    trend: "up",
  },
  {
    model: "OnePlus 13",
    brand: "OnePlus",
    price: 42000,
    change: -800,
    trend: "down",
  },
  {
    model: "Google Pixel 9 Pro",
    brand: "Google",
    price: 68000,
    change: +1200,
    trend: "up",
  },
  {
    model: "iPhone 16",
    brand: "Apple",
    price: 72000,
    change: +4500,
    trend: "up",
  },
  {
    model: "Redmi Note 13 Pro",
    brand: "Xiaomi",
    price: 18500,
    change: -400,
    trend: "down",
  },
  {
    model: "Apple Watch Ultra 2",
    brand: "Apple",
    price: 82000,
    change: +1100,
    trend: "up",
  },
  {
    model: "Sony WH-1000XM5",
    brand: "Sony",
    price: 24500,
    change: -600,
    trend: "down",
  },
];

export default function MarketTrendsPage() {
  const navigate = useNavigate();

  return (
    <div
      className="mobile-container"
      style={{ background: "#F8FAFC", minHeight: "100dvh" }}
    >
      {/* Header */}
      <div
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: "1px solid #E2E8F0",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <button
          type="button"
          data-ocid="market_trends.back.button"
          onClick={() => navigate({ to: "/app" })}
          style={{
            width: 36,
            height: 36,
            borderRadius: "10px",
            background: "#F1F5F9",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={18} style={{ color: "#1E293B" }} />
        </button>
        <div>
          <h1
            style={{
              fontSize: "18px",
              fontWeight: 800,
              color: "#1E293B",
              margin: 0,
            }}
          >
            Market Trends
          </h1>
          <p style={{ fontSize: "11px", color: "#94A3B8", margin: 0 }}>
            Recent sales & price history
          </p>
        </div>
      </div>

      {/* Trend cards */}
      <div style={{ padding: "16px" }}>
        {MARKET_DATA.map((item, idx) => (
          <div
            key={item.model}
            data-ocid={`market_trends.item.${idx + 1}`}
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              padding: "14px 16px",
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#1E293B",
                  margin: "0 0 2px",
                }}
              >
                {item.model}
              </p>
              <p style={{ fontSize: "11px", color: "#94A3B8", margin: 0 }}>
                {item.brand}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "#1D4ED8",
                  margin: "0 0 2px",
                }}
              >
                ₹{item.price.toLocaleString("en-IN")}
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  justifyContent: "flex-end",
                }}
              >
                {item.trend === "up" ? (
                  <TrendingUp size={12} style={{ color: "#16A34A" }} />
                ) : (
                  <TrendingDown size={12} style={{ color: "#DC2626" }} />
                )}
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: item.trend === "up" ? "#16A34A" : "#DC2626",
                  }}
                >
                  {item.trend === "up" ? "+" : "-"}₹
                  {Math.abs(item.change).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
