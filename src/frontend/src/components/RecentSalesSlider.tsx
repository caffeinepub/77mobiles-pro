import { useNavigate } from "@tanstack/react-router";
import { Smartphone } from "lucide-react";

const RECENT_SALES = [
  { id: "1", model: "iPhone 15 Pro", price: 68000 },
  { id: "2", model: "S24 Ultra", price: 92000 },
  { id: "3", model: "iPad Pro M4", price: 95000 },
  { id: "4", model: "MacBook Pro M3", price: 145000 },
  { id: "5", model: "OnePlus 13", price: 42000 },
  { id: "6", model: "Pixel 9 Pro", price: 68000 },
  { id: "7", model: "iPhone 16", price: 72000 },
  { id: "8", model: "Redmi Note 13 Pro", price: 18500 },
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
          Recent Sales
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
              alignItems: "center",
              gap: "8px",
              background: "#F8FAFC",
              borderRadius: "12px",
              padding: "8px 10px",
              border: "1px solid #E2E8F0",
              cursor: "pointer",
              minWidth: "160px",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                background: "#EFF6FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Smartphone size={16} style={{ color: "#1D4ED8" }} />
            </div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#1E293B",
                flex: 1,
                textAlign: "left",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {sale.model}
            </span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#FFFFFF",
                background: "#1D4ED8",
                borderRadius: "20px",
                padding: "3px 8px",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              ₹{(sale.price / 1000).toFixed(0)}K
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
