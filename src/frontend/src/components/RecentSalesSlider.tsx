import { useNavigate } from "@tanstack/react-router";
import { Smartphone } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { SELLER_LISTINGS } from "../data/demoListings";

export default function RecentSalesSlider() {
  const navigate = useNavigate();
  const { sharedListings } = useApp();

  // Build real-time sold data from sharedListings + static sold listings
  const soldFromShared = sharedListings
    .filter((l) => l.status === "Sold")
    .map((l, i) => ({
      id: `shared-${i}`,
      model: l.model,
      storage: l.storage ? `${Number(l.storage)}GB` : "N/A",
      condition: l.condition,
      age: "Just listed",
      price: Number(l.basePrice) / 100,
    }));

  const soldFromStatic = SELLER_LISTINGS.filter((l) => l.status === "Sold").map(
    (l, i) => ({
      id: `static-${i}`,
      model: l.model,
      storage: l.storage ? `${Number(l.storage)}GB` : "N/A",
      condition: l.condition,
      age: "Recent",
      price: Number(l.basePrice) / 100,
    }),
  );

  const displaySales = [...soldFromShared, ...soldFromStatic];

  // Task 11: Show empty state if no sold items
  if (displaySales.length === 0) {
    return (
      <div style={{ padding: "16px", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
          No items sold yet. Start an auction today!
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderBottom: "1px solid #F1F5F9",
        paddingTop: "6px",
        paddingBottom: "6px",
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
          Recently Sold on 77mobiles.pro
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
        {displaySales.map((sale) => (
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
              padding: "8px",
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
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
