import { ArrowDownLeft, Plus, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../contexts/AppContext";

const fmt = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const INITIAL_BALANCE = Number(
  localStorage.getItem("77m_wallet_balance") || "342500",
);

const BUYER_TRANSACTIONS_SEED = [
  {
    id: 1,
    type: "credit" as const,
    label: "Refund: iPhone 16 Pro",
    amount: 78500,
    date: "31 Mar",
  },
  {
    id: 2,
    type: "debit" as const,
    label: "Bid: S24 Ultra",
    amount: 85000,
    date: "30 Mar",
  },
  {
    id: 3,
    type: "credit" as const,
    label: "UPI Top Up",
    amount: 200000,
    date: "28 Mar",
  },
  {
    id: 4,
    type: "debit" as const,
    label: "Bid: iPad Pro M4",
    amount: 95000,
    date: "27 Mar",
  },
  {
    id: 5,
    type: "credit" as const,
    label: "Auction Win Refund",
    amount: 12000,
    date: "25 Mar",
  },
];

const SELLER_TRANSACTIONS_SEED = [
  {
    id: 1,
    type: "credit" as const,
    label: "Sale: iPhone 15",
    amount: 68000,
    date: "31 Mar",
  },
  {
    id: 2,
    type: "debit" as const,
    label: "Payout to Bank",
    amount: 50000,
    date: "30 Mar",
  },
  {
    id: 3,
    type: "credit" as const,
    label: "Sale: iPad Pro M4",
    amount: 95000,
    date: "28 Mar",
  },
  {
    id: 4,
    type: "credit" as const,
    label: "Sale: Samsung S24",
    amount: 72000,
    date: "27 Mar",
  },
  {
    id: 5,
    type: "debit" as const,
    label: "Payout to Bank",
    amount: 40000,
    date: "25 Mar",
  },
];

export default function WalletPage() {
  const { mode } = useApp();
  const isDemoMode = localStorage.getItem("77m_demo_mode") !== "false";

  // Reactive balance state
  const [balance, setBalance] = useState(INITIAL_BALANCE);

  // Reactive transactions list
  const [buyerTxns, setBuyerTxns] = useState(BUYER_TRANSACTIONS_SEED);
  const [sellerTxns, setSellerTxns] = useState(SELLER_TRANSACTIONS_SEED);

  const [showAddInput, setShowAddInput] = useState(false);
  const [showWithdrawInput, setShowWithdrawInput] = useState(false);
  const [addAmount, setAddAmount] = useState(1000);
  const [withdrawAmount, setWithdrawAmount] = useState(1000);

  const updateBalance = (newBalance: number) => {
    setBalance(newBalance);
    localStorage.setItem("77m_wallet_balance", String(newBalance));
  };

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

  const handleAddMoney = async () => {
    if (isDemoMode) {
      // Demo mode: instantly add
      const newBalance = balance + addAmount;
      updateBalance(newBalance);
      if (mode === "buyer") {
        setBuyerTxns((prev) => [
          {
            id: Date.now(),
            type: "credit" as const,
            label: "UPI Top Up",
            amount: addAmount,
            date: today,
          },
          ...prev,
        ]);
      } else {
        setSellerTxns((prev) => [
          {
            id: Date.now(),
            type: "credit" as const,
            label: "UPI Top Up",
            amount: addAmount,
            date: today,
          },
          ...prev,
        ]);
      }
      toast.success(`${fmt(addAmount)} added to wallet (Demo)`);
      setShowAddInput(false);
      return;
    }

    // Live mode: load Razorpay
    const ok = await loadRazorpay();
    if (!ok) {
      toast.error("Payment service unavailable. Try again.");
      return;
    }
    const options = {
      key: "rzp_test_77mobiles",
      amount: addAmount * 100,
      currency: "INR",
      name: "77mobiles.pro",
      description: "Wallet Top-Up",
      theme: { color: "#1D4ED8" },
      handler: (_response: any) => {
        const newBalance = balance + addAmount;
        updateBalance(newBalance);
        toast.success(`${fmt(addAmount)} added to wallet!`);
        setShowAddInput(false);
      },
      prefill: { name: "Dealer", email: "dealer@77mobiles.pro" },
    };
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  const handleWithdraw = () => {
    if (withdrawAmount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (withdrawAmount > balance) {
      toast.error("Insufficient balance");
      return;
    }
    const newBalance = balance - withdrawAmount;
    updateBalance(newBalance);
    if (mode === "buyer") {
      setBuyerTxns((prev) => [
        {
          id: Date.now(),
          type: "debit" as const,
          label: "Payout to Bank",
          amount: withdrawAmount,
          date: today,
        },
        ...prev,
      ]);
    } else {
      setSellerTxns((prev) => [
        {
          id: Date.now(),
          type: "debit" as const,
          label: "Payout to Bank",
          amount: withdrawAmount,
          date: today,
        },
        ...prev,
      ]);
    }
    toast.success(
      `${fmt(withdrawAmount)} withdrawal initiated${isDemoMode ? " (Demo)" : ""}`,
    );
    setShowWithdrawInput(false);
  };

  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const txns = mode === "seller" ? sellerTxns : buyerTxns;

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      {/* Demo mode banner */}
      {isDemoMode && (
        <div
          style={{
            background: "#FEF3C7",
            borderBottom: "1px solid #FCD34D",
            padding: "6px 16px",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#92400E" }}>
            ⚠️ DEMO MODE — Wallet actions are simulated
          </span>
        </div>
      )}

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
          {mode === "seller" ? "Balance" : "Current Balance"}
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
          {fmt(balance)}
        </p>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px" }}>
          {mode === "seller" ? "Ready for Payout" : "Available for bidding"}
        </p>
        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          {mode !== "seller" && (
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
              onClick={() => {
                setShowAddInput((v) => !v);
                setShowWithdrawInput(false);
              }}
            >
              <Plus size={16} /> Add Money
            </button>
          )}
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
            onClick={() => {
              setShowWithdrawInput((v) => !v);
              setShowAddInput(false);
            }}
          >
            <ArrowDownLeft size={16} /> Withdraw
          </button>
        </div>
      </div>

      {/* Add money panel */}
      {showAddInput && mode !== "seller" && (
        <div
          style={{
            margin: "16px",
            background: "#fff",
            borderRadius: "14px",
            padding: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <p
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#1E293B",
              marginBottom: "12px",
            }}
          >
            Add Money to Wallet{" "}
            {isDemoMode && (
              <span style={{ fontSize: "11px", color: "#92400E" }}>(Demo)</span>
            )}
          </p>
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "12px",
            }}
          >
            {[500, 1000, 5000, 10000, 25000, 50000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAddAmount(amt)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "20px",
                  border: `1.5px solid ${addAmount === amt ? "#1D4ED8" : "#E2E8F0"}`,
                  background: addAmount === amt ? "#EFF6FF" : "#fff",
                  color: addAmount === amt ? "#1D4ED8" : "#6B7280",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {fmt(amt)}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={addAmount}
            onChange={(e) => setAddAmount(Number(e.target.value))}
            style={{
              width: "100%",
              border: "1.5px solid #E2E8F0",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "15px",
              fontWeight: 600,
              marginBottom: "12px",
              outline: "none",
              boxSizing: "border-box",
            }}
            placeholder="Enter custom amount"
          />
          <button
            type="button"
            data-ocid="wallet.add_money.submit_button"
            onClick={handleAddMoney}
            style={{
              width: "100%",
              background: "#1D4ED8",
              color: "#fff",
              borderRadius: "12px",
              padding: "13px",
              fontWeight: 700,
              fontSize: "15px",
              border: "none",
              cursor: "pointer",
            }}
          >
            {isDemoMode
              ? `Add ${fmt(addAmount)} (Demo)`
              : `Pay ${fmt(addAmount)} via Razorpay`}
          </button>
        </div>
      )}

      {/* Withdraw panel */}
      {showWithdrawInput && (
        <div
          style={{
            margin: "16px",
            background: "#fff",
            borderRadius: "14px",
            padding: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <p
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#1E293B",
              marginBottom: "12px",
            }}
          >
            Withdraw Funds{" "}
            {isDemoMode && (
              <span style={{ fontSize: "11px", color: "#92400E" }}>(Demo)</span>
            )}
          </p>
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "12px",
            }}
          >
            {[500, 1000, 5000, 10000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setWithdrawAmount(amt)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "20px",
                  border: `1.5px solid ${withdrawAmount === amt ? "#1D4ED8" : "#E2E8F0"}`,
                  background: withdrawAmount === amt ? "#EFF6FF" : "#fff",
                  color: withdrawAmount === amt ? "#1D4ED8" : "#6B7280",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {fmt(amt)}
              </button>
            ))}
          </div>
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(Number(e.target.value))}
            style={{
              width: "100%",
              border: "1.5px solid #E2E8F0",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "15px",
              fontWeight: 600,
              marginBottom: "4px",
              outline: "none",
              boxSizing: "border-box",
            }}
            placeholder="Enter amount"
          />
          <p
            style={{ fontSize: "11px", color: "#94A3B8", marginBottom: "12px" }}
          >
            Available: {fmt(balance)}
          </p>
          <button
            type="button"
            data-ocid="wallet.withdraw.submit_button"
            onClick={handleWithdraw}
            style={{
              width: "100%",
              background: "#1D4ED8",
              color: "#fff",
              borderRadius: "12px",
              padding: "13px",
              fontWeight: 700,
              fontSize: "15px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Withdraw {fmt(withdrawAmount)}
          </button>
        </div>
      )}

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
            Held pending auction settlement
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
        {txns.map((tx, i) => (
          <div
            key={tx.id}
            data-ocid={`wallet.transaction.item.${i + 1}`}
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
              {tx.type === "credit" ? "+" : "-"}
              {fmt(tx.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
