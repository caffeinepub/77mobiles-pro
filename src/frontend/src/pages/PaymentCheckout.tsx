import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CreditCard, Smartphone, User } from "lucide-react";
import { useState } from "react";

function formatINRVal(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PaymentCheckout() {
  const navigate = useNavigate();
  const [payMethod, setPayMethod] = useState<"upi" | "card" | "netbanking">(
    "upi",
  );
  const [upiId, setUpiId] = useState("yourname@upi");
  const [processing, setProcessing] = useState(false);

  const storedItem = (() => {
    try {
      return JSON.parse(localStorage.getItem("77m_checkout") || "{}");
    } catch {
      return {};
    }
  })();

  const model = storedItem.model || "iPhone 15 Pro 256GB";
  const condition = storedItem.condition || "Like New";
  const price = storedItem.price || 65000;

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      localStorage.setItem(
        "77m_payment_success",
        JSON.stringify({ model, condition, price }),
      );
      navigate({ to: "/payment-success" });
    }, 1500);
  };

  return (
    <div className="mobile-container bg-[#F8F9FA] min-h-screen flex flex-col">
      <header
        style={{ background: "#007AFF" }}
        className="px-4 py-3 flex items-center gap-3"
      >
        <button
          type="button"
          data-ocid="checkout.back.button"
          onClick={() => navigate({ to: "/app" })}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <span className="text-white font-black flex-1">Checkout</span>
        <button
          type="button"
          data-ocid="checkout.profile.button"
          className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center"
        >
          <User className="w-4 h-4 text-white" />
        </button>
      </header>

      <div className="flex-1 px-4 py-5 space-y-4">
        <div
          className="bg-white rounded-2xl p-4"
          style={{ border: "1px solid #e5e7eb" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ background: "#EEF2FF" }}
            >
              <Smartphone className="w-7 h-7" style={{ color: "#007AFF" }} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-gray-900">{model}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Condition: {condition}
              </p>
            </div>
          </div>
          <div
            className="mt-4 flex justify-between items-center py-3 px-3 rounded-xl"
            style={{ background: "#F8F9FA" }}
          >
            <span className="text-sm font-semibold text-gray-700">
              Total Payable
            </span>
            <span className="text-xl font-black" style={{ color: "#007AFF" }}>
              {formatINRVal(price)}
            </span>
          </div>
        </div>

        <div
          className="bg-white rounded-2xl p-4"
          style={{ border: "1px solid #e5e7eb" }}
        >
          <p className="font-bold text-sm text-gray-900 mb-3">Payment Method</p>
          <div className="flex gap-2 mb-4">
            {(["upi", "card", "netbanking"] as const).map((m) => (
              <button
                type="button"
                key={m}
                data-ocid={`checkout.${m}.tab`}
                onClick={() => setPayMethod(m)}
                className="flex-1 py-2 rounded-xl text-xs font-bold"
                style={{
                  background: payMethod === m ? "#007AFF" : "#f3f4f6",
                  color: payMethod === m ? "white" : "#374151",
                }}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>

          {payMethod === "upi" && (
            <div>
              <label
                htmlFor="upi-id"
                className="text-xs font-semibold text-gray-500 mb-1.5 block"
              >
                UPI ID
              </label>
              <input
                id="upi-id"
                data-ocid="checkout.upi.input"
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
              />
            </div>
          )}
          {payMethod === "card" && (
            <div className="space-y-3">
              <input
                data-ocid="checkout.card_number.input"
                type="text"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
                placeholder="Card number"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
                  placeholder="MM/YY"
                />
                <input
                  type="text"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none"
                  placeholder="CVV"
                />
              </div>
            </div>
          )}
          {payMethod === "netbanking" && (
            <div className="grid grid-cols-3 gap-2">
              {["SBI", "HDFC", "ICICI", "Axis", "Kotak", "Other"].map(
                (bank) => (
                  <button
                    key={bank}
                    type="button"
                    className="py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-600"
                  >
                    {bank}
                  </button>
                ),
              )}
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 px-1">
          <CreditCard className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-400">
            Your identity is masked. Transaction uses Dealer IDs only.
          </p>
        </div>

        <button
          type="button"
          data-ocid="checkout.pay_now.submit_button"
          onClick={handlePay}
          disabled={processing}
          className="w-full py-4 rounded-2xl text-white font-black text-base"
          style={{ background: processing ? "#6b7280" : "#007AFF" }}
        >
          {processing ? "Processing..." : `Pay Now ${formatINRVal(price)}`}
        </button>
      </div>
    </div>
  );
}
