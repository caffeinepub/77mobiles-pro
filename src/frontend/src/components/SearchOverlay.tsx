import {
  ArrowLeft,
  Clock,
  ScanBarcode,
  Search,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const FILTER_CHIPS = [
  "All",
  "Smartphones",
  "Laptops",
  "Tablets",
  "Watches",
  "Accessories",
];

const LIVE_MATCHES = [
  {
    id: "l1",
    model: "iPhone 16 Pro 256GB",
    price: "₹82,000",
    timer: "14:22",
    badge: "LIVE",
  },
  {
    id: "l2",
    model: "Samsung S25 Ultra",
    price: "₹74,500",
    timer: "02:44",
    badge: "LIVE",
  },
  {
    id: "l3",
    model: "OnePlus 12 Pro 512GB",
    price: "₹45,000",
    timer: "31:07",
    badge: "LIVE",
  },
];

const RECENTLY_SOLD = [
  {
    id: "s1",
    model: "iPhone 15 Pro Max",
    soldPrice: "₹78,500",
    ago: "2 days ago",
  },
  {
    id: "s2",
    model: "MacBook Pro M3",
    soldPrice: "₹1,24,000",
    ago: "3 days ago",
  },
  {
    id: "s3",
    model: "Google Pixel 9",
    soldPrice: "₹52,000",
    ago: "5 days ago",
  },
];

const INVENTORY_RESULTS = [
  {
    id: "i1",
    model: "iPhone 16 Pro",
    condition: "Like New",
    price: "₹82,000",
    bids: 7,
    timer: "14:22",
  },
  {
    id: "i2",
    model: "Samsung S25 Ultra",
    condition: "Excellent",
    price: "₹74,500",
    bids: 4,
    timer: "02:44",
  },
  {
    id: "i3",
    model: "OnePlus 12 Pro",
    condition: "Good",
    price: "₹45,000",
    bids: 2,
    timer: "31:07",
  },
  {
    id: "i4",
    model: "Xiaomi 14 Ultra",
    condition: "Like New",
    price: "₹56,000",
    bids: 5,
    timer: "08:15",
  },
];

const MARKET_TRENDS = [
  {
    id: "t1",
    model: "iPhone 15 Pro Max",
    soldPrice: "₹78,500",
    date: "Mar 30",
    trend: "+2%",
  },
  {
    id: "t2",
    model: "MacBook Pro M3",
    soldPrice: "₹1,24,000",
    date: "Mar 29",
    trend: "+5%",
  },
  {
    id: "t3",
    model: "Samsung S24 Ultra",
    soldPrice: "₹62,000",
    date: "Mar 28",
    trend: "-1%",
  },
  {
    id: "t4",
    model: "Google Pixel 9",
    soldPrice: "₹52,000",
    date: "Mar 27",
    trend: "+3%",
  },
  {
    id: "t5",
    model: "iPad Pro M4",
    soldPrice: "₹94,000",
    date: "Mar 26",
    trend: "+1%",
  },
];

const BUYER_LEADS = [
  {
    id: "b1",
    model: "iPhone 13 Pro Max",
    budget: "₹55,000",
    qty: 10,
    viewers: 4,
  },
  {
    id: "b2",
    model: "Samsung S23 Ultra",
    budget: "₹48,000",
    qty: 5,
    viewers: 2,
  },
  { id: "b3", model: "MacBook Air M2", budget: "₹85,000", qty: 3, viewers: 6 },
];

interface Props {
  onClose: () => void;
}

export default function SearchOverlay({ onClose }: Props) {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeSort, setActiveSort] = useState<"ending" | "demand">("ending");
  const [activeResultTab, setActiveResultTab] = useState<
    "inventory" | "trends" | "leads"
  >("inventory");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (query.trim().length > 0) setSubmitted(true);
  };

  const handleScanInSearch = async () => {
    if (!("BarcodeDetector" in window)) {
      const imei = window.prompt("Enter IMEI or barcode manually:");
      if (imei) {
        setQuery(imei);
        setTimeout(() => {
          if (imei.trim().length > 0) setSubmitted(true);
        }, 100);
      }
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      await video.play();

      const detector = new (window as any).BarcodeDetector({
        formats: ["ean_13", "code_128", "qr_code", "code_39"],
      });

      const overlay = document.createElement("div");
      overlay.style.cssText =
        "position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;";
      video.style.cssText = "width:100%;max-width:430px;height:auto;";
      const closeBtn = document.createElement("button");
      closeBtn.textContent = "Cancel";
      closeBtn.style.cssText =
        "margin-top:16px;padding:12px 32px;background:#1D4ED8;color:white;border:none;border-radius:8px;font-size:16px;cursor:pointer;";
      overlay.appendChild(video);
      overlay.appendChild(closeBtn);
      document.body.appendChild(overlay);

      let scanning = true;
      closeBtn.onclick = () => {
        scanning = false;
        for (const t of stream.getTracks()) t.stop();
        if (document.body.contains(overlay)) document.body.removeChild(overlay);
      };

      const scan = async () => {
        if (!scanning) return;
        try {
          const barcodes = await detector.detect(video);
          if (barcodes.length > 0) {
            scanning = false;
            for (const t of stream.getTracks()) t.stop();
            if (document.body.contains(overlay))
              document.body.removeChild(overlay);
            const val = barcodes[0].rawValue;
            setQuery(val);
            setTimeout(() => {
              if (val.trim().length > 0) setSubmitted(true);
            }, 100);
          } else {
            requestAnimationFrame(scan);
          }
        } catch {
          requestAnimationFrame(scan);
        }
      };
      requestAnimationFrame(scan);
    } catch (err) {
      console.error("Scanner error", err);
      const imei = window.prompt("Camera not available. Enter IMEI manually:");
      if (imei) {
        setQuery(imei);
        setTimeout(() => {
          if (imei.trim().length > 0) setSubmitted(true);
        }, 100);
      }
    }
  };

  const showSuggestions = query.length > 0 && !submitted;

  return (
    <div
      className="fixed inset-0 bg-white flex flex-col"
      style={{ zIndex: 100 }}
      data-ocid="search.modal"
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ borderBottom: "1px solid #E2E8F0" }}
      >
        <button
          type="button"
          data-ocid="search.close_button"
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full"
          style={{ background: "#F8FAFC" }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: "#1E293B" }} />
        </button>
        <div
          className="flex-1 flex items-center gap-2 rounded-2xl px-3 py-2"
          style={{ background: "#F8FAFC", border: "1.5px solid #1D4ED8" }}
        >
          <Search
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "#1D4ED8" }}
          />
          <input
            ref={inputRef}
            data-ocid="search.input"
            type="text"
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: "#1E293B" }}
            placeholder="Search Model, Brand, or IMEI"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSubmitted(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>
        <button
          type="button"
          data-ocid="search.scan_button"
          onClick={handleScanInSearch}
          className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0"
          style={{ background: "#EFF6FF" }}
        >
          <ScanBarcode className="w-5 h-5" style={{ color: "#1D4ED8" }} />
        </button>
      </div>

      {/* Filter chips + sort */}
      <div
        className="px-4 py-2 flex items-center gap-2 overflow-x-auto"
        style={{ scrollbarWidth: "none", borderBottom: "1px solid #F1F5F9" }}
      >
        {FILTER_CHIPS.map((chip) => {
          const active = activeFilter === chip;
          return (
            <button
              key={chip}
              type="button"
              data-ocid={`search.filter.${chip.toLowerCase()}.tab`}
              onClick={() => setActiveFilter(chip)}
              className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all"
              style={{
                background: active ? "#1D4ED8" : "#F1F5F9",
                color: active ? "#fff" : "#6B7280",
              }}
            >
              {chip}
            </button>
          );
        })}
        <div
          className="flex-shrink-0 ml-auto flex items-center gap-1 rounded-full p-0.5"
          style={{ background: "#F1F5F9" }}
        >
          {(["ending", "demand"] as const).map((s) => (
            <button
              key={s}
              type="button"
              data-ocid={`search.sort.${s}.tab`}
              onClick={() => setActiveSort(s)}
              className="px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all"
              style={{
                background: activeSort === s ? "#1D4ED8" : "transparent",
                color: activeSort === s ? "#fff" : "#9CA3AF",
              }}
            >
              {s === "ending" ? "Ending Soon" : "Highest Demand"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Suggestions */}
        {showSuggestions && (
          <div className="px-4 pt-3">
            {/* Live Matches */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-3.5 h-3.5" style={{ color: "#1D4ED8" }} />
                <span
                  className="text-xs font-bold"
                  style={{ color: "#1D4ED8" }}
                >
                  LIVE MATCHES
                </span>
              </div>
              {LIVE_MATCHES.filter(
                (m) =>
                  m.model.toLowerCase().includes(query.toLowerCase()) ||
                  query.length < 2,
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  data-ocid={`search.live_match.${m.id}.button`}
                  onClick={handleSubmit}
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl mb-1 hover:bg-blue-50 transition-colors"
                  style={{ border: "1px solid #EFF6FF" }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                      style={{ background: "#FEF2F2", color: "#EF4444" }}
                    >
                      {m.badge}
                    </span>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "#1E293B" }}
                    >
                      {m.model}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-bold"
                      style={{ color: "#1D4ED8" }}
                    >
                      {m.price}
                    </span>
                    <span className="text-[10px]" style={{ color: "#9CA3AF" }}>
                      {m.timer}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Recently Sold */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-3.5 h-3.5" style={{ color: "#6B7280" }} />
                <span
                  className="text-xs font-bold"
                  style={{ color: "#6B7280" }}
                >
                  RECENTLY SOLD
                </span>
              </div>
              {RECENTLY_SOLD.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  data-ocid={`search.sold.${s.id}.button`}
                  onClick={handleSubmit}
                  className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl mb-1 hover:bg-gray-50"
                >
                  <span className="text-sm" style={{ color: "#1E293B" }}>
                    {s.model}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-semibold"
                      style={{
                        background: "#1D4ED8",
                        color: "#fff",
                        padding: "2px 8px",
                        borderRadius: "20px",
                        fontSize: "11px",
                      }}
                    >
                      {s.soldPrice}
                    </span>
                    <span className="text-[10px]" style={{ color: "#9CA3AF" }}>
                      {s.ago}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {submitted && (
          <div>
            {/* Result tabs */}
            <div
              className="flex px-4 pt-3 gap-2 overflow-x-auto"
              style={{ scrollbarWidth: "none" }}
            >
              {(
                [
                  { id: "inventory", label: "Live Inventory" },
                  { id: "trends", label: "Market Trends" },
                  { id: "leads", label: "Buyer Leads" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  data-ocid={`search.result.${tab.id}.tab`}
                  onClick={() => setActiveResultTab(tab.id)}
                  className="flex-shrink-0 pb-2 text-sm font-semibold transition-colors"
                  style={{
                    color: activeResultTab === tab.id ? "#1D4ED8" : "#9CA3AF",
                    borderBottom:
                      activeResultTab === tab.id
                        ? "2px solid #1D4ED8"
                        : "2px solid transparent",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div
              style={{ height: "1px", background: "#E2E8F0", margin: "0 16px" }}
            />

            <div className="px-4 pt-3 pb-4">
              {/* A) Live Inventory */}
              {activeResultTab === "inventory" && (
                <div className="flex flex-col gap-2">
                  {INVENTORY_RESULTS.map((item, idx) => (
                    <div
                      key={item.id}
                      data-ocid={`search.inventory.item.${idx + 1}`}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{
                        background: "#fff",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div
                        className="flex-shrink-0 rounded-lg flex items-center justify-center"
                        style={{
                          width: "52px",
                          height: "52px",
                          background: "#EFF6FF",
                        }}
                      >
                        <span style={{ fontSize: "22px" }}>📱</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-bold truncate"
                          style={{ color: "#1E293B" }}
                        >
                          {item.model}
                        </p>
                        <p className="text-xs" style={{ color: "#9CA3AF" }}>
                          {item.condition} · {item.bids} bids
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span
                          className="text-sm font-bold"
                          style={{ color: "#1D4ED8" }}
                        >
                          {item.price}
                        </span>
                        <span
                          className="text-[10px]"
                          style={{ color: "#EF4444" }}
                        >
                          {item.timer}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* B) Market Trends */}
              {activeResultTab === "trends" && (
                <div className="flex flex-col gap-2">
                  {MARKET_TRENDS.map((t, idx) => (
                    <div
                      key={t.id}
                      data-ocid={`search.trends.item.${idx + 1}`}
                      className="flex items-center justify-between py-3 px-3 rounded-xl"
                      style={{
                        background: idx % 2 === 0 ? "#fff" : "#F8FAFC",
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      <div>
                        <p
                          className="text-sm font-semibold"
                          style={{ color: "#1E293B" }}
                        >
                          {t.model}
                        </p>
                        <p className="text-xs" style={{ color: "#9CA3AF" }}>
                          {t.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: "#1D4ED8",
                            color: "#fff",
                            fontSize: "11px",
                          }}
                        >
                          {t.soldPrice}
                        </span>
                        <span
                          className="text-xs font-semibold"
                          style={{
                            color: t.trend.startsWith("+")
                              ? "#16a34a"
                              : "#dc2626",
                          }}
                        >
                          {t.trend}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* C) Buyer Leads */}
              {activeResultTab === "leads" && (
                <div className="flex flex-col gap-3">
                  {BUYER_LEADS.map((lead, idx) => (
                    <div
                      key={lead.id}
                      data-ocid={`search.leads.item.${idx + 1}`}
                      className="p-4 rounded-xl"
                      style={{
                        background: "#fff",
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p
                            className="text-sm font-bold"
                            style={{ color: "#1E293B" }}
                          >
                            {lead.model}
                          </p>
                          <p className="text-xs" style={{ color: "#6B7280" }}>
                            Wants {lead.qty} units · Budget {lead.budget}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{
                              background: "#EF4444",
                              animation: "pulse 1.5s infinite",
                            }}
                          />
                          <span
                            className="text-[10px] font-bold"
                            style={{ color: "#EF4444" }}
                          >
                            LIVE
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[11px]"
                          style={{ color: "#9CA3AF" }}
                        >
                          <Users
                            className="inline w-3 h-3 mr-0.5"
                            style={{ color: "#9CA3AF" }}
                          />
                          {lead.viewers} dealers viewing this lead
                        </span>
                        <button
                          type="button"
                          data-ocid={`search.leads.fulfill.${idx + 1}.button`}
                          className="px-3 py-1 rounded-lg text-xs font-bold"
                          style={{ background: "#1D4ED8", color: "#fff" }}
                        >
                          FULFILL LEAD
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!showSuggestions && !submitted && (
          <div
            className="flex flex-col items-center justify-center py-16 px-6"
            data-ocid="search.empty_state"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ background: "#EFF6FF" }}
            >
              <TrendingUp className="w-8 h-8" style={{ color: "#1D4ED8" }} />
            </div>
            <p
              className="text-base font-semibold text-center mb-1"
              style={{ color: "#1E293B" }}
            >
              Search the Market
            </p>
            <p className="text-sm text-center" style={{ color: "#9CA3AF" }}>
              Find live listings, market prices, and buyer leads in one place.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
