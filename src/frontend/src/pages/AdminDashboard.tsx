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
  LayoutDashboard,
  Menu,
  Package,
  RefreshCw,
  Search,
  Settings,
  Shield,
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
  const [activeBenchmarkIdx, setActiveBenchmarkIdx] = useState<number | null>(
    null,
  );
  const feedRef = useRef<HTMLDivElement>(null);
  const feedIdxRef = useRef(0);

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
        style={{ background: "#0F172A" }}
        data-ocid="admin.login.panel"
      >
        <div
          className="w-full max-w-sm rounded-2xl p-8"
          style={{ background: "#1E293B", border: "1px solid #334155" }}
        >
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                background: "rgba(59,130,246,0.15)",
                border: "1px solid rgba(59,130,246,0.3)",
              }}
            >
              <Shield className="w-8 h-8" style={{ color: "#3B82F6" }} />
            </div>
            <h1 className="text-2xl font-black text-white mb-1">
              77<span style={{ color: "#3B82F6" }}>mobiles</span>.pro
            </h1>
            <p className="text-sm" style={{ color: "#94A3B8" }}>
              Admin Control Center
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="admin-pin"
                className="block text-xs font-semibold mb-2"
                style={{ color: "#94A3B8" }}
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
                className="w-full px-4 py-3 rounded-xl text-white text-center text-xl tracking-widest font-mono"
                style={{
                  background: "#0F172A",
                  border: pinError
                    ? "2px solid #EF4444"
                    : "1.5px solid #334155",
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
              style={{ background: pin.length === 6 ? "#3B82F6" : "#334155" }}
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

          <p className="text-center text-xs mt-6" style={{ color: "#475569" }}>
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
      style={{ background: "#0F172A", fontFamily: "Inter, sans-serif" }}
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
          background: "#1E293B",
          borderRight: "1px solid #334155",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
        }}
      >
        <div className="p-5 border-b" style={{ borderColor: "#334155" }}>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-black text-white">
                77<span style={{ color: "#3B82F6" }}>mobiles</span>
              </span>
              <p className="text-xs" style={{ color: "#94A3B8" }}>
                Admin Panel
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg"
              style={{ color: "#94A3B8" }}
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
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: "#334155" }}>
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
          style={{ background: "#1E293B", borderBottom: "1px solid #334155" }}
        >
          <button
            type="button"
            data-ocid="admin.menu.button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl"
            style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6" }}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "#0F172A", border: "1px solid #334155" }}
          >
            <Search
              className="w-4 h-4 flex-shrink-0"
              style={{ color: "#475569" }}
            />
            <input
              data-ocid="admin.search.input"
              type="text"
              placeholder="Search by IMEI, Model, or Dealer ID..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "#E2E8F0" }}
            />
          </div>

          <button
            type="button"
            className="p-2 rounded-xl relative"
            style={{ background: "rgba(59,130,246,0.1)", color: "#3B82F6" }}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </header>

        {/* Page Content */}
        <main
          className="flex-1 overflow-y-auto p-4"
          style={{ background: "#0F172A" }}
        >
          {/* Section Title */}
          <div className="mb-5">
            <h2 className="text-xl font-bold text-white capitalize">
              {NAV_ITEMS.find((n) => n.id === activeSection)?.label}
            </h2>
            <p className="text-xs" style={{ color: "#64748B" }}>
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
                    <Zap className="w-5 h-5" style={{ color: "#3B82F6" }} />
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
                style={{ background: "#1E293B", border: "1px solid #334155" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{
                        background: "#22C55E",
                        animation: "pulse 1.5s infinite",
                      }}
                    />
                    Live Bid Activity
                  </h3>
                  <span className="text-xs" style={{ color: "#64748B" }}>
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
                      style={{ borderColor: "#334155" }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: "rgba(59,130,246,0.15)",
                            color: "#3B82F6",
                          }}
                        >
                          Dealer {bid.dealer}
                        </span>
                        <span className="text-xs" style={{ color: "#94A3B8" }}>
                          {bid.action} on{" "}
                          <span className="text-white font-medium">
                            {bid.item}
                          </span>
                        </span>
                      </div>
                      <span
                        className="text-xs flex-shrink-0"
                        style={{ color: "#475569" }}
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
                    border: "1px solid #334155",
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
                    border: "1px solid #334155",
                  }}
                >
                  KYC Verification
                </button>
              </div>

              {!kycTab ? (
                <>
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                    style={{
                      background: "#1E293B",
                      border: "1px solid #334155",
                    }}
                  >
                    <Search className="w-4 h-4" style={{ color: "#475569" }} />
                    <input
                      data-ocid="admin.users.search_input"
                      type="text"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="flex-1 bg-transparent text-sm outline-none"
                      style={{ color: "#E2E8F0" }}
                    />
                  </div>

                  <div className="space-y-2">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="rounded-xl p-3"
                        style={{
                          background: "#1E293B",
                          border: "1px solid #334155",
                        }}
                        data-ocid={`admin.users.item.${MOCK_USERS.indexOf(user) + 1}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-sm text-white">
                              {user.name}
                            </p>
                            <p className="text-xs" style={{ color: "#64748B" }}>
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
                  {MOCK_KYC.map((kyc, i) => (
                    <div
                      key={kyc.id}
                      className="rounded-xl p-4"
                      style={{
                        background: "#1E293B",
                        border: "1px solid #334155",
                      }}
                      data-ocid={`admin.kyc.item.${i + 1}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-sm text-white">
                            {kyc.business}
                          </p>
                          <p className="text-xs" style={{ color: "#64748B" }}>
                            {kyc.id} · {kyc.docType}
                          </p>
                        </div>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            background:
                              kyc.status === "Approved"
                                ? "rgba(34,197,94,0.1)"
                                : "rgba(245,158,11,0.1)",
                            color:
                              kyc.status === "Approved" ? "#22C55E" : "#F59E0B",
                          }}
                        >
                          {kyc.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                          style={{
                            background: "#0F172A",
                            color: "#94A3B8",
                            border: "1px solid #334155",
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
                            onClick={() =>
                              toast.success(`KYC approved for ${kyc.business}`)
                            }
                            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white"
                            style={{ background: "#22C55E" }}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            data-ocid="admin.kyc.reject.button"
                            onClick={() =>
                              toast.error(`KYC rejected for ${kyc.business}`)
                            }
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
                    border: "1px solid #334155",
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
                    border: "1px solid #334155",
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
                        background: "#1E293B",
                        border: "1px solid #334155",
                      }}
                      data-ocid={`admin.listings.item.${i + 1}`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center"
                          style={{ background: "#0F172A" }}
                        >
                          <Package
                            className="w-6 h-6"
                            style={{ color: "#475569" }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-white">
                            {listing.model}
                          </p>
                          <p className="text-xs" style={{ color: "#64748B" }}>
                            {listing.id} · Seller {listing.seller}
                          </p>
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "#94A3B8" }}
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
                          className="flex-1 py-2 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-1"
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
                        background: "#1E293B",
                        border: "1px solid #334155",
                      }}
                      data-ocid={`admin.auctions.item.${i + 1}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-sm text-white">
                            {auction.model}
                          </p>
                          <p className="text-xs" style={{ color: "#64748B" }}>
                            {auction.id} · Current Bid:{" "}
                            <span className="text-white font-semibold">
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
                            background: "rgba(59,130,246,0.1)",
                            color: "#3B82F6",
                            border: "1px solid rgba(59,130,246,0.3)",
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
                      style={{ borderColor: "#334155" }}
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
                          <p className="text-sm font-semibold text-white">
                            {txn.amount}
                          </p>
                          <p className="text-xs" style={{ color: "#64748B" }}>
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
                          <p className="text-sm font-semibold text-white">
                            {esc.model}
                          </p>
                          <p className="text-xs" style={{ color: "#64748B" }}>
                            Buyer {esc.buyer} · Held {esc.since}
                          </p>
                        </div>
                        <span
                          className="font-bold text-sm"
                          style={{ color: "#3B82F6" }}
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
                      <p className="text-sm font-semibold text-white mb-1">
                        {dis.device}
                      </p>
                      <p className="text-xs mb-1" style={{ color: "#94A3B8" }}>
                        Buyer {dis.buyer} claims: &quot;{dis.claim}&quot;
                      </p>
                      <p
                        className="text-xs mb-3 font-semibold"
                        style={{ color: "#3B82F6" }}
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
                          style={{ background: "#3B82F6" }}
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
                        <span className="text-white font-medium">
                          {item.model}
                        </span>
                        <span style={{ color: "#64748B" }}>
                          {item.stars} stars
                        </span>
                      </div>
                      <div
                        className="w-full h-2 rounded-full overflow-hidden"
                        style={{ background: "#334155" }}
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
                        background: "#0F172A",
                        border: "1px solid #334155",
                      }}
                      data-ocid={`admin.benchmarks.item.${i + 1}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-white font-medium">
                          {bench.model}
                        </p>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-sm font-bold"
                            style={{ color: "#3B82F6" }}
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
                              background: "#1E293B",
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
                            style={{ background: "#3B82F6" }}
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
                            background: "rgba(59,130,246,0.1)",
                            color: "#3B82F6",
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
                style={{ background: "#1E293B", border: "1px solid #334155" }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(59,130,246,0.15)" }}
                >
                  <Shield className="w-6 h-6" style={{ color: "#3B82F6" }} />
                </div>
                <div>
                  <p className="font-bold text-white">Super Admin</p>
                  <p className="text-xs" style={{ color: "#64748B" }}>
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
                      background: "#0F172A",
                      border: "1px solid #334155",
                      color: "white",
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    data-ocid="admin.settings.ip.save_button"
                    onClick={() => toast.success("IP whitelist updated")}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                    style={{ background: "#3B82F6" }}
                  >
                    Save
                  </button>
                </div>
              </SectionBlock>
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
                  style={{ background: "#3B82F6" }}
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              </div>
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: "#1E293B", border: "1px solid #334155" }}
              >
                {MOCK_AUDIT.map((entry, i) => (
                  <div
                    key={entry.time}
                    className="flex items-start gap-3 p-3.5 border-b last:border-0"
                    style={{ borderColor: "#334155" }}
                    data-ocid={`admin.auditlog.item.${i + 1}`}
                  >
                    <CheckCircle
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      style={{ color: "#3B82F6" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white leading-snug">
                        {entry.entry}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "#475569" }}
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
        background: "#1E293B",
        border: "1px solid #334155",
        borderLeft: `3px solid ${accentColor}`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold" style={{ color: "#64748B" }}>
          {label}
        </span>
        {icon}
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs mt-0.5" style={{ color: "#64748B" }}>
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
      style={{ background: "#1E293B", border: "1px solid #334155" }}
    >
      <h3 className="font-bold text-white text-sm mb-3">{title}</h3>
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
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-xs" style={{ color: "#64748B" }}>
          {sub}
        </p>
      </div>
      <button
        type="button"
        data-ocid={ocid}
        onClick={() => onChange(!value)}
        className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
        style={{ background: value ? "#3B82F6" : "#334155" }}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: value ? "translateX(22px)" : "translateX(2px)" }}
        />
      </button>
    </div>
  );
}
