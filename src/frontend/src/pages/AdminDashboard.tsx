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

const MOCK_BIDS = [
  {
    dealer: "#217",
    action: "bid ₹72,000",
    item: "iPhone 15 Pro",
    time: "2 min ago",
  },
  {
    dealer: "#441",
    action: "bid ₹38,500",
    item: "Samsung S24 Ultra",
    time: "3 min ago",
  },
  {
    dealer: "#089",
    action: "bid ₹55,200",
    item: "MacBook Pro M3",
    time: "4 min ago",
  },
  {
    dealer: "#312",
    action: "bid ₹14,800",
    item: "iPad Pro 12.9",
    time: "5 min ago",
  },
  {
    dealer: "#178",
    action: "bid ₹92,000",
    item: "iPhone 17 Pro Max",
    time: "7 min ago",
  },
  {
    dealer: "#503",
    action: "bid ₹28,000",
    item: "OnePlus 12 Pro",
    time: "9 min ago",
  },
  {
    dealer: "#067",
    action: "bid ₹19,500",
    item: "Pixel 9 Pro",
    time: "11 min ago",
  },
  {
    dealer: "#299",
    action: "bid ₹44,100",
    item: "Apple Watch Ultra 2",
    time: "13 min ago",
  },
];

const MOCK_USERS = [
  {
    id: "USR-001",
    name: "TechMart Delhi",
    role: "Dealer",
    balance: "₹1,24,000",
    status: "Active",
  },
  {
    id: "USR-002",
    name: "MobilePro Mumbai",
    role: "Seller",
    balance: "₹68,500",
    status: "Active",
  },
  {
    id: "USR-003",
    name: "QuickSell Pune",
    role: "Buyer",
    balance: "₹32,200",
    status: "Active",
  },
  {
    id: "USR-004",
    name: "RefurbKing Chennai",
    role: "Dealer",
    balance: "₹0",
    status: "Banned",
  },
  {
    id: "USR-005",
    name: "GadgetHub Hyderabad",
    role: "Seller",
    balance: "₹91,000",
    status: "Active",
  },
  {
    id: "USR-006",
    name: "BulkBid Bengaluru",
    role: "Buyer",
    balance: "₹5,500",
    status: "Active",
  },
  {
    id: "USR-007",
    name: "PhoneFleet Kolkata",
    role: "Dealer",
    balance: "₹2,10,000",
    status: "Active",
  },
  {
    id: "USR-008",
    name: "SwapDeal Ahmedabad",
    role: "Seller",
    balance: "₹0",
    status: "Banned",
  },
];

const MOCK_KYC = [
  {
    id: "KYC-001",
    business: "TechMart Delhi",
    docType: "GST Certificate",
    status: "Pending",
  },
  {
    id: "KYC-002",
    business: "MobileWorld Surat",
    docType: "PAN Card",
    status: "Pending",
  },
  {
    id: "KYC-003",
    business: "GadgetPro Jaipur",
    docType: "Business License",
    status: "Approved",
  },
  {
    id: "KYC-004",
    business: "ScreenFix Lucknow",
    docType: "GST Certificate",
    status: "Pending",
  },
];

const MOCK_LISTINGS = [
  {
    id: "L-2847",
    model: "iPhone 15 Pro 256GB",
    condition: "Like New",
    price: "₹72,000",
    seller: "#217",
  },
  {
    id: "L-2848",
    model: "Samsung S24 Ultra",
    condition: "Excellent",
    price: "₹58,000",
    seller: "#441",
  },
  {
    id: "L-2849",
    model: "MacBook Pro M3 Max",
    condition: "Good",
    price: "₹1,45,000",
    seller: "#089",
  },
  {
    id: "L-2850",
    model: "iPad Pro 12.9 M2",
    condition: "Like New",
    price: "₹68,000",
    seller: "#312",
  },
];

const MOCK_AUCTIONS = [
  {
    id: "A-5011",
    model: "iPhone 17 Pro Max",
    currentBid: "₹92,000",
    timeLeft: 1800,
  },
  {
    id: "A-5012",
    model: "OnePlus 12 Pro",
    currentBid: "₹28,500",
    timeLeft: 3600,
  },
  {
    id: "A-5013",
    model: "Google Pixel 9 Pro",
    currentBid: "₹44,000",
    timeLeft: 900,
  },
  {
    id: "A-5014",
    model: "Samsung Galaxy Fold 6",
    currentBid: "₹1,12,000",
    timeLeft: 5400,
  },
];

const MOCK_TRANSACTIONS = [
  {
    id: "TXN-8821",
    type: "Top-up",
    amount: "₹50,000",
    dealer: "#217",
    date: "01 Apr 2026",
    status: "Completed",
  },
  {
    id: "TXN-8820",
    type: "Withdrawal",
    amount: "₹28,500",
    dealer: "#441",
    date: "31 Mar 2026",
    status: "Completed",
  },
  {
    id: "TXN-8819",
    type: "Top-up",
    amount: "₹1,00,000",
    dealer: "#089",
    date: "30 Mar 2026",
    status: "Completed",
  },
  {
    id: "TXN-8818",
    type: "Withdrawal",
    amount: "₹15,200",
    dealer: "#312",
    date: "30 Mar 2026",
    status: "Pending",
  },
  {
    id: "TXN-8817",
    type: "Top-up",
    amount: "₹75,000",
    dealer: "#178",
    date: "29 Mar 2026",
    status: "Completed",
  },
  {
    id: "TXN-8816",
    type: "Withdrawal",
    amount: "₹44,800",
    dealer: "#503",
    date: "28 Mar 2026",
    status: "Failed",
  },
];

const MOCK_ESCROW = [
  {
    id: "ESC-201",
    model: "iPhone 15 Pro",
    buyer: "#312",
    amount: "₹72,000",
    since: "2 hrs ago",
  },
  {
    id: "ESC-202",
    model: "MacBook Pro M3",
    buyer: "#089",
    amount: "₹1,45,000",
    since: "4 hrs ago",
  },
  {
    id: "ESC-203",
    model: "Samsung S24 Ultra",
    buyer: "#178",
    amount: "₹58,000",
    since: "1 day ago",
  },
];

const MOCK_DISPUTES = [
  {
    id: "DIS-041",
    buyer: "#312",
    claim: "Device condition does not match 'Mint' description",
    device: "iPhone 15 Pro 256GB",
    amount: "₹72,000",
  },
  {
    id: "DIS-042",
    buyer: "#089",
    claim: "IMEI mismatch on received unit",
    device: "MacBook Pro M3 Max",
    amount: "₹1,45,000",
  },
];

const MOCK_HEATMAP = [
  { model: "iPhone 15 Pro", stars: 312, demand: 95 },
  { model: "Samsung S24 Ultra", stars: 278, demand: 87 },
  { model: "iPhone 17 Pro Max", stars: 254, demand: 82 },
  { model: "MacBook Pro M3", stars: 198, demand: 67 },
  { model: "iPad Pro M2", stars: 176, demand: 59 },
  { model: "Google Pixel 9 Pro", stars: 143, demand: 48 },
  { model: "OnePlus 12 Pro", stars: 128, demand: 43 },
  { model: "Apple Watch Ultra 2", stars: 97, demand: 34 },
];

const MOCK_BENCHMARKS = [
  { model: "iPhone 15 Pro 256GB", avgPrice: "₹71,500", trend: "+₹2,200" },
  { model: "Samsung S24 Ultra", avgPrice: "₹57,800", trend: "+₹1,100" },
  { model: "MacBook Pro M3 Max", avgPrice: "₹1,44,200", trend: "-₹3,000" },
  { model: "iPad Pro 12.9 M2", avgPrice: "₹66,500", trend: "+₹800" },
  { model: "Google Pixel 9 Pro", avgPrice: "₹43,900", trend: "+₹500" },
];

const MOCK_AUDIT = [
  {
    time: "01 Apr 2026, 14:32",
    entry: "Admin approved listing #L-2847 (iPhone 15 Pro 256GB)",
  },
  { time: "01 Apr 2026, 13:58", entry: "Admin froze wallet for Dealer #391" },
  {
    time: "01 Apr 2026, 13:21",
    entry: "Admin approved KYC for MobileWorld Surat",
  },
  {
    time: "01 Apr 2026, 12:44",
    entry: "Admin rejected listing #L-2845 — reason: Blurry Photos",
  },
  {
    time: "01 Apr 2026, 11:30",
    entry: "Admin extended auction A-5011 by 1 hour",
  },
  {
    time: "31 Mar 2026, 18:02",
    entry: "Admin approved withdrawal TXN-8820 for Dealer #441",
  },
  {
    time: "31 Mar 2026, 16:45",
    entry: "Admin resolved dispute DIS-039 — Refund issued to Buyer #178",
  },
  { time: "31 Mar 2026, 15:10", entry: "Admin reset password for Dealer #503" },
  {
    time: "31 Mar 2026, 14:22",
    entry: "Admin approved listing #L-2843 (Samsung S24 Ultra)",
  },
  {
    time: "31 Mar 2026, 13:00",
    entry: "Admin disabled new registrations for maintenance",
  },
];

interface BannerSlide {
  id: string;
  imageUrl: string;
  title: string;
  target: "buyer" | "seller" | "both";
  active: boolean;
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
  const [kycTab, setKycTab] = useState(false);
  const [kycFilter, setKycFilter] = useState<
    "All" | "Pending" | "Verified" | "Rejected"
  >("All");
  const [kycItems, setKycItems] = useState(MOCK_KYC);
  const [listingTab, setListingTab] = useState<"queue" | "auctions">("queue");
  const [auctionTimers, setAuctionTimers] = useState(
    MOCK_AUCTIONS.map((a) => a.timeLeft),
  );
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [newRegistrations, setNewRegistrations] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState("192.168.1.0/24");
  const [benchmarkInputs, setBenchmarkInputs] = useState<
    Record<number, string>
  >({});

  // Portal Controls state
  const [buyerMinBid, setBuyerMinBid] = useState(500);
  const [buyerAuctionDuration, setBuyerAuctionDuration] = useState(20);
  const [buyerMaxListings, setBuyerMaxListings] = useState(20);
  const [sellerListingFee, setSellerListingFee] = useState(0);
  const [sellerMaxPhotos, setSellerMaxPhotos] = useState(6);
  const [sellerAutoExpire, setSellerAutoExpire] = useState(14);
  const [portalSaveSuccess, setPortalSaveSuccess] = useState(false);
  const [activeBenchmarkIdx, setActiveBenchmarkIdx] = useState<number | null>(
    null,
  );
  const feedRef = useRef<HTMLDivElement>(null);
  const feedIdxRef = useRef(0);

  // Task 11: Real-time pending verifications
  const [pendingUsers, setPendingUsers] = useState([
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

  // Task 12: Slider Management state
  const [banners, setBanners] = useState<BannerSlide[]>([
    {
      id: "b1",
      imageUrl: "",
      title: "iPhone 16 Pro — Bidding War!",
      target: "both",
      active: true,
    },
    {
      id: "b2",
      imageUrl: "",
      title: "Samsung S25 Ultra Auction",
      target: "buyer",
      active: true,
    },
    {
      id: "b3",
      imageUrl: "",
      title: "Bulk MacBook Pro Deals",
      target: "seller",
      active: false,
    },
  ]);
  const [newBannerTitle, setNewBannerTitle] = useState("");
  const [newBannerTarget, setNewBannerTarget] = useState<
    "buyer" | "seller" | "both"
  >("both");
  const [newBannerPreview, setNewBannerPreview] = useState("");

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
            business: k.business,
            docType: k.docType,
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
    return () => window.removeEventListener("storage", onStorage);
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

  // Live feed auto-scroll
  useEffect(() => {
    if (!authenticated) return;
    const interval = setInterval(() => {
      feedIdxRef.current = (feedIdxRef.current + 1) % MOCK_BIDS.length;
      if (feedRef.current) {
        const items = feedRef.current.querySelectorAll(".bid-item");
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
  const filteredUsers = MOCK_USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.id.toLowerCase().includes(userSearch.toLowerCase()),
  );

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

          <button
            type="button"
            className="p-2 rounded-xl relative"
            style={{ background: "rgba(29,78,216,0.08)", color: "#1D4ED8" }}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
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
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  icon={
                    <DollarSign
                      className="w-5 h-5"
                      style={{ color: "#22C55E" }}
                    />
                  }
                  label="Total Revenue"
                  value="₹42,85,000"
                  sub="Escrow + Fees"
                  accentColor="#22C55E"
                />
                <StatCard
                  icon={
                    <Zap className="w-5 h-5" style={{ color: "#1D4ED8" }} />
                  }
                  label="Active Auctions"
                  value="128"
                  sub="Live right now"
                  accentColor="#3B82F6"
                />
                <StatCard
                  icon={
                    <Users className="w-5 h-5" style={{ color: "#A855F7" }} />
                  }
                  label="User Growth"
                  value="1,636"
                  sub="1,247 Dealers · 389 Individual"
                  accentColor="#A855F7"
                />
                <StatCard
                  icon={
                    <AlertTriangle
                      className="w-5 h-5"
                      style={{ color: "#F59E0B" }}
                    />
                  }
                  label="Pending Verifications"
                  value="23"
                  sub="Awaiting review"
                  accentColor="#F59E0B"
                />
              </div>

              {/* Live Bid Feed */}
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
                  {MOCK_BIDS.map((bid) => (
                    <div
                      key={bid.dealer + bid.time}
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
                          Dealer {bid.dealer}
                        </span>
                        <span className="text-xs" style={{ color: "#9CA3AF" }}>
                          {bid.action} on{" "}
                          <span className="text-[#1E293B] font-medium">
                            {bid.item}
                          </span>
                        </span>
                      </div>
                      <span
                        className="text-xs flex-shrink-0"
                        style={{ color: "#9CA3AF" }}
                      >
                        {bid.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== USERS ===== */}
          {activeSection === "users" && (
            <div className="space-y-4">
              {/* Sub-tabs */}
              <div className="flex gap-2">
                <button
                  type="button"
                  data-ocid="admin.users.tab"
                  onClick={() => setKycTab(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{
                    background: !kycTab ? "#3B82F6" : "#1E293B",
                    color: !kycTab ? "white" : "#94A3B8",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  Users
                </button>
                <button
                  type="button"
                  data-ocid="admin.kyc.tab"
                  onClick={() => setKycTab(true)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold"
                  style={{
                    background: kycTab ? "#3B82F6" : "#1E293B",
                    color: kycTab ? "white" : "#94A3B8",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  KYC Verification
                </button>
              </div>

              {!kycTab ? (
                <>
                  {/* Task 11: Pending Verifications real-time card */}
                  <div
                    className="rounded-2xl p-4"
                    style={{
                      background: "#FFF7ED",
                      border: "1px solid #FED7AA",
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-bold text-sm"
                          style={{ color: "#92400E" }}
                        >
                          Pending Verifications
                        </span>
                        <span
                          className="text-xs font-black px-2 py-0.5 rounded-full animate-pulse"
                          style={{ background: "#F97316", color: "white" }}
                        >
                          {pendingCount}
                        </span>
                      </div>
                      <span className="text-[10px] text-orange-500">
                        Live • Auto-updates
                      </span>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {pendingUsers.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center justify-between py-2 px-3 rounded-xl"
                          style={{
                            background: "white",
                            border: "1px solid #FED7AA",
                          }}
                        >
                          <div>
                            <p className="text-sm font-semibold text-[#1E293B]">
                              {u.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {u.business} • {u.mobile}
                            </p>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              data-ocid="admin.pending.approve.button"
                              onClick={() => {
                                setPendingUsers((prev) =>
                                  prev.filter((x) => x.id !== u.id),
                                );
                                setPendingCount((prev) =>
                                  Math.max(0, prev - 1),
                                );
                                toast.success(
                                  "User approved — they can now access the portal",
                                );
                              }}
                              className="text-xs font-bold px-2.5 py-1 rounded-lg"
                              style={{ background: "#16A34A", color: "white" }}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              data-ocid="admin.pending.reject.button"
                              onClick={() => {
                                setPendingUsers((prev) =>
                                  prev.filter((x) => x.id !== u.id),
                                );
                                setPendingCount((prev) =>
                                  Math.max(0, prev - 1),
                                );
                                toast.error("User rejected");
                              }}
                              className="text-xs font-bold px-2.5 py-1 rounded-lg"
                              style={{ background: "#DC2626", color: "white" }}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                      {pendingUsers.length === 0 && (
                        <p className="text-xs text-center text-gray-400 py-2">
                          No pending verifications
                        </p>
                      )}
                    </div>
                  </div>

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
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="flex-1 bg-transparent text-sm outline-none"
                      style={{ color: "#1E293B" }}
                    />
                  </div>

                  <div className="space-y-2">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="rounded-xl p-3"
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid #E2E8F0",
                        }}
                        data-ocid={`admin.users.item.${MOCK_USERS.indexOf(user) + 1}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-sm text-[#1E293B]">
                              {user.name}
                            </p>
                            <p className="text-xs" style={{ color: "#9CA3AF" }}>
                              {user.id} · Balance: {user.balance}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-semibold"
                              style={{
                                background:
                                  user.role === "Dealer"
                                    ? "rgba(59,130,246,0.15)"
                                    : user.role === "Seller"
                                      ? "rgba(168,85,247,0.15)"
                                      : "rgba(34,197,94,0.15)",
                                color:
                                  user.role === "Dealer"
                                    ? "#3B82F6"
                                    : user.role === "Seller"
                                      ? "#A855F7"
                                      : "#22C55E",
                              }}
                            >
                              {user.role}
                            </span>
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-semibold"
                              style={{
                                background:
                                  user.status === "Active"
                                    ? "rgba(34,197,94,0.1)"
                                    : "rgba(239,68,68,0.1)",
                                color:
                                  user.status === "Active"
                                    ? "#22C55E"
                                    : "#EF4444",
                              }}
                            >
                              {user.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <ActionBtn
                            label="Freeze Wallet"
                            color="#EF4444"
                            onClick={() =>
                              toast.error(`Wallet frozen for ${user.name}`)
                            }
                            ocid="admin.users.freeze.button"
                          />
                          <ActionBtn
                            label="Reset Password"
                            color="#3B82F6"
                            onClick={() =>
                              toast.success(
                                `Password reset sent to ${user.name}`,
                              )
                            }
                            ocid="admin.users.reset.button"
                          />
                          <ActionBtn
                            label="Message"
                            color="#94A3B8"
                            onClick={() =>
                              toast.success(`Message sent to ${user.name}`)
                            }
                            ocid="admin.users.message.button"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  {/* KYC filter tabs */}
                  <div className="flex gap-1.5 flex-wrap">
                    {(["All", "Pending", "Verified", "Rejected"] as const).map(
                      (f) => (
                        <button
                          key={f}
                          type="button"
                          data-ocid={`admin.kyc.filter.${f.toLowerCase()}.tab`}
                          onClick={() => setKycFilter(f)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                          style={{
                            background: kycFilter === f ? "#3B82F6" : "#1E293B",
                            color: kycFilter === f ? "white" : "#94A3B8",
                            border: "1px solid #E2E8F0",
                          }}
                        >
                          {f}
                          {f !== "All" && (
                            <span className="ml-1 text-[9px]">
                              (
                              {
                                kycItems.filter(
                                  (k) =>
                                    k.status === f ||
                                    (f === "Verified" &&
                                      k.status === "Approved"),
                                ).length
                              }
                              )
                            </span>
                          )}
                        </button>
                      ),
                    )}
                  </div>

                  {kycItems
                    .filter((k) => {
                      if (kycFilter === "All") return true;
                      if (kycFilter === "Verified")
                        return (
                          k.status === "Approved" || k.status === "Verified"
                        );
                      return k.status === kycFilter;
                    })
                    .map((kyc, i) => (
                      <div
                        key={kyc.id}
                        className="rounded-xl p-4"
                        style={{
                          background: "#FFFFFF",
                          border: "1px solid #E2E8F0",
                        }}
                        data-ocid={`admin.kyc.item.${i + 1}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-sm text-[#1E293B]">
                              {kyc.business}
                            </p>
                            <p className="text-xs" style={{ color: "#9CA3AF" }}>
                              {kyc.id} · {kyc.docType}
                            </p>
                          </div>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{
                              background:
                                kyc.status === "Approved" ||
                                kyc.status === "Verified"
                                  ? "rgba(34,197,94,0.1)"
                                  : kyc.status === "Rejected"
                                    ? "rgba(239,68,68,0.1)"
                                    : "rgba(245,158,11,0.1)",
                              color:
                                kyc.status === "Approved" ||
                                kyc.status === "Verified"
                                  ? "#22C55E"
                                  : kyc.status === "Rejected"
                                    ? "#EF4444"
                                    : "#F59E0B",
                            }}
                          >
                            {kyc.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                            style={{
                              background: "#F8FAFC",
                              color: "#9CA3AF",
                              border: "1px solid #E2E8F0",
                            }}
                          >
                            <Eye className="w-3.5 h-3.5" /> View Document
                          </div>
                        </div>
                        {kyc.status === "Pending" && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              data-ocid="admin.kyc.approve.button"
                              onClick={() => {
                                setKycItems((prev) =>
                                  prev.map((k) =>
                                    k.id === kyc.id
                                      ? { ...k, status: "Approved" }
                                      : k,
                                  ),
                                );
                                setPendingCount((prev) =>
                                  Math.max(0, prev - 1),
                                );
                                toast.success(
                                  "KYC Approved — user now has full access",
                                );
                              }}
                              className="flex-1 py-2 rounded-xl text-sm font-semibold text-white"
                              style={{ background: "#22C55E" }}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              data-ocid="admin.kyc.reject.button"
                              onClick={() => {
                                setKycItems((prev) =>
                                  prev.map((k) =>
                                    k.id === kyc.id
                                      ? { ...k, status: "Rejected" }
                                      : k,
                                  ),
                                );
                                toast.error(`KYC rejected for ${kyc.business}`);
                              }}
                              className="flex-1 py-2 rounded-xl text-sm font-semibold"
                              style={{
                                background: "rgba(239,68,68,0.1)",
                                color: "#EF4444",
                                border: "1px solid rgba(239,68,68,0.3)",
                              }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  {kycItems.filter((k) => {
                    if (kycFilter === "All") return true;
                    if (kycFilter === "Verified")
                      return k.status === "Approved" || k.status === "Verified";
                    return k.status === kycFilter;
                  }).length === 0 && (
                    <p className="text-xs text-center text-gray-400 py-4">
                      No {kycFilter.toLowerCase()} KYC records
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

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
                  {MOCK_LISTINGS.map((listing, i) => (
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
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {MOCK_AUCTIONS.map((auction, i) => (
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
                          {formatTime(auctionTimers[i])}
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
                              prev.map((t, idx) => (idx === i ? t + 3600 : t)),
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
                  ))}
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
                  {MOCK_TRANSACTIONS.map((txn, i) => (
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
                  ))}
                </div>
              </SectionBlock>

              {/* Escrow Monitor */}
              <SectionBlock title="Escrow Monitor">
                <div className="space-y-2">
                  {MOCK_ESCROW.map((esc, i) => (
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
                  ))}
                </div>
              </SectionBlock>

              {/* Dispute Resolution */}
              <SectionBlock title="Dispute Resolution">
                <div className="space-y-3">
                  {MOCK_DISPUTES.map((dis, i) => (
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
                      <p className="text-xs mb-1" style={{ color: "#9CA3AF" }}>
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
                  ))}
                </div>
              </SectionBlock>
            </div>
          )}

          {/* ===== DIAGNOSTICS ===== */}
          {activeSection === "diagnostics" && (
            <div className="space-y-5">
              <SectionBlock title="Demand Heatmap">
                <div className="space-y-3">
                  {MOCK_HEATMAP.map((item, i) => (
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
                  ))}
                </div>
              </SectionBlock>

              <SectionBlock title="Price Benchmarking">
                <div className="space-y-2">
                  {MOCK_BENCHMARKS.map((bench, i) => (
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
                  ))}
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
                      onChange={(e) => setBuyerMinBid(Number(e.target.value))}
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
                      onChange={(e) =>
                        setBuyerAuctionDuration(Number(e.target.value))
                      }
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
                      onChange={(e) =>
                        setBuyerMaxListings(Number(e.target.value))
                      }
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
                      onChange={(e) =>
                        setSellerListingFee(Number(e.target.value))
                      }
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
                      onChange={(e) =>
                        setSellerMaxPhotos(Number(e.target.value))
                      }
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
                      onChange={(e) =>
                        setSellerAutoExpire(Number(e.target.value))
                      }
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
                        };
                        setBanners((prev) => [newBanner, ...prev]);
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
                                setBanners((prev) =>
                                  prev.map((b) =>
                                    b.id === banner.id
                                      ? { ...b, active: !b.active }
                                      : b,
                                  ),
                                );
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
                                setBanners((prev) =>
                                  prev.filter((b) => b.id !== banner.id),
                                );
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
                      setBanners((prev) => [
                        {
                          id: `banner-${Date.now()}`,
                          imageUrl: newBannerPreview,
                          title: newBannerTitle,
                          target: newBannerTarget,
                          active: true,
                        },
                        ...prev,
                      ]);
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
                          setBanners((prev) =>
                            prev.map((b) =>
                              b.id === banner.id
                                ? { ...b, active: !b.active }
                                : b,
                            ),
                          );
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
                          setBanners((prev) =>
                            prev.filter((b) => b.id !== banner.id),
                          );
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
                {MOCK_AUDIT.map((entry, i) => (
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
                ))}
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

function ActionBtn({
  label,
  color,
  onClick,
  ocid,
}: {
  label: string;
  color: string;
  onClick: () => void;
  ocid: string;
}) {
  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={onClick}
      className="flex-1 py-1.5 rounded-xl text-xs font-semibold"
      style={{
        background: `${color}15`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      {label}
    </button>
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
