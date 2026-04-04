import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BarChart2,
  Bell,
  Building2,
  CheckCircle,
  ChevronRight,
  CreditCard,
  FileText,
  HelpCircle,
  Lock,
  LogOut,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Settings,
  Shield,
  Star,
  TrendingUp,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type AppMode, useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { SELLER_LISTINGS } from "../data/demoListings";
import { type Bid, BidStore } from "../stores/BidStore";

const FAQ_ITEMS = [
  {
    q: "How do I verify my device with IMEI?",
    a: "Go to Sell → Smartphones, enter your 15-digit IMEI number in the field at the top. The system will auto-fill model, storage, and color details from our device database.",
  },
  {
    q: "When do I receive payment after a sale?",
    a: "Funds are released to your wallet within 48 hours after the buyer confirms receipt. You can then withdraw to your linked bank account.",
  },
  {
    q: "How does the escrow system work?",
    a: "When a buyer wins an auction, the bid amount is automatically moved to escrow. It’s held securely until the buyer confirms the device matches the listing, then released to the seller.",
  },
  {
    q: "What are the platform fees?",
    a: "Sourcing fee is ₹800–₹2,000 depending on transaction value, plus 18% GST on the fee and 1% claimable TCS on the total transaction.",
  },
  {
    q: "Can I bulk list multiple devices?",
    a: "Yes. Use the Create Listing flow for each device, or contact our B2B support team to set up a bulk Excel upload for 50+ devices.",
  },
  {
    q: "How do I switch between Buyer and Seller mode?",
    a: "Go to Profile tab, then tap the \u2018Switch\u2019 button in the Mode section. Your data and listings are preserved when switching.",
  },
];

export default function ProfilePage() {
  const { mode, setMode, sharedListings } = useApp();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<
    "profile" | "account" | "help" | "analytics"
  >("profile");
  const [analyticsFilter, setAnalyticsFilter] = useState<
    "7days" | "30days" | "alltime"
  >("7days");
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [notifDenied, setNotifDenied] = useState(false);

  const handleSwitchMode = () => {
    const newMode: AppMode = mode === "seller" ? "buyer" : "seller";
    setMode(newMode);
    toast.success(
      `Switched to ${newMode === "seller" ? "Seller" : "Buyer"} Mode`,
    );
  };

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  const handleNotifToggle = async () => {
    if (!notifEnabled && "Notification" in window) {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        setNotifEnabled(true);
        toast.success("Push notifications enabled");
      } else {
        toast("Notification permission denied. Enable it in browser settings.");
      }
    } else {
      setNotifEnabled((p) => !p);
      toast(
        notifEnabled ? "Notifications turned off" : "Notifications turned on",
      );
    }
  };

  const handleEnableNotifications = async () => {
    if (!("Notification" in window)) {
      toast.error("Notifications not supported in this browser");
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === "granted") {
      setNotifEnabled(true);
      setNotifDenied(false);
      toast.success("Alerts Enabled!");
    } else if (perm === "denied") {
      setNotifDenied(true);
    } else {
      toast("Notification permission dismissed");
    }
  };

  const handleTestNotification = () => {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      toast.error("Please enable notifications first");
      return;
    }
    const n = new Notification("77mobiles.pro - Outbid Alert", {
      body: "Someone just placed a higher bid on the Samsung S24 Ultra.",
      icon: "/assets/generated/icon-77mobiles-192.dim_192x192.png",
    });
    n.onclick = () => {
      window.focus();
    };
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then((reg) => {
          reg.showNotification("77mobiles.pro - Outbid Alert", {
            body: "Someone just placed a higher bid on the Samsung S24 Ultra.",
            icon: "/assets/generated/icon-77mobiles-192.dim_192x192.png",
            data: { url: "/app" },
          });
        })
        .catch(() => {});
    }
    toast.success("Test notification sent!");
  };

  // ── Account sub-page ─────────────────────────────────────────────────────────
  if (view === "account") {
    return (
      <div className="px-4 pt-4 pb-24 bg-[#F8F9FA] min-h-screen">
        <button
          type="button"
          onClick={() => setView("profile")}
          className="flex items-center gap-2 mb-4 text-sm font-semibold"
          style={{ color: "#1D4ED8" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </button>
        <h2 className="font-black text-lg text-gray-900 mb-4">My Account</h2>

        {/* Identity card */}
        <div
          className="bg-white rounded-2xl p-4 mb-3"
          style={{
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: "#EEF2FF" }}
            >
              <User className="w-6 h-6" style={{ color: "#1D4ED8" }} />
            </div>
            <div>
              <p className="font-black text-base text-gray-900">
                Verified Dealer #402
              </p>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" style={{ color: "#1D4ED8" }} />
                <span
                  className="text-xs font-semibold"
                  style={{ color: "#1D4ED8" }}
                >
                  KYC Verified
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-2.5">
            {[
              {
                icon: Building2,
                label: "Business Name",
                value: "TechMart India Pvt. Ltd.",
              },
              {
                icon: Phone,
                label: "Mobile",
                value: `+91 •••••${user?.mobileNumber?.slice(-5) || "‥90000"}`,
              },
              { icon: Mail, label: "Email", value: "dealer402@77mobiles.pro" },
              { icon: FileText, label: "GST Number", value: "22AAAAA0000A1Z5" },
              { icon: CreditCard, label: "PAN", value: "AAAAA0000A" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "#F4F7FF" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "#1D4ED8" }} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400 font-medium">
                    {label}
                  </p>
                  <p className="text-sm font-semibold text-gray-900">{value}</p>
                </div>
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div
          className="bg-white rounded-2xl overflow-hidden mb-3"
          style={{
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <p className="px-4 pt-3 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wide">
            Security
          </p>
          {[
            {
              icon: Lock,
              label: "Change Password",
              action: () =>
                toast("Password reset link sent to your registered email."),
            },
            {
              icon: Shield,
              label: "Two-Factor Authentication",
              action: () => toast("2FA is enabled for wallet withdrawals."),
            },
            {
              icon: Bell,
              label: "Push Notifications",
              action: handleNotifToggle,
              trailing: notifEnabled ? "On" : "Off",
            },
          ].map((item, idx, arr) => (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              style={{
                borderBottom:
                  idx < arr.length - 1 ? "1px solid #f3f4f6" : "none",
              }}
            >
              <item.icon className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-800 flex-1">
                {item.label}
              </span>
              {item.trailing ? (
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ background: notifEnabled ? "#22c55e" : "#9ca3af" }}
                >
                  {item.trailing}
                </span>
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
          ))}
        </div>

        {/* Notification Actions */}
        <div
          className="bg-white rounded-2xl overflow-hidden mb-3"
          style={{
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <p className="px-4 pt-3 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wide">
            Bid Alerts
          </p>
          {/* Enable Bid Alerts */}
          <div
            className="px-4 py-3"
            style={{ borderBottom: "1px solid #f3f4f6" }}
          >
            <p className="text-sm font-semibold text-gray-800 mb-1">
              Enable Bid Alerts
            </p>
            <p className="text-xs text-gray-500 mb-2.5">
              Get notified when you're outbid or when a bidding war starts.
            </p>
            {notifDenied && (
              <div
                className="mb-2 text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2"
                style={{ border: "1px solid #fecaca" }}
              >
                Notifications blocked. To receive bidding updates, go to your
                browser Settings &rarr; Site Settings &rarr; Notifications and
                allow this site.
              </div>
            )}
            <button
              type="button"
              data-ocid="profile.enable_notifications.button"
              onClick={handleEnableNotifications}
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "#1D4ED8" }}
            >
              Enable Bid Alerts
            </button>
          </div>
          {/* Debug Notification */}
          <div className="px-4 py-3">
            <p className="text-sm font-semibold text-gray-800 mb-1">
              Test Notification
            </p>
            <p className="text-xs text-gray-500 mb-2.5">
              Trigger a sample outbid alert to verify your notification setup.
            </p>
            <button
              type="button"
              data-ocid="profile.test_notification.button"
              onClick={handleTestNotification}
              className="w-full py-2.5 rounded-xl text-sm font-bold"
              style={{
                background: "white",
                color: "#6B7280",
                border: "1px solid #e5e7eb",
              }}
            >
              Test Notification (Debug)
            </button>
          </div>
        </div>

        {/* Ratings */}
        <div
          className="bg-white rounded-2xl p-4"
          style={{
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
            Dealer Reputation
          </p>
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ background: "#FFF7ED" }}
            >
              <Star className="w-7 h-7 text-orange-500" fill="currentColor" />
            </div>
            <div>
              <p className="font-black text-2xl text-gray-900">4.8</p>
              <p className="text-xs text-gray-500">Based on 136 transactions</p>
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="w-3 h-3"
                    style={{ color: s <= 4 ? "#f97316" : "#d1d5db" }}
                    fill={s <= 4 ? "currentColor" : "none"}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Analytics sub-page ───────────────────────────────────────────────────────
  if (view === "analytics") {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const allListings = [...sharedListings, ...SELLER_LISTINGS];

    // Time filter logic
    const now = Date.now();
    const filterMs =
      analyticsFilter === "7days"
        ? 7 * 24 * 60 * 60 * 1000
        : analyticsFilter === "30days"
          ? 30 * 24 * 60 * 60 * 1000
          : Number.POSITIVE_INFINITY;

    // Seller metrics
    const activeListings = allListings.filter(
      (l) => l.status === "Active",
    ).length;
    const soldListings = allListings.filter((l) => {
      if (l.status !== "Sold") return false;
      if (filterMs === Number.POSITIVE_INFINITY) return true;
      const ts = Number(l.createdAt) / 1_000_000 || 0;
      return now - ts <= filterMs;
    });
    const totalEarned = soldListings.reduce(
      (s, l) => s + Number(l.basePrice) / 100,
      0,
    );

    // Buyer metrics — collect all bids from BidStore
    // Collect via a snapshot approach
    const allBidsSnap: Bid[] = (() => {
      const collected: Bid[] = [];
      // We need to iterate all bids; use subscribeAllBids momentarily
      BidStore.subscribeAllBids((_listingId, bids) => {
        for (const b of bids.filter((b) => b.dealerId === "demo-buyer"))
          collected.push(b);
      })(); // immediately unsubscribe after firing
      return collected;
    })();
    const filteredBids = allBidsSnap.filter((b) => {
      if (filterMs === Number.POSITIVE_INFINITY) return true;
      return now - b.placedAt <= filterMs;
    });
    const bidsPlaced = filteredBids.length;
    const wonAuctions = soldListings.length; // proxy for won
    const totalSpent = filteredBids.reduce((s, b) => s + b.amount / 100, 0);

    // Build daily bar chart from actual data (last 7 days per day of week)
    const getActivityByDay = (): number[] => {
      const counts = new Array(7).fill(0);
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      if (mode === "seller") {
        for (const l of allListings) {
          const ts = Number(l.createdAt) / 1_000_000 || 0;
          if (ts > weekAgo) {
            const day = new Date(ts).getDay(); // 0=Sun ... 6=Sat
            const idx = day === 0 ? 6 : day - 1; // Mon=0
            counts[idx]++;
          }
        }
      } else {
        for (const b of allBidsSnap) {
          if (b.placedAt > weekAgo) {
            const day = new Date(b.placedAt).getDay();
            const idx = day === 0 ? 6 : day - 1;
            counts[idx]++;
          }
        }
      }
      return counts;
    };
    const rawCounts = getActivityByDay();
    const maxCount = Math.max(...rawCounts, 1);
    const heights = rawCounts.map((c) =>
      Math.max(4, Math.round((c / maxCount) * 90)),
    );

    return (
      <div className="px-4 pt-4 pb-24 bg-[#F8F9FA] min-h-screen">
        <button
          type="button"
          onClick={() => setView("profile")}
          className="flex items-center gap-2 mb-4 text-sm font-semibold"
          style={{ color: "#1D4ED8" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </button>
        <h2 className="font-black text-lg text-gray-900 mb-1">My Analytics</h2>
        <p className="text-xs text-gray-500 mb-4">
          {mode === "seller"
            ? "Your selling activity"
            : "Your bidding activity"}
        </p>

        {/* Time filter tabs */}
        <div
          className="flex gap-1 mb-4 p-1 rounded-xl"
          style={{ background: "#F3F4F6" }}
        >
          {[
            { key: "7days", label: "7 Days" },
            { key: "30days", label: "30 Days" },
            { key: "alltime", label: "All Time" },
          ].map((f) => (
            <button
              key={f.key}
              type="button"
              data-ocid={`analytics.filter.${f.key}.tab`}
              onClick={() =>
                setAnalyticsFilter(f.key as typeof analyticsFilter)
              }
              className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background:
                  analyticsFilter === f.key ? "#1D4ED8" : "transparent",
                color: analyticsFilter === f.key ? "white" : "#6B7280",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Stat cards */}
        {mode === "seller" ? (
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {[
              {
                label: "Total Listings",
                value: String(allListings.length),
                icon: "📦",
                color: "#1D4ED8",
              },
              {
                label: "Active Auctions",
                value: String(activeListings),
                icon: "🔥",
                color: "#F97316",
              },
              {
                label: "Sold Items",
                value: String(soldListings.length),
                icon: "✅",
                color: "#22C55E",
              },
              {
                label: "Total Revenue",
                value:
                  totalEarned > 0
                    ? new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(totalEarned)
                    : "₹0",
                icon: "💰",
                color: "#8B5CF6",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                data-ocid={`analytics.seller.${stat.label.toLowerCase().replace(/ /g, "_")}.card`}
                className="bg-white rounded-2xl p-3.5"
                style={{
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg">{stat.icon}</span>
                  <TrendingUp
                    className="w-3 h-3"
                    style={{ color: stat.color }}
                  />
                </div>
                <p className="font-black text-lg" style={{ color: stat.color }}>
                  {stat.value}
                </p>
                <p className="text-[10px] text-gray-500 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              {
                label: "Bids Placed",
                value: String(bidsPlaced),
                icon: "🏷️",
                color: "#1D4ED8",
              },
              {
                label: "Won",
                value: String(wonAuctions),
                icon: "🏆",
                color: "#22C55E",
              },
              {
                label: "Spent",
                value:
                  totalSpent > 0
                    ? new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(totalSpent)
                    : "₹0",
                icon: "💳",
                color: "#8B5CF6",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                data-ocid={`analytics.buyer.${stat.label.toLowerCase().replace(/ /g, "_")}.card`}
                className="bg-white rounded-2xl p-3"
                style={{
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
              >
                <span className="text-xl">{stat.icon}</span>
                <p
                  className="font-black text-base mt-1"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </p>
                <p className="text-[9px] text-gray-500 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Activity chart */}
        <div
          className="bg-white rounded-2xl p-4"
          style={{
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
            7-Day Activity
          </p>
          <div className="flex items-end gap-2 h-24">
            {heights.map((h, i) => (
              <div key={days[i]} className="flex flex-col items-center flex-1">
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${h}%`,
                    background: i === 6 ? "#1D4ED8" : "#BFDBFE",
                    minHeight: "4px",
                  }}
                />
                <span className="text-[9px] text-gray-400 mt-1">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Help sub-page ─────────────────────────────────────────────────────────────
  if (view === "help") {
    return (
      <div className="px-4 pt-4 pb-24 bg-[#F8F9FA] min-h-screen">
        <button
          type="button"
          onClick={() => setView("profile")}
          className="flex items-center gap-2 mb-4 text-sm font-semibold"
          style={{ color: "#1D4ED8" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </button>
        <h2 className="font-black text-lg text-gray-900 mb-1">
          Help & Support
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Frequently asked questions for B2B dealers
        </p>

        {/* Contact options */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            {
              icon: MessageCircle,
              label: "WhatsApp Support",
              sub: "Mon–Sat 9AM–8PM",
              color: "#22c55e",
              action: () => window.open("https://wa.me/917700000077", "_blank"),
            },
            {
              icon: Mail,
              label: "Email Support",
              sub: "Reply within 24h",
              color: "#1D4ED8",
              action: () =>
                window.open("mailto:support@77mobiles.pro", "_blank"),
            },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              className="bg-white rounded-2xl p-3.5 flex flex-col items-center gap-2 text-center"
              style={{
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${item.color}15` }}
              >
                <item.icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">{item.label}</p>
                <p className="text-[10px] text-gray-400">{item.sub}</p>
              </div>
            </button>
          ))}
        </div>

        {/* FAQs */}
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <p className="px-4 pt-3 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wide">
            Frequently Asked Questions
          </p>
          <FAQList />
        </div>
      </div>
    );
  }

  // ── Main Profile view ─────────────────────────────────────────────────────────
  return (
    <div className="px-4 pt-6 pb-6 bg-[#F8F9FA] min-h-screen">
      {/* Profile header */}
      <div
        className="bg-white rounded-2xl p-5 text-center mb-4"
        style={{
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <div
          className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center"
          style={{ background: "#EEF2FF", border: "3px solid #007AFF" }}
        >
          <User className="w-10 h-10" style={{ color: "#007AFF" }} />
        </div>
        <h2 className="font-black text-lg text-gray-900">
          Verified Dealer #402
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">B2B Dealer</p>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <Shield className="w-3.5 h-3.5" style={{ color: "#007AFF" }} />
          <span className="text-xs font-semibold" style={{ color: "#007AFF" }}>
            Verified Account
          </span>
        </div>
        <div className="mt-3 bg-gray-50 rounded-xl px-3 py-2 text-left">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">GST / PAN</span>
            <span className="text-xs font-bold text-gray-900">••••••••••</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">Mobile</span>
            <span className="text-xs font-bold text-gray-900">
              ••••••{user?.mobileNumber?.slice(-4) || "XXXX"}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">Current Mode</span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
              style={{ background: mode === "seller" ? "#007AFF" : "#16a34a" }}
            >
              {mode === "seller" ? "Seller" : "Buyer"}
            </span>
          </div>
        </div>
      </div>

      {/* Switch mode */}
      <div
        className="bg-white rounded-2xl p-4 flex items-center justify-between mb-4"
        style={{
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <div>
          <p className="font-bold text-sm text-gray-900">
            Switch to {mode === "seller" ? "Buyer" : "Seller"} Mode
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {mode === "seller"
              ? "Browse and bid on listings"
              : "List your devices for auction"}
          </p>
        </div>
        <button
          type="button"
          data-ocid="profile.switch_mode.toggle"
          onClick={handleSwitchMode}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: "#007AFF" }}
        >
          <RefreshCw className="w-4 h-4" />
          Switch
        </button>
      </div>

      {/* Settings list */}
      <div
        className="bg-white rounded-2xl overflow-hidden mb-4"
        style={{
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        {[
          {
            icon: Settings,
            label: "My Account",
            ocid: "profile.account.link",
            action: () => setView("account"),
          },
          {
            icon: BarChart2,
            label: "My Analytics",
            ocid: "profile.analytics.link",
            action: () => setView("analytics"),
          },
          {
            icon: HelpCircle,
            label: "Help & Support",
            ocid: "profile.help.link",
            action: () => setView("help"),
          },
        ].map((item, idx) => (
          <button
            key={item.label}
            type="button"
            data-ocid={item.ocid}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
            style={{
              borderBottom: idx < 2 ? "1px solid #f3f4f6" : "none",
            }}
            onClick={item.action}
          >
            <item.icon className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-800 flex-1">
              {item.label}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        type="button"
        data-ocid="profile.logout.button"
        onClick={handleLogout}
        className="w-full mt-2 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
        style={{
          background: "#fef2f2",
          color: "#dc2626",
          border: "1px solid #fecaca",
        }}
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
}

function FAQList() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div>
      {FAQ_ITEMS.map((item, idx) => (
        <div
          key={item.q}
          style={{
            borderBottom:
              idx < FAQ_ITEMS.length - 1 ? "1px solid #f3f4f6" : "none",
          }}
        >
          <button
            type="button"
            className="w-full flex items-start gap-2 px-4 py-3 text-left"
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
          >
            <HelpCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm font-semibold text-gray-800 flex-1">
              {item.q}
            </span>
            <ChevronRight
              className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 transition-transform"
              style={{ transform: openIdx === idx ? "rotate(90deg)" : "none" }}
            />
          </button>
          {openIdx === idx && (
            <div className="px-4 pb-3">
              <p className="text-xs text-gray-600 leading-relaxed pl-6">
                {item.a}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
