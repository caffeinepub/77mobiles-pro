import { useNavigate } from "@tanstack/react-router";
import { CheckCircle } from "lucide-react";
import { Smartphone } from "lucide-react";

const RECENT_SALES = [
  {
    id: "1",
    model: "iPhone 15 Pro",
    storage: "256GB",
    condition: "Mint Condition",
    age: "3 months old",
    price: 68000,
  },
  {
    id: "2",
    model: "Samsung S24 Ultra",
    storage: "512GB",
    condition: "Like New",
    age: "5 months old",
    price: 92000,
  },
  {
    id: "3",
    model: "iPad Pro M4",
    storage: "128GB",
    condition: "Excellent",
    age: "2 months old",
    price: 95000,
  },
  {
    id: "4",
    model: "MacBook Pro M3",
    storage: "512GB",
    condition: "Good",
    age: "8 months old",
    price: 145000,
  },
  {
    id: "5",
    model: "OnePlus 13",
    storage: "256GB",
    condition: "Mint Condition",
    age: "1 month old",
    price: 42000,
  },
  {
    id: "6",
    model: "Pixel 9 Pro",
    storage: "128GB",
    condition: "Excellent",
    age: "4 months old",
    price: 68000,
  },
  {
    id: "7",
    model: "iPhone 16",
    storage: "128GB",
    condition: "Mint Condition",
    age: "2 months old",
    price: 72000,
  },
  {
    id: "8",
    model: "Redmi Note 13 Pro",
    storage: "256GB",
    condition: "Like New",
    age: "6 months old",
    price: 18500,
  },
];

export default function RecentSalesSlider() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderBottom: "1px solid #F1F5F9",
        paddingTop: "10px",
        paddingBottom: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: "16px",
          paddingRight: "16px",
          marginBottom: "8px",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: 700,
            color: "#1E293B",
            letterSpacing: "0.02em",
          }}
        >
          Recently Sold on 77mobiles
        </span>
        <button
          type="button"
          data-ocid="recent_sales.view_all.button"
          onClick={() => navigate({ to: "/market-trends" })}
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#1D4ED8",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          View All →
        </button>
      </div>
      <div
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          paddingLeft: "16px",
          paddingRight: "16px",
          scrollbarWidth: "none",
        }}
      >
        {RECENT_SALES.map((sale) => (
          <button
            type="button"
            key={sale.id}
            data-ocid={`recent_sales.item.${sale.id}`}
            onClick={() => navigate({ to: "/market-trends" })}
            style={{
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              background: "#FFFFFF",
              borderRadius: "12px",
              padding: "12px",
              border: "1px solid #E5E7EB",
              cursor: "pointer",
              minWidth: "160px",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "7px",
                  background: "#EFF6FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Smartphone size={14} style={{ color: "#1D4ED8" }} />
              </div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#1E293B",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {sale.model} | {sale.storage}
              </span>
            </div>
            <span
              style={{
                fontSize: "10px",
                color: "#6B7280",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {sale.condition} • {sale.age}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#16A34A",
                  background: "#F0FDF4",
                  border: "1px solid #BBF7D0",
                  borderRadius: "20px",
                  padding: "2px 8px",
                  whiteSpace: "nowrap",
                }}
              >
                Sold: ₹{sale.price.toLocaleString("en-IN")}
              </span>
              <CheckCircle
                className="w-3 h-3"
                style={{ color: "#16A34A", flexShrink: 0 }}
              />
              <span
                style={{
                  fontSize: "9px",
                  color: "#16A34A",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                Verified
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
