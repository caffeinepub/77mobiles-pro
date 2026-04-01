import { useNavigate } from "@tanstack/react-router";
import { Calendar, CheckCircle, Download, Flame, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import AuctionTimer from "../components/AuctionTimer";
import PortalCarousel from "../components/PortalCarousel";
import type { CarouselSlide } from "../components/PortalCarousel";
import RecentSalesSlider from "../components/RecentSalesSlider";
import { useApp } from "../contexts/AppContext";
import { SELLER_LISTINGS, getDeviceImage } from "../data/demoListings";
import { formatINR } from "../utils/format";

const SELLER_CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: "s1",
    bgColor: "#F8F9FA",
    theme: "light",
    accentColor: "#1D4ED8",
    badge: { text: "IDENTIFY YOUR DEVICE", pulse: false },
    title: "Identify Your Device",
    subtitle: "Scan your IMEI to instantly get device specs and market value",
    ctaText: "Start Now",
    image: "\uD83D\uDCF1",
  },
  {
    id: "s2",
    bgColor: "#F8F9FA",
    theme: "light",
    accentColor: "#1D4ED8",
    badge: { text: "CUSTOMIZE YOUR LISTING" },
    title: "Customize Your Listing",
    subtitle: "Set your price, add photos, and reach 500+ verified B2B buyers",
    ctaText: "List Now",
    image: "\u270F\uFE0F",
  },
  {
    id: "s3",
    bgColor: "#F8F9FA",
    theme: "light",
    accentColor: "#1D4ED8",
    badge: { text: "VERIFY AND PUBLISH" },
    title: "Verify and Publish",
    subtitle: "Get the 77mobiles Certified badge and 3x more buyer trust",
    ctaText: "Get Verified",
    image: "\u2705",
  },
];

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
];

// Task 7B: Fixed demo sold history data
const SOLD_HISTORY_EXTRA = [
  {
    model: "Samsung Galaxy Z Fold6",
    condition: "Like New",
    basePrice: 11000000n,
    date: "2026-03-01",
    buyer: "Dealer #117",
  },
  {
    model: "iPhone 15 Pro",
    condition: "Good",
    basePrice: 7500000n,
    date: "2026-03-05",
    buyer: "Dealer #284",
  },
  {
    model: "OnePlus 12",
    condition: "Fair",
    basePrice: 3800000n,
    date: "2026-03-09",
    buyer: "Dealer #456",
  },
];

function conditionColor(c: string) {
  if (c === "Like New" || c === "New")
    return { bg: "#eff6ff", text: "#1D4ED8" };
  if (c === "Good") return { bg: "#f0fdf4", text: "#166534" };
  if (c === "Fair") return { bg: "#fff7ed", text: "#c2410c" };
  if (c === "Excellent") return { bg: "#f0fdf4", text: "#166534" };
  return { bg: "#f9fafb", text: "#1E293B" };
}

export default function SellerPortal() {
  const navigate = useNavigate();
  const { searchQuery } = useApp();

  const [soldHistoryVisible, setSoldHistoryVisible] = useState(false);

  const filtered = SELLER_LISTINGS.filter((l) => {
    const q = searchQuery.toLowerCase();
    return (
      q === "" ||
      l.model.toLowerCase().includes(q) ||
      l.title.toLowerCase().includes(q)
    );
  });

  const soldListings = SELLER_LISTINGS.filter((l) => l.status === "Sold");
  const soldDates = [
    "2026-03-28",
    "2026-03-24",
    "2026-03-20",
    "2026-03-15",
    "2026-03-10",
  ];
  const soldBuyers = [
    "Dealer #217",
    "Dealer #189",
    "Dealer #341",
    "Dealer #502",
    "Dealer #78",
  ];

  const totalRevenue =
    soldListings.reduce((sum, l) => sum + Number(l.basePrice) / 100, 0) +
    SOLD_HISTORY_EXTRA.reduce((sum, l) => sum + Number(l.basePrice) / 100, 0);

  const handleExportCSV = () => {
    const rows = [
      ["Model", "Condition", "Sold Price (INR)", "Date", "Buyer"],
      ...soldListings.map((item, i) => [
        item.model,
        item.condition,
        (Number(item.basePrice) / 100).toLocaleString("en-IN"),
        soldDates[i] ?? "2026-03-01",
        soldBuyers[i] ?? "Dealer #000",
      ]),
      ...SOLD_HISTORY_EXTRA.map((item) => [
        item.model,
        item.condition,
        (Number(item.basePrice) / 100).toLocaleString("en-IN"),
        item.date,
        item.buyer,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "77mobiles-sold-history.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Sold history exported!");
  };

  const handleFulfillLead = (item: (typeof DEMAND_FEED)[0]) => {
    localStorage.setItem("77m_send_offer", JSON.stringify(item));
    navigate({ to: "/send-offer" });
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-24">
      {/* Auto-sliding carousel */}
      <div className="px-3 pt-3 pb-3">
        <PortalCarousel slides={SELLER_CAROUSEL_SLIDES} intervalMs={5000} />
      </div>
      <RecentSalesSlider />

      <div className="px-3 space-y-4">
        {/* Market Demand — horizontal scroll */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-black text-sm text-gray-900">
              Market Demand
            </span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white ml-1"
              style={{ background: "#F5F5F7" }}
            >
              {DEMAND_FEED.length} Leads
            </span>
          </div>
          <div
            className="flex gap-2.5 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            {DEMAND_FEED.map((item, idx) => (
              <div
                key={item.id}
                data-ocid={`seller.demand.item.${idx + 1}`}
                className="bg-white rounded-xl p-2 flex flex-col justify-between flex-shrink-0"
                style={{
                  minWidth: "120px",
                  maxWidth: "130px",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                }}
              >
                {/* Pulsing red Live indicator */}
                <div className="flex items-center gap-1 mb-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                  <span className="text-[9px] font-bold text-red-500 uppercase tracking-wide">
                    Live
                  </span>
                </div>

                <div className="mb-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center mb-2"
                    style={{ background: "#fff7ed" }}
                  >
                    <Flame className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="font-bold text-xs text-gray-900 leading-snug mb-1">
                    {item.text}
                  </p>
                  <p className="text-[9px] text-gray-500">
                    {"\u20B9"}
                    {item.budget} each
                  </p>
                  <p className="text-[9px] text-gray-400 mt-0.5 truncate">
                    {item.dealer}
                  </p>
                  {/* Social proof */}
                  <p
                    className="text-[8px] font-semibold mt-1"
                    style={{ color: "#1D4ED8" }}
                  >
                    3 other dealers are viewing this lead
                  </p>
                </div>
                <button
                  type="button"
                  data-ocid={`seller.fulfill_lead.button.${idx + 1}`}
                  onClick={() => handleFulfillLead(item)}
                  className="w-full flex items-center justify-center gap-1 py-1 rounded-lg text-[9px] font-bold text-white transition-all"
                  style={{ background: "#1D4ED8" }}
                >
                  FULFILL LEAD
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* My Listings header with Sold History toggle */}
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="font-black text-sm text-gray-900">
            {soldHistoryVisible ? "Sold History" : "My Listings"}
          </span>
          {!soldHistoryVisible && (
            <span className="text-xs text-gray-400 ml-auto">
              {SELLER_LISTINGS.length} total
            </span>
          )}
          <button
            type="button"
            data-ocid="seller.sold_history.toggle"
            onClick={() => setSoldHistoryVisible((v) => !v)}
            className="text-[11px] font-bold px-2.5 py-1 rounded-full transition-all"
            style={{
              background: soldHistoryVisible ? "#1D4ED8" : "white",
              color: soldHistoryVisible ? "white" : "#1E293B",
              border: "1px solid #e5e7eb",
              marginLeft: soldHistoryVisible ? undefined : "0",
            }}
          >
            {soldHistoryVisible ? "\u2190 Listings" : "Sold History"}
          </button>
        </div>

        {/* Sold History View */}
        {soldHistoryVisible ? (
          <div>
            <div
              className="bg-white rounded-2xl p-4 mb-3 flex items-center justify-between"
              style={{ border: "1px solid #e5e7eb" }}
            >
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Total Revenue</p>
                <p className="font-black text-xl" style={{ color: "#1D4ED8" }}>
                  {"\u20B9"}
                  {totalRevenue.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-gray-400">
                  {soldListings.length + SOLD_HISTORY_EXTRA.length} devices sold
                </p>
              </div>
              <button
                type="button"
                data-ocid="seller.export_csv.button"
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: "#1D4ED8" }}
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>

            <div className="space-y-2.5 pb-2">
              {soldListings.map((listing, idx) => {
                const cond = conditionColor(listing.condition);
                return (
                  <div
                    key={listing.listingId}
                    data-ocid={`seller.sold.item.${idx + 1}`}
                    className="bg-white rounded-2xl overflow-hidden"
                    style={{
                      boxShadow: "0 2px 6px rgba(0,0,0,0.07)",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div className="p-3 flex gap-3 items-center">
                      <img
                        src={getDeviceImage(listing.model)}
                        alt={listing.model}
                        className="rounded-xl object-cover flex-shrink-0"
                        style={{ width: "52px", height: "52px" }}
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[13px] text-[#1E293B] truncate leading-tight mb-0.5">
                          {listing.model}
                        </p>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                            style={{ background: cond.bg, color: cond.text }}
                          >
                            {listing.condition}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            Sold
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400">
                          {soldDates[idx] ?? "2026-03-01"} {"\xB7"}{" "}
                          {soldBuyers[idx] ?? "Dealer #000"}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className="font-black text-[14px]"
                          style={{ color: "#16a34a" }}
                        >
                          {formatINR(listing.basePrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {SOLD_HISTORY_EXTRA.map((item, idx) => {
                const cond = conditionColor(item.condition);
                return (
                  <div
                    key={`extra-${item.model}-${item.date}`}
                    data-ocid={`seller.sold.item.${soldListings.length + idx + 1}`}
                    className="bg-white rounded-2xl overflow-hidden"
                    style={{
                      boxShadow: "0 2px 6px rgba(0,0,0,0.07)",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div className="p-3 flex gap-3 items-center">
                      <img
                        src={getDeviceImage(item.model)}
                        alt={item.model}
                        className="rounded-xl object-cover flex-shrink-0"
                        style={{ width: "52px", height: "52px" }}
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[13px] text-[#1E293B] truncate leading-tight mb-0.5">
                          {item.model}
                        </p>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                            style={{ background: cond.bg, color: cond.text }}
                          >
                            {item.condition}
                          </span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            Sold
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400">
                          {item.date} {"\xB7"} {item.buyer}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className="font-black text-[14px]"
                          style={{ color: "#16a34a" }}
                        >
                          {"\u20B9"}
                          {(Number(item.basePrice) / 100).toLocaleString(
                            "en-IN",
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── Normal My Listings view ── */
          <div>
            {filtered.length === 0 ? (
              <div
                data-ocid="seller.listings.empty_state"
                className="bg-white rounded-2xl p-8 text-center"
                style={{ border: "1px solid #e5e7eb" }}
              >
                <p className="font-bold text-sm text-gray-400">
                  No listings found
                </p>
              </div>
            ) : (
              <div className="space-y-3 pb-2">
                {filtered.map((listing, idx) => {
                  const cond = conditionColor(listing.condition);
                  return (
                    <div
                      key={listing.listingId}
                      data-ocid={`seller.listing.item.${idx + 1}`}
                      className="bg-white rounded-xl overflow-hidden"
                      style={{
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      {/* Main row */}
                      <div className="p-4 flex gap-3">
                        {/* Left: device image */}
                        <button
                          type="button"
                          className="flex-shrink-0"
                          onClick={() =>
                            navigate({ to: `/listing/${listing.listingId}` })
                          }
                        >
                          <img
                            src={getDeviceImage(listing.model)}
                            alt={listing.model}
                            className="object-cover rounded-xl"
                            style={{ width: "72px", height: "72px" }}
                            loading="lazy"
                          />
                        </button>

                        {/* Center: model name, condition, price */}
                        <button
                          type="button"
                          className="flex-1 min-w-0 text-left"
                          onClick={() =>
                            navigate({ to: `/listing/${listing.listingId}` })
                          }
                        >
                          <p className="font-bold text-[15px] text-[#1E293B] truncate leading-tight mb-1">
                            {listing.model}
                          </p>
                          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                            <span
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                              style={{ background: cond.bg, color: cond.text }}
                            >
                              {listing.condition}
                            </span>
                            {listing.usbVerified && (
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{
                                  background: "#F0FDF4",
                                  color: "#166534",
                                }}
                              >
                                {"\u2713"} VERIFIED
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-gray-400 font-medium">
                              Base
                            </span>
                            <span
                              className="font-black text-[15px]"
                              style={{ color: "#1D4ED8" }}
                            >
                              {formatINR(listing.basePrice)}
                            </span>
                          </div>
                        </button>

                        {/* Right: status badge + timer */}
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0 pt-0.5">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background:
                                listing.status === "Active"
                                  ? "#F0FDF4"
                                  : "#F3F4F6",
                              color:
                                listing.status === "Active"
                                  ? "#166534"
                                  : "#4b5563",
                            }}
                          >
                            {listing.status}
                          </span>
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5"
                            style={{
                              background:
                                listing.auctionType === "Live20min"
                                  ? "#FEF2F2"
                                  : "#EFF6FF",
                              color:
                                listing.auctionType === "Live20min"
                                  ? "#DC2626"
                                  : "#1D4ED8",
                            }}
                          >
                            {listing.auctionType === "Live20min" ? (
                              <>
                                <Zap
                                  className="w-2.5 h-2.5"
                                  strokeWidth={1.5}
                                />
                                Live
                              </>
                            ) : (
                              <>
                                <Calendar
                                  className="w-2.5 h-2.5"
                                  strokeWidth={1.5}
                                />
                                7-Day
                              </>
                            )}
                          </span>
                          <AuctionTimer
                            endsAt={listing.endsAt}
                            auctionType={listing.auctionType}
                            status={listing.status}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
