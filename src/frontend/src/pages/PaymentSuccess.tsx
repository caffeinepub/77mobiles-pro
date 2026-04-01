import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle,
  Download,
  Package,
  Truck,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useApp } from "../contexts/AppContext";

function formatINRVal(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const STEPS = [
  {
    label: "Payment Confirmed",
    icon: CheckCircle,
    done: true,
    color: "#22c55e",
  },
  {
    label: "QC & Inspection",
    icon: CheckCircle,
    done: false,
    color: "#007AFF",
  },
  { label: "Dispatched", icon: Truck, done: false, color: "#007AFF" },
  { label: "Delivered", icon: Package, done: false, color: "#9ca3af" },
];

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { setActiveTab } = useApp();

  const stored = (() => {
    try {
      return JSON.parse(localStorage.getItem("77m_payment_success") || "{}");
    } catch {
      return {};
    }
  })();

  const model = stored.model || "iPhone 15 Pro 256GB";
  const price = stored.price || 65000;

  const handleGoToPurchases = () => {
    setActiveTab("activity");
    navigate({ to: "/app" });
  };

  return (
    <div className="mobile-container bg-[#F8F9FA] min-h-screen">
      {/* Header */}
      <header
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: "#007AFF" }}
      >
        <span className="text-white font-black">77mobiles.pro Marketplace</span>
        <button
          type="button"
          data-ocid="success.profile.button"
          className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center"
        >
          <User className="w-4 h-4 text-white" />
        </button>
      </header>

      <div className="px-4 py-6 space-y-4">
        {/* Success checkmark */}
        <div className="text-center py-4">
          <div
            className="w-20 h-20 rounded-full border-4 border-green-500 flex items-center justify-center mx-auto mb-4"
            style={{ background: "#f0fdf4" }}
          >
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="font-black text-2xl text-gray-900">
            Payment Successful!
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            {formatINRVal(price)} has been sent to the Verified Seller for your
            device.
          </p>
        </div>

        {/* Transaction card */}
        <div
          className="bg-white rounded-2xl p-4"
          style={{
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
          data-ocid="success.transaction.card"
        >
          <h2 className="font-bold text-sm text-gray-700 mb-3">
            Transaction Details
          </h2>
          {[
            ["Item", model],
            ["Buyer ID", "Verified Dealer #402"],
            ["Seller ID", "Verified Seller #189"],
            ["Amount Paid", formatINRVal(price)],
            ["Payment Method", "HDFC UPI"],
            ["Transaction ID", "TXN998877"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between items-center py-1.5"
            >
              <span className="text-xs text-gray-500">{label}</span>
              <span className="text-xs font-bold text-gray-900">{value}</span>
            </div>
          ))}
        </div>

        {/* Fulfillment steps */}
        <div
          className="bg-white rounded-2xl p-4"
          style={{
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <h2 className="font-bold text-sm text-gray-700 mb-4">
            Next Steps for Fulfillment
          </h2>
          <div className="space-y-3">
            {STEPS.map((step, idx) => (
              <div key={step.label} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: step.done
                      ? "#f0fdf4"
                      : idx === 1
                        ? "#eff6ff"
                        : "#f9fafb",
                    border: `2px solid ${step.color}`,
                  }}
                >
                  <step.icon
                    className="w-4 h-4"
                    style={{ color: step.color }}
                  />
                </div>
                <span
                  className="text-xs font-semibold"
                  style={{
                    color: step.done
                      ? "#22c55e"
                      : idx === 1
                        ? "#007AFF"
                        : "#9ca3af",
                  }}
                >
                  {idx + 1}. {step.label}
                  {step.done ? " ✓" : ""}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-gray-500 mt-3">
            The seller will dispatch the device after the mandatory quality
            check.
          </p>
        </div>

        {/* Action buttons */}
        <button
          type="button"
          data-ocid="success.download_receipt.button"
          onClick={() => toast.success("Receipt downloaded!")}
          className="w-full py-3 rounded-2xl text-sm font-bold"
          style={{
            background: "white",
            color: "#007AFF",
            border: "2px solid #007AFF",
          }}
        >
          <Download className="w-4 h-4 inline mr-2" />
          Download Receipt (PDF)
        </button>
        <button
          type="button"
          data-ocid="success.go_to_purchases.button"
          onClick={handleGoToPurchases}
          className="w-full py-3 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2"
          style={{ background: "#22c55e" }}
        >
          Go to &apos;My Purchases&apos;
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
