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
import { BidStore } from "../stores/BidStore";
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
  const { searchQuery, sharedListings, setActiveTab } = useApp();

  const [gridLoading, setGridLoading] = useState(true);
  const [listView, setListView] = useState<"list" | "grid">("list");
  const [hideDemoListings, setHideDemoListings] = useState<boolean>(() => {
    return localStorage.getItem("77m_hide_demo") === "true";
  });

  // Task 5+6: Track current high bid per listing
  const [bidMap, setBidMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const t = setTimeout(() => setGridLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  // Task 5: Subscribe to all bids in real-time
  useEffect(() => {
    const unsub = BidStore.subscribeAllBids((listingId, bids) => {
      if (bids.length === 0) return;
      const highest = Math.max(...bids.map((b) => b.amount));
      setBidMap((prev) => {
        if (prev[listingId] === highest) return prev;
        return { ...prev, [listingId]: highest };
      });
    });
    return unsub;
  }, []);

  // Merge static + shared listings
  const baseListings = [...sharedListings, ...SELLER_LISTINGS];

  // Auto-hide demo listings when user has real listings
  useEffect(() => {
    if (sharedListings.length > 0 && !hideDemoListings) {
      setHideDemoListings(true);
      localStorage.setItem("77m_hide_demo", "true");
    }
  }, [sharedListings.length, hideDemoListings]);

  const toggleHideDemo = () => {
    setHideDemoListings((prev) => {
      const next = !prev;
      localStorage.setItem("77m_hide_demo", String(next));
      return next;
    });
  };

  const allListings = hideDemoListings
    ? baseListings.filter((l) => !(l as any).isDemo)
    : baseListings;

  const filtered = allListings.filter((l) => {
    const q = searchQuery.toLowerCase();
    return (
      q === "" ||
      l.model.toLowerCase().includes(q) ||
      l.title?.toLowerCase().includes(q)
    );
  });
  const handleFulfillLead = (item: (typeof DEMAND_FEED)[0]) => {
    localStorage.setItem("77m_send_offer", JSON.stringify(item));
    navigate({ to: "/send-offer" });
  };

  // Task 6: Get formatted bid/price string for a listing card
  const getListingPriceLabel = (listingId: string, basePrice: number) => {
    const currentBid = bidMap[listingId];
    if (currentBid && currentBid > 0) {
      const inr = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(currentBid / 100);
      return { label: "Current Bid", value: inr, isBid: true };
    }
    return { label: "Base", value: formatINR(basePrice), isBid: false };
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-safe-nav">
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
                className="bg-white rounded-xl p-3 flex flex-col justify-between flex-shrink-0"
                style={{
                  minWidth: "148px",
                  maxWidth: "160px",
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
                  <p
                    className="text-sm font-black"
                    style={{ color: "#1E293B" }}
                  >
                    ₹{item.budget}
                  </p>
                  <p className="text-[8px] text-gray-400">per unit</p>
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
                  className="w-full flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-bold text-white transition-all"
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
          <span className="font-black text-sm text-gray-900">My Listings</span>
          <span style={{ color: "#94A3B8", fontSize: "12px", fontWeight: 500 }}>
            {allListings.length} total
          </span>
          {/* Demo mode toggle */}
          <button
            type="button"
            data-ocid="seller.demo_toggle.toggle"
            onClick={toggleHideDemo}
            className="text-[9px] font-bold px-2 py-0.5 rounded-full ml-1 transition-all"
            style={{
              background: hideDemoListings ? "#D1FAE5" : "#F1F5F9",
              color: hideDemoListings ? "#065F46" : "#6B7280",
              border: "1px solid",
              borderColor: hideDemoListings ? "#A7F3D0" : "#E2E8F0",
            }}
          >
            {hideDemoListings ? "Show All" : "Hide Demo"}
          </button>
          {/* View toggle */}
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
          <button
            type="button"
            data-ocid="seller.sold_history.toggle"
            onClick={() => setActiveTab("activity")}
            className="text-[11px] font-bold px-2.5 py-1 rounded-full transition-all"
            style={{
              background: "white",
              color: "#1E293B",
              border: "1px solid #e5e7eb",
            }}
          >
            Activity
          </button>
        </div>

        {/* My Listings */}
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
              <p className="text-2xl mb-2">📦</p>
              <p className="font-bold text-sm text-gray-800 mb-1">
                No listings found
              </p>
              <p className="text-xs text-gray-400">Tap + to start selling</p>
            </div>
          ) : listView === "grid" ? (
            // ─── Grid View (2 columns) ───
            <div className="grid grid-cols-2 gap-2.5 pb-2">
              {filtered.map((listing, idx) => {
                const isActive = listing.status === "Active";
                const priceInfo = getListingPriceLabel(
                  listing.listingId,
                  listing.basePrice,
                );
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
                        src={listing.imageUrl || getDeviceImage(listing.model)}
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
                      {(listing as any).sealedBox && (
                        <span
                          className="absolute bottom-1.5 left-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: "#D1FAE5", color: "#065F46" }}
                        >
                          SEALED
                        </span>
                      )}
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
                      <p className="text-[9px] text-gray-400 truncate">
                        {listing.brand}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        <span
                          className="text-[8px] font-semibold px-1 py-0.5 rounded-full"
                          style={{
                            background: isActive ? "#F0FDF4" : "#F3F4F6",
                            color: isActive ? "#166534" : "#4b5563",
                          }}
                        >
                          {listing.status}
                        </span>
                        {listing.usbVerified && (
                          <span
                            className="text-[8px] font-semibold px-1 py-0.5 rounded-full"
                            style={{ background: "#D1FAE5", color: "#065F46" }}
                          >
                            USB ✓
                          </span>
                        )}
                        <span
                          style={{
                            background: conditionColor(listing.condition).bg,
                            color: conditionColor(listing.condition).text,
                          }}
                          className="text-[8px] font-semibold px-1 py-0.5 rounded-full"
                        >
                          {listing.condition}
                        </span>
                        {listing.warranty && Number(listing.warranty) > 0 && (
                          <span className="text-[8px] text-gray-400">
                            ~{String(listing.warranty)}mo
                          </span>
                        )}
                      </div>
                      {/* Task 6: Show current bid or base price */}
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <p
                          className="font-black text-[12px]"
                          style={{
                            color: priceInfo.isBid ? "#16A34A" : "#1D4ED8",
                          }}
                        >
                          {priceInfo.value}
                        </p>
                        <span className="text-[8px] text-gray-400">
                          {priceInfo.label}
                        </span>
                      </div>
                      {isActive && listing.endsAt && (
                        <div className="mt-0.5">
                          <AuctionTimer
                            endsAt={listing.endsAt}
                            auctionType={listing.auctionType}
                            status={listing.status}
                          />
                        </div>
                      )}
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
                const priceInfo = getListingPriceLabel(
                  listing.listingId,
                  listing.basePrice,
                );
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
                          <span
                            style={{
                              background: conditionColor(listing.condition).bg,
                              color: conditionColor(listing.condition).text,
                            }}
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                          >
                            {listing.condition}
                          </span>
                          {listing.warranty && Number(listing.warranty) > 0 && (
                            <span className="text-[9px] text-gray-400">
                              ~{String(listing.warranty)}mo
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400">
                          {listing.brand}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {/* Task 6: Show current bid or base price */}
                        <div className="flex flex-col items-end">
                          <p
                            className="font-black text-[14px]"
                            style={{
                              color: priceInfo.isBid ? "#16A34A" : "#1D4ED8",
                            }}
                          >
                            {priceInfo.value}
                          </p>
                          <span className="text-[9px] text-gray-400">
                            {priceInfo.label}
                          </span>
                        </div>
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
      </div>
    </div>
  );
}
