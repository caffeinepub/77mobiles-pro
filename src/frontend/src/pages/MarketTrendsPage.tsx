import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, TrendingDown, TrendingUp } from "lucide-react";

const MARKET_DATA = [
  {
    model: "iPhone 15 Pro",
    brand: "Apple",
    price: 68000,
    change: +3200,
    trend: "up",
    storage: "256GB",
    age: "3 months",
    condition: "Mint",
    reason: "High Demand",
    sparkline: [60000, 62000, 61500, 64000, 65000, 67500, 68000],
  },
  {
    model: "Samsung S24 Ultra",
    brand: "Samsung",
    price: 92000,
    change: -1500,
    trend: "down",
    storage: "512GB",
    age: "5 months",
    condition: "Like New",
    reason: "S25 Launch Effect",
    sparkline: [96000, 95000, 94000, 93500, 93000, 92500, 92000],
  },
  {
    model: 'iPad Pro M4 11"',
    brand: "Apple",
    price: 95000,
    change: +2000,
    trend: "up",
    storage: "256GB",
    age: "2 months",
    condition: "Like New",
    reason: "Education Demand",
    sparkline: [90000, 91000, 92000, 93000, 93500, 94500, 95000],
  },
  {
    model: "MacBook Pro M3",
    brand: "Apple",
    price: 145000,
    change: +5000,
    trend: "up",
    storage: "512GB",
    age: "4 months",
    condition: "Excellent",
    reason: "AI Workload Demand",
    sparkline: [135000, 138000, 139000, 141000, 142000, 144000, 145000],
  },
  {
    model: "OnePlus 13",
    brand: "OnePlus",
    price: 42000,
    change: -800,
    trend: "down",
    storage: "256GB",
    age: "6 months",
    condition: "Good",
    reason: "New Model Launch",
    sparkline: [44000, 43800, 43500, 43200, 43000, 42500, 42000],
  },
  {
    model: "Google Pixel 9 Pro",
    brand: "Google",
    price: 68000,
    change: +1200,
    trend: "up",
    storage: "256GB",
    age: "4 months",
    condition: "Like New",
    reason: "AI Features Buzz",
    sparkline: [65000, 65500, 66000, 66500, 67000, 67500, 68000],
  },
  {
    model: "iPhone 16",
    brand: "Apple",
    price: 72000,
    change: +4500,
    trend: "up",
    storage: "128GB",
    age: "2 months",
    condition: "Mint",
    reason: "High Demand",
    sparkline: [66000, 67000, 68500, 69000, 70000, 71000, 72000],
  },
  {
    model: "Redmi Note 13 Pro",
    brand: "Xiaomi",
    price: 18500,
    change: -400,
    trend: "down",
    storage: "256GB",
    age: "8 months",
    condition: "Good",
    reason: "Market Saturation",
    sparkline: [20000, 19800, 19500, 19200, 19000, 18800, 18500],
  },
  {
    model: "Apple Watch Ultra 2",
    brand: "Apple",
    price: 82000,
    change: +1100,
    trend: "up",
    storage: "64GB",
    age: "3 months",
    condition: "Mint",
    reason: "Sports Season",
    sparkline: [79000, 79500, 80000, 80500, 81000, 81500, 82000],
  },
  {
    model: "Sony WH-1000XM5",
    brand: "Sony",
    price: 24500,
    change: -600,
    trend: "down",
    storage: "N/A",
    age: "7 months",
    condition: "Good",
    reason: "New XM6 Expected",
    sparkline: [26000, 25800, 25500, 25200, 25000, 24800, 24500],
  },
];

function Sparkline({ data, trend }: { data: number[]; trend: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 60;
  const h = 24;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  const color = trend === "up" ? "#16A34A" : "#DC2626";
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      aria-hidden="true"
    >
      <title>Price sparkline</title>
      <polyline
        points={points}
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

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
                {/* Metadata: storage · age · condition */}
                <p style={{ fontSize: "10px", color: "#94A3B8", margin: 0 }}>
                  {item.storage} &bull; {item.age} &bull; {item.condition}
                </p>
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
                \u20B9{item.price.toLocaleString("en-IN")}
              </p>
            </div>
            {/* Row 2: sparkline + delta + reason chip */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginTop: "6px",
              }}
            >
              <Sparkline data={item.sparkline} trend={item.trend} />
              <div
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
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
                  {item.trend === "up" ? "+" : "-"}\u20B9
                  {Math.abs(item.change).toLocaleString("en-IN")}
                </span>
              </div>
              {/* Why chip */}
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  padding: "2px 7px",
                  borderRadius: "20px",
                  background: item.trend === "up" ? "#D1FAE5" : "#FEE2E2",
                  color: item.trend === "up" ? "#065F46" : "#991B1B",
                  whiteSpace: "nowrap",
                  marginLeft: "auto",
                }}
              >
                {item.reason}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
