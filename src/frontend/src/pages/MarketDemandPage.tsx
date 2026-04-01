import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Flame } from "lucide-react";

const DEMAND_FEED = [
  {
    id: "d1",
    text: "Wanted: 10x iPhone 15 Pro",
    budget: "85,000",
    dealer: "Verified Dealer #217",
  },
  {
    id: "d2",
    text: "Wanted: 5x Samsung S24",
    budget: "60,000",
    dealer: "Verified Dealer #189",
  },
  {
    id: "d3",
    text: "Wanted: 3x OnePlus 12",
    budget: "40,000",
    dealer: "Verified Dealer #341",
  },
  {
    id: "d4",
    text: "Wanted: 8x iPhone 14 Pro",
    budget: "55,000",
    dealer: "Verified Dealer #502",
  },
  {
    id: "d5",
    text: "Wanted: 12x Samsung S23",
    budget: "38,000",
    dealer: "Verified Dealer #118",
  },
  {
    id: "d6",
    text: "Wanted: 6x Google Pixel 9",
    budget: "62,000",
    dealer: "Verified Dealer #390",
  },
  {
    id: "d7",
    text: "Wanted: 15x iPhone 13 (any condition)",
    budget: "28,000",
    dealer: "Verified Dealer #77",
  },
  {
    id: "d8",
    text: "Wanted: 4x MacBook Air M2",
    budget: "89,000",
    dealer: "Verified Dealer #231",
  },
];

export default function MarketDemandPage() {
  const navigate = useNavigate();

  const handleFulfillLead = (item: (typeof DEMAND_FEED)[0]) => {
    localStorage.setItem("77m_send_offer", JSON.stringify(item));
    navigate({ to: "/send-offer" });
  };

  return (
    <div
      className="mobile-container"
      style={{ background: "#F8FAFC", minHeight: "100dvh" }}
    >
      {/* Header */}
      <div
        style={{
          background: "rgba(255,255,255,0.9)",
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
          data-ocid="market_demand.back.button"
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
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontSize: "18px",
              fontWeight: 800,
              color: "#1E293B",
              margin: 0,
            }}
          >
            Market Demand
          </h1>
          <p style={{ fontSize: "11px", color: "#94A3B8", margin: 0 }}>
            {DEMAND_FEED.length} active buyer leads
          </p>
        </div>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "white",
            background: "#EF4444",
            borderRadius: "20px",
            padding: "3px 10px",
          }}
        >
          {DEMAND_FEED.length} Live
        </span>
      </div>

      <div style={{ padding: "16px" }}>
        <div
          data-ocid="market_demand.list"
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          {DEMAND_FEED.map((item, idx) => (
            <div
              key={item.id}
              data-ocid={`market_demand.item.${idx + 1}`}
              style={{
                background: "#FFFFFF",
                borderRadius: "16px",
                padding: "16px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              {/* Live dot + badge */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "10px",
                }}
              >
                <span
                  style={{
                    position: "relative",
                    display: "flex",
                    width: 10,
                    height: 10,
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      display: "inline-flex",
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      background: "#EF4444",
                      opacity: 0.75,
                      animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
                    }}
                  />
                  <span
                    style={{
                      position: "relative",
                      display: "inline-flex",
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: "#EF4444",
                    }}
                  />
                </span>
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    color: "#EF4444",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Live Demand
                </span>
              </div>

              {/* Icon + details */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "12px",
                    background: "#FFF7ED",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Flame size={20} style={{ color: "#F97316" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#1E293B",
                      margin: "0 0 4px",
                      lineHeight: 1.3,
                    }}
                  >
                    {item.text}
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#64748B",
                      margin: "0 0 2px",
                    }}
                  >
                    Budget: ₹{item.budget} each
                  </p>
                  <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>
                    {item.dealer}
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#1D4ED8",
                      margin: 0,
                    }}
                  >
                    ₹{item.budget}
                  </p>
                </div>
              </div>

              {/* Social proof */}
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#1D4ED8",
                  marginBottom: "12px",
                }}
              >
                3 other dealers are viewing this lead
              </p>

              {/* Fulfill Lead button */}
              <button
                type="button"
                data-ocid={`market_demand.fulfill.button.${idx + 1}`}
                onClick={() => handleFulfillLead(item)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "12px",
                  background: "#1D4ED8",
                  color: "white",
                  fontSize: "13px",
                  fontWeight: 800,
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "0.03em",
                }}
              >
                FULFILL LEAD
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
