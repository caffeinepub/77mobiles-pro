import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SendOfferScreen() {
  const navigate = useNavigate();
  const demand = (() => {
    try {
      return JSON.parse(localStorage.getItem("77m_send_offer") || "{}");
    } catch {
      return {};
    }
  })();

  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");
  const [storage, setStorage] = useState("128GB");
  const [color, setColor] = useState("");

  const handleSend = () => {
    toast.success("Custom offer sent successfully!");
    navigate({ to: "/app" });
  };

  return (
    <div className="mobile-container bg-[#F8F9FA] min-h-screen flex flex-col">
      <header className="bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-200">
        <button
          type="button"
          data-ocid="send_offer.back.button"
          onClick={() => navigate({ to: "/app" })}
          className="flex items-center gap-1 text-[#007AFF]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-semibold">Back</span>
        </button>
        <h1 className="font-black text-base text-gray-900 flex-1 text-center">
          Send Offer
        </h1>
        <div className="w-16" />
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-6">
        {/* Context card */}
        <div className="bg-[#E8F4FD] rounded-2xl p-4 border border-blue-200">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
            Market Demand
          </p>
          <p className="font-black text-sm text-gray-900">
            {demand.text || "Wanted: 10x iPhone 15 Pro"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Budget ₹{demand.budget || "85,000"} each ·{" "}
            {demand.dealer || "Verified Dealer #217"}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-4 space-y-4 border border-gray-200">
          <div>
            <label
              htmlFor="offer-price"
              className="text-xs font-semibold text-gray-500 block mb-1"
            >
              Adjusted Price per Unit (₹)
            </label>
            <div className="flex items-center border border-gray-200 rounded-xl px-3 py-3 gap-2">
              <span className="text-gray-400 font-bold">₹</span>
              <input
                id="offer-price"
                data-ocid="send_offer.price.input"
                type="number"
                className="flex-1 text-sm font-bold text-gray-900 bg-transparent outline-none"
                placeholder="e.g. 82,000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="offer-qty"
              className="text-xs font-semibold text-gray-500 block mb-1"
            >
              Revised Quantity
            </label>
            <input
              id="offer-qty"
              data-ocid="send_offer.qty.input"
              type="number"
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm font-bold text-gray-900 outline-none"
              placeholder="e.g. 5"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="offer-storage"
              className="text-xs font-semibold text-gray-500 block mb-1"
            >
              Storage Capacity
            </label>
            <select
              id="offer-storage"
              data-ocid="send_offer.storage.select"
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm font-bold text-gray-900 outline-none bg-white"
              value={storage}
              onChange={(e) => setStorage(e.target.value)}
            >
              {["64GB", "128GB", "256GB", "512GB"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="offer-color"
              className="text-xs font-semibold text-gray-500 block mb-1"
            >
              Device Color
            </label>
            <input
              id="offer-color"
              data-ocid="send_offer.color.input"
              type="text"
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm font-bold text-gray-900 outline-none"
              placeholder="e.g. Titanium Black"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
        </div>

        {/* Image upload */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <p className="text-sm font-black text-gray-900 mb-3">Add Photos</p>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 bg-gray-50"
              >
                <Plus className="w-5 h-5 text-gray-400" />
                <span className="text-[9px] text-gray-400">Add</span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          data-ocid="send_offer.submit_button"
          onClick={handleSend}
          className="w-full py-4 rounded-2xl text-white font-black text-base flex items-center justify-center gap-2"
          style={{ background: "#007AFF" }}
        >
          <Send className="w-5 h-5" />
          Send Custom Offer
        </button>
      </div>
    </div>
  );
}
