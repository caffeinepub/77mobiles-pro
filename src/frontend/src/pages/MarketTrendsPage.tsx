import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

const MARKET_DATA = [
  {
    model: "iPhone 15 Pro",
    brand: "Apple",
    price: 68000,
    trend: "up",
    storage: "256GB",
    age: "3 months",
    condition: "Mint",
    reason: "High Demand",
  },
  {
    model: "Samsung S24 Ultra",
    brand: "Samsung",
    price: 92000,
    trend: "down",
    storage: "512GB",
    age: "5 months",
    condition: "Like New",
    reason: "S25 Launch Effect",
  },
  {
    model: 'iPad Pro M4 11"',
    brand: "Apple",
    price: 95000,
    trend: "up",
    storage: "256GB",
    age: "2 months",
    condition: "Like New",
    reason: "Education Demand",
  },
  {
    model: "MacBook Pro M3",
    brand: "Apple",
    price: 145000,
    trend: "up",
    storage: "512GB",
    age: "4 months",
    condition: "Excellent",
    reason: "AI Workload Demand",
  },
  {
    model: "OnePlus 13",
    brand: "OnePlus",
    price: 42000,
    trend: "down",
    storage: "256GB",
    age: "6 months",
    condition: "Good",
    reason: "New Model Launch",
  },
  {
    model: "Google Pixel 9 Pro",
    brand: "Google",
    price: 68000,
    trend: "up",
    storage: "256GB",
    age: "4 months",
    condition: "Like New",
    reason: "AI Features Buzz",
  },
  {
    model: "iPhone 16",
    brand: "Apple",
    price: 72000,
    trend: "up",
    storage: "128GB",
    age: "2 months",
    condition: "Mint",
    reason: "High Demand",
  },
  {
    model: "Redmi Note 13 Pro",
    brand: "Xiaomi",
    price: 18500,
    trend: "down",
    storage: "256GB",
    age: "8 months",
    condition: "Good",
    reason: "Market Saturation",
  },
  {
    model: "Apple Watch Ultra 2",
    brand: "Apple",
    price: 82000,
    trend: "up",
    storage: "64GB",
    age: "3 months",
    condition: "Mint",
    reason: "Sports Season",
  },
  {
    model: "Sony WH-1000XM5",
    brand: "Sony",
    price: 24500,
    trend: "down",
    storage: "N/A",
    age: "7 months",
    condition: "Good",
    reason: "New XM6 Expected",
  },
];

export { MARKET_DATA };

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
              boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
            }}
          >
            {/* Row 1: title + right-aligned price */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "4px",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#1E293B",
                    margin: "0 0 2px",
                    lineHeight: 1.3,
                  }}
                >
                  {item.model}
                </p>
                {/* Metadata + reason chip inline */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    flexWrap: "wrap",
                    marginTop: "2px",
                  }}
                >
                  <p style={{ fontSize: "10px", color: "#94A3B8", margin: 0 }}>
                    {item.storage} &bull; {item.age} &bull; {item.condition}
                  </p>
                  <span
                    style={{
                      fontSize: "9px",
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: "20px",
                      background: item.trend === "up" ? "#D1FAE5" : "#FEE2E2",
                      color: item.trend === "up" ? "#065F46" : "#991B1B",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.reason}
                  </span>
                </div>
              </div>
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "#1D4ED8",
                  margin: 0,
                  textAlign: "right",
                  whiteSpace: "nowrap",
                  paddingLeft: "8px",
                }}
              >
                ₹{item.price.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
