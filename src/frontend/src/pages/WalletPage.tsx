import { ArrowDownLeft, Plus, TrendingUp } from "lucide-react";

const MOCK_TRANSACTIONS = [
  {
    id: 1,
    type: "credit",
    label: "Bid Refund – iPhone 16 Pro",
    amount: 78500,
    date: "31 Mar",
  },
  {
    id: 2,
    type: "debit",
    label: "Bid Placed – S24 Ultra",
    amount: 85000,
    date: "30 Mar",
  },
  {
    id: 3,
    type: "credit",
    label: "Top Up via UPI",
    amount: 200000,
    date: "28 Mar",
  },
  {
    id: 4,
    type: "debit",
    label: "Bid Placed – iPad Pro M4",
    amount: 95000,
    date: "27 Mar",
  },
  {
    id: 5,
    type: "credit",
    label: "Auction Win Refund",
    amount: 12000,
    date: "25 Mar",
  },
];

export default function WalletPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      {/* Gradient header */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #1D4ED8 0%, #3B82F6 60%, #6366F1 100%)",
          padding: "32px 20px 40px",
          borderRadius: "0 0 24px 24px",
        }}
      >
        <p
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: "13px",
            fontWeight: 500,
            marginBottom: "4px",
          }}
        >
          Current Balance
        </p>
        <p
          style={{
            color: "#FFFFFF",
            fontSize: "40px",
            fontWeight: 800,
            letterSpacing: "-1px",
            marginBottom: "4px",
          }}
        >
          ₹3,42,500
        </p>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px" }}>
          Available for bidding
        </p>
        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <button
            type="button"
            data-ocid="wallet.add_money.button"
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              cursor: "pointer",
            }}
          >
            <Plus size={16} /> Add Money
          </button>
          <button
            type="button"
            data-ocid="wallet.withdraw.button"
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              cursor: "pointer",
            }}
          >
            <ArrowDownLeft size={16} /> Withdraw
          </button>
        </div>
      </div>

      {/* Escrow info card */}
      <div
        style={{
          margin: "16px",
          background: "#EFF6FF",
          borderRadius: "12px",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <TrendingUp size={18} style={{ color: "#1D4ED8", flexShrink: 0 }} />
        <div>
          <p
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#1D4ED8",
              margin: 0,
            }}
          >
            ₹85,000 in Escrow
          </p>
          <p style={{ fontSize: "11px", color: "#64748B", margin: 0 }}>
            Active bid on Samsung S24 Ultra
          </p>
        </div>
      </div>

      {/* Transaction history */}
      <div style={{ padding: "0 16px 16px" }}>
        <p
          style={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#1E293B",
            marginBottom: "12px",
          }}
        >
          Recent Transactions
        </p>
        {MOCK_TRANSACTIONS.map((tx) => (
          <div
            key={tx.id}
            data-ocid={`wallet.transaction.item.${tx.id}`}
            style={{
              background: "#FFFFFF",
              borderRadius: "14px",
              padding: "14px 16px",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  background: tx.type === "credit" ? "#DCFCE7" : "#FEE2E2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {tx.type === "credit" ? (
                  <Plus size={16} style={{ color: "#16A34A" }} />
                ) : (
                  <ArrowDownLeft size={16} style={{ color: "#DC2626" }} />
                )}
              </div>
              <div>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#1E293B",
                    margin: 0,
                  }}
                >
                  {tx.label}
                </p>
                <p style={{ fontSize: "11px", color: "#94A3B8", margin: 0 }}>
                  {tx.date}
                </p>
              </div>
            </div>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: tx.type === "credit" ? "#16A34A" : "#DC2626",
              }}
            >
              {tx.type === "credit" ? "+" : "-"}₹
              {tx.amount.toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
