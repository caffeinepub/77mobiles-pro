import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Flame,
  Gamepad2,
  Headphones,
  Heart,
  Laptop,
  LayoutGrid,
  LayoutList,
  Search,
  Tablet,
  Watch,
  Wrench,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import PortalCarousel from "../components/PortalCarousel";
import type { CarouselSlide } from "../components/PortalCarousel";
import RecentSalesSlider from "../components/RecentSalesSlider";
import { useApp } from "../contexts/AppContext";
import {
  DEMO_BIDS,
  SELLER_LISTINGS,
  getDeviceImage,
} from "../data/demoListings";
import { formatINR } from "../utils/format";

type CategoryTab = "live" | "ending";
type FilterPill = "all" | "live" | "7day";

// Task 5: Added bidding war alert (b4) and price sparkline (b5) slides
const BUYER_CAROUSEL_SLIDES: CarouselSlide[] = [
  // Task 5: Bidding war alert slide
  {
    id: "b4",
    bgColor: "#FFF5F5",
    theme: "light" as const,
    accentColor: "#DC2626",
    badge: { text: "\u26A1 BIDDING WAR", pulse: true },
    title: "iPhone 16 Pro \u2014 Bidding War!",
    subtitle: "5 new bids in the last 2 minutes \xB7 12 dealers competing",
    ctaText: "Bid Now",
    image: "\uD83D\uDCF1",
  },
  // Task 5: Price sparkline slide
  {
    id: "b5",
    bgColor: "#F0FDF4",
    theme: "light" as const,
    accentColor: "#16a34a",
    badge: { text: "\uD83D\uDCC8 PRICE TREND" },
    title: "Used iPhone 15 Market",
    subtitle: "Price trending up +18% this month",
    ctaText: "View Trends",
  },
];

const GAMING_ITEMS = [
  {
    id: "g1",
    name: "PS5 Digital Edition",
    price: "\u20B942,000",
    emoji: "\uD83C\uDFAE",
  },
  {
    id: "g2",
    name: "Xbox Series S",
    price: "\u20B928,500",
    emoji: "\uD83C\uDFAE",
  },
  {
    id: "g3",
    name: "Nintendo Switch OLED",
    price: "\u20B931,000",
    emoji: "\uD83C\uDFAE",
  },
  {
    id: "g4",
    name: "PS5 Disc Edition",
    price: "\u20B952,000",
    emoji: "\uD83C\uDFAE",
  },
  {
    id: "g5",
    name: "Xbox Series X",
    price: "\u20B955,000",
    emoji: "\uD83C\uDFAE",
  },
];

const LAPTOP_ITEMS = [
  {
    id: "l1",
    name: "MacBook Air M3",
    price: "\u20B91,15,000",
    emoji: "\uD83D\uDCBB",
  },
  {
    id: "l2",
    name: "MacBook Pro M3",
    price: "\u20B91,85,000",
    emoji: "\uD83D\uDCBB",
  },
  {
    id: "l3",
    name: "Dell XPS 15",
    price: "\u20B91,25,000",
    emoji: "\uD83D\uDCBB",
  },
  {
    id: "l4",
    name: "HP Spectre x360",
    price: "\u20B91,08,000",
    emoji: "\uD83D\uDCBB",
  },
  {
    id: "l5",
    name: "ThinkPad X1 Carbon",
    price: "\u20B995,000",
    emoji: "\uD83D\uDCBB",
  },
];

const SPEAKER_ITEMS = [
  {
    id: "s1",
    name: "Apple HomePod Mini",
    price: "\u20B99,900",
    emoji: "\uD83D\uDD0A",
  },
  {
    id: "s2",
    name: "Amazon Echo Show 10",
    price: "\u20B924,999",
    emoji: "\uD83D\uDD0A",
  },
  {
    id: "s3",
    name: "Google Nest Hub Max",
    price: "\u20B919,999",
    emoji: "\uD83D\uDD0A",
  },
  { id: "s4", name: "Sonos One", price: "\u20B921,000", emoji: "\uD83D\uDD0A" },
  {
    id: "s5",
    name: "Amazon Echo Dot",
    price: "\u20B94,499",
    emoji: "\uD83D\uDD0A",
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

function CategoryListingView({
  category,
  onBack,
}: {
  category: string;
  onBack: () => void;
}) {
  const navigateInner = useNavigate();
  const categoryData: Record<
    string,
    {
      title: string;
      emoji: string;
      items: Array<{
        id: string;
        listingId?: string;
        name: string;
        price: string;
        tag: string;
      }>;
    }
  > = {
    "macbook-laptops": {
      title: "MacBook & Laptops",
      emoji: "\uD83D\uDCBB",
      items: [
        {
          id: "ml1",
          listingId: "b-1",
          name: "MacBook Air M3 (13-inch)",
          price: "\u20B91,15,000",
          tag: "Like New",
        },
        {
          id: "ml2",
          listingId: "b-2",
          name: "MacBook Pro M3 Pro (14-inch)",
          price: "\u20B91,85,000",
          tag: "Good",
        },
        {
          id: "ml3",
          listingId: "b-3",
          name: "Dell XPS 15 (i7, 32GB)",
          price: "\u20B91,25,000",
          tag: "Fair",
        },
        {
          id: "ml4",
          listingId: "b-4",
          name: "HP Spectre x360 (i7)",
          price: "\u20B91,08,000",
          tag: "Like New",
        },
        {
          id: "ml5",
          listingId: "b-5",
          name: "ThinkPad X1 Carbon Gen 11",
          price: "\u20B995,000",
          tag: "Good",
        },
        {
          id: "ml6",
          listingId: "b-6",
          name: "MacBook Air M2 (Space Gray)",
          price: "\u20B989,000",
          tag: "Fair",
        },
      ],
    },
    ipads: {
      title: "iPads",
      emoji: "\uD83D\uDCF1",
      items: [
        {
          id: "ip1",
          listingId: "b-7",
          name: "iPad Pro M4 (13-inch, WiFi)",
          price: "\u20B91,05,000",
          tag: "Like New",
        },
        {
          id: "ip2",
          listingId: "b-8",
          name: "iPad Air M2 (11-inch)",
          price: "\u20B969,000",
          tag: "Good",
        },
        {
          id: "ip3",
          listingId: "b-9",
          name: "iPad Mini 7 (64GB)",
          price: "\u20B948,000",
          tag: "Like New",
        },
        {
          id: "ip4",
          listingId: "b-10",
          name: "iPad Pro M2 (12.9-inch)",
          price: "\u20B992,000",
          tag: "Good",
        },
        {
          id: "ip5",
          listingId: "b-11",
          name: "iPad 10th Gen (WiFi + Cellular)",
          price: "\u20B945,000",
          tag: "Fair",
        },
        {
          id: "ip6",
          listingId: "b-12",
          name: "iPad Air M1 (256GB)",
          price: "\u20B958,000",
          tag: "Like New",
        },
      ],
    },
    watches: {
      title: "Watches",
      emoji: "\u231A",
      items: [
        {
          id: "w1",
          listingId: "b-1",
          name: "Apple Watch Series 9 (45mm)",
          price: "\u20B942,000",
          tag: "Like New",
        },
        {
          id: "w2",
          listingId: "b-2",
          name: "Apple Watch Ultra 2 (49mm)",
          price: "\u20B979,000",
          tag: "Good",
        },
        {
          id: "w3",
          listingId: "b-3",
          name: "Samsung Galaxy Watch 6 Classic",
          price: "\u20B928,000",
          tag: "Like New",
        },
        {
          id: "w4",
          listingId: "b-4",
          name: "Apple Watch SE 2nd Gen",
          price: "\u20B924,000",
          tag: "Good",
        },
        {
          id: "w5",
          listingId: "b-5",
          name: "Garmin Fenix 7X Pro",
          price: "\u20B965,000",
          tag: "Fair",
        },
        {
          id: "w6",
          listingId: "b-6",
          name: "Apple Watch Series 8 (41mm)",
          price: "\u20B932,000",
          tag: "Good",
        },
      ],
    },
    "gaming-consoles": {
      title: "Gaming Consoles",
      emoji: "\uD83C\uDFAE",
      items: [
        {
          id: "gc1",
          listingId: "b-7",
          name: "PlayStation 5 Disc Edition",
          price: "\u20B952,000",
          tag: "Like New",
        },
        {
          id: "gc2",
          listingId: "b-8",
          name: "PS5 Digital Edition",
          price: "\u20B942,000",
          tag: "Good",
        },
        {
          id: "gc3",
          listingId: "b-9",
          name: "Xbox Series X (1TB)",
          price: "\u20B955,000",
          tag: "Like New",
        },
        {
          id: "gc4",
          listingId: "b-10",
          name: "Xbox Series S (512GB)",
          price: "\u20B928,500",
          tag: "Good",
        },
        {
          id: "gc5",
          listingId: "b-11",
          name: "Nintendo Switch OLED (White)",
          price: "\u20B931,000",
          tag: "Like New",
        },
        {
          id: "gc6",
          listingId: "b-12",
          name: "Nintendo Switch V2",
          price: "\u20B920,000",
          tag: "Fair",
        },
      ],
    },
    accessories: {
      title: "Accessories",
      emoji: "\uD83C\uDFA7",
      items: [
        {
          id: "ac1",
          listingId: "b-1",
          name: "Apple AirPods Pro 2nd Gen",
          price: "\u20B918,000",
          tag: "Like New",
        },
        {
          id: "ac2",
          listingId: "b-2",
          name: "Apple MagSafe Charger 15W",
          price: "\u20B93,200",
          tag: "Good",
        },
        {
          id: "ac3",
          listingId: "b-3",
          name: "Samsung 65W Fast Charger",
          price: "\u20B92,500",
          tag: "Like New",
        },
        {
          id: "ac4",
          listingId: "b-4",
          name: "Apple USB-C to Lightning Cable",
          price: "\u20B91,800",
          tag: "Good",
        },
        {
          id: "ac5",
          listingId: "b-5",
          name: "Anker 26800 Power Bank",
          price: "\u20B95,500",
          tag: "Like New",
        },
        {
          id: "ac6",
          listingId: "b-6",
          name: "Apple AirPods (3rd Gen)",
          price: "\u20B912,000",
          tag: "Fair",
        },
      ],
    },
    "spare-parts": {
      title: "Spare Parts",
      emoji: "\uD83D\uDD27",
      items: [
        {
          id: "sp1",
          listingId: "b-7",
          name: "iPhone 15 Pro OLED Screen Module",
          price: "\u20B98,500",
          tag: "New",
        },
        {
          id: "sp2",
          listingId: "b-8",
          name: "Samsung S24 Ultra Battery Pack",
          price: "\u20B93,200",
          tag: "New",
        },
        {
          id: "sp3",
          listingId: "b-9",
          name: "iPhone 14 Back Glass Panel",
          price: "\u20B92,800",
          tag: "New",
        },
        {
          id: "sp4",
          listingId: "b-10",
          name: "OnePlus 12 Charging Port Assembly",
          price: "\u20B91,500",
          tag: "New",
        },
        {
          id: "sp5",
          listingId: "b-11",
          name: "Samsung Galaxy S23 Camera Module",
          price: "\u20B94,500",
          tag: "New",
        },
        {
          id: "sp6",
          listingId: "b-12",
          name: "iPhone 13 Pro Vibration Motor",
          price: "\u20B9900",
          tag: "New",
        },
      ],
    },
  };

  const data = categoryData[category] || {
    title: "Category",
    emoji: "\uD83D\uDCF1",
    items: [],
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [condFilter, setCondFilter] = useState("All");
  const CONDITIONS = ["All", "Like New", "Good", "Fair"];

  const getCategoryIcon = () => {
    if (category === "macbook-laptops")
      return <Laptop className="w-10 h-10" style={{ color: "#1D4ED8" }} />;
    if (category === "ipads")
      return <Tablet className="w-10 h-10" style={{ color: "#1D4ED8" }} />;
    if (category === "watches")
      return <Watch className="w-10 h-10" style={{ color: "#1D4ED8" }} />;
    if (category === "gaming-consoles")
      return <Gamepad2 className="w-10 h-10" style={{ color: "#1D4ED8" }} />;
    if (category === "accessories")
      return <Headphones className="w-10 h-10" style={{ color: "#1D4ED8" }} />;
    return <Wrench className="w-10 h-10" style={{ color: "#1D4ED8" }} />;
  };

  const filteredItems = data.items.filter((item) => {
    const matchSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCond = condFilter === "All" || item.tag === condFilter;
    return matchSearch && matchCond;
  });

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-safe-nav">
      {/* Header */}
      <header
        className="sticky top-0 z-30 bg-white px-4 py-3"
        style={{ borderBottom: "1px solid #e5e7eb" }}
      >
        <div className="flex items-center gap-3 mb-3">
          <button
            type="button"
            data-ocid="category_listing.back.button"
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "#F4F7FF" }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: "#1D4ED8" }} />
          </button>
          <div className="flex-1">
            <h2 className="font-black text-base" style={{ color: "#1E293B" }}>
              {data.title}
            </h2>
            <p className="text-[10px]" style={{ color: "#9CA3AF" }}>
              Showing {filteredItems.length} results
            </p>
          </div>
        </div>
        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: "#F4F7FF", border: "1px solid #E2E8F0" }}
        >
          <Search
            className="w-4 h-4 flex-shrink-0"
            style={{ color: "#9CA3AF" }}
          />
          <input
            data-ocid="category_listing.search_input"
            type="text"
            placeholder={`Search in ${data.title}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-xs"
            style={{ color: "#1E293B" }}
          />
        </div>
        {/* Filter pills */}
        <div
          className="flex gap-2 mt-2.5 overflow-x-auto pb-0.5"
          style={{ scrollbarWidth: "none" }}
        >
          {CONDITIONS.map((cond) => (
            <button
              key={cond}
              type="button"
              data-ocid={`category_listing.filter.${cond.toLowerCase().replace(" ", "_")}.tab`}
              onClick={() => setCondFilter(cond)}
              className="flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold"
              style={{
                background: condFilter === cond ? "#1D4ED8" : "white",
                color: condFilter === cond ? "white" : "#6B7280",
                border: condFilter === cond ? "none" : "1px solid #e5e7eb",
              }}
            >
              {cond}
            </button>
          ))}
        </div>
      </header>

      <div className="px-3 pt-3">
        <div className="grid grid-cols-2 gap-2.5">
          {filteredItems.map((item, idx) => {
            const cond = conditionColor(item.tag);
            return (
              <div
                key={item.id}
                data-ocid={`category_listing.${category}.item.${idx + 1}`}
                className="bg-white rounded-2xl overflow-hidden flex flex-col cursor-pointer active:scale-[0.98] transition-transform"
                style={{ border: "1px solid #e5e7eb", borderRadius: "16px" }}
                onClick={() =>
                  navigateInner({ to: `/listing/${item.listingId || item.id}` })
                }
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  navigateInner({ to: `/listing/${item.listingId || item.id}` })
                }
              >
                {/* Image area: square 1:1 with studio inner stroke */}
                <div
                  className="w-full flex items-center justify-center relative"
                  style={{
                    aspectRatio: "1/1",
                    background: "#F4F7FF",
                    borderRadius: "16px 16px 0 0",
                    boxShadow: "inset 0 0 0 1px #E2E8F0",
                    overflow: "hidden",
                  }}
                >
                  {getCategoryIcon()}
                </div>
                {/* Card body */}
                <div className="p-2.5 flex flex-col gap-1 flex-1">
                  <p
                    className="font-bold text-xs leading-snug truncate"
                    style={{ color: "#1E293B" }}
                  >
                    {item.name}
                  </p>
                  <span
                    className="inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded-full w-fit"
                    style={{ background: cond.bg, color: cond.text }}
                  >
                    {item.tag}
                  </span>
                  <p
                    className="font-black text-sm"
                    style={{ color: "#1D4ED8" }}
                  >
                    {item.price}
                  </p>
                  <button
                    type="button"
                    data-ocid={`category_listing.${category}.bid.${idx + 1}.button`}
                    className="w-full py-1.5 rounded-lg text-[10px] font-bold text-white mt-auto"
                    style={{ background: "#1D4ED8" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateInner({ to: `/listing/${item.id}` });
                    }}
                  >
                    Bid Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {filteredItems.length === 0 && (
          <div
            data-ocid={`category_listing.${category}.empty_state`}
            className="text-center py-16"
          >
            <p className="text-sm text-gray-400">No listings found</p>
            <button
              type="button"
              onClick={onBack}
              className="mt-3 text-sm font-semibold"
              style={{ color: "#1D4ED8" }}
            >
              Browse all devices
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function LiveCountdown({ endsAt }: { endsAt: bigint }) {
  const [secs, setSecs] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const endMs = Number(endsAt) / 1_000_000;
    const update = () => {
      const ms = endMs - Date.now();
      setSecs(Math.max(0, Math.floor(ms / 1000)));
    };
    update();
    ref.current = setInterval(update, 1000);
    return () => {
      if (ref.current) clearInterval(ref.current);
    };
  }, [endsAt]);

  const m = Math.floor(secs / 60);
  const s = secs % 60;
  const ended = secs === 0;
  if (ended) {
    return (
      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-400">
        Ended
      </span>
    );
  }
  const display = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return (
    <span
      className="text-[9px] font-black px-1.5 py-0.5 rounded-md"
      style={{ background: "#fef2f2", color: "#dc2626" }}
    >
      {"\u23F1"} {display}
    </span>
  );
}

const SkeletonCard = ({ className }: { className?: string }) => (
  <div
    className={`rounded-xl overflow-hidden ${className ?? ""}`}
    style={{ background: "#EFF6FF" }}
  >
    <div className="animate-pulse space-y-2 p-3">
      <div className="h-24 rounded-lg" style={{ background: "#DBEAFE" }} />
      <div className="h-3 rounded w-3/4" style={{ background: "#DBEAFE" }} />
      <div className="h-3 rounded w-1/2" style={{ background: "#DBEAFE" }} />
    </div>
  </div>
);

// Price Ticker Transaction History
export default function BuyerPortal() {
  const navigate = useNavigate();
  const {
    searchQuery,
    toggleWatchlist,
    isWatchlisted,
    activeCategory,
    setActiveCategory,
    sharedListings,
  } = useApp();
  const [category, setCategory] = useState<CategoryTab>("live");
  const [filterPill, setFilterPill] = useState<FilterPill>("all");
  const handleCarouselCta = (_slideId: string, ctaText: string) => {
    if (ctaText === "Explore Lots" || ctaText.includes("Lot")) {
      setCategory("live");
      const el = document.getElementById("listing-grid");
      el?.scrollIntoView({ behavior: "smooth" });
    } else if (ctaText === "View Auctions" || ctaText.includes("Auction")) {
      setCategory("ending");
      const el = document.getElementById("listing-grid");
      el?.scrollIntoView({ behavior: "smooth" });
    } else if (ctaText === "Bid Now") {
      const firstListing = SELLER_LISTINGS[0];
      if (firstListing) navigate({ to: `/listing/${firstListing.listingId}` });
    }
  };
  const [loading, setLoading] = useState(true);
  const [listView, setListView] = useState<"list" | "grid">("list");
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  const [heartAnim, setHeartAnim] = useState<string | null>(null);
  // Task 11: Real-time bid count state
  const [liveBidCounts, setLiveBidCounts] = useState<Record<string, number>>(
    Object.fromEntries(SELLER_LISTINGS.map((l) => [l.listingId, 0])),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveBidCounts((prev) => {
        const next = { ...prev };
        // Randomly increment a few active listings
        for (const id of Object.keys(next)) {
          if (Math.random() < 0.15) {
            next[id] = (next[id] || 0) + 1;
          }
        }
        return next;
      });
    }, 9000);
    return () => clearInterval(interval);
  }, []);
  const [showWatchlistToast, setShowWatchlistToast] = useState(false);
  const [pressedCard, setPressedCard] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Task 6A: Swipe gesture state
  const swipeTouchStart = useRef<{ x: number; y: number } | null>(null);
  const didSwipe = useRef(false);

  // Task 7A: Bulk bidding state
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedForBulk, setSelectedForBulk] = useState<Set<string>>(
    new Set(),
  );
  const [bulkBidAmount, setBulkBidAmount] = useState("");

  // Task 6A: Dismissed cards (swipe left)
  const [dismissedCards, setDismissedCards] = useState<Set<string>>(new Set());

  // Task 7A: Handle bulk bid
  const handleBulkBid = () => {
    if (!bulkBidAmount || selectedForBulk.size === 0) {
      toast.error("Select items and enter a bid amount");
      return;
    }
    const amount = Number(bulkBidAmount);
    toast.success(
      `Bulk bid of \u20B9${amount.toLocaleString("en-IN")} placed on ${selectedForBulk.size} item${selectedForBulk.size > 1 ? "s" : ""}!`,
    );
    if (typeof navigator.vibrate === "function")
      navigator.vibrate([100, 50, 100]);
    setSelectedForBulk(new Set());
    setBulkSelectMode(false);
    setBulkBidAmount("");
  };

  // Task 7A: Handle card tap (navigate or bulk select)
  const handleCardTap = (itemId: string, listingId: string) => {
    if (didSwipe.current) {
      didSwipe.current = false;
      return;
    }
    if (bulkSelectMode) {
      setSelectedForBulk((prev) => {
        const next = new Set(prev);
        if (next.has(itemId)) next.delete(itemId);
        else next.add(itemId);
        return next;
      });
      return;
    }
    navigate({ to: `/listing/${listingId}` });
  };

  /* Map SELLER_LISTINGS + sharedListings into display format */
  const sellerBentoItems = SELLER_LISTINGS.map((l) => ({
    id: l.listingId,
    listingId: l.listingId,
    model: l.model,
    brand: l.brand,
    emoji: "📱",
    condition: l.condition,
    price: Number(l.basePrice) / 100,
    originalPrice: Number(l.basePrice) / 100,
    bids: liveBidCounts[l.listingId] ?? 0,
    timer: l.auctionType === "Live20min" ? "20:00" : "7d",
    isLive: l.auctionType === "Live20min",
    warrantyMonths: Number(l.warranty ?? 0n),
    imageUrl: l.imageUrl ?? "",
  }));

  const sharedBentoItems = sharedListings.map((l: any) => ({
    id: l.listingId ?? `shared-${l.model}`,
    listingId: l.listingId ?? `shared-${l.model}`,
    model: l.model ?? "New Device",
    brand: l.brand ?? "",
    emoji: "📱",
    condition: l.condition ?? "Good",
    price: Number(l.basePrice) / 100,
    originalPrice: Number(l.basePrice) / 100,
    bids: 0,
    timer: "20:00",
    isLive: l.auctionType === "Live20min",
    warrantyMonths: 0,
    imageUrl: l.imageUrl ?? "",
  }));

  /* Filtered bento items — filter by filterPill and search, dismiss swipes */
  const allBentoItems = [...sharedBentoItems, ...sellerBentoItems];
  const filteredBento = allBentoItems.filter((item) => {
    if (dismissedCards.has(item.id)) return false;
    const q = searchQuery.toLowerCase();
    if (
      q &&
      !item.model.toLowerCase().includes(q) &&
      !item.brand.toLowerCase().includes(q)
    )
      return false;
    if (filterPill === "live") return item.isLive;
    if (filterPill === "7day") return !item.isLive;
    return true;
  });

  const condColor = (c: string) => conditionColor(c);

  const handleHeartTap = (listingId: string) => {
    const wasWatchlisted = isWatchlisted(listingId);
    toggleWatchlist(listingId);
    if (!wasWatchlisted) {
      setHeartAnim(listingId);
      setTimeout(() => setHeartAnim(null), 400);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setShowWatchlistToast(true);
      toastTimer.current = setTimeout(() => setShowWatchlistToast(false), 1900);
    }
  };

  /* Show category-specific view when a non-smartphones category is active */
  if (activeCategory !== "smartphones") {
    return (
      <CategoryListingView
        category={activeCategory}
        onBack={() => setActiveCategory("smartphones")}
      />
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-safe-nav">
      {/* Auto-sliding Carousel */}
      <div id="listing-grid" className="px-3 pt-3">
        <PortalCarousel
          slides={BUYER_CAROUSEL_SLIDES}
          onCtaClick={handleCarouselCta}
        />
      </div>
      {/* Price Ticker */}
      <RecentSalesSlider />

      <div className="px-3 pt-3">
        {/* Segmented category tab bar */}
        <div
          className="bg-white rounded-xl p-1 flex gap-1 mb-3"
          style={{ border: "1px solid #e5e7eb" }}
        >
          {[
            {
              id: "live" as const,
              icon: <Zap className="w-3 h-3" strokeWidth={1.5} />,
              label: "Live Auctions",
            },
            {
              id: "ending" as const,
              icon: <Clock className="w-3 h-3" strokeWidth={1.5} />,
              label: "Ending Soon",
            },
          ].map((cat) => (
            <button
              type="button"
              key={cat.id}
              data-ocid={`buyer.category.${cat.id}.tab`}
              onClick={() => setCategory(cat.id)}
              className="flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1"
              style={{
                background: category === cat.id ? "#1D4ED8" : "transparent",
                color: category === cat.id ? "white" : "#9ca3af",
                border:
                  category === cat.id
                    ? "1.5px solid #1D4ED8"
                    : "1.5px solid transparent",
              }}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Filter pills + Select button (Task 7A) — live tab only */}
        {category === "live" && (
          <div className="flex items-center gap-2 mb-3">
            {[
              { id: "all" as FilterPill, label: "All", icon: null },
              {
                id: "live" as FilterPill,
                label: "Live",
                icon: <Zap className="w-3 h-3" strokeWidth={1.5} />,
              },
              {
                id: "7day" as FilterPill,
                label: "7-Day",
                icon: <Calendar className="w-3 h-3" strokeWidth={1.5} />,
              },
            ].map((f) => (
              <button
                type="button"
                key={f.id}
                data-ocid={`buyer.filter.${f.id}.tab`}
                onClick={() => setFilterPill(f.id)}
                className="px-3 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1"
                style={{
                  background: filterPill === f.id ? "#1E293B" : "white",
                  color: filterPill === f.id ? "white" : "#9ca3af",
                  border: filterPill === f.id ? "none" : "1px solid #e5e7eb",
                }}
              >
                {f.icon}
                {f.label}
              </button>
            ))}
            {/* Task 7A: Bulk select toggle */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                data-ocid="buyer.listings.list_view.toggle"
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
                data-ocid="buyer.listings.grid_view.toggle"
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
              data-ocid="buyer.bulk_select.toggle"
              onClick={() => {
                setBulkSelectMode((v) => !v);
                if (bulkSelectMode) {
                  setSelectedForBulk(new Set());
                }
              }}
              className="ml-auto px-3 py-1 rounded-full text-[11px] font-bold transition-all"
              style={{
                background: bulkSelectMode ? "#1D4ED8" : "white",
                color: bulkSelectMode ? "white" : "#1E293B",
                border: "1px solid #e5e7eb",
              }}
            >
              {bulkSelectMode ? "\u2713 Selecting" : "Select"}
            </button>
          </div>
        )}

        {/* ── LIVE AUCTIONS: Single-column feed ── */}
        {category === "live" && (
          <div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <SkeletonCard key={i} className="mb-3" />
                ))}
              </div>
            ) : filteredBento.length === 0 ? (
              <div
                data-ocid="buyer.listings.empty_state"
                className="bg-white rounded-2xl p-8 text-center"
                style={{ border: "1px solid #e5e7eb" }}
              >
                <p className="text-2xl mb-2">🔍</p>
                <p className="font-bold text-sm text-gray-800 mb-1">
                  No active listings available
                </p>
                <p className="text-xs text-gray-400">
                  Check back soon for new auctions
                </p>
              </div>
            ) : (
              <div
                className={
                  listView === "grid" ? "grid grid-cols-2 gap-2.5" : ""
                }
              >
                {filteredBento.map((item, idx) => {
                  const cond = condColor(item.condition);
                  const saved = isWatchlisted(item.listingId);
                  const isAnimating = heartAnim === item.listingId;
                  const isPressed = pressedCard === item.id;
                  const isSelected = selectedForBulk.has(item.id);

                  if (listView === "grid") {
                    return (
                      <div
                        key={item.id}
                        data-ocid={`buyer.listing.item.${idx + 1}`}
                        className="bg-white rounded-xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                        style={{
                          border: "1px solid #e5e7eb",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                        }}
                        onClick={() => handleCardTap(item.id, item.listingId)}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          handleCardTap(item.id, item.listingId)
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
                            src={item.imageUrl || getDeviceImage(item.model)}
                            alt={item.model}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {item.isLive && (
                            <span
                              className="absolute top-1.5 left-1.5 text-[8px] font-bold px-1 py-0.5 rounded-full flex items-center gap-0.5"
                              style={{
                                background: "#FEF2F2",
                                color: "#DC2626",
                              }}
                            >
                              <Zap className="w-2 h-2" strokeWidth={1.5} /> Live
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHeartTap(item.listingId);
                            }}
                            className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white flex items-center justify-center"
                            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }}
                          >
                            <Heart
                              className="w-2.5 h-2.5"
                              style={{
                                fill: saved ? "#1D4ED8" : "none",
                                stroke: saved ? "#1D4ED8" : "#9CA3AF",
                                strokeWidth: 2,
                              }}
                            />
                          </button>
                        </div>
                        <div className="p-2">
                          <p className="font-bold text-[11px] text-[#1E293B] truncate leading-tight">
                            {item.model}
                          </p>
                          <p className="text-[9px] text-gray-400 truncate">
                            {item.brand}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                            <span
                              className="text-[8px] font-semibold px-1 py-0.5 rounded-full"
                              style={{
                                background: "#F0FDF4",
                                color: "#166534",
                              }}
                            >
                              Active
                            </span>
                            <span
                              style={{
                                background: condColor(item.condition).bg,
                                color: condColor(item.condition).text,
                              }}
                              className="inline-block text-[8px] font-semibold px-1 py-0.5 rounded-full"
                            >
                              {item.condition}
                            </span>
                            {item.warrantyMonths > 0 && (
                              <span className="text-[8px] text-gray-400">
                                ~{item.warrantyMonths}mo
                              </span>
                            )}
                          </div>
                          <p
                            className="font-black text-[12px] mt-0.5"
                            style={{ color: "#1D4ED8" }}
                          >
                            ₹{item.price.toLocaleString("en-IN")}
                          </p>
                          <p className="text-[8px] text-gray-400">
                            {liveBidCounts[item.id] ?? item.bids} bids ·{" "}
                            {item.timer}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={item.id}
                      data-ocid={`buyer.listing.item.${idx + 1}`}
                      className="bg-white rounded-xl overflow-hidden"
                      style={{
                        boxShadow: isSelected
                          ? "0 0 0 2px #1D4ED8, 0 2px 8px rgba(27,86,199,0.15)"
                          : "0 1px 4px rgba(0,0,0,0.06)",
                        marginBottom: "10px",
                        border: "1px solid #e5e7eb",
                        transform: isPressed ? "scale(0.99)" : "scale(1)",
                        transition:
                          "transform 0.15s ease, box-shadow 0.15s ease",
                      }}
                      onMouseDown={() => setPressedCard(item.id)}
                      onMouseUp={() => setPressedCard(null)}
                      onMouseLeave={() => setPressedCard(null)}
                      // Task 6A: Extended touch handlers for swipe
                      onTouchStart={(e) => {
                        setPressedCard(item.id);
                        swipeTouchStart.current = {
                          x: e.touches[0].clientX,
                          y: e.touches[0].clientY,
                        };
                        didSwipe.current = false;
                      }}
                      onTouchEnd={(e) => {
                        setPressedCard(null);
                        if (!swipeTouchStart.current) return;
                        const dx =
                          e.changedTouches[0].clientX -
                          swipeTouchStart.current.x;
                        const dy =
                          e.changedTouches[0].clientY -
                          swipeTouchStart.current.y;
                        swipeTouchStart.current = null;
                        if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) {
                          didSwipe.current = false;
                          return;
                        }
                        didSwipe.current = true;
                        if (dx > 60) {
                          // Swipe right = Quick Bid
                          if (typeof navigator.vibrate === "function")
                            navigator.vibrate([50, 30, 50]);
                          toast.success(`Quick Bid placed on ${item.model}!`);
                        } else if (dx < -60) {
                          // Swipe left = Dismiss
                          setDismissedCards(
                            (prev) => new Set([...prev, item.id]),
                          );
                          toast(`${item.model} dismissed`, { duration: 2000 });
                        }
                      }}
                    >
                      {/* Main row */}
                      <div className="p-4 flex gap-3">
                        {/* Left: product image */}
                        <div className="relative flex-shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              handleCardTap(item.id, item.listingId)
                            }
                          >
                            <img
                              src={item.imageUrl || getDeviceImage(item.model)}
                              alt={item.model}
                              className="rounded-xl object-cover"
                              style={{ width: "72px", height: "72px" }}
                              loading="lazy"
                            />
                          </button>

                          {/* Task 7A: Bulk select indicator */}
                          {bulkSelectMode && (
                            <div
                              className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                              style={{
                                background: isSelected ? "#1D4ED8" : "white",
                                border: isSelected
                                  ? "2px solid #1D4ED8"
                                  : "2px solid #9ca3af",
                                zIndex: 2,
                              }}
                            >
                              {isSelected && (
                                <span
                                  style={{
                                    color: "white",
                                    fontSize: "10px",
                                    lineHeight: 1,
                                  }}
                                >
                                  \u2713
                                </span>
                              )}
                            </div>
                          )}

                          {/* Heart overlay */}
                          <button
                            type="button"
                            aria-label="Add to watchlist"
                            data-ocid={`buyer.listing.watchlist.${idx + 1}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleHeartTap(item.listingId);
                            }}
                            className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white flex items-center justify-center"
                            style={{
                              boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                              zIndex: 1,
                            }}
                          >
                            <Heart
                              className="w-3 h-3"
                              style={{
                                fill: saved ? "#1D4ED8" : "none",
                                stroke: saved ? "#1D4ED8" : "#9CA3AF",
                                strokeWidth: 2,
                                transform: isAnimating
                                  ? "scale(1.5)"
                                  : "scale(1)",
                                transition:
                                  "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                              }}
                            />
                          </button>
                        </div>

                        {/* Center + Right: info + price */}
                        <button
                          type="button"
                          className="flex-1 min-w-0 text-left"
                          onClick={() => handleCardTap(item.id, item.listingId)}
                        >
                          {/* Title row + price */}
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="min-w-0">
                              <p className="font-bold text-[15px] text-[#1E293B] truncate leading-tight">
                                {item.model}
                              </p>
                              <span className="text-[11px] text-gray-400 font-medium">
                                {item.brand}
                              </span>
                            </div>
                            {/* Price on right */}
                            <div className="text-right flex-shrink-0">
                              <p
                                className="font-black text-[15px]"
                                style={{ color: "#1D4ED8" }}
                              >
                                {"\u20B9"}
                                {item.price.toLocaleString("en-IN")}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {liveBidCounts[item.id] ?? item.bids} bids
                              </p>
                            </div>
                          </div>

                          {/* Status badges — always visible, flat layout */}
                          <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                            <span
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                              style={{
                                background: "#F0FDF4",
                                color: "#166534",
                              }}
                            >
                              Active
                            </span>
                            {item.isLive && (
                              <span
                                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                                style={{
                                  background: "#FEF2F2",
                                  color: "#DC2626",
                                }}
                              >
                                <Zap
                                  className="w-2.5 h-2.5"
                                  strokeWidth={1.5}
                                />
                                Live
                              </span>
                            )}
                          </div>

                          {/* Condition + countdown — always visible */}
                          <div className="flex items-center gap-1.5">
                            <span
                              className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                              style={{
                                background: cond.bg,
                                color: cond.text,
                              }}
                            >
                              {item.condition}
                            </span>
                            {item.warrantyMonths > 0 && (
                              <span
                                className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                                style={{
                                  background: "#F3F4F6",
                                  color: "#6B7280",
                                }}
                              >
                                ~{item.warrantyMonths}mo warranty
                              </span>
                            )}
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-auto flex-shrink-0"
                              style={{
                                background: "#fef2f2",
                                color: "#dc2626",
                              }}
                            >
                              {"\u23F1"} {item.timer}
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ENDING SOON — 2-column bento grid */}
        {category === "ending" && (
          <div className="grid grid-cols-2 gap-2.5">
            {[...sharedListings, ...SELLER_LISTINGS]
              .slice()
              .sort((a, b) => Number(a.endsAt - b.endsAt))
              .map((listing, idx) => {
                const currentBid =
                  DEMO_BIDS[listing.listingId] ?? Number(listing.basePrice);
                const cond = condColor(listing.condition);
                const isPressed = pressedCard === listing.listingId;
                return (
                  <button
                    type="button"
                    key={listing.listingId}
                    data-ocid={`buyer.ending.item.${idx + 1}`}
                    className="bg-white rounded-xl overflow-hidden flex flex-col text-left"
                    style={{
                      border: "1px solid #e5e7eb",
                      cursor: "pointer",
                      transform: isPressed ? "scale(0.97)" : "scale(1)",
                      transition: "transform 0.15s ease",
                      userSelect: "none",
                    }}
                    onClick={() =>
                      navigate({ to: `/listing/${listing.listingId}` })
                    }
                    onMouseDown={() => setPressedCard(listing.listingId)}
                    onMouseUp={() => setPressedCard(null)}
                    onMouseLeave={() => setPressedCard(null)}
                    onTouchStart={() => setPressedCard(listing.listingId)}
                    onTouchEnd={() => setPressedCard(null)}
                  >
                    <div className="w-full h-28 overflow-hidden">
                      <img
                        src={listing.imageUrl || getDeviceImage(listing.model)}
                        alt={listing.model}
                        className="w-full h-full object-cover"
                        style={{ borderRadius: "12px 12px 0 0" }}
                      />
                    </div>
                    <div className="p-2.5">
                      <p className="font-bold text-xs text-[#002F34] leading-snug mb-1 truncate">
                        {listing.model}
                      </p>
                      <div className="flex gap-1 mb-1.5 flex-wrap">
                        <span
                          className="inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{ background: cond.bg, color: cond.text }}
                        >
                          {listing.condition}
                        </span>
                        {(listing as any).sealedBox && (
                          <span
                            className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: "#D1FAE5", color: "#065F46" }}
                          >
                            SEALED
                          </span>
                        )}
                      </div>
                      <p className="font-black text-sm text-[#002F34] mb-1">
                        {formatINR(currentBid)}
                      </p>
                      <div className="flex justify-end">
                        <LiveCountdown endsAt={listing.endsAt} />
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        )}
      </div>

      {/* Gaming Consoles horizontal scroll */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2.5 px-3">
          <div className="flex items-center gap-2">
            <span>{"\uD83C\uDFAE"}</span>
            <span className="font-black text-sm text-[#002F34]">
              Gaming Consoles
            </span>
          </div>
          <button
            type="button"
            data-ocid="buyer.gaming.see_all.button"
            className="text-xs font-semibold"
            style={{ color: "#1D4ED8" }}
            onClick={() => setActiveCategory("gaming-consoles")}
          >
            See all
          </button>
        </div>
        <div
          className="flex gap-3 overflow-x-auto pb-2 px-3"
          style={{ scrollbarWidth: "none" }}
        >
          {GAMING_ITEMS.map((item, idx) => (
            <div
              key={item.id}
              data-ocid={`buyer.gaming.item.${idx + 1}`}
              className="flex-shrink-0 w-36 bg-white rounded-xl overflow-hidden"
              style={{ border: "1px solid #e5e7eb" }}
            >
              <div className="h-28 bg-gray-100 flex items-center justify-center text-4xl">
                {item.emoji}
              </div>
              <div className="p-2">
                <p className="font-bold text-xs text-[#002F34] truncate">
                  {item.name}
                </p>
                <p className="text-[10px] text-gray-400">{item.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MacBooks & Laptops horizontal scroll */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2.5 px-3">
          <div className="flex items-center gap-2">
            <span>{"\uD83D\uDCBB"}</span>
            <span className="font-black text-sm text-[#002F34]">
              MacBooks &amp; Laptops
            </span>
          </div>
          <button
            type="button"
            data-ocid="buyer.laptops.see_all.button"
            className="text-xs font-semibold"
            style={{ color: "#1D4ED8" }}
            onClick={() => setActiveCategory("macbook-laptops")}
          >
            See all
          </button>
        </div>
        <div
          className="flex gap-3 overflow-x-auto pb-2 px-3"
          style={{ scrollbarWidth: "none" }}
        >
          {LAPTOP_ITEMS.map((item, idx) => (
            <div
              key={item.id}
              data-ocid={`buyer.laptops.item.${idx + 1}`}
              className="flex-shrink-0 w-36 bg-white rounded-xl overflow-hidden"
              style={{ border: "1px solid #e5e7eb" }}
            >
              <div className="h-28 bg-gray-100 flex items-center justify-center text-4xl">
                {item.emoji}
              </div>
              <div className="p-2">
                <p className="font-bold text-xs text-[#002F34] truncate">
                  {item.name}
                </p>
                <p className="text-[10px] text-gray-400">{item.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smart Speakers horizontal scroll */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2.5 px-3">
          <div className="flex items-center gap-2">
            <span>{"\uD83D\uDD0A"}</span>
            <span className="font-black text-sm text-[#002F34]">
              Smart Speakers
            </span>
          </div>
          <button
            type="button"
            data-ocid="buyer.speakers.see_all.button"
            className="text-xs font-semibold"
            style={{ color: "#1D4ED8" }}
          >
            See all
          </button>
        </div>
        <div
          className="flex gap-3 overflow-x-auto pb-2 px-3"
          style={{ scrollbarWidth: "none" }}
        >
          {SPEAKER_ITEMS.map((item, idx) => (
            <div
              key={item.id}
              data-ocid={`buyer.speakers.item.${idx + 1}`}
              className="flex-shrink-0 w-36 bg-white rounded-xl overflow-hidden"
              style={{ border: "1px solid #e5e7eb" }}
            >
              <div className="h-28 bg-gray-100 flex items-center justify-center text-4xl">
                {item.emoji}
              </div>
              <div className="p-2">
                <p className="font-bold text-xs text-[#002F34] truncate">
                  {item.name}
                </p>
                <p className="text-[10px] text-gray-400">{item.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seller Promotion Banner */}
      <div
        className="mx-3 mt-4 mb-6 rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1D4ED8 0%, #1D4ED8 100%)",
          padding: "20px",
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <span className="text-3xl">{"\uD83D\uDCF1"}</span>
          </div>
          <div className="flex-1">
            <p className="font-black text-white text-base leading-tight mb-1">
              Turn your old stock into cash.
            </p>
            <p
              className="text-xs mb-4"
              style={{ color: "rgba(255,255,255,0.75)" }}
            >
              Start your own auction in 2 minutes.
            </p>
            <button
              type="button"
              data-ocid="buyer.sell_promo.primary_button"
              onClick={() => navigate({ to: "/sell-category" })}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-white"
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.4)",
              }}
            >
              Start Selling {"\u2192"}
            </button>
          </div>
        </div>
      </div>

      {/* Watchlist toast */}
      <div
        className="fixed left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white text-sm font-semibold z-[60] pointer-events-none"
        style={{
          bottom: "76px",
          background: "#1f2937",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          opacity: showWatchlistToast ? 1 : 0,
          transform: showWatchlistToast
            ? "translateX(-50%) translateY(0)"
            : "translateX(-50%) translateY(8px)",
        }}
      >
        <span style={{ color: "#1D4ED8", fontSize: "14px" }}>{"\u2713"}</span>
        Added to Watchlist!
      </div>

      {/* Task 7A: Bulk bid sticky bar */}
      {selectedForBulk.size > 0 && (
        <div
          data-ocid="buyer.bulk_bid.panel"
          style={{
            position: "fixed",
            bottom: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(400px, calc(100% - 24px))",
            background: "white",
            borderRadius: "16px",
            padding: "12px 16px",
            boxShadow: "0 -4px 20px rgba(0,0,0,0.12)",
            zIndex: 45,
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#1E293B",
              flexShrink: 0,
            }}
          >
            {selectedForBulk.size} selected
          </span>
          <input
            type="number"
            placeholder={"\u20B9 Bid each"}
            data-ocid="buyer.bulk_bid.input"
            style={{
              flex: 1,
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "8px",
              fontSize: "13px",
              outline: "none",
            }}
            value={bulkBidAmount}
            onChange={(e) => setBulkBidAmount(e.target.value)}
          />
          <button
            type="button"
            data-ocid="buyer.bulk_bid.submit_button"
            onClick={handleBulkBid}
            style={{
              background: "#1D4ED8",
              color: "white",
              borderRadius: "10px",
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: 700,
              flexShrink: 0,
              border: "none",
              cursor: "pointer",
            }}
          >
            Bulk Bid {"\u2192"}
          </button>
        </div>
      )}
    </div>
  );
}
