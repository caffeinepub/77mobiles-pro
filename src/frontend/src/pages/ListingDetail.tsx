import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Battery,
  CheckCircle,
  Crown,
  Monitor,
  Shield,
  ShieldCheck,
  Smartphone,
  User,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Listing } from "../backend.d";
import AuctionTimer from "../components/AuctionTimer";
import { useApp } from "../contexts/AppContext";
import {
  BUYER_AUCTIONS,
  DEMO_BIDS,
  DEMO_BID_COUNTS,
  SELLER_LISTINGS,
  getDeviceImage,
} from "../data/demoListings";
import { useActor } from "../hooks/useActor";
import { formatINR } from "../utils/format";

// ─── Image Carousel ───────────────────────────────────────────────────────────────
function mockFallback(id: string) {
  const now = BigInt(Date.now()) * 1_000_000n;
  const sec = (s: number) => BigInt(s * 1000) * 1_000_000n;
  return {
    listingId: id,
    title: "Samsung Galaxy S24 Ultra 256GB",
    brand: "Samsung",
    model: "Samsung S24 Ultra",
    storage: 256n,
    batteryHealth: 88n,
    warranty: 8n,
    condition: "Good",
    color: "Titanium Gray",
    description:
      "S-Pen included. USB-verified by 77mobiles Pro diagnostic. Fully functional, minor surface scratches.",
    basePrice: 8500000n,
    auctionType: "Live20min" as const,
    status: "Active" as const,
    imageUrl: "",
    isDemo: true,
    screenPassCertified: true,
    usbVerified: true,
    serialNumberHash: "sha256:mock",
    sellerId: "Seller #189",
    endsAt: now + sec(750),
    createdAt: now,
  };
}

function ImageCarousel({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) {
      // Tap — no swipe — open fullscreen
      setFullscreen(true);
      return;
    }
    if (delta < -40 && current < images.length - 1) {
      setCurrent((c) => c + 1);
    } else if (delta > 40 && current > 0) {
      setCurrent((c) => c - 1);
    }
  };

  if (images.length === 0) {
    return (
      <div
        className="w-full flex flex-col items-center justify-center gap-2"
        // Task 1: use #1D4ED8 tint
        style={{ aspectRatio: "16/9", background: "#EFF6FF" }}
      >
        <Smartphone
          className="w-16 h-16"
          style={{ color: "#1D4ED8", opacity: 0.35 }}
        />
        <span className="text-xs font-semibold text-gray-400">
          No Image Available
        </span>
      </div>
    );
  }

  return (
    <>
      {/* Carousel container */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: "16/9",
          background: "#0f172a",
          cursor: "pointer",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => setFullscreen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setFullscreen(true);
        }}
      >
        <img
          key={current}
          src={images[current]}
          alt={`Device ${current + 1}`}
          loading="lazy"
          className="w-full h-full object-cover"
          style={{ transition: "opacity 0.2s ease" }}
        />
        {/* Tap hint */}
        <div
          className="absolute bottom-8 right-2 text-[9px] text-white/70 font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          Tap to zoom
        </div>
        {/* Pagination dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {images.map((img, i) => (
              <button
                key={img}
                type="button"
                aria-label={`Go to image ${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent(i);
                }}
                className="rounded-full transition-all"
                style={{
                  width: i === current ? "20px" : "6px",
                  height: "6px",
                  // Task 1: #007AFF → #1D4ED8
                  background:
                    i === current ? "#1D4ED8" : "rgba(255,255,255,0.6)",
                  border:
                    i === current ? "none" : "1px solid rgba(255,255,255,0.4)",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen overlay */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.95)" }}
          onTouchStart={handleTouchStart}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const delta = e.changedTouches[0].clientX - touchStartX.current;
            touchStartX.current = null;
            if (Math.abs(delta) < 40) return;
            if (delta < -40 && current < images.length - 1)
              setCurrent((c) => c + 1);
            else if (delta > 40 && current > 0) setCurrent((c) => c - 1);
          }}
        >
          <button
            type="button"
            aria-label="Close fullscreen"
            data-ocid="listing.image_fullscreen.close_button"
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center z-10"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <img
            src={images[current]}
            alt={`Device ${current + 1} fullscreen view`}
            loading="lazy"
            className="w-full max-h-screen object-contain"
          />
          {/* Fullscreen dots */}
          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
              {images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setCurrent(i)}
                  className="rounded-full transition-all"
                  style={{
                    width: i === current ? "24px" : "8px",
                    height: "8px",
                    // Task 1: #007AFF → #1D4ED8
                    background:
                      i === current ? "#1D4ED8" : "rgba(255,255,255,0.5)",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ─── Bidding Card ────────────────────────────────────────────────────────────────────
function BiddingCard({
  listing,
  currentBid,
}: { listing: Listing; currentBid: number }) {
  const [bidAmount, setBidAmount] = useState("");
  const [placing, setPlacing] = useState(false);
  const { actor } = useActor();
  const [secs, setSecs] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const endMs = Number(listing.endsAt) / 1_000_000;
    const update = () =>
      setSecs(Math.max(0, Math.floor((endMs - Date.now()) / 1000)));
    update();
    ref.current = setInterval(update, 1000);
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [listing.endsAt]);

  // Task 6B: Haptic feedback when timer crosses 60 seconds
  useEffect(() => {
    if (secs === 60 && typeof navigator.vibrate === "function") {
      navigator.vibrate([200]);
    }
  }, [secs]);

  const m = Math.floor(secs / 60);
  const s = secs % 60;
  const timerStr = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  const minBid = currentBid + 10000;

  const handleBid = async () => {
    const amount = Number.parseFloat(bidAmount);
    if (!amount || amount * 100 <= currentBid) {
      toast.error("Bid must be higher than current bid");
      return;
    }
    setPlacing(true);
    try {
      if (actor) {
        await actor.placeBid({
          bidId: crypto.randomUUID(),
          listingId: listing.listingId,
          bidderId: "demo-buyer",
          amount: BigInt(Math.round(amount * 100)),
          createdAt: BigInt(Date.now()) * 1_000_000n,
        });
      }
      toast.success("Bid placed successfully!");
      // Task 6B: Haptic feedback on successful bid
      if (typeof navigator.vibrate === "function")
        navigator.vibrate([100, 50, 100]);
      setBidAmount("");
    } catch {
      toast.success("Bid placed! (Demo mode)");
      // Task 6B: Haptic feedback on successful bid
      if (typeof navigator.vibrate === "function")
        navigator.vibrate([100, 50, 100]);
      setBidAmount("");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "#EFF6FF", border: "1px solid #bfdbfe" }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-black text-sm text-gray-900">
          Current High Bid: {formatINR(currentBid)}
        </span>
        {/* Task 1: #007AFF → #1D4ED8 */}
        <span
          className="text-[11px] font-bold text-white px-2 py-0.5 rounded-full"
          style={{ background: "#1D4ED8" }}
        >
          Dealer #402
        </span>
      </div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold" style={{ color: "#1D4ED8" }}>
          Base: {formatINR(listing.basePrice)}
        </span>
        <span
          className="text-xs font-bold flex items-center gap-1"
          style={{ color: "#1D4ED8" }}
        >
          <Zap className="w-3 h-3" />
          {timerStr} left
        </span>
      </div>
      <p className="text-xs font-bold text-gray-700 mb-2">Place Your Bid</p>
      <div className="bg-white rounded-xl border border-gray-200 px-3 py-2.5 mb-2">
        <input
          data-ocid="listing.bid.input"
          type="number"
          className="w-full bg-transparent outline-none text-sm text-gray-800"
          placeholder={`Min \u20b9${(minBid / 100).toLocaleString("en-IN")}`}
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
        />
      </div>
      {/* Increment buttons */}
      <div className="flex gap-2 mb-3">
        {[100, 500, 1000].map((inc) => (
          <button
            key={inc}
            type="button"
            data-ocid={`listing.bid_increment_${inc}.button`}
            onClick={() => {
              const current = Number.parseFloat(bidAmount) || currentBid / 100;
              setBidAmount(String(current + inc));
              if (typeof navigator.vibrate === "function")
                navigator.vibrate([30]);
            }}
            className="flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all"
            style={{
              border: "1.5px solid #1D4ED8",
              color: "#1D4ED8",
              background: "white",
            }}
          >
            +\u20B9{inc.toLocaleString("en-IN")}
          </button>
        ))}
      </div>
      <button
        type="button"
        data-ocid="listing.bid.submit_button"
        onClick={handleBid}
        disabled={placing}
        className="w-full py-3 rounded-xl text-white font-black text-sm"
        // Task 1: #007AFF → #1D4ED8
        style={{ background: placing ? "#6b7280" : "#1D4ED8" }}
      >
        {placing ? "Placing..." : "Place Bid \u2192"}
      </button>
      <p className="text-[10px] text-gray-500 text-center mt-2">
        Bid and seller details are masked until auction end.
      </p>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────────────
export default function ListingDetail() {
  const { id } = useParams({ strict: false }) as { id?: string };
  const navigate = useNavigate();
  const { mode } = useApp();
  const { actor } = useActor();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidCount, setBidCount] = useState(0);
  useEffect(() => {
    if (!listing || listing.status !== "Active") return;
    setBidCount(DEMO_BID_COUNTS[listing.listingId] ?? 0);
    const interval = setInterval(() => {
      setBidCount((prev) => {
        if (Math.random() < 0.1) return prev + 1;
        return prev;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [listing]);

  useEffect(() => {
    const all = [...SELLER_LISTINGS, ...BUYER_AUCTIONS];
    const found = all.find((l) => l.listingId === id);
    if (found) {
      setListing(found);
      setLoading(false);
      return;
    }
    if (actor && id) {
      actor
        .getListing(id)
        .then((res) => {
          if (res) {
            setListing(res);
          } else {
            setListing(mockFallback(id));
          }
        })
        .catch(() => setListing(mockFallback(id)))
        .finally(() => setLoading(false));
      return;
    }
    // No actor yet — use fallback so UI always renders
    setListing(mockFallback(id ?? "mock"));
    setLoading(false);
  }, [actor, id]);

  if (loading) {
    return (
      <div className="mobile-container flex items-center justify-center min-h-screen">
        <div data-ocid="listing.loading_state" className="text-center">
          <div
            className="w-10 h-10 border-2 rounded-full animate-spin mx-auto mb-3"
            // Task 1: #007AFF → #1D4ED8
            style={{ borderColor: "#1D4ED8", borderTopColor: "transparent" }}
          />
          <p className="text-sm text-gray-500">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mobile-container flex flex-col items-center justify-center min-h-screen px-6">
        <div data-ocid="listing.error_state" className="text-center">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-600">Listing not found</p>
          <button
            type="button"
            onClick={() => navigate({ to: "/app" })}
            className="mt-4 px-6 py-2 rounded-xl text-white font-bold"
            // Task 1: #007AFF → #1D4ED8
            style={{ background: "#1D4ED8" }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const currentBid = DEMO_BIDS[listing.listingId] ?? Number(listing.basePrice);

  // Build image array for carousel — use device image as demo
  const carouselImages = listing.imageUrl
    ? [listing.imageUrl]
    : [
        getDeviceImage(listing.model),
        getDeviceImage(listing.model),
        getDeviceImage(listing.model),
      ];

  const specs = [
    { label: "Model", value: listing.model },
    { label: "Storage", value: `${listing.storage.toString()}GB` },
    { label: "Battery", value: `${listing.batteryHealth.toString()}%` },
    {
      label: "Warranty",
      value: listing.warranty ? `${listing.warranty.toString()} mo` : "None",
    },
    { label: "Condition", value: listing.condition },
    { label: "Color", value: listing.color || "N/A" },
  ];

  return (
    <div className="mobile-container bg-[#F8F9FA] min-h-screen">
      <header
        className="sticky top-0 z-40 bg-white px-4 py-3 flex items-center gap-3"
        style={{ borderBottom: "1px solid #e5e7eb" }}
      >
        <button
          type="button"
          data-ocid="listing.back.button"
          onClick={() => navigate({ to: "/app" })}
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="font-bold text-sm truncate flex-1">{listing.model}</h2>
        <AuctionTimer
          endsAt={listing.endsAt}
          auctionType={listing.auctionType}
          status={listing.status}
        />
        <button
          type="button"
          data-ocid="listing.profile.button"
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <User className="w-4 h-4 text-gray-500" />
        </button>
      </header>

      <div className="overflow-y-auto pb-8">
        {/* Image Carousel */}
        <ImageCarousel images={carouselImages} />

        <div className="px-4 py-4 space-y-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {listing.usbVerified && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full"
                  style={{ background: "#F3E8FF", color: "#7c3aed" }}
                >
                  <Zap className="w-3 h-3" /> 77mobiles Pro Certified
                </span>
              )}
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {listing.condition}
              </span>
            </div>
            <h1 className="font-black text-xl text-gray-900">
              {listing.title || listing.model}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {bidCount} bids {"\xB7"} {listing.brand}
            </p>
          </div>

          {/* 1. Description */}
          <div
            className="bg-white rounded-2xl p-4"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Description
            </p>
            <p className="text-sm text-gray-800 leading-relaxed">
              {listing.description}
            </p>
            {listing.usbVerified && (
              <div
                className="mt-3 flex items-start gap-2 p-3 rounded-xl"
                style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
              >
                {/* Task 1: #007AFF → #1D4ED8 */}
                <ShieldCheck
                  className="w-4 h-4 flex-shrink-0 mt-0.5"
                  style={{ color: "#1D4ED8" }}
                />
                <p className="text-xs" style={{ color: "#1D4ED8" }}>
                  Fully functional, 100% screen pass. USB-verified by 77mobiles
                  Pro diagnostic system.
                </p>
              </div>
            )}
          </div>

          {/* 2. Bidding Card or Seller Management Panel */}
          {listing.status === "Active" && mode === "seller" && (
            <div
              className="rounded-2xl p-4 space-y-3"
              style={{ background: "#EFF6FF", border: "1px solid #bfdbfe" }}
            >
              <p className="font-black text-sm text-gray-900">
                Manage This Listing
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  data-ocid="listing.edit.button"
                  className="py-2.5 rounded-xl text-sm font-bold text-white"
                  // Task 1: #007AFF → #1D4ED8
                  style={{ background: "#1D4ED8" }}
                >
                  {"\u270F\uFE0F"} Edit Listing
                </button>
                <button
                  type="button"
                  data-ocid="listing.promote.button"
                  className="py-2.5 rounded-xl text-sm font-bold text-gray-900"
                  style={{ background: "#fbbf24" }}
                >
                  {"\uD83D\uDCC5"} Promote Listing
                </button>
              </div>
              <div className="bg-white rounded-xl p-3 border border-blue-100">
                <p className="text-xs text-gray-500 mb-1">Current Bids</p>
                {/* Task 1: #007AFF → #1D4ED8 */}
                <p className="font-black text-lg" style={{ color: "#1D4ED8" }}>
                  {bidCount} bids
                </p>
              </div>
            </div>
          )}
          {listing.status === "Active" && mode !== "seller" && (
            <BiddingCard listing={listing} currentBid={currentBid} />
          )}

          {/* 3. Product Specs */}
          <div
            className="bg-white rounded-2xl p-4"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Product Specs
            </p>
            <div className="grid grid-cols-2 gap-3">
              {specs.map((spec) => (
                <div key={spec.label} className="bg-gray-50 rounded-xl p-2.5">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase">
                    {spec.label}
                  </p>
                  <p className="font-bold text-sm text-gray-900 mt-0.5">
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Screen Pass */}
          {listing.screenPassCertified && (
            <div
              className="flex items-start gap-3 p-4 rounded-2xl"
              style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
            >
              <Monitor className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-green-800">
                    100% Screen Pass
                  </span>
                  <span className="bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    PASSED
                  </span>
                </div>
                <p className="text-xs text-green-700">
                  No dead pixels or touch issues detected.
                </p>
              </div>
            </div>
          )}

          {/* 5. USB Verified */}
          {listing.usbVerified && (
            <div
              className="flex items-start gap-3 p-4 rounded-2xl"
              style={{ border: "2px solid #bfdbfe", background: "#eff6ff" }}
            >
              {/* Task 1: #007AFF → #1D4ED8 */}
              <ShieldCheck
                className="w-6 h-6 flex-shrink-0 mt-0.5"
                style={{ color: "#1D4ED8" }}
              />
              <div>
                <p
                  className="font-bold text-sm mb-1"
                  style={{ color: "#1D4ED8" }}
                >
                  USB-Verified by 77mobiles Pro
                </p>
                <p className="text-xs text-blue-600">
                  Device was physically tested using 77mobiles diagnostic
                  system.
                </p>
              </div>
            </div>
          )}

          {/* 6. Device Verification HUD */}
          <div
            className="bg-white rounded-2xl p-4"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Device Verification
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Battery Health */}
              <div
                className="p-3 rounded-xl"
                style={{ border: "1px solid #e5e7eb", borderRadius: "12px" }}
              >
                <p className="text-[9px] font-semibold text-gray-400 uppercase mb-2">
                  Battery Health
                </p>
                {(() => {
                  const pct = Number(listing.batteryHealth) || 87;
                  const r = 20;
                  const circ = 2 * Math.PI * r;
                  const fill = circ - (pct / 100) * circ;
                  const col =
                    pct > 80 ? "#16A34A" : pct > 60 ? "#D97706" : "#DC2626";
                  return (
                    <div className="flex flex-col items-center">
                      <svg
                        width="52"
                        height="52"
                        viewBox="0 0 52 52"
                        aria-label="Battery health indicator"
                        role="img"
                      >
                        <circle
                          cx="26"
                          cy="26"
                          r={r}
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="4"
                        />
                        <circle
                          cx="26"
                          cy="26"
                          r={r}
                          fill="none"
                          stroke={col}
                          strokeWidth="4"
                          strokeDasharray={circ}
                          strokeDashoffset={fill}
                          strokeLinecap="round"
                          transform="rotate(-90 26 26)"
                        />
                        <text
                          x="26"
                          y="30"
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="800"
                          fill={col}
                        >
                          {pct}%
                        </text>
                      </svg>
                      <span
                        className="text-[9px] font-semibold mt-1"
                        style={{ color: col }}
                      >
                        {pct > 80 ? "Excellent" : pct > 60 ? "Good" : "Low"}
                      </span>
                    </div>
                  );
                })()}
              </div>
              {/* IMEI Status */}
              <div
                className="p-3 rounded-xl flex flex-col gap-1.5"
                style={{ border: "1px solid #e5e7eb", borderRadius: "12px" }}
              >
                <p className="text-[9px] font-semibold text-gray-400 uppercase">
                  IMEI Status
                </p>
                <ShieldCheck className="w-6 h-6" style={{ color: "#16A34A" }} />
                <span
                  className="text-xs font-bold"
                  style={{ color: "#16A34A" }}
                >
                  Verified
                </span>
                <span className="text-[9px] font-mono text-gray-500">
                  {mode === "buyer" ? "354812093847561" : "35****3847561"}
                </span>
              </div>
              {/* Cosmetic Grade */}
              <div
                className="p-3 rounded-xl flex flex-col gap-1.5"
                style={{ border: "1px solid #e5e7eb", borderRadius: "12px" }}
              >
                <p className="text-[9px] font-semibold text-gray-400 uppercase">
                  Cosmetic Grade
                </p>
                <span
                  className="text-xs font-black px-2 py-1 rounded-full w-fit"
                  style={{ background: "#D1FAE5", color: "#065F46" }}
                >
                  {listing.condition === "Like New" ||
                  listing.condition === "Excellent"
                    ? "Grade A – Like New"
                    : listing.condition === "Good"
                      ? "Grade B – Good"
                      : "Grade C – Fair"}
                </span>
              </div>
              {/* Functional Check */}
              <div
                className="p-3 rounded-xl flex flex-col gap-1.5"
                style={{ border: "1px solid #e5e7eb", borderRadius: "12px" }}
              >
                <p className="text-[9px] font-semibold text-gray-400 uppercase">
                  Functional Check
                </p>
                <CheckCircle className="w-6 h-6" style={{ color: "#16A34A" }} />
                <span
                  className="text-xs font-bold"
                  style={{ color: "#16A34A" }}
                >
                  55/55 Pass
                </span>
                <span className="text-[9px] text-gray-500">
                  All Systems Nominal
                </span>
              </div>
            </div>
          </div>

          {/* 7. Dealer Leaderboard */}
          {mode !== "seller" && (
            <div
              className="bg-white rounded-2xl p-4"
              style={{ border: "1px solid #e5e7eb" }}
            >
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Live Bidder Board
              </p>
              {[
                { rank: 1, id: "Dealer ***42", offset: 0 },
                { rank: 2, id: "Dealer ***17", offset: -500 },
                { rank: 3, id: "Dealer ***85", offset: -1200 },
                { rank: 4, id: "Dealer ***63", offset: -2000 },
                { rank: 5, id: "Dealer ***29", offset: -3500 },
              ].map((d) => {
                const bid = currentBid + d.offset;
                return (
                  <div
                    key={d.rank}
                    className="flex items-center gap-3 py-2"
                    style={{
                      borderBottom: d.rank < 5 ? "1px solid #F1F5F9" : "none",
                    }}
                  >
                    <span
                      className="text-xs font-black w-5 text-center"
                      style={{ color: d.rank === 1 ? "#D97706" : "#9CA3AF" }}
                    >
                      {d.rank}
                    </span>
                    {d.rank === 1 && (
                      <Crown
                        className="w-3.5 h-3.5 flex-shrink-0"
                        style={{ color: "#D97706" }}
                      />
                    )}
                    <span
                      className="flex-1 text-xs font-semibold"
                      style={{ color: "#1E293B" }}
                    >
                      {d.id}
                    </span>
                    <span
                      className="text-xs font-black"
                      style={{ color: "#1D4ED8" }}
                    >
                      ₹{(bid / 100).toLocaleString("en-IN")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* 8. Fee & Tax Summary */}
          {(() => {
            const priceRs = currentBid / 100;
            const fee =
              priceRs <= 10000
                ? 800
                : priceRs <= 30000
                  ? 1000
                  : priceRs <= 60000
                    ? 1300
                    : priceRs <= 100000
                      ? 1500
                      : 2000;
            const gst = Math.round(fee * 0.18);
            const tcs = Math.round(priceRs * 0.01);
            const total = priceRs + fee + gst + tcs;
            return (
              <div
                className="bg-white rounded-2xl p-4"
                style={{ border: "1px solid #e5e7eb" }}
              >
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Fee & Tax Summary
                </p>
                {[
                  {
                    label: "Device Price",
                    value: `₹${priceRs.toLocaleString("en-IN")}`,
                    bold: false,
                  },
                  {
                    label: "Sourcing Fee",
                    value: `₹${fee.toLocaleString("en-IN")}`,
                    bold: false,
                  },
                  {
                    label: "GST on Fee (18%)",
                    value: `₹${gst.toLocaleString("en-IN")}`,
                    bold: false,
                  },
                  {
                    label: "1% Claimable TCS",
                    value: `₹${tcs.toLocaleString("en-IN")}`,
                    bold: false,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between py-2"
                    style={{ borderBottom: "1px solid #F1F5F9" }}
                  >
                    <span className="text-xs text-gray-500">{row.label}</span>
                    <span className="text-xs font-semibold text-gray-700">
                      {row.value}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-bold text-gray-900">
                    Total Payable
                  </span>
                  <span
                    className="text-sm font-black"
                    style={{ color: "#1D4ED8" }}
                  >
                    ₹{total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Sticky quick-bid footer */}
      {listing.status === "Active" && mode !== "seller" && (
        <div
          style={{
            position: "sticky",
            bottom: 0,
            background: "white",
            borderTop: "1px solid #e5e7eb",
            padding: "12px 16px",
            display: "flex",
            gap: "8px",
            alignItems: "center",
            zIndex: 10,
          }}
        >
          {[100, 500, 1000].map((inc) => (
            <button
              key={inc}
              type="button"
              data-ocid={`listing.quick_bid.${inc}.button`}
              style={{
                flex: 1,
                padding: "8px 4px",
                borderRadius: "10px",
                border: "1.5px solid #1D4ED8",
                background: "white",
                color: "#1D4ED8",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              +₹{inc.toLocaleString("en-IN")}
            </button>
          ))}
          <button
            type="button"
            data-ocid="listing.place_bid.primary_button"
            style={{
              flex: 2,
              padding: "10px",
              borderRadius: "10px",
              background: "#1D4ED8",
              color: "white",
              fontSize: "13px",
              fontWeight: 800,
              border: "none",
              cursor: "pointer",
            }}
          >
            Place Bid
          </button>
        </div>
      )}
    </div>
  );
}
