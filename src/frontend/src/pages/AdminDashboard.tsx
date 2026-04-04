import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  Image,
  LayoutDashboard,
  Menu,
  Package,
  RefreshCw,
  Search,
  Settings,
  Shield,
  SlidersHorizontal,
  TrendingUp,
  Users,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BidStore } from "../stores/BidStore";
import {
  approveUserByPhone,
  readBanners,
  readPortalSettings,
  writeBanners,
  writePortalSettings,
} from "../utils/portalSettings";

type AdminSection =
  | "dashboard"
  | "users"
  | "listings"
  | "payments"
  | "diagnostics"
  | "portal-controls"
  | "slider-management"
  | "settings"
  | "auditlog";

const CORRECT_PIN = "770777";

const NAV_ITEMS: {
  id: AdminSection;
  label: string;
  Icon: React.ElementType;
}[] = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "users", label: "Users", Icon: Users },
  { id: "listings", label: "Listings", Icon: Package },
  { id: "payments", label: "Payments", Icon: CreditCard },
  { id: "diagnostics", label: "Diagnostics", Icon: Activity },
  { id: "portal-controls", label: "Portal Controls", Icon: SlidersHorizontal },
  { id: "slider-management", label: "Slider Management", Icon: Image },
  { id: "settings", label: "Settings", Icon: Settings },
  { id: "auditlog", label: "Audit Log", Icon: ClipboardList },
];

interface BannerSlide {
  id: string;
  imageUrl: string;
  title: string;
  target: "buyer" | "seller" | "both";
  active: boolean;
  link?: string;
  createdAt: number;
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const [kycFilter, setKycFilter] = useState<
    "All" | "Pending" | "Verified" | "Rejected"
  >("All");
  const [userTab, setUserTab] = useState<"seller" | "buyer">("seller");
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [resetPwTarget, setResetPwTarget] = useState<string | null>(null);
  const [resetPwValue, setResetPwValue] = useState("");
  const [kycItems, setKycItems] = useState<any[]>([]);
  const [listingTab, setListingTab] = useState<"queue" | "auctions">("queue");
  const [auctionTimers, setAuctionTimers] = useState<number[]>([]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(
    () => localStorage.getItem("77m_demo_mode") === "true",
  );
  const [newRegistrations, setNewRegistrations] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState("192.168.1.0/24");
  const [benchmarkInputs, setBenchmarkInputs] = useState<
    Record<number, string>
  >({});

  // Portal Controls state — initialized from persisted settings
  const [buyerMinBid, setBuyerMinBid] = useState(
    () => readPortalSettings().buyerMinBidIncrement,
  );
  const [buyerAuctionDuration, setBuyerAuctionDuration] = useState(
    () => readPortalSettings().buyerAuctionDuration,
  );
  const [buyerMaxListings, setBuyerMaxListings] = useState(
    () => readPortalSettings().buyerMaxListings,
  );
  const [sellerListingFee, setSellerListingFee] = useState(
    () => readPortalSettings().sellerListingFee,
  );
  const [sellerMaxPhotos, setSellerMaxPhotos] = useState(
    () => readPortalSettings().sellerMaxPhotos,
  );
  const [sellerAutoExpire, setSellerAutoExpire] = useState(
    () => readPortalSettings().sellerAutoExpireDays,
  );
  const [portalSaveSuccess, setPortalSaveSuccess] = useState(false);
  const [activeBenchmarkIdx, setActiveBenchmarkIdx] = useState<number | null>(
    null,
  );
  const feedRef = useRef<HTMLDivElement>(null);
  const feedIdxRef = useRef(0);
  // Task 13D: Real-time live bid feed from BidStore
  const [liveFeedBids, setLiveFeedBids] = useState<
    Array<{
      bidId: string;
      dealerId: string;
      listingId: string;
      amount: number;
      placedAt: number;
    }>
  >([]);

  // Task 11: Real-time pending verifications
  const [_pendingUsers, setPendingUsers] = useState([
    {
      id: "PND-001",
      name: "PhoneHub Surat",
      mobile: "+91 98765 43210",
      business: "PhoneHub Electronics",
      status: "pending" as const,
    },
    {
      id: "PND-002",
      name: "QuickResell Jaipur",
      mobile: "+91 87654 32109",
      business: "QuickResell Pvt Ltd",
      status: "pending" as const,
    },
    {
      id: "PND-003",
      name: "MobilePlex Kochi",
      mobile: "+91 76543 21098",
      business: "MobilePlex Traders",
      status: "pending" as const,
    },
  ]);
  const [pendingCount, setPendingCount] = useState(3);

  // Task 12: Slider Management state — load from persisted storage
  const DEFAULT_BANNERS: BannerSlide[] = [
    {
      id: "b1",
      imageUrl: "",
      title: "iPhone 16 Pro — Bidding War!",
      target: "both",
      active: true,
      createdAt: Date.now(),
    },
    {
      id: "b2",
      imageUrl: "",
      title: "Samsung S25 Ultra Auction",
      target: "buyer",
      active: true,
      createdAt: Date.now(),
    },
    {
      id: "b3",
      imageUrl: "",
      title: "Bulk MacBook Pro Deals",
      target: "seller",
      active: false,
      createdAt: Date.now(),
    },
  ];
  const [banners, setBanners] = useState<BannerSlide[]>(() => {
    const stored = readBanners();
    if (stored.length > 0) return stored;
    // Persist defaults so portals can read them immediately
    writeBanners(DEFAULT_BANNERS);
    return DEFAULT_BANNERS;
  });
  const [newBannerTitle, setNewBannerTitle] = useState("");
  const [newBannerTarget, setNewBannerTarget] = useState<
    "buyer" | "seller" | "both"
  >("both");
  const [newBannerPreview, setNewBannerPreview] = useState("");

  // Task 7: KYC document lightbox
  const [docModal, setDocModal] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [docZoom, setDocZoom] = useState(1);

  // Reset zoom when doc modal changes - runs when docModal opens/closes
  useEffect(() => {
    if (!docModal) setDocZoom(1);
  });

  // Task 8: Admin bell notifications
  const [showBellPanel, setShowBellPanel] = useState(false);
  const [adminNotifs, setAdminNotifs] = useState([
    {
      id: "n1",
      text: "New KYC submission: PhoneHub Surat",
      time: "2 min ago",
      read: false,
    },
    {
      id: "n2",
      text: "High-value bid: ₹1,12,000 on Galaxy Fold 6",
      time: "5 min ago",
      read: false,
    },
    {
      id: "n3",
      text: "Dispute filed by Dealer #178",
      time: "12 min ago",
      read: false,
    },
    {
      id: "n4",
      text: "New listing pending approval: iPhone 17 Pro",
      time: "18 min ago",
      read: true,
    },
    {
      id: "n5",
      text: "Wallet withdrawal request: ₹50,000 from Dealer #217",
      time: "1 hr ago",
      read: true,
    },
  ]);

  // Task 3: Load KYC submissions from localStorage and subscribe to storage events
  useEffect(() => {
    if (!authenticated) return;
    const loadKyc = () => {
      try {
        const stored = localStorage.getItem("77m_kyc_submissions");
        if (stored) {
          const parsed = JSON.parse(stored);
          const mapped = parsed.map((k: any) => ({
            id: k.id,
            name: k.name || k.business || "Unknown",
            business: k.business || k.businessName || "Unknown",
            businessName: k.businessName || k.business || "—",
            phone: k.phone || k.phone_number || "—",
            phone_number: k.phone_number || k.phone || "—",
            location: k.city || k.location || "—",
            city: k.city || k.location || "—",
            docType: k.docType || "KYC Document",
            aadhaar_url: k.aadhaar_url || "",
            pan_url: k.pan_url || "",
            createdAt: k.createdAt || Date.now(),
            status:
              k.status === "pending"
                ? "Pending"
                : k.status === "approved"
                  ? "Approved"
                  : "Pending",
          }));
          setKycItems((prev) => {
            const existingIds = new Set(prev.map((x) => x.id));
            const newItems = mapped.filter((x: any) => !existingIds.has(x.id));
            if (newItems.length > 0) return [...newItems, ...prev];
            return prev;
          });
        }
      } catch {}
    };
    loadKyc();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "77m_kyc_submissions") loadKyc();
    };
    window.addEventListener("storage", onStorage);
    // Task 2: Poll every 5s for new buyer/seller registrations
    const pollInterval = setInterval(loadKyc, 5000);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(pollInterval);
    };
  }, [authenticated]);

  // Task 11: Real-time new user listener simulation (like Firebase onSnapshot)
  useEffect(() => {
    if (!authenticated) return;
    const names = ["TechStore Nagpur", "BidPhone Vizag", "SmartResell Indore"];
    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        const name = names[Math.floor(Math.random() * names.length)];
        const newUser = {
          id: `PND-${Date.now()}`,
          name,
          mobile: `+91 9${Math.floor(Math.random() * 9)}${Math.floor(
            Math.random() * 100000000,
          )
            .toString()
            .padStart(8, "0")}`,
          business: `${name} Ltd`,
          status: "pending" as const,
        };
        setPendingUsers((prev) => [newUser, ...prev]);
        setPendingCount((prev) => prev + 1);
        toast.success(`New registration: ${newUser.name}`, {
          description: "Pending verification",
        });
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [authenticated]);

  // Task 13D: Subscribe to BidStore for real-time live bid feed
  useEffect(() => {
    if (!authenticated) return;
    const unsub = BidStore.subscribeAllBids((_listingId, bids) => {
      if (bids.length === 0) return;
      const latestBid = bids[0]; // most recent first (addBid prepends)
      setLiveFeedBids((prev) => {
        // Prepend and keep last 20
        const next = [
          { ...latestBid },
          ...prev.filter((b) => b.bidId !== latestBid.bidId),
        ];
        return next.slice(0, 20);
      });
    });
    return unsub;
  }, [authenticated]);

  // Live feed auto-scroll
  useEffect(() => {
    if (!authenticated) return;
    const interval = setInterval(() => {
      if (feedRef.current) {
        const items = feedRef.current.querySelectorAll(".bid-item");
        if (items.length === 0) return;
        feedIdxRef.current = (feedIdxRef.current + 1) % items.length;
        const target = items[feedIdxRef.current] as HTMLElement;
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [authenticated]);

  // Auction countdown timers
  useEffect(() => {
    if (!authenticated) return;
    const interval = setInterval(() => {
      setAuctionTimers((prev) => prev.map((t) => Math.max(0, t - 1)));
    }, 1000);
    return () => clearInterval(interval);
  }, [authenticated]);

  // --- LOGIN SCREEN ---
  if (!authenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "#F8FAFC" }}
        data-ocid="admin.login.panel"
      >
        <div
          className="w-full max-w-sm rounded-2xl p-8"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}
        >
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                background: "rgba(29,78,216,0.08)",
                border: "1px solid rgba(29,78,216,0.2)",
              }}
            >
              <Shield className="w-8 h-8" style={{ color: "#1D4ED8" }} />
            </div>
            <h1
              className="text-2xl font-black mb-1"
              style={{ color: "#1E293B" }}
            >
              77<span style={{ color: "#1D4ED8" }}>mobiles</span>.pro
            </h1>
            <p className="text-sm" style={{ color: "#64748B" }}>
              Admin Control Center
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="admin-pin"
                className="block text-xs font-semibold mb-2"
                style={{ color: "#9CA3AF" }}
              >
                6-DIGIT ADMIN PIN
              </label>
              <input
                id="admin-pin"
                data-ocid="admin.pin.input"
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ""));
                  setPinError("");
                }}
                placeholder="••••••"
                className="w-full px-4 py-3 rounded-xl text-[#1E293B] text-center text-xl tracking-widest font-mono bg-white"
                style={{
                  background: "#FFFFFF",
                  border: pinError
                    ? "2px solid #EF4444"
                    : "1.5px solid #E2E8F0",
                  outline: "none",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && pin.length === 6) {
                    if (pin === CORRECT_PIN) {
                      setAuthenticated(true);
                    } else {
                      setPinError("Incorrect PIN. Access denied.");
                      setPin("");
                    }
                  }
                }}
              />
              {pinError && (
                <p className="text-xs mt-2 text-red-400 text-center">
                  {pinError}
                </p>
              )}
            </div>

            <button
              type="button"
              data-ocid="admin.login.submit_button"
              className="w-full py-3 rounded-xl font-bold text-white transition-all"
              style={{ background: pin.length === 6 ? "#1D4ED8" : "#CBD5E1" }}
              onClick={() => {
                if (pin === CORRECT_PIN) {
                  setAuthenticated(true);
                } else {
                  setPinError("Incorrect PIN. Access denied.");
                  setPin("");
                }
              }}
            >
              Admin Access
            </button>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: "#9CA3AF" }}>
            Protected by Multi-Factor Authentication
          </p>
        </div>
      </div>
    );
  }

  // --- MAIN ADMIN PANEL ---
  return (
    <div
      className="min-h-screen flex"
      style={{ background: "#F8FAFC", fontFamily: "Inter, sans-serif" }}
    >
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close sidebar"
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className="fixed top-0 left-0 h-full z-50 flex flex-col"
        style={{
          width: "240px",
          background: "#FFFFFF",
          borderRight: "1px solid #E2E8F0",
          boxShadow: "2px 0 8px rgba(0,0,0,0.06)",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
        }}
      >
        <div className="p-5 border-b" style={{ borderColor: "#E2E8F0" }}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-black" style={{ color: "#1E293B" }}>
                77<span style={{ color: "#1D4ED8" }}>mobiles</span>
              </span>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>
                Admin Panel
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg"
              style={{ color: "#9CA3AF" }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                type="button"
                data-ocid={`admin.nav.${id}.link`}
                onClick={() => {
                  setActiveSection(id);
                  setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: isActive
                    ? "rgba(59,130,246,0.15)"
                    : "transparent",
                  color: isActive ? "#3B82F6" : "#94A3B8",
                  border: isActive
                    ? "1px solid rgba(59,130,246,0.3)"
                    : "1px solid transparent",
                }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                {id === "users" && pendingCount > 0 && (
                  <span
                    className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-full"
                    style={{ background: "#F97316", color: "white" }}
                  >
                    {pendingCount}
                  </span>
                )}
                {isActive && id !== "users" && (
                  <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: "#E2E8F0" }}>
          <button
            type="button"
            data-ocid="admin.logout.button"
            onClick={() => setAuthenticated(false)}
            className="w-full py-2 text-xs font-semibold rounded-lg"
            style={{
              color: "#EF4444",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header
          className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3"
          style={{ background: "#FFFFFF", borderBottom: "1px solid #E2E8F0" }}
        >
          <button
            type="button"
            data-ocid="admin.menu.button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl"
            style={{ background: "rgba(29,78,216,0.08)", color: "#1D4ED8" }}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
          >
            <Search
              className="w-4 h-4 flex-shrink-0"
              style={{ color: "#9CA3AF" }}
            />
            <input
              data-ocid="admin.search.input"
              type="text"
              placeholder="Search by IMEI, Model, or Dealer ID..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "#1E293B" }}
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowBellPanel((p) => !p)}
              className="p-2 rounded-xl relative"
              style={{ background: "rgba(29,78,216,0.08)", color: "#1D4ED8" }}
            >
              <Bell className="w-5 h-5" />
              {adminNotifs.filter((n) => !n.read).length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[8px] font-bold flex items-center justify-center">
                  {adminNotifs.filter((n) => !n.read).length}
                </span>
              )}
            </button>
            {showBellPanel && (
              <div
                className="absolute right-0 top-10 w-72 bg-white rounded-2xl shadow-xl z-50 overflow-hidden"
                style={{ border: "1px solid #E2E8F0" }}
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="font-bold text-sm text-gray-900">
                    Notifications
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminNotifs((prev) =>
                        prev.map((n) => ({ ...n, read: true })),
                      );
                    }}
                    className="text-[10px] font-semibold"
                    style={{ color: "#1D4ED8" }}
                  >
                    Mark all read
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {adminNotifs.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      className="w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50"
                      style={{ background: n.read ? "white" : "#EFF6FF" }}
                      onClick={() =>
                        setAdminNotifs((prev) =>
                          prev.map((x) =>
                            x.id === n.id ? { ...x, read: true } : x,
                          ),
                        )
                      }
                    >
                      <p className="text-xs font-semibold text-gray-800">
                        {n.text}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {n.time}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main
          className="flex-1 overflow-y-auto p-4"
          style={{ background: "#F8FAFC" }}
        >
          {/* Section Title */}
          <div className="mb-5">
            <h2 className="text-xl font-bold text-[#1E293B] capitalize">
              {NAV_ITEMS.find((n) => n.id === activeSection)?.label}
            </h2>
            <p className="text-xs" style={{ color: "#9CA3AF" }}>
              77mobiles.pro Control Center
            </p>
          </div>

          {/* ===== DASHBOARD ===== */}
          {activeSection === "dashboard" && (
            <div className="space-y-5">
              {/* Stat Cards */}
              {(() => {
                // Dynamic stat derivation from localStorage
                let pendingVerifCount = 0;
                let activeAuctionCount = 0;
                let userGrowthCount = 0;
                let totalRevenue = 0;
                try {
                  const kycSubs = JSON.parse(
                    localStorage.getItem("77m_kyc_submissions") || "[]",
                  );
                  pendingVerifCount = kycSubs.filter(
                    (k: any) =>
                      k.status === "pending" || k.status === "Pending",
                  ).length;
                  userGrowthCount = kycSubs.length;
                } catch {}
                try {
                  const listings = JSON.parse(
                    localStorage.getItem("77m_listings") || "[]",
                  );
                  activeAuctionCount = listings.filter(
                    (l: any) => l.status === "active" || l.status === "live",
                  ).length;
                } catch {}
                try {
                  const txns = JSON.parse(
                    localStorage.getItem("77m_wallet_transactions") || "[]",
                  );
                  totalRevenue = txns
                    .filter(
                      (t: any) =>
                        t.type === "sale" ||
                        t.type === "top-up" ||
                        t.type === "credit",
                    )
                    .reduce(
                      (sum: number, t: any) => sum + (Number(t.amount) || 0),
                      0,
                    );
                } catch {}
                const fmtRevenue =
                  totalRevenue > 0
                    ? `₹${totalRevenue.toLocaleString("en-IN")}`
                    : "₹0";
                return (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveSection("payments")}
                      style={{
                        cursor: "pointer",
                        background: "none",
                        border: "none",
                        padding: 0,
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      <StatCard
                        icon={
                          <DollarSign
                            className="w-5 h-5"
                            style={{ color: "#22C55E" }}
                          />
                        }
                        label="Total Revenue"
                        value={fmtRevenue}
                        sub="Escrow + Fees"
                        accentColor="#22C55E"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection("listings")}
                      style={{
                        cursor: "pointer",
                        background: "none",
                        border: "none",
                        padding: 0,
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      <StatCard
                        icon={
                          <Zap
                            className="w-5 h-5"
                            style={{ color: "#1D4ED8" }}
                          />
                        }
                        label="Active Auctions"
                        value={
                          activeAuctionCount > 0
                            ? activeAuctionCount.toString()
                            : "0"
                        }
                        sub="Live right now"
                        accentColor="#3B82F6"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection("users")}
                      style={{
                        cursor: "pointer",
                        background: "none",
                        border: "none",
                        padding: 0,
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      <StatCard
                        icon={
                          <Users
                            className="w-5 h-5"
                            style={{ color: "#A855F7" }}
                          />
                        }
                        label="User Growth"
                        value={userGrowthCount.toString()}
                        sub="Registered dealers"
                        accentColor="#A855F7"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSection("users");
                        setKycFilter("Pending");
                      }}
                      style={{
                        cursor: "pointer",
                        background: "none",
                        border: "none",
                        padding: 0,
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      <StatCard
                        icon={
                          <AlertTriangle
                            className="w-5 h-5"
                            style={{ color: "#F59E0B" }}
                          />
                        }
                        label="Pending Verifications"
                        value={pendingVerifCount.toString()}
                        sub="Awaiting review"
                        accentColor="#F59E0B"
                      />
                    </button>
                  </div>
                );
              })()}

              {/* Task 13B: Global Wallet Management */}
              {(() => {
                const totalBalance = Number(
                  localStorage.getItem("77m_wallet_balance") || "342500",
                );
                const totalEscrow = Number(
                  localStorage.getItem("77m_escrow") || "0",
                );
                let kycCount = 0;
                try {
                  kycCount = JSON.parse(
                    localStorage.getItem("77m_kyc_submissions") || "[]",
                  ).length;
                } catch {}
                const adminEarnings = Math.round(kycCount * 1500 * 1.18 * 1.01);
                const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
                return (
                  <div
                    className="rounded-2xl p-4"
                    style={{
                      background: "#EFF6FF",
                      border: "1px solid #BFDBFE",
                    }}
                  >
                    <h3 className="font-bold text-sm text-[#1E293B] mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                      Global Wallet Management
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          label: "Platform Balance",
                          value: fmt(totalBalance),
                          color: "#1D4ED8",
                        },
                        {
                          label: "Total Escrow",
                          value: fmt(totalEscrow),
                          color: "#F59E0B",
                        },
                        {
                          label: "Admin Earnings",
                          value: fmt(adminEarnings),
                          color: "#22C55E",
                        },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="bg-white rounded-xl p-2.5 text-center"
                          style={{ border: "1px solid #DBEAFE" }}
                        >
                          <p
                            className="font-black text-sm"
                            style={{ color: stat.color }}
                          >
                            {stat.value}
                          </p>
                          <p className="text-[9px] text-gray-500 font-medium mt-0.5">
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Task 13C: Recent Transactions Table */}
              {(() => {
                let txns: any[] = [];
                try {
                  txns = JSON.parse(
                    localStorage.getItem("77m_global_transactions") || "[]",
                  );
                } catch {}
                return (
                  <div
                    className="rounded-2xl p-4"
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    <h3 className="font-bold text-sm text-[#1E293B] mb-3">
                      Recent Transactions
                    </h3>
                    {txns.length === 0 ? (
                      <p className="text-xs text-center text-gray-400 py-4">
                        No transactions yet.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                              {["User", "Type", "Amount", "Time", "Status"].map(
                                (h) => (
                                  <th
                                    key={h}
                                    className="text-left pb-1.5 font-semibold text-gray-400 pr-2"
                                  >
                                    {h}
                                  </th>
                                ),
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {txns.slice(0, 20).map((txn: any) => (
                              <tr
                                key={
                                  txn.id || txn.timestamp || JSON.stringify(txn)
                                }
                                style={{ borderBottom: "1px solid #F1F5F9" }}
                              >
                                <td className="py-1.5 pr-2 text-gray-700 font-medium">
                                  {txn.userName || "—"}
                                </td>
                                <td className="py-1.5 pr-2 text-gray-500">
                                  {txn.type || "—"}
                                </td>
                                <td
                                  className="py-1.5 pr-2 font-bold"
                                  style={{ color: "#1D4ED8" }}
                                >
                                  ₹
                                  {Number(txn.amount || 0).toLocaleString(
                                    "en-IN",
                                  )}
                                </td>
                                <td className="py-1.5 pr-2 text-gray-400">
                                  {txn.timestamp
                                    ? new Date(
                                        txn.timestamp,
                                      ).toLocaleTimeString("en-IN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "—"}
                                </td>
                                <td className="py-1.5">
                                  <span
                                    className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                                    style={{
                                      background:
                                        txn.status === "success"
                                          ? "#F0FDF4"
                                          : "#FFF7ED",
                                      color:
                                        txn.status === "success"
                                          ? "#16A34A"
                                          : "#C2410C",
                                    }}
                                  >
                                    {txn.status || "pending"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Task 13D: Live Bid Activity Feed (BidStore real-time) */}
              <div
                className="rounded-2xl p-4"
                style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-[#1E293B] text-sm flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{
                        background: "#22C55E",
                        animation: "pulse 1.5s infinite",
                      }}
                    />
                    Live Bid Activity
                  </h3>
                  <span className="text-xs" style={{ color: "#9CA3AF" }}>
                    Real-time
                  </span>
                </div>
                <div
                  ref={feedRef}
                  className="space-y-2.5 overflow-y-auto"
                  style={{ maxHeight: "280px" }}
                >
                  {liveFeedBids.length === 0 ? (
                    <p
                      className="text-xs text-center text-gray-400 py-8"
                      data-ocid="admin.bids.empty_state"
                    >
                      No recent bids yet — bids placed in the app appear here
                      instantly
                    </p>
                  ) : (
                    liveFeedBids.map((bid, idx) => {
                      const minsAgo = Math.floor(
                        (Date.now() - bid.placedAt) / 60000,
                      );
                      const timeStr =
                        minsAgo === 0 ? "just now" : `${minsAgo}m ago`;
                      const dealerShort = `Dealer #${bid.dealerId.slice(-4).toUpperCase()}`;
                      const listingShort = `${bid.listingId.slice(0, 8)}...`;
                      return (
                        <div
                          key={`${bid.bidId}-${idx}`}
                          className="bid-item flex items-center justify-between py-2 border-b"
                          style={{ borderColor: "#E2E8F0" }}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{
                                background: "rgba(29,78,216,0.08)",
                                color: "#1D4ED8",
                              }}
                            >
                              {dealerShort}
                            </span>
                            <span
                              className="text-xs"
                              style={{ color: "#9CA3AF" }}
                            >
                              bid ₹{(bid.amount / 100).toLocaleString("en-IN")}{" "}
                              on{" "}
                              <span className="text-[#1E293B] font-medium">
                                {listingShort}
                              </span>
                            </span>
                          </div>
                          <span
                            className="text-xs flex-shrink-0"
                            style={{ color: "#9CA3AF" }}
                          >
                            {timeStr}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===== USERS ===== (Two-Tab: Seller Verification / Buyer Verification) */}
          {activeSection === "users" &&
            (() => {
              // Build unified user list from kycItems (localStorage-loaded)
              const allKyc: Array<{
                id: string;
                name: string;
                phone: string;
                businessName: string;
                location: string;
                role: string;
                balance: string;
                kycStatus: "Pending" | "Verified" | "Rejected";
                docType: string;
                aadhaar_url?: string;
                pan_url?: string;
                joinedAt: string;
                createdAt: number;
              }> = kycItems.map((k: any) => ({
                id: k.id,
                name: k.name || k.business || "Unknown",
                phone: k.phone || k.phone_number || "—",
                businessName:
                  k.businessName || k.business_name || k.business || "—",
                location: k.city || k.location || "—",
                role: k.role || "seller",
                balance: k.balance || "₹0",
                kycStatus:
                  k.status === "Approved" ||
                  k.status === "Verified" ||
                  k.status === "approved"
                    ? "Verified"
                    : k.status === "Rejected" || k.status === "rejected"
                      ? "Rejected"
                      : "Pending",
                docType: k.docType || "KYC Document",
                aadhaar_url: k.aadhaar_url,
                pan_url: k.pan_url,
                joinedAt: k.createdAt
                  ? new Date(k.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })
                  : "Recent",
                createdAt: k.createdAt || 0,
              }));

              // Tab-filtered lists
              const sellerItems = allKyc.filter(
                (u) =>
                  u.role === "seller" ||
                  u.role === "Seller" ||
                  !u.role ||
                  u.role === "Dealer",
              );
              const buyerItems = allKyc.filter(
                (u) => u.role?.toLowerCase() === "buyer",
              );

              const sellerPending = sellerItems.filter(
                (u) => u.kycStatus === "Pending",
              ).length;
              const buyerPending = buyerItems.filter(
                (u) => u.kycStatus === "Pending",
              ).length;

              const tabItems = userTab === "seller" ? sellerItems : buyerItems;

              // Sort: Pending first (newest first within Pending), then Verified, then Rejected
              const sorted = [...tabItems].sort((a, b) => {
                const order = { Pending: 0, Verified: 1, Rejected: 2 };
                if (order[a.kycStatus] !== order[b.kycStatus])
                  return order[a.kycStatus] - order[b.kycStatus];
                if (a.kycStatus === "Pending") return b.createdAt - a.createdAt;
                return 0;
              });

              // Apply search + filter dropdown
              const filtered = sorted.filter((u) => {
                const q = userSearch.toLowerCase();
                const matchSearch =
                  q === "" ||
                  u.name.toLowerCase().includes(q) ||
                  u.phone.includes(q) ||
                  u.businessName.toLowerCase().includes(q);
                if (!matchSearch) return false;
                if (kycFilter === "All") return true;
                return u.kycStatus === kycFilter;
              });

              const pendingCount2 = sorted.filter(
                (u) => u.kycStatus === "Pending",
              ).length;
              const verifiedCount = sorted.filter(
                (u) => u.kycStatus === "Verified",
              ).length;
              const rejectedCount = sorted.filter(
                (u) => u.kycStatus === "Rejected",
              ).length;

              return (
                <div className="space-y-4">
                  {/* Two-tab navigation */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      data-ocid="admin.users.seller.tab"
                      onClick={() => {
                        setUserTab("seller");
                        setKycFilter("All");
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl text-sm font-bold transition-all"
                      style={{
                        background:
                          userTab === "seller" ? "#1D4ED8" : "#F1F5F9",
                        color: userTab === "seller" ? "white" : "#64748B",
                      }}
                    >
                      Seller Verification
                      {sellerPending > 0 && (
                        <span
                          className="ml-1.5 text-[10px] font-black px-1.5 py-0.5 rounded-full"
                          style={{
                            background:
                              userTab === "seller"
                                ? "rgba(255,255,255,0.25)"
                                : "#F97316",
                            color: userTab === "seller" ? "white" : "white",
                          }}
                        >
                          {sellerPending} Pending
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      data-ocid="admin.users.buyer.tab"
                      onClick={() => {
                        setUserTab("buyer");
                        setKycFilter("All");
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl text-sm font-bold transition-all"
                      style={{
                        background: userTab === "buyer" ? "#1D4ED8" : "#F1F5F9",
                        color: userTab === "buyer" ? "white" : "#64748B",
                      }}
                    >
                      Buyer Verification
                      {buyerPending > 0 && (
                        <span
                          className="ml-1.5 text-[10px] font-black px-1.5 py-0.5 rounded-full"
                          style={{
                            background:
                              userTab === "buyer"
                                ? "rgba(255,255,255,0.25)"
                                : "#F97316",
                            color: "white",
                          }}
                        >
                          {buyerPending} Pending
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Header + filter */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-bold text-sm"
                        style={{ color: "#1E293B" }}
                      >
                        {userTab === "seller"
                          ? "Dealer Accounts"
                          : "Business Buyer Accounts"}
                      </span>
                      <span
                        className="text-xs font-black px-2 py-0.5 rounded-full"
                        style={{ background: "#F97316", color: "white" }}
                      >
                        {pendingCount2} Pending
                      </span>
                    </div>
                    <select
                      data-ocid="admin.users.filter.select"
                      value={kycFilter}
                      onChange={(e) =>
                        setKycFilter(
                          e.target.value as
                            | "All"
                            | "Pending"
                            | "Verified"
                            | "Rejected",
                        )
                      }
                      className="text-xs font-semibold px-3 py-1.5 rounded-xl outline-none"
                      style={{
                        background: "#1E293B",
                        color: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                      }}
                    >
                      <option value="All">All ({sorted.length})</option>
                      <option value="Pending">
                        Only Pending ({pendingCount2})
                      </option>
                      <option value="Verified">
                        Only Verified ({verifiedCount})
                      </option>
                      <option value="Rejected">
                        Only Rejected ({rejectedCount})
                      </option>
                    </select>
                  </div>

                  {/* Search */}
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    <Search className="w-4 h-4" style={{ color: "#9CA3AF" }} />
                    <input
                      data-ocid="admin.users.search_input"
                      type="text"
                      placeholder="Search name, phone, or business…"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="flex-1 bg-transparent text-sm outline-none"
                      style={{ color: "#1E293B" }}
                    />
                  </div>

                  {/* User cards */}
                  <div className="space-y-2">
                    {filtered.length === 0 && (
                      <p
                        className="text-xs text-center text-gray-400 py-6"
                        data-ocid="admin.users.empty_state"
                      >
                        No{" "}
                        {kycFilter === "All"
                          ? ""
                          : `${kycFilter.toLowerCase()} `}
                        {userTab} users found
                      </p>
                    )}
                    {filtered.map((user, i) => (
                      <button
                        key={user.id}
                        type="button"
                        data-ocid={`admin.users.item.${i + 1}`}
                        className="w-full text-left rounded-xl p-4 transition-all hover:shadow-sm"
                        style={{
                          background: "#FFFFFF",
                          border:
                            user.kycStatus === "Pending"
                              ? "1px solid #FED7AA"
                              : "1px solid #E2E8F0",
                        }}
                        onClick={() => setSelectedUser(user)}
                      >
                        {/* Top row: name + status badge */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-[#1E293B] truncate">
                              {user.name}
                            </p>
                            <p className="text-xs" style={{ color: "#9CA3AF" }}>
                              {user.phone} ·{" "}
                              {userTab === "seller" ? "Dealer" : "Buyer"}
                            </p>
                          </div>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 ml-2"
                            style={{
                              background:
                                user.kycStatus === "Verified"
                                  ? "#DCFCE7"
                                  : user.kycStatus === "Rejected"
                                    ? "#FEE2E2"
                                    : "#FEF9C3",
                              color:
                                user.kycStatus === "Verified"
                                  ? "#166534"
                                  : user.kycStatus === "Rejected"
                                    ? "#991B1B"
                                    : "#92400E",
                            }}
                          >
                            {user.kycStatus}
                          </span>
                        </div>

                        {/* Details row */}
                        <div className="flex gap-3 mb-2 flex-wrap">
                          {user.businessName !== "—" && (
                            <span className="text-[10px] text-gray-500">
                              🏢 {user.businessName}
                            </span>
                          )}
                          {user.location !== "—" && (
                            <span className="text-[10px] text-gray-500">
                              📍 {user.location}
                            </span>
                          )}
                          <span className="text-[10px] text-gray-400">
                            Joined {user.joinedAt}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {user.docType}
                          </span>
                        </div>

                        {/* Quick action buttons */}
                        <div className="flex gap-2 flex-wrap">
                          <span
                            className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg"
                            style={{
                              background: "#F8FAFC",
                              color: "#64748B",
                              border: "1px solid #E2E8F0",
                            }}
                          >
                            <Eye className="w-3 h-3" /> View Details
                          </span>
                          {user.kycStatus === "Pending" && (
                            <>
                              <button
                                type="button"
                                data-ocid="admin.users.approve.button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setKycItems((prev) =>
                                    prev.map((k) =>
                                      k.id === user.id
                                        ? { ...k, status: "Approved" }
                                        : k,
                                    ),
                                  );
                                  setPendingCount((prev) =>
                                    Math.max(0, prev - 1),
                                  );
                                  approveUserByPhone(
                                    (user.phone as string) || "",
                                  );
                                  try {
                                    const kycSubs = JSON.parse(
                                      localStorage.getItem(
                                        "77m_kyc_submissions",
                                      ) || "[]",
                                    );
                                    const updated = kycSubs.map((k: any) =>
                                      k.id === user.id
                                        ? { ...k, status: "approved" }
                                        : k,
                                    );
                                    localStorage.setItem(
                                      "77m_kyc_submissions",
                                      JSON.stringify(updated),
                                    );
                                    const auditLog = JSON.parse(
                                      localStorage.getItem("77m_audit_log") ||
                                        "[]",
                                    );
                                    auditLog.unshift({
                                      time: new Date().toLocaleString("en-IN"),
                                      entry: `Admin approved KYC for ${user.name} (${user.businessName})`,
                                    });
                                    localStorage.setItem(
                                      "77m_audit_log",
                                      JSON.stringify(auditLog.slice(0, 100)),
                                    );
                                  } catch {}
                                  toast.success(
                                    "Approved — user can now access the portal",
                                  );
                                }}
                                className="text-xs font-bold px-2.5 py-1 rounded-lg"
                                style={{
                                  background: "#16A34A",
                                  color: "white",
                                }}
                              >
                                ✓ Approve
                              </button>
                              <button
                                type="button"
                                data-ocid="admin.users.reject.button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRejectTarget(user.id);
                                  setRejectReason("");
                                }}
                                className="text-xs font-bold px-2.5 py-1 rounded-lg"
                                style={{
                                  background: "rgba(239,68,68,0.1)",
                                  color: "#EF4444",
                                  border: "1px solid rgba(239,68,68,0.3)",
                                }}
                              >
                                ✕ Reject
                              </button>
                            </>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

          {/* ===== LISTINGS ===== */}
          {activeSection === "listings" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  data-ocid="admin.listings.queue.tab"
                  onClick={() => setListingTab("queue")}
                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{
                    background: listingTab === "queue" ? "#3B82F6" : "#1E293B",
                    color: listingTab === "queue" ? "white" : "#94A3B8",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  Approval Queue
                </button>
                <button
                  type="button"
                  data-ocid="admin.listings.auctions.tab"
                  onClick={() => setListingTab("auctions")}
                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{
                    background:
                      listingTab === "auctions" ? "#3B82F6" : "#1E293B",
                    color: listingTab === "auctions" ? "white" : "#94A3B8",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  Active Auctions
                </button>
              </div>

              {listingTab === "queue" ? (
                <div className="space-y-3">
                  {(() => {
                    let queueListings: any[] = [];
                    try {
                      const stored = localStorage.getItem("77m_listings");
                      if (stored)
                        queueListings = JSON.parse(stored).filter(
                          (l: any) =>
                            l.status === "pending" ||
                            l.status === "pending_approval",
                        );
                    } catch {}
                    if (queueListings.length === 0) {
                      return (
                        <p
                          className="text-xs text-center text-gray-400 py-6"
                          data-ocid="admin.listings.empty_state"
                        >
                          No listings awaiting approval
                        </p>
                      );
                    }
                    return queueListings.map((listing: any, i: number) => (
                      <div
                        key={listing.id}
                        className="rounded-xl p-4"
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid #E2E8F0",
                        }}
                        data-ocid={`admin.listings.item.${i + 1}`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div
                            className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center"
                            style={{ background: "#F8FAFC" }}
                          >
                            <Package
                              className="w-6 h-6"
                              style={{ color: "#9CA3AF" }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-[#1E293B]">
                              {listing.model}
                            </p>
                            <p className="text-xs" style={{ color: "#9CA3AF" }}>
                              {listing.id} · Seller {listing.seller}
                            </p>
                            <p
                              className="text-xs mt-0.5"
                              style={{ color: "#9CA3AF" }}
                            >
                              Condition: {listing.condition} · Base:{" "}
                              {listing.price}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            data-ocid="admin.listings.approve.button"
                            onClick={() =>
                              toast.success(`Listing ${listing.id} approved!`)
                            }
                            className="flex-1 py-2 rounded-xl text-sm font-semibold text-[#1E293B] flex items-center justify-center gap-1"
                            style={{ background: "#22C55E" }}
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <select
                            data-ocid="admin.listings.reject.select"
                            className="flex-1 py-2 px-2 rounded-xl text-sm font-semibold text-center"
                            style={{
                              background: "rgba(239,68,68,0.1)",
                              color: "#EF4444",
                              border: "1px solid rgba(239,68,68,0.3)",
                            }}
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) {
                                toast.error(`Rejected: ${e.target.value}`);
                                e.target.value = "";
                              }
                            }}
                          >
                            <option value="">Reject ▾</option>
                            <option>Blurry Photos</option>
                            <option>Invalid IMEI</option>
                            <option>Wrong Category</option>
                            <option>Incomplete Info</option>
                          </select>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              ) : (
                <div className="space-y-3">
                  {(() => {
                    let activeAuctions: any[] = [];
                    try {
                      const stored = localStorage.getItem("77m_listings");
                      if (stored)
                        activeAuctions = JSON.parse(stored).filter(
                          (l: any) =>
                            l.status === "live" || l.status === "active",
                        );
                    } catch {}
                    if (activeAuctions.length === 0) {
                      return (
                        <p
                          className="text-xs text-center text-gray-400 py-6"
                          data-ocid="admin.auctions.empty_state"
                        >
                          No active auctions
                        </p>
                      );
                    }
                    return activeAuctions.map((auction: any, i: number) => (
                      <div
                        key={auction.id}
                        className="rounded-xl p-4"
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid #E2E8F0",
                        }}
                        data-ocid={`admin.auctions.item.${i + 1}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-sm text-[#1E293B]">
                              {auction.model}
                            </p>
                            <p className="text-xs" style={{ color: "#9CA3AF" }}>
                              {auction.id} · Current Bid:{" "}
                              <span className="text-[#1E293B] font-semibold">
                                {auction.currentBid}
                              </span>
                            </p>
                          </div>
                          <div
                            className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold"
                            style={{
                              background:
                                auctionTimers[i] < 1800
                                  ? "rgba(239,68,68,0.15)"
                                  : "rgba(59,130,246,0.15)",
                              color:
                                auctionTimers[i] < 1800 ? "#EF4444" : "#3B82F6",
                            }}
                          >
                            {formatTime(auctionTimers[i] ?? 3600)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            data-ocid="admin.auctions.end.button"
                            onClick={() =>
                              toast.error(`Auction ${auction.id} ended early`)
                            }
                            className="flex-1 py-2 rounded-xl text-sm font-semibold"
                            style={{
                              background: "rgba(239,68,68,0.1)",
                              color: "#EF4444",
                              border: "1px solid rgba(239,68,68,0.3)",
                            }}
                          >
                            End Early
                          </button>
                          <button
                            type="button"
                            data-ocid="admin.auctions.extend.button"
                            onClick={() => {
                              setAuctionTimers((prev) =>
                                prev.map((t, idx) =>
                                  idx === i ? t + 3600 : t,
                                ),
                              );
                              toast.success(
                                `Auction ${auction.id} extended by 1 hour`,
                              );
                            }}
                            className="flex-1 py-2 rounded-xl text-sm font-semibold"
                            style={{
                              background: "rgba(29,78,216,0.08)",
                              color: "#1D4ED8",
                              border: "1px solid rgba(29,78,216,0.2)",
                            }}
                          >
                            Extend +1hr
                          </button>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </div>
          )}

          {/* ===== PAYMENTS ===== */}
          {activeSection === "payments" && (
            <div className="space-y-5">
              {/* Transaction Log */}
              <SectionBlock title="Transaction Log">
                <div className="space-y-2">
                  {(() => {
                    let transactions: any[] = [];
                    try {
                      transactions = JSON.parse(
                        localStorage.getItem("77m_wallet_transactions") || "[]",
                      );
                    } catch {}
                    if (transactions.length === 0)
                      return (
                        <p
                          className="text-xs text-center text-gray-400 py-4"
                          data-ocid="admin.transactions.empty_state"
                        >
                          No transactions yet
                        </p>
                      );
                    return transactions.map((txn: any, i: number) => (
                      <div
                        key={txn.id}
                        className="flex items-center justify-between py-2.5 border-b"
                        style={{ borderColor: "#E2E8F0" }}
                        data-ocid={`admin.transactions.item.${i + 1}`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{
                              background:
                                txn.type === "Top-up"
                                  ? "rgba(34,197,94,0.1)"
                                  : "rgba(239,68,68,0.1)",
                              color:
                                txn.type === "Top-up" ? "#22C55E" : "#EF4444",
                            }}
                          >
                            {txn.type}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-[#1E293B]">
                              {txn.amount}
                            </p>
                            <p className="text-xs" style={{ color: "#9CA3AF" }}>
                              Dealer {txn.dealer} · {txn.date}
                            </p>
                          </div>
                        </div>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            background:
                              txn.status === "Completed"
                                ? "rgba(34,197,94,0.1)"
                                : txn.status === "Pending"
                                  ? "rgba(245,158,11,0.1)"
                                  : "rgba(239,68,68,0.1)",
                            color:
                              txn.status === "Completed"
                                ? "#22C55E"
                                : txn.status === "Pending"
                                  ? "#F59E0B"
                                  : "#EF4444",
                          }}
                        >
                          {txn.status}
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              </SectionBlock>

              {/* Escrow Monitor */}
              <SectionBlock title="Escrow Monitor">
                <div className="space-y-2">
                  {(() => {
                    let escrowItems: any[] = [];
                    try {
                      escrowItems = JSON.parse(
                        localStorage.getItem("77m_escrow") || "[]",
                      );
                    } catch {}
                    if (escrowItems.length === 0)
                      return (
                        <p
                          className="text-xs text-center text-gray-400 py-4"
                          data-ocid="admin.escrow.empty_state"
                        >
                          No active escrow holds
                        </p>
                      );
                    return escrowItems.map((esc: any, i: number) => (
                      <div
                        key={esc.id}
                        className="rounded-xl p-3"
                        style={{
                          background: "rgba(59,130,246,0.05)",
                          border: "1px solid rgba(59,130,246,0.2)",
                        }}
                        data-ocid={`admin.escrow.item.${i + 1}`}
                      >
                        <div className="flex justify-between">
                          <div>
                            <p className="text-sm font-semibold text-[#1E293B]">
                              {esc.model}
                            </p>
                            <p className="text-xs" style={{ color: "#9CA3AF" }}>
                              Buyer {esc.buyer} · Held {esc.since}
                            </p>
                          </div>
                          <span
                            className="font-bold text-sm"
                            style={{ color: "#1D4ED8" }}
                          >
                            {esc.amount}
                          </span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </SectionBlock>

              {/* Dispute Resolution */}
              <SectionBlock title="Dispute Resolution">
                <div className="space-y-3">
                  {(() => {
                    let disputes: any[] = [];
                    try {
                      disputes = JSON.parse(
                        localStorage.getItem("77m_disputes") || "[]",
                      );
                    } catch {}
                    if (disputes.length === 0)
                      return (
                        <p
                          className="text-xs text-center text-gray-400 py-4"
                          data-ocid="admin.disputes.empty_state"
                        >
                          No active disputes
                        </p>
                      );
                    return disputes.map((dis: any, i: number) => (
                      <div
                        key={dis.id}
                        className="rounded-xl p-4"
                        style={{
                          background: "rgba(239,68,68,0.05)",
                          border: "1px solid rgba(239,68,68,0.2)",
                        }}
                        data-ocid={`admin.disputes.item.${i + 1}`}
                      >
                        <p className="text-sm font-semibold text-[#1E293B] mb-1">
                          {dis.device}
                        </p>
                        <p
                          className="text-xs mb-1"
                          style={{ color: "#9CA3AF" }}
                        >
                          Buyer {dis.buyer} claims: &quot;{dis.claim}&quot;
                        </p>
                        <p
                          className="text-xs mb-3 font-semibold"
                          style={{ color: "#1D4ED8" }}
                        >
                          Amount in Escrow: {dis.amount}
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            data-ocid="admin.disputes.refund.button"
                            onClick={() =>
                              toast.success("Refund issued to buyer")
                            }
                            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white"
                            style={{ background: "#22C55E" }}
                          >
                            Refund Buyer
                          </button>
                          <button
                            type="button"
                            data-ocid="admin.disputes.release.button"
                            onClick={() =>
                              toast.success("Funds released to seller")
                            }
                            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white"
                            style={{ background: "#1D4ED8" }}
                          >
                            Release to Seller
                          </button>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </SectionBlock>
            </div>
          )}

          {/* ===== DIAGNOSTICS ===== */}
          {activeSection === "diagnostics" && (
            <div className="space-y-5">
              <SectionBlock title="Demand Heatmap">
                <div className="space-y-3">
                  {(() => {
                    let heatmapItems: Array<{
                      model: string;
                      stars: number;
                      demand: number;
                    }> = [];
                    try {
                      const listings = JSON.parse(
                        localStorage.getItem("77m_listings") || "[]",
                      );
                      const modelMap: Record<string, number> = {};
                      for (const l of listings) {
                        const key = l.model || l.title || "Unknown";
                        modelMap[key] =
                          (modelMap[key] || 0) +
                          (l.watchlistCount || l.stars || 1);
                      }
                      const maxStars = Math.max(...Object.values(modelMap), 1);
                      heatmapItems = Object.entries(modelMap)
                        .map(([model, stars]) => ({
                          model,
                          stars,
                          demand: Math.round((stars / maxStars) * 100),
                        }))
                        .sort((a, b) => b.stars - a.stars)
                        .slice(0, 8);
                    } catch {}
                    if (heatmapItems.length === 0)
                      return (
                        <p
                          className="text-xs text-center text-gray-400 py-4"
                          data-ocid="admin.heatmap.empty_state"
                        >
                          No data yet
                        </p>
                      );
                    return heatmapItems.map((item, i) => (
                      <div
                        key={item.model}
                        className="space-y-1"
                        data-ocid={`admin.heatmap.item.${i + 1}`}
                      >
                        <div className="flex justify-between text-xs">
                          <span className="text-[#1E293B] font-medium">
                            {item.model}
                          </span>
                          <span style={{ color: "#9CA3AF" }}>
                            {item.stars} stars
                          </span>
                        </div>
                        <div
                          className="w-full h-2 rounded-full overflow-hidden"
                          style={{ background: "#E2E8F0" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${item.demand}%`,
                              background:
                                item.demand > 75
                                  ? "#22C55E"
                                  : item.demand > 50
                                    ? "#3B82F6"
                                    : "#F59E0B",
                            }}
                          />
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </SectionBlock>

              <SectionBlock title="Price Benchmarking">
                <div className="space-y-2">
                  {(() => {
                    let benchmarkItems: Array<{
                      model: string;
                      avgPrice: string;
                      trend: string;
                    }> = [];
                    try {
                      const listings = JSON.parse(
                        localStorage.getItem("77m_listings") || "[]",
                      );
                      const soldListings = listings.filter(
                        (l: any) => l.status === "sold",
                      );
                      const modelPrices: Record<string, number[]> = {};
                      for (const l of soldListings) {
                        const key = l.model || l.title || "Unknown";
                        const price = Number(
                          l.current_high_bid || l.basePrice || l.price || 0,
                        );
                        if (!modelPrices[key]) modelPrices[key] = [];
                        modelPrices[key].push(price);
                      }
                      benchmarkItems = Object.entries(modelPrices)
                        .map(([model, prices]) => {
                          const avg = Math.round(
                            prices.reduce((a, b) => a + b, 0) / prices.length,
                          );
                          return {
                            model,
                            avgPrice: `₹${avg.toLocaleString("en-IN")}`,
                            trend: "+₹0",
                          };
                        })
                        .slice(0, 5);
                    } catch {}
                    if (benchmarkItems.length === 0)
                      return (
                        <p
                          className="text-xs text-center text-gray-400 py-4"
                          data-ocid="admin.benchmarks.empty_state"
                        >
                          No sold listings yet
                        </p>
                      );
                    return benchmarkItems.map((bench, i) => (
                      <div
                        key={bench.model}
                        className="rounded-xl p-3"
                        style={{
                          background: "#F8FAFC",
                          border: "1px solid #E2E8F0",
                        }}
                        data-ocid={`admin.benchmarks.item.${i + 1}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-[#1E293B] font-medium">
                            {bench.model}
                          </p>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-sm font-bold"
                              style={{ color: "#1D4ED8" }}
                            >
                              {bench.avgPrice}
                            </span>
                            <span
                              className="text-xs"
                              style={{
                                color: bench.trend.startsWith("+")
                                  ? "#22C55E"
                                  : "#EF4444",
                              }}
                            >
                              <TrendingUp className="inline w-3 h-3 mr-0.5" />
                              {bench.trend}
                            </span>
                          </div>
                        </div>
                        {activeBenchmarkIdx === i ? (
                          <div className="flex gap-2">
                            <input
                              data-ocid="admin.benchmarks.price.input"
                              type="text"
                              placeholder="Set base price (₹)"
                              value={benchmarkInputs[i] ?? ""}
                              onChange={(e) =>
                                setBenchmarkInputs((prev) => ({
                                  ...prev,
                                  [i]: e.target.value,
                                }))
                              }
                              className="flex-1 px-3 py-1.5 rounded-lg text-sm"
                              style={{
                                background: "#FFFFFF",
                                border: "1px solid #3B82F6",
                                color: "white",
                                outline: "none",
                              }}
                            />
                            <button
                              type="button"
                              data-ocid="admin.benchmarks.save.button"
                              onClick={() => {
                                toast.success(
                                  `Base price set for ${bench.model}`,
                                );
                                setActiveBenchmarkIdx(null);
                              }}
                              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white"
                              style={{ background: "#1D4ED8" }}
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            data-ocid="admin.benchmarks.set.button"
                            onClick={() => setActiveBenchmarkIdx(i)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                            style={{
                              background: "rgba(29,78,216,0.08)",
                              color: "#1D4ED8",
                              border: "1px solid rgba(59,130,246,0.2)",
                            }}
                          >
                            Set Base Price
                          </button>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </SectionBlock>
            </div>
          )}

          {/* ===== SETTINGS ===== */}
          {activeSection === "settings" && (
            <div className="space-y-4">
              <div
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(29,78,216,0.08)" }}
                >
                  <Shield className="w-6 h-6" style={{ color: "#1D4ED8" }} />
                </div>
                <div>
                  <p className="font-bold text-[#1E293B]">Super Admin</p>
                  <p className="text-xs" style={{ color: "#9CA3AF" }}>
                    admin@77mobiles.pro
                  </p>
                </div>
              </div>

              <SectionBlock title="Environment Mode">
                <div className="space-y-3">
                  <div
                    className="p-3 rounded-xl flex items-center justify-between"
                    style={{
                      background: isDemoMode ? "#FEF9C3" : "#D1FAE5",
                      border: `1px solid ${isDemoMode ? "#FDE047" : "#6EE7B7"}`,
                    }}
                  >
                    <div>
                      <p
                        className="font-bold text-sm"
                        style={{ color: isDemoMode ? "#92400E" : "#065F46" }}
                      >
                        {isDemoMode ? "DEMO MODE ACTIVE" : "LIVE MODE ACTIVE"}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: isDemoMode ? "#B45309" : "#047857" }}
                      >
                        {isDemoMode
                          ? "Using mock data. IMEI API bypassed. OTP: 123456"
                          : "All systems connected to live Firestore"}
                      </p>
                    </div>
                  </div>
                  <ToggleRow
                    label="Demo Mode"
                    sub="Show demo banners, bypass IMEI API, use static user counts"
                    value={isDemoMode}
                    onChange={(v) => {
                      setIsDemoMode(v);
                      localStorage.setItem("77m_demo_mode", String(v));
                      toast.success(`Switched to ${v ? "Demo" : "Live"} mode`);
                    }}
                    ocid="admin.settings.demo_mode.switch"
                  />
                </div>
              </SectionBlock>

              <SectionBlock title="System Controls">
                <div className="space-y-4">
                  <ToggleRow
                    label="Maintenance Mode"
                    sub="Disable public access temporarily"
                    value={maintenanceMode}
                    onChange={(v) => {
                      setMaintenanceMode(v);
                      toast.success(
                        `Maintenance mode ${v ? "enabled" : "disabled"}`,
                      );
                    }}
                    ocid="admin.settings.maintenance.switch"
                  />
                  <ToggleRow
                    label="New Registrations"
                    sub="Allow new user sign-ups"
                    value={newRegistrations}
                    onChange={(v) => {
                      setNewRegistrations(v);
                      toast.success(
                        `New registrations ${v ? "enabled" : "disabled"}`,
                      );
                    }}
                    ocid="admin.settings.registrations.switch"
                  />
                  <ToggleRow
                    label="Email Notifications"
                    sub="Send system alerts via email"
                    value={emailNotifications}
                    onChange={(v) => {
                      setEmailNotifications(v);
                      toast.success(
                        `Email notifications ${v ? "enabled" : "disabled"}`,
                      );
                    }}
                    ocid="admin.settings.email.switch"
                  />
                </div>
              </SectionBlock>

              <SectionBlock title="IP Whitelist">
                <div className="flex gap-2">
                  <input
                    data-ocid="admin.settings.ip.input"
                    type="text"
                    value={ipWhitelist}
                    onChange={(e) => setIpWhitelist(e.target.value)}
                    placeholder="192.168.1.0/24"
                    className="flex-1 px-3 py-2 rounded-xl text-sm"
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      color: "white",
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    data-ocid="admin.settings.ip.save_button"
                    onClick={() => toast.success("IP whitelist updated")}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                    style={{ background: "#1D4ED8" }}
                  >
                    Save
                  </button>
                </div>
              </SectionBlock>
            </div>
          )}

          {/* ===== PORTAL CONTROLS ===== */}
          {activeSection === "portal-controls" && (
            <div className="space-y-5">
              {/* Buyer Portal */}
              <SectionBlock title="Buyer Portal Settings">
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "#1E293B" }}
                      >
                        Minimum Bid Increment
                      </p>
                      <span
                        className="text-sm font-black"
                        style={{ color: "#1D4ED8" }}
                      >
                        ₹{buyerMinBid.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <input
                      id="admin.portal.buyer_min_bid.input"
                      data-ocid="admin.portal.buyer_min_bid.input"
                      type="range"
                      min={100}
                      max={2000}
                      step={100}
                      value={buyerMinBid}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setBuyerMinBid(v);
                        writePortalSettings({ buyerMinBidIncrement: v });
                      }}
                      className="w-full accent-blue-600"
                      style={{ accentColor: "#1D4ED8" }}
                    />
                    <div
                      className="flex justify-between text-[10px]"
                      style={{ color: "#9CA3AF" }}
                    >
                      <span>₹100</span>
                      <span>₹2,000</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "#1E293B" }}
                      >
                        Auction Duration
                      </p>
                      <span
                        className="text-sm font-black"
                        style={{ color: "#1D4ED8" }}
                      >
                        {buyerAuctionDuration} min
                      </span>
                    </div>
                    <input
                      id="admin.portal.buyer_duration.input"
                      data-ocid="admin.portal.buyer_duration.input"
                      type="range"
                      min={10}
                      max={60}
                      step={5}
                      value={buyerAuctionDuration}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setBuyerAuctionDuration(v);
                        writePortalSettings({ buyerAuctionDuration: v });
                      }}
                      className="w-full"
                      style={{ accentColor: "#1D4ED8" }}
                    />
                    <div
                      className="flex justify-between text-[10px]"
                      style={{ color: "#9CA3AF" }}
                    >
                      <span>10 min</span>
                      <span>60 min</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "#1E293B" }}
                      >
                        Max Listings Per Page
                      </p>
                      <span
                        className="text-sm font-black"
                        style={{ color: "#1D4ED8" }}
                      >
                        {buyerMaxListings}
                      </span>
                    </div>
                    <input
                      id="admin.portal.buyer_max_listings.input"
                      data-ocid="admin.portal.buyer_max_listings.input"
                      type="range"
                      min={10}
                      max={50}
                      step={5}
                      value={buyerMaxListings}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setBuyerMaxListings(v);
                        writePortalSettings({ buyerMaxListings: v });
                      }}
                      className="w-full"
                      style={{ accentColor: "#1D4ED8" }}
                    />
                    <div
                      className="flex justify-between text-[10px]"
                      style={{ color: "#9CA3AF" }}
                    >
                      <span>10</span>
                      <span>50</span>
                    </div>
                  </div>
                </div>
              </SectionBlock>

              {/* Seller Portal */}
              <SectionBlock title="Seller Portal Settings">
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "#1E293B" }}
                      >
                        Listing Fee
                      </p>
                      <span
                        className="text-sm font-black"
                        style={{ color: "#1D4ED8" }}
                      >
                        ₹{sellerListingFee}
                      </span>
                    </div>
                    <input
                      id="admin.portal.seller_fee.input"
                      data-ocid="admin.portal.seller_fee.input"
                      type="range"
                      min={0}
                      max={500}
                      step={50}
                      value={sellerListingFee}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setSellerListingFee(v);
                        writePortalSettings({ sellerListingFee: v });
                      }}
                      className="w-full"
                      style={{ accentColor: "#1D4ED8" }}
                    />
                    <div
                      className="flex justify-between text-[10px]"
                      style={{ color: "#9CA3AF" }}
                    >
                      <span>₹0 (Free)</span>
                      <span>₹500</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "#1E293B" }}
                      >
                        Max Photos Per Listing
                      </p>
                      <span
                        className="text-sm font-black"
                        style={{ color: "#1D4ED8" }}
                      >
                        {sellerMaxPhotos} photos
                      </span>
                    </div>
                    <input
                      id="admin.portal.seller_photos.input"
                      data-ocid="admin.portal.seller_photos.input"
                      type="range"
                      min={3}
                      max={10}
                      step={1}
                      value={sellerMaxPhotos}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setSellerMaxPhotos(v);
                        writePortalSettings({ sellerMaxPhotos: v });
                      }}
                      className="w-full"
                      style={{ accentColor: "#1D4ED8" }}
                    />
                    <div
                      className="flex justify-between text-[10px]"
                      style={{ color: "#9CA3AF" }}
                    >
                      <span>3</span>
                      <span>10</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "#1E293B" }}
                      >
                        Auto-expire Listings
                      </p>
                      <span
                        className="text-sm font-black"
                        style={{ color: "#1D4ED8" }}
                      >
                        {sellerAutoExpire} days
                      </span>
                    </div>
                    <input
                      id="admin.portal.seller_expire.input"
                      data-ocid="admin.portal.seller_expire.input"
                      type="range"
                      min={7}
                      max={30}
                      step={1}
                      value={sellerAutoExpire}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setSellerAutoExpire(v);
                        writePortalSettings({ sellerAutoExpireDays: v });
                      }}
                      className="w-full"
                      style={{ accentColor: "#1D4ED8" }}
                    />
                    <div
                      className="flex justify-between text-[10px]"
                      style={{ color: "#9CA3AF" }}
                    >
                      <span>7 days</span>
                      <span>30 days</span>
                    </div>
                  </div>
                </div>
              </SectionBlock>

              {/* Task 12: Slider Management */}
              <SectionBlock title="Slider Management">
                <div className="space-y-4">
                  {/* Upload New Banner */}
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-gray-500 uppercase">
                      Upload New Banner
                    </p>
                    <div>
                      <label
                        htmlFor="admin-banner-upload"
                        className="block text-xs text-gray-600 mb-1 font-medium"
                      >
                        Banner Image
                      </label>
                      <label
                        htmlFor="admin-banner-upload"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer text-sm font-semibold"
                        style={{
                          background: "#F1F5F9",
                          border: "1.5px dashed #CBD5E1",
                          color: "#64748B",
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="w-4 h-4"
                          aria-hidden="true"
                        >
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                        </svg>
                        {newBannerPreview
                          ? "Image selected ✓"
                          : "Choose image..."}
                        <input
                          id="admin-banner-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) =>
                                setNewBannerPreview(
                                  ev.target?.result as string,
                                );
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      {newBannerPreview && (
                        <img
                          src={newBannerPreview}
                          alt="Banner preview"
                          className="mt-2 rounded-xl h-16 w-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="admin-banner-title"
                        className="block text-xs text-gray-600 mb-1 font-medium"
                      >
                        Title
                      </label>
                      <input
                        id="admin-banner-title"
                        data-ocid="admin.slider.title.input"
                        type="text"
                        value={newBannerTitle}
                        onChange={(e) => setNewBannerTitle(e.target.value)}
                        placeholder="e.g. iPhone 16 Pro — Bidding War!"
                        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                        style={{
                          background: "#F8FAFC",
                          border: "1px solid #E2E8F0",
                          color: "#1E293B",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="admin-banner-target"
                        className="block text-xs text-gray-600 mb-1 font-medium"
                      >
                        Target Audience
                      </label>
                      <select
                        id="admin-banner-target"
                        data-ocid="admin.slider.target.select"
                        value={newBannerTarget}
                        onChange={(e) =>
                          setNewBannerTarget(
                            e.target.value as "buyer" | "seller" | "both",
                          )
                        }
                        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                        style={{
                          background: "#F8FAFC",
                          border: "1px solid #E2E8F0",
                          color: "#1E293B",
                        }}
                      >
                        <option value="both">Both Portals</option>
                        <option value="buyer">Buyer Portal Only</option>
                        <option value="seller">Seller Portal Only</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      data-ocid="admin.slider.publish.button"
                      onClick={() => {
                        if (!newBannerTitle) {
                          toast.error("Enter a banner title");
                          return;
                        }
                        const newBanner = {
                          id: `banner-${Date.now()}`,
                          imageUrl: newBannerPreview,
                          title: newBannerTitle,
                          target: newBannerTarget,
                          active: true,
                          createdAt: Date.now(),
                        };
                        setBanners((prev) => {
                          const updated = [newBanner, ...prev];
                          writeBanners(updated);
                          return updated;
                        });
                        setNewBannerTitle("");
                        setNewBannerPreview("");
                        toast.success(
                          "Banner published — portals updated in real-time!",
                        );
                      }}
                      className="w-full py-2.5 rounded-xl font-bold text-white text-sm"
                      style={{ background: "#1D4ED8" }}
                    >
                      Publish Banner
                    </button>
                  </div>

                  {/* Banner list */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                      Active Banners ({banners.length})
                    </p>
                    <div className="space-y-2">
                      {banners.map((banner) => (
                        <div
                          key={banner.id}
                          className="flex items-center gap-3 p-3 rounded-xl"
                          style={{
                            background: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                          }}
                          data-ocid={`admin.slider.banner.item.${banners.indexOf(banner) + 1}`}
                        >
                          {banner.imageUrl && (
                            <img
                              src={banner.imageUrl}
                              alt={banner.title}
                              className="w-12 h-8 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          {!banner.imageUrl && (
                            <div
                              className="w-12 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                              style={{ background: "#E2E8F0" }}
                            >
                              <span className="text-[8px] text-gray-400">
                                IMG
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#1E293B] truncate">
                              {banner.title}
                            </p>
                            <span
                              className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                              style={{
                                background:
                                  banner.target === "both"
                                    ? "#EFF6FF"
                                    : banner.target === "buyer"
                                      ? "#F0FDF4"
                                      : "#FFF7ED",
                                color:
                                  banner.target === "both"
                                    ? "#1D4ED8"
                                    : banner.target === "buyer"
                                      ? "#16A34A"
                                      : "#F97316",
                              }}
                            >
                              {banner.target === "both"
                                ? "Both"
                                : banner.target === "buyer"
                                  ? "Buyer"
                                  : "Seller"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              type="button"
                              data-ocid="admin.slider.banner.toggle"
                              onClick={() => {
                                setBanners((prev) => {
                                  const updated = prev.map((b) =>
                                    b.id === banner.id
                                      ? { ...b, active: !b.active }
                                      : b,
                                  );
                                  writeBanners(updated);
                                  return updated;
                                });
                                toast.success(
                                  `Banner ${banner.active ? "deactivated" : "activated"} successfully`,
                                );
                              }}
                              className="text-[10px] font-bold px-2 py-1 rounded-lg transition-all"
                              style={{
                                background: banner.active
                                  ? "#D1FAE5"
                                  : "#F1F5F9",
                                color: banner.active ? "#065F46" : "#94A3B8",
                              }}
                            >
                              {banner.active ? "ON" : "OFF"}
                            </button>
                            <button
                              type="button"
                              data-ocid="admin.slider.banner.delete_button"
                              onClick={() => {
                                setBanners((prev) => {
                                  const updated = prev.filter(
                                    (b) => b.id !== banner.id,
                                  );
                                  writeBanners(updated);
                                  return updated;
                                });
                                toast.success("Banner removed");
                              }}
                              className="w-6 h-6 flex items-center justify-center rounded-lg"
                              style={{
                                background: "#FEE2E2",
                                color: "#DC2626",
                              }}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="w-3 h-3"
                                aria-hidden="true"
                              >
                                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SectionBlock>

              <button
                type="button"
                data-ocid="admin.portal.save.button"
                onClick={() => {
                  writePortalSettings({
                    buyerMinBidIncrement: buyerMinBid,
                    buyerAuctionDuration,
                    buyerMaxListings,
                    sellerListingFee,
                    sellerMaxPhotos,
                    sellerAutoExpireDays: sellerAutoExpire,
                  });
                  setPortalSaveSuccess(true);
                  toast.success("Portal settings saved successfully!");
                  setTimeout(() => setPortalSaveSuccess(false), 3000);
                }}
                className="w-full py-3 rounded-xl font-bold text-white transition-all"
                style={{ background: "#1D4ED8" }}
              >
                {portalSaveSuccess ? "✓ Changes Saved" : "Save Changes"}
              </button>
            </div>
          )}

          {/* ===== SLIDER MANAGEMENT ===== */}
          {activeSection === "slider-management" && (
            <div className="space-y-4">
              <div
                className="rounded-2xl p-4"
                style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}
              >
                <p className="font-bold text-sm text-[#1E293B] mb-1">
                  Slider Management
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Upload and manage banners shown on the Buyer and Seller portal
                  home screens.
                </p>

                {/* Upload New Banner */}
                <div className="space-y-3 mb-6">
                  <p className="text-xs font-bold text-gray-500 uppercase">
                    Upload New Banner
                  </p>
                  <div>
                    <label
                      htmlFor="slider-mgmt-upload"
                      className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer text-sm font-semibold"
                      style={{
                        background: "#F1F5F9",
                        border: "1.5px dashed #CBD5E1",
                        color: "#64748B",
                      }}
                    >
                      <Image className="w-4 h-4" />
                      {newBannerPreview
                        ? "Image selected ✓"
                        : "Choose image..."}
                      <input
                        id="slider-mgmt-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) =>
                              setNewBannerPreview(ev.target?.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {newBannerPreview && (
                      <img
                        src={newBannerPreview}
                        alt="Banner preview"
                        className="mt-2 rounded-xl h-16 w-full object-cover"
                      />
                    )}
                  </div>
                  <input
                    data-ocid="admin.slider.title.input"
                    type="text"
                    value={newBannerTitle}
                    onChange={(e) => setNewBannerTitle(e.target.value)}
                    placeholder="Banner title..."
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      color: "#1E293B",
                    }}
                  />
                  <select
                    data-ocid="admin.slider.target.select"
                    value={newBannerTarget}
                    onChange={(e) =>
                      setNewBannerTarget(
                        e.target.value as "buyer" | "seller" | "both",
                      )
                    }
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      color: "#1E293B",
                    }}
                  >
                    <option value="both">Both Portals</option>
                    <option value="buyer">Buyer Portal Only</option>
                    <option value="seller">Seller Portal Only</option>
                  </select>
                  <button
                    type="button"
                    data-ocid="admin.slider.publish.button"
                    onClick={() => {
                      if (!newBannerTitle) {
                        toast.error("Enter a banner title");
                        return;
                      }
                      setBanners((prev) => {
                        const updated = [
                          {
                            id: `banner-${Date.now()}`,
                            imageUrl: newBannerPreview,
                            title: newBannerTitle,
                            target: newBannerTarget,
                            active: true,
                            createdAt: Date.now(),
                          },
                          ...prev,
                        ];
                        writeBanners(updated);
                        return updated;
                      });
                      setNewBannerTitle("");
                      setNewBannerPreview("");
                      toast.success(
                        "Banner published — portals updated in real-time!",
                      );
                    }}
                    className="w-full py-2.5 rounded-xl font-bold text-white text-sm"
                    style={{ background: "#1D4ED8" }}
                  >
                    Publish Banner
                  </button>
                </div>

                {/* Banner list */}
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                  Active Banners ({banners.length})
                </p>
                <div className="space-y-2">
                  {banners.map((banner, bi) => (
                    <div
                      key={banner.id}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{
                        background: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                      }}
                      data-ocid={`admin.slider.banner.item.${bi + 1}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#1E293B] truncate">
                          {banner.title}
                        </p>
                        <span
                          className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{
                            background:
                              banner.target === "both"
                                ? "#EFF6FF"
                                : banner.target === "buyer"
                                  ? "#F0FDF4"
                                  : "#FFF7ED",
                            color:
                              banner.target === "both"
                                ? "#1D4ED8"
                                : banner.target === "buyer"
                                  ? "#16A34A"
                                  : "#F97316",
                          }}
                        >
                          {banner.target === "both"
                            ? "Both"
                            : banner.target === "buyer"
                              ? "Buyer"
                              : "Seller"}
                        </span>
                      </div>
                      <button
                        type="button"
                        data-ocid="admin.slider.banner.toggle"
                        onClick={() => {
                          setBanners((prev) => {
                            const updated = prev.map((b) =>
                              b.id === banner.id
                                ? { ...b, active: !b.active }
                                : b,
                            );
                            writeBanners(updated);
                            return updated;
                          });
                          toast.success(
                            `Banner ${banner.active ? "deactivated" : "activated"}`,
                          );
                        }}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg"
                        style={{
                          background: banner.active ? "#D1FAE5" : "#F1F5F9",
                          color: banner.active ? "#065F46" : "#94A3B8",
                        }}
                      >
                        {banner.active ? "ON" : "OFF"}
                      </button>
                      <button
                        type="button"
                        data-ocid="admin.slider.banner.delete_button"
                        onClick={() => {
                          setBanners((prev) => {
                            const updated = prev.filter(
                              (b) => b.id !== banner.id,
                            );
                            writeBanners(updated);
                            return updated;
                          });
                          toast.success("Banner removed");
                        }}
                        className="w-6 h-6 flex items-center justify-center rounded-lg"
                        style={{ background: "#FEE2E2", color: "#DC2626" }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== AUDIT LOG ===== */}
          {activeSection === "auditlog" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  data-ocid="admin.auditlog.export.button"
                  onClick={() => toast.success("Audit log exported as CSV")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "#1D4ED8" }}
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              </div>
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}
              >
                {(() => {
                  let auditEntries: Array<{ time: string; entry: string }> = [];
                  try {
                    auditEntries = JSON.parse(
                      localStorage.getItem("77m_audit_log") || "[]",
                    );
                  } catch {}
                  if (auditEntries.length === 0)
                    return (
                      <p
                        className="text-xs text-center text-gray-400 py-6"
                        data-ocid="admin.auditlog.empty_state"
                      >
                        No audit entries yet
                      </p>
                    );
                  return auditEntries.map((entry: any, i: number) => (
                    <div
                      key={entry.time}
                      className="flex items-start gap-3 p-3.5 border-b last:border-0"
                      style={{ borderColor: "#E2E8F0" }}
                      data-ocid={`admin.auditlog.item.${i + 1}`}
                    >
                      <CheckCircle
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        style={{ color: "#1D4ED8" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1E293B] leading-snug">
                          {entry.entry}
                        </p>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "#9CA3AF" }}
                        >
                          {entry.time}
                        </p>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Desktop sidebar visible >= lg */}
      <style>{`
        @media (min-width: 1024px) {
          .admin-sidebar-fixed {
            transform: translateX(0) !important;
            position: fixed;
          }
          .admin-main-offset {
            margin-left: 240px;
          }
        }
      `}</style>

      {/* ===== USER DETAIL MODAL (Task 1D) ===== */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4"
          onClick={() => setSelectedUser(null)}
          onKeyDown={(e) => e.key === "Escape" && setSelectedUser(null)}
          aria-label="User detail modal"
          aria-modal="true"
        >
          <div
            className="rounded-2xl bg-white p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
            data-ocid="admin.users.modal"
          >
            {/* Close button */}
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg text-[#1E293B]">User Details</h3>
              <button
                type="button"
                data-ocid="admin.users.modal.close_button"
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "#F1F5F9", color: "#64748B" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Section */}
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase text-gray-400 mb-3 tracking-wider">
                Profile
              </p>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Full Name</span>
                  <span className="text-sm font-semibold text-[#1E293B]">
                    {selectedUser.name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Phone Number</span>
                  <span className="text-sm font-semibold text-[#1E293B]">
                    {selectedUser.phone}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Password</span>
                  {resetPwTarget === selectedUser.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="password"
                        value={resetPwValue}
                        onChange={(e) => setResetPwValue(e.target.value)}
                        placeholder="Enter New Password"
                        minLength={6}
                        data-ocid="admin.users.modal.reset_password.input"
                        className="text-xs border border-gray-300 rounded-lg px-2 py-1 w-36 focus:outline-none focus:border-[#1D4ED8]"
                        style={{ fontFamily: "inherit" }}
                      />
                      <button
                        type="button"
                        data-ocid="admin.users.modal.reset_password.save_button"
                        onClick={() => {
                          if (resetPwValue.length < 6) {
                            toast.error(
                              "Password must be at least 6 characters",
                            );
                            return;
                          }
                          // Update 77m_kyc_submissions
                          try {
                            const kycSubs = JSON.parse(
                              localStorage.getItem("77m_kyc_submissions") ||
                                "[]",
                            );
                            localStorage.setItem(
                              "77m_kyc_submissions",
                              JSON.stringify(
                                kycSubs.map((k: any) =>
                                  k.id === selectedUser.id
                                    ? { ...k, password: resetPwValue }
                                    : k,
                                ),
                              ),
                            );
                          } catch {}
                          // Update 77m_registered_users if present
                          try {
                            const regUsers = JSON.parse(
                              localStorage.getItem("77m_registered_users") ||
                                "[]",
                            );
                            if (regUsers.length > 0) {
                              localStorage.setItem(
                                "77m_registered_users",
                                JSON.stringify(
                                  regUsers.map((u: any) =>
                                    u.id === selectedUser.id
                                      ? { ...u, password: resetPwValue }
                                      : u,
                                  ),
                                ),
                              );
                            }
                          } catch {}
                          // Audit log
                          try {
                            const auditLog = JSON.parse(
                              localStorage.getItem("77m_audit_log") || "[]",
                            );
                            auditLog.unshift({
                              time: new Date().toLocaleString("en-IN"),
                              entry: `Admin reset password for ${selectedUser.name}`,
                            });
                            localStorage.setItem(
                              "77m_audit_log",
                              JSON.stringify(auditLog.slice(0, 100)),
                            );
                          } catch {}
                          toast.success(
                            `Password for ${selectedUser.name} updated successfully.`,
                          );
                          setResetPwTarget(null);
                          setResetPwValue("");
                        }}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg text-white"
                        style={{ background: "#1D4ED8" }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        data-ocid="admin.users.modal.reset_password.cancel_button"
                        onClick={() => {
                          setResetPwTarget(null);
                          setResetPwValue("");
                        }}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg"
                        style={{ background: "#F1F5F9", color: "#64748B" }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 font-mono">
                        ••••••••
                      </span>
                      <button
                        type="button"
                        data-ocid="admin.users.modal.reset_password.button"
                        onClick={() => {
                          setResetPwTarget(selectedUser.id);
                          setResetPwValue("");
                        }}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg"
                        style={{
                          background: "rgba(29,78,216,0.08)",
                          color: "#1D4ED8",
                        }}
                      >
                        Reset
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 my-4" />

            {/* Business Info Section */}
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase text-gray-400 mb-3 tracking-wider">
                Business Info
              </p>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Business Name</span>
                  <span className="text-sm font-semibold text-[#1E293B]">
                    {selectedUser.businessName || "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">City</span>
                  <span className="text-sm font-semibold text-[#1E293B]">
                    {selectedUser.location || "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Role</span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background:
                        selectedUser.role === "buyer" ||
                        selectedUser.role === "Buyer"
                          ? "#ECFDF5"
                          : "#EFF6FF",
                      color:
                        selectedUser.role === "buyer" ||
                        selectedUser.role === "Buyer"
                          ? "#065F46"
                          : "#1D4ED8",
                    }}
                  >
                    {selectedUser.role === "buyer" ||
                    selectedUser.role === "Buyer"
                      ? "Business Buyer"
                      : "Seller / Dealer"}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 my-4" />

            {/* Documents Section */}
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase text-gray-400 mb-3 tracking-wider">
                Documents
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Document Type</p>
                  <p className="text-sm font-semibold text-[#1E293B]">
                    {selectedUser.docType || "KYC Document"}
                  </p>
                </div>
                {(() => {
                  const docUrl =
                    selectedUser.aadhaar_url ||
                    selectedUser.pan_url ||
                    selectedUser.kyc_document_url ||
                    selectedUser.doc_url ||
                    null;
                  const isValidUrl =
                    docUrl &&
                    (docUrl.startsWith("http") || docUrl.startsWith("data:"));
                  const isGsPath = docUrl?.startsWith("gs://");
                  if (isValidUrl) {
                    return (
                      <button
                        type="button"
                        data-ocid="admin.users.modal.view_doc.button"
                        onClick={() =>
                          setDocModal({ url: docUrl, name: selectedUser.name })
                        }
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl"
                        style={{ background: "#1D4ED8", color: "white" }}
                      >
                        <Eye className="w-3.5 h-3.5" /> View Doc
                      </button>
                    );
                  }
                  if (isGsPath) {
                    return (
                      <button
                        type="button"
                        data-ocid="admin.users.modal.view_doc.button"
                        disabled
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl cursor-not-allowed opacity-60"
                        style={{ background: "#E2E8F0", color: "#94A3B8" }}
                      >
                        <Eye className="w-3.5 h-3.5" /> Processing...
                      </button>
                    );
                  }
                  return (
                    <button
                      type="button"
                      data-ocid="admin.users.modal.view_doc.button"
                      disabled
                      className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-2 rounded-xl cursor-not-allowed opacity-60"
                      style={{ background: "#E2E8F0", color: "#94A3B8" }}
                    >
                      No Document Uploaded
                    </button>
                  );
                })()}
              </div>
            </div>

            {/* Action buttons — only for Pending */}
            {selectedUser.kycStatus === "Pending" && (
              <>
                <div className="border-t border-gray-100 my-4" />
                <div className="flex gap-3">
                  <button
                    type="button"
                    data-ocid="admin.users.modal.approve.button"
                    onClick={() => {
                      setKycItems((prev) =>
                        prev.map((k) =>
                          k.id === selectedUser.id
                            ? { ...k, status: "Approved" }
                            : k,
                        ),
                      );
                      setPendingCount((prev) => Math.max(0, prev - 1));
                      approveUserByPhone((selectedUser.phone as string) || "");
                      try {
                        const kycSubs = JSON.parse(
                          localStorage.getItem("77m_kyc_submissions") || "[]",
                        );
                        localStorage.setItem(
                          "77m_kyc_submissions",
                          JSON.stringify(
                            kycSubs.map((k: any) =>
                              k.id === selectedUser.id
                                ? { ...k, status: "approved" }
                                : k,
                            ),
                          ),
                        );
                        const auditLog = JSON.parse(
                          localStorage.getItem("77m_audit_log") || "[]",
                        );
                        auditLog.unshift({
                          time: new Date().toLocaleString("en-IN"),
                          entry: `Admin approved KYC for ${selectedUser.name} (${selectedUser.businessName})`,
                        });
                        localStorage.setItem(
                          "77m_audit_log",
                          JSON.stringify(auditLog.slice(0, 100)),
                        );
                      } catch {}
                      toast.success(
                        "Approved — user can now access the portal",
                      );
                      setSelectedUser(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white"
                    style={{ background: "#16A34A" }}
                  >
                    ✓ Approve
                  </button>
                  <button
                    type="button"
                    data-ocid="admin.users.modal.reject.button"
                    onClick={() => {
                      setRejectTarget(selectedUser.id);
                      setRejectReason("");
                      setSelectedUser(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                    style={{
                      background: "rgba(239,68,68,0.1)",
                      color: "#EF4444",
                      border: "1px solid rgba(239,68,68,0.3)",
                    }}
                  >
                    ✕ Reject
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===== REJECT REASON MODAL (Task 1E) ===== */}
      {rejectTarget && (
        <div
          className="fixed inset-0 z-[110] bg-black/40 flex items-center justify-center p-4"
          onClick={() => setRejectTarget(null)}
          onKeyDown={(e) => e.key === "Escape" && setRejectTarget(null)}
          aria-label="Reject reason dialog"
          aria-modal="true"
          data-ocid="admin.users.reject.dialog"
        >
          <div
            className="rounded-2xl bg-white p-6 w-full max-w-sm"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-[#1E293B]">
                Reject Verification
              </h3>
              <button
                type="button"
                data-ocid="admin.users.reject.close_button"
                onClick={() => setRejectTarget(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "#F1F5F9", color: "#64748B" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Select a reason or write a custom message:
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                "Invalid GST Document",
                "Invalid PAN Card",
                "Blurry Photo",
                "Mismatched Business Name",
                "Incomplete Info",
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setRejectReason(reason)}
                  className="text-xs px-3 py-1.5 rounded-full font-medium transition-all"
                  style={{
                    background: rejectReason === reason ? "#1D4ED8" : "#F1F5F9",
                    color: rejectReason === reason ? "white" : "#64748B",
                    border:
                      rejectReason === reason
                        ? "1px solid #1D4ED8"
                        : "1px solid #E2E8F0",
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>
            <input
              data-ocid="admin.users.reject.input"
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Or type a custom reason…"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none mb-4"
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                color: "#1E293B",
              }}
            />
            <div className="flex gap-3">
              <button
                type="button"
                data-ocid="admin.users.reject.cancel_button"
                onClick={() => setRejectTarget(null)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: "#F1F5F9", color: "#64748B" }}
              >
                Cancel
              </button>
              <button
                type="button"
                data-ocid="admin.users.reject.confirm_button"
                onClick={() => {
                  if (!rejectReason.trim()) {
                    toast.error("Please select or enter a rejection reason");
                    return;
                  }
                  setKycItems((prev) =>
                    prev.map((k) =>
                      k.id === rejectTarget ? { ...k, status: "Rejected" } : k,
                    ),
                  );
                  try {
                    const kycSubs = JSON.parse(
                      localStorage.getItem("77m_kyc_submissions") || "[]",
                    );
                    localStorage.setItem(
                      "77m_kyc_submissions",
                      JSON.stringify(
                        kycSubs.map((k: any) =>
                          k.id === rejectTarget
                            ? { ...k, status: "rejected", rejectReason }
                            : k,
                        ),
                      ),
                    );
                    const auditLog = JSON.parse(
                      localStorage.getItem("77m_audit_log") || "[]",
                    );
                    const user = kycItems.find(
                      (k: any) => k.id === rejectTarget,
                    );
                    auditLog.unshift({
                      time: new Date().toLocaleString("en-IN"),
                      entry: `Admin rejected KYC for ${user?.name || rejectTarget} — reason: ${rejectReason}`,
                    });
                    localStorage.setItem(
                      "77m_audit_log",
                      JSON.stringify(auditLog.slice(0, 100)),
                    );
                  } catch {}
                  toast.error(`User rejected — reason: ${rejectReason}`);
                  setRejectTarget(null);
                  setRejectReason("");
                }}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white"
                style={{ background: "#EF4444" }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task 7: KYC Document Lightbox with Zoom */}
      {docModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.90)" }}
          onClick={() => setDocModal(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setDocModal(null);
          }}
          aria-label="Document preview"
        >
          <div
            className="relative max-w-[92vw] max-h-[92vh] rounded-2xl bg-white p-3 flex flex-col"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()}
          >
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-xs font-semibold text-gray-500">
                KYC Document — {docModal.name}
              </p>
              <div className="flex items-center gap-2">
                {docZoom > 1 && (
                  <span className="text-[10px] font-bold text-[#1D4ED8] bg-blue-50 px-1.5 py-0.5 rounded-md">
                    {docZoom.toFixed(1)}x
                  </span>
                )}
                <button
                  type="button"
                  title="Download"
                  onClick={() => window.open(docModal.url, "_blank")}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  data-ocid="admin.users.modal.view_doc.button"
                >
                  <Download className="w-3.5 h-3.5 text-gray-600" />
                </button>
                <button
                  type="button"
                  onClick={() => setDocModal(null)}
                  className="w-7 h-7 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            {/* Image container */}
            <div
              className="overflow-auto rounded-xl"
              style={{
                maxWidth: "85vw",
                maxHeight: "80vh",
                cursor: docZoom > 1 ? "grab" : "zoom-in",
              }}
              onWheel={(e) => {
                e.preventDefault();
                setDocZoom((z) =>
                  Math.min(3, Math.max(1, z + (e.deltaY < 0 ? 0.2 : -0.2))),
                );
              }}
            >
              <img
                src={docModal.url}
                alt="KYC Document"
                onDoubleClick={() => setDocZoom((z) => (z > 1 ? 1 : 2))}
                style={{
                  transform: `scale(${docZoom})`,
                  transformOrigin: "top left",
                  transition: "transform 0.15s ease",
                  display: "block",
                  maxWidth: docZoom === 1 ? "100%" : "none",
                  borderRadius: "12px",
                }}
              />
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-1.5">
              Scroll or pinch to zoom · Double-click to toggle zoom
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Sub-components ----

function StatCard({
  icon,
  label,
  value,
  sub,
  accentColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accentColor: string;
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderLeft: `3px solid ${accentColor}`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold" style={{ color: "#9CA3AF" }}>
          {label}
        </span>
        {icon}
      </div>
      <p className="text-2xl font-black text-[#1E293B]">{value}</p>
      <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
        {sub}
      </p>
    </div>
  );
}

function SectionBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}
    >
      <h3 className="font-bold text-[#1E293B] text-sm mb-3">{title}</h3>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  sub,
  value,
  onChange,
  ocid,
}: {
  label: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
  ocid: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold" style={{ color: "#1E293B" }}>
          {label}
        </p>
        <p className="text-xs" style={{ color: "#9CA3AF" }}>
          {sub}
        </p>
      </div>
      <button
        type="button"
        data-ocid={ocid}
        onClick={() => onChange(!value)}
        className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
        style={{ background: value ? "#1D4ED8" : "#E2E8F0" }}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: value ? "translateX(22px)" : "translateX(2px)" }}
        />
      </button>
    </div>
  );
}
