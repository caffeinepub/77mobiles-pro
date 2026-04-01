import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../contexts/AppContext";

export default function PostLeadModal() {
  const { showPostLead, setShowPostLead } = useApp();
  const [model, setModel] = useState("");
  const [quantity, setQuantity] = useState("");
  const [budget, setBudget] = useState("");

  if (!showPostLead) return null;

  const handleSubmit = () => {
    if (!model || !quantity || !budget) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success("Buying lead posted! Sellers will be notified.");
    setModel("");
    setQuantity("");
    setBudget("");
    setShowPostLead(false);
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close modal"
        className="fixed inset-0 z-50 w-full h-full cursor-default"
        style={{ background: "rgba(0,0,0,0.5)" }}
        onClick={() => setShowPostLead(false)}
      />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-3xl p-6 z-[51]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-lg text-gray-900">Post Buying Lead</h2>
          <button type="button" onClick={() => setShowPostLead(false)}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="lead-model"
              className="text-xs font-semibold text-gray-500 mb-1 block"
            >
              Device Model *
            </label>
            <input
              id="lead-model"
              data-ocid="post_lead.model.input"
              type="text"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              placeholder="e.g. iPhone 16 Pro"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>
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
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              placeholder="e.g. 10"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
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
                type="number"
                className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm outline-none focus:border-blue-500"
                placeholder="e.g. 85000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
          </div>
          <button
            type="button"
            data-ocid="post_lead.submit_button"
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl text-white font-bold text-sm"
            style={{ background: "#007AFF" }}
          >
            Post Buying Lead
          </button>
        </div>
      </div>
    </>
  );
}
