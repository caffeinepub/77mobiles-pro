import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { MarketLead } from "../contexts/AppContext";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { type PhoneSearchResult, searchPhones } from "../utils/rapidApi";

const BRANDS = [
  "Apple",
  "Samsung",
  "OnePlus",
  "Xiaomi",
  "Realme",
  "Vivo",
  "Oppo",
  "Google",
  "Motorola",
  "Nokia",
  "Sony",
  "Nothing",
  "Other",
];

export default function PostLeadModal() {
  const { showPostLead, setShowPostLead, setModalOpen, addMarketLead } =
    useApp();
  const { user } = useAuth();

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [modelInputText, setModelInputText] = useState("");
  const [modelSelected, setModelSelected] = useState(false);
  const [modelResults, setModelResults] = useState<PhoneSearchResult[]>([]);
  const [modelLoading, setModelLoading] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [budget, setBudget] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync modal open state with AppContext so BottomNav hides
  useEffect(() => {
    if (showPostLead) {
      setModalOpen(true);
    } else {
      setModalOpen(false);
    }
  }, [showPostLead, setModalOpen]);

  // Debounced model search via RapidAPI
  const handleModelInput = (val: string) => {
    setModelInputText(val);
    setModel("");
    setModelSelected(false);
    setShowModelDropdown(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setModelResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setModelLoading(true);
      try {
        const query = brand ? `${brand} ${val}` : val;
        const results = await searchPhones(query);
        setModelResults(results.slice(0, 10));
      } catch {
        setModelResults([]);
      } finally {
        setModelLoading(false);
      }
    }, 500);
  };

  const handleModelSelect = (result: PhoneSearchResult) => {
    setModel(result.phone_name);
    setModelInputText(result.phone_name);
    if (!brand && result.brand) setBrand(result.brand);
    setModelSelected(true);
    setShowModelDropdown(false);
    setModelResults([]);
  };

  const handleClose = () => {
    setShowPostLead(false);
    setModalOpen(false);
  };

  const isValid =
    brand &&
    modelSelected &&
    model &&
    Number(quantity) > 0 &&
    Number(budget) > 0;

  if (!showPostLead) return null;

  const handleSubmit = () => {
    if (!isValid) {
      toast.error("Please fill in all fields correctly");
      return;
    }
    const lead: MarketLead = {
      leadId: crypto.randomUUID(),
      buyerId: user?.userId || user?.mobileNumber || "buyer-anon",
      brand,
      model,
      quantity: Number(quantity),
      budgetPerUnit: Number(budget),
      status: "active",
      createdAt: Date.now(),
    };
    addMarketLead(lead);
    toast.success("Buying lead posted! Sellers will be notified.");
    setBrand("");
    setModel("");
    setModelInputText("");
    setModelSelected(false);
    setQuantity("");
    setBudget("");
    handleClose();
  };

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        className="fixed inset-0 w-full h-full cursor-default"
        style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}
        onClick={handleClose}
      />
      {/* Modal Panel */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-3xl p-6"
        style={{
          zIndex: 9999,
          paddingBottom: "max(24px, env(safe-area-inset-bottom, 20px))",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-lg text-gray-900">Post Buying Lead</h2>
          <button
            type="button"
            data-ocid="post_lead.close_button"
            onClick={handleClose}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="space-y-4">
          {/* Brand dropdown */}
          <div>
            <label
              htmlFor="lead-brand"
              className="text-xs font-semibold text-gray-500 mb-1 block"
            >
              Device Brand *
            </label>
            <select
              id="lead-brand"
              data-ocid="post_lead.brand.select"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none bg-white"
              style={{ color: brand ? "#1E293B" : "#9CA3AF" }}
              value={brand}
              onChange={(e) => {
                setBrand(e.target.value);
                // Reset model when brand changes
                setModel("");
                setModelInputText("");
                setModelSelected(false);
              }}
            >
              <option value="">Select brand...</option>
              {BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Model searchable input */}
          <div className="relative">
            <label
              htmlFor="lead-model"
              className="text-xs font-semibold text-gray-500 mb-1 block"
            >
              Device Model *
            </label>
            <div className="relative">
              <input
                id="lead-model"
                data-ocid="post_lead.model.input"
                type="text"
                className="w-full border rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{
                  borderColor: modelSelected ? "#1D4ED8" : "#e5e7eb",
                  color: "#1E293B",
                }}
                placeholder="Type to search model..."
                value={modelInputText}
                onChange={(e) => handleModelInput(e.target.value)}
                onBlur={() =>
                  setTimeout(() => setShowModelDropdown(false), 180)
                }
                onFocus={() => {
                  if (modelInputText && modelResults.length > 0)
                    setShowModelDropdown(true);
                }}
                autoComplete="off"
              />
              {modelLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              )}
              {modelSelected && (
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "#dcfce7", color: "#166534" }}
                >
                  ✓
                </span>
              )}
            </div>
            {showModelDropdown && modelResults.length > 0 && (
              <div
                className="absolute left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-200 max-h-44 overflow-y-auto"
                style={{ zIndex: 10000, top: "100%", marginTop: "4px" }}
              >
                {modelResults.map((r) => (
                  <button
                    type="button"
                    key={r.key}
                    className="w-full px-3 py-2.5 text-left text-sm font-semibold hover:bg-blue-50 flex items-center justify-between"
                    style={{ color: "#1E293B" }}
                    onMouseDown={() => handleModelSelect(r)}
                  >
                    <span>{r.phone_name}</span>
                    <span
                      className="text-[10px] font-medium"
                      style={{ color: "#9CA3AF" }}
                    >
                      {r.brand}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {!modelSelected && modelInputText && !modelLoading && (
              <p className="text-[10px] text-amber-600 mt-0.5">
                Please select a model from the list
              </p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label
              htmlFor="lead-qty"
              className="text-xs font-semibold text-gray-500 mb-1 block"
            >
              Quantity *
            </label>
            <input
              id="lead-qty"
              data-ocid="post_lead.quantity.input"
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              min="1"
              step="1"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              placeholder="e.g. 10"
              value={quantity}
              onChange={(e) => {
                // Only allow positive integers
                const val = e.target.value.replace(/[^0-9]/g, "");
                setQuantity(val);
              }}
              onKeyDown={(e) => {
                if (["-", "+", ".", "e", "E"].includes(e.key))
                  e.preventDefault();
              }}
            />
          </div>

          {/* Budget */}
          <div>
            <label
              htmlFor="lead-budget"
              className="text-xs font-semibold text-gray-500 mb-1 block"
            >
              Budget per unit (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                ₹
              </span>
              <input
                id="lead-budget"
                data-ocid="post_lead.budget.input"
                type="tel"
                inputMode="decimal"
                className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
                placeholder="e.g. 85000"
                value={budget}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setBudget(val);
                }}
              />
            </div>
          </div>

          <button
            type="button"
            data-ocid="post_lead.submit_button"
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all"
            style={
              isValid
                ? { background: "#1D4ED8" }
                : { background: "#9CA3AF", cursor: "not-allowed" }
            }
          >
            Post Buying Lead
          </button>
        </div>
      </div>
    </>
  );
}
