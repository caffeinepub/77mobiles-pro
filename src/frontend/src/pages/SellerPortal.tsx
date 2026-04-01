import { useNavigate } from "@tanstack/react-router";
import {
  Calendar,
  CheckCircle,
  Download,
  Flame,
  LayoutGrid,
  LayoutList,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
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
    image: "📱",
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
    image: "✏️",
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
    image: "✅",
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
  const { searchQuery, sharedListings } = useApp();

  const [soldHistoryVisible, setSoldHistoryVisible] = useState(false);
  const [gridLoading, setGridLoading] = useState(true);
  const [listView, setListView] = useState<"list" | "grid">("list");

  useEffect(() => {
    const t = setTimeout(() => setGridLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  // Merge static + shared listings
  const allListings = [...sharedListings, ...SELLER_LISTINGS];

  const filtered = allListings.filter((l) => {
    const q = searchQuery.toLowerCase();
    return (
      q === "" ||
      l.model.toLowerCase().includes(q) ||
      l.title?.toLowerCase().includes(q)
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
              style={{ background: "#F5F5F7", color: "#666" }}
            >
              {DEMAND_FEED.length} Leads
            </span>
            {/* View All → */}
            <button
              type="button"
              data-ocid="seller.demand.view_all.button"
              onClick={() => navigate({ to: "/market-demand" })}
              className="ml-auto text-[11px] font-bold"
              style={{
                color: "#1D4ED8",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              View All →
            </button>
          </div>
          <div
            className="flex gap-2.5 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            {DEMAND_FEED.map((item, idx) => (
              <div
                key={item.id}
                data-ocid={`seller.demand.item.${idx + 1}`}
                className="bg-white rounded-xl p-1.5 flex flex-col justify-between flex-shrink-0"
                style={{
                  minWidth: "105px",
                  maxWidth: "115px",
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
                  <span className="text-[8px] font-bold text-red-500 uppercase tracking-wide">
                    Live
                  </span>
                </div>

                <div className="mb-2">
                  <div
                    className="w-5 h-5 rounded-lg flex items-center justify-center mb-1"
                    style={{ background: "#fff7ed" }}
                  >
                    <Flame className="w-4 h-4 text-orange-500" />
                  </div>
                  <p className="font-bold text-[10px] text-gray-900 leading-snug mb-1">
                    {item.text}
                  </p>
                  <p className="text-[8px] text-gray-500">
                    ₹{item.budget} each
                  </p>
                  <p className="text-[8px] text-gray-400 mt-0.5 truncate">
                    {item.dealer}
                  </p>
                  <p
                    className="text-[7px] font-semibold mt-0.5"
                    style={{ color: "#1D4ED8" }}
                  >
                    3 dealers viewing
                  </p>
                </div>
                <button
                  type="button"
                  data-ocid={`seller.fulfill_lead.button.${idx + 1}`}
                  onClick={() => handleFulfillLead(item)}
                  className="w-full flex items-center justify-center gap-1 py-0.5 rounded-lg text-[8px] font-bold text-white transition-all"
                  style={{ background: "#1D4ED8" }}
                >
                  FULFILL LEAD
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* My Listings header with view toggle */}
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="font-black text-sm text-gray-900">
            {soldHistoryVisible ? "Sold History" : "My Listings"}
          </span>
          {!soldHistoryVisible && (
            <span
              style={{ color: "#94A3B8", fontSize: "12px", fontWeight: 500 }}
            >
              {allListings.length} total
            </span>
          )}
          {/* View toggle */}
          {!soldHistoryVisible && (
            <div className="flex items-center gap-1 ml-auto">
              <button
                type="button"
                data-ocid="seller.listings.list_view.toggle"
                onClick={() => setListView("list")}
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                style={{
                  background: listView === "list" ? "#1D4ED8" : "white",
                  border: "1px solid #e5e7eb",
                  color: listView === "list" ? "white" : "#9CA3AF",
                }}
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                data-ocid="seller.listings.grid_view.toggle"
                onClick={() => setListView("grid")}
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                style={{
                  background: listView === "grid" ? "#1D4ED8" : "white",
                  border: "1px solid #e5e7eb",
                  color: listView === "grid" ? "white" : "#9CA3AF",
                }}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
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
            {soldHistoryVisible ? "← Listings" : "Sold History"}
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
                  ₹{totalRevenue.toLocaleString("en-IN")}
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
                          {soldDates[idx] ?? "2026-03-01"} ·{" "}
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
                          {item.date} · {item.buyer}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className="font-black text-[14px]"
                          style={{ color: "#16a34a" }}
                        >
                          ₹
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
            {gridLoading ? (
              <div
                className={
                  listView === "grid"
                    ? "grid grid-cols-2 gap-2.5 pb-2"
                    : "space-y-2.5 pb-2"
                }
              >
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl overflow-hidden"
                    style={{ border: "1px solid #e5e7eb" }}
                  >
                    <div className="animate-pulse">
                      {listView === "grid" ? (
                        <>
                          <div
                            className="w-full aspect-square"
                            style={{ background: "#DBEAFE" }}
                          />
                          <div className="p-3 space-y-2">
                            <div
                              className="h-3 rounded w-3/4"
                              style={{ background: "#DBEAFE" }}
                            />
                            <div
                              className="h-3.5 rounded w-2/3"
                              style={{ background: "#DBEAFE" }}
                            />
                          </div>
                        </>
                      ) : (
                        <div className="p-3 flex gap-3">
                          <div
                            className="w-16 h-16 rounded-xl"
                            style={{ background: "#DBEAFE" }}
                          />
                          <div className="flex-1 space-y-2 pt-1">
                            <div
                              className="h-3 rounded w-3/4"
                              style={{ background: "#DBEAFE" }}
                            />
                            <div
                              className="h-2.5 rounded w-1/2"
                              style={{ background: "#DBEAFE" }}
                            />
                            <div
                              className="h-3.5 rounded w-2/3"
                              style={{ background: "#DBEAFE" }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div
                data-ocid="seller.listings.empty_state"
                className="bg-white rounded-2xl p-8 text-center"
                style={{ border: "1px solid #e5e7eb" }}
              >
                <p className="font-bold text-sm text-gray-400">
                  No listings found
                </p>
              </div>
            ) : listView === "grid" ? (
              // ─── Grid View (2 columns) ───
              <div className="grid grid-cols-2 gap-2.5 pb-2">
                {filtered.map((listing, idx) => {
                  const isActive = listing.status === "Active";
                  return (
                    <div
                      key={listing.listingId ?? idx}
                      data-ocid={`seller.listing.item.${idx + 1}`}
                      className="bg-white rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                      style={{
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                        border: "1px solid #e5e7eb",
                      }}
                      onClick={() =>
                        navigate({ to: `/listing/${listing.listingId}` })
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        navigate({ to: `/listing/${listing.listingId}` })
                      }
                    >
                      <div
                        className="relative w-full"
                        style={{
                          aspectRatio: "1/1",
                          background: "#F4F7FF",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={
                            listing.imageUrl || getDeviceImage(listing.model)
                          }
                          alt={listing.model}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <span
                          className="absolute top-1.5 left-1.5 text-[8px] font-bold px-1 py-0.5 rounded-full"
                          style={{
                            background: isActive ? "#F0FDF4" : "#F3F4F6",
                            color: isActive ? "#166534" : "#4b5563",
                          }}
                        >
                          {listing.status}
                        </span>
                        {listing.auctionType && (
                          <span
                            className="absolute top-1.5 right-1.5 text-[8px] font-bold px-1 py-0.5 rounded-full flex items-center gap-0.5"
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
                              <Zap className="w-2 h-2" strokeWidth={1.5} />
                            ) : (
                              <Calendar className="w-2 h-2" strokeWidth={1.5} />
                            )}
                          </span>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="font-bold text-[11px] text-[#1E293B] truncate leading-tight">
                          {listing.title || listing.model}
                        </p>
                        <p
                          className="font-black text-[13px] mt-0.5"
                          style={{ color: "#1D4ED8" }}
                        >
                          {formatINR(listing.basePrice)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // ─── List View (single column) ───
              <div className="space-y-2.5 pb-2">
                {filtered.map((listing, idx) => {
                  const isActive = listing.status === "Active";
                  return (
                    <div
                      key={listing.listingId ?? idx}
                      data-ocid={`seller.listing.item.${idx + 1}`}
                      className="bg-white rounded-2xl overflow-hidden cursor-pointer active:scale-[0.99] transition-transform"
                      style={{
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                        border: "1px solid #e5e7eb",
                      }}
                      onClick={() =>
                        navigate({ to: `/listing/${listing.listingId}` })
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        navigate({ to: `/listing/${listing.listingId}` })
                      }
                    >
                      <div className="p-3 flex gap-3 items-center">
                        <div
                          className="relative flex-shrink-0"
                          style={{
                            width: "64px",
                            height: "64px",
                            background: "#F4F7FF",
                            borderRadius: "12px",
                            overflow: "hidden",
                            boxShadow: "inset 0 0 0 1px #E2E8F0",
                          }}
                        >
                          <img
                            src={
                              listing.imageUrl || getDeviceImage(listing.model)
                            }
                            alt={listing.model}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-[13px] text-[#1E293B] truncate leading-tight mb-0.5">
                            {listing.title || listing.model}
                          </p>
                          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                            <span
                              className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                              style={{
                                background: isActive ? "#F0FDF4" : "#F3F4F6",
                                color: isActive ? "#166534" : "#4b5563",
                              }}
                            >
                              {listing.status}
                            </span>
                            {listing.usbVerified && (
                              <span
                                className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                                style={{
                                  background: "#D1FAE5",
                                  color: "#065F46",
                                }}
                              >
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400">
                            {listing.condition}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p
                            className="font-black text-[14px]"
                            style={{ color: "#1D4ED8" }}
                          >
                            {formatINR(listing.basePrice)}
                          </p>
                          {isActive && listing.endsAt && (
                            <div className="mt-1">
                              <AuctionTimer
                                endsAt={listing.endsAt}
                                auctionType={listing.auctionType}
                                status={listing.status}
                              />
                            </div>
                          )}
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
