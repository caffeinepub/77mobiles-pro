import {
  Activity,
  AlertTriangle,
  BarChart2,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  Edit2,
  FileText,
  Gavel,
  LayoutDashboard,
  LogOut,
  Plus,
  Shield,
  Trash2,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type AdminModule =
  | "pulse"
  | "dealers"
  | "auctions"
  | "wallet"
  | "cms"
  | "audit";

const MODULES: {
  id: AdminModule;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: "pulse", label: "Pulse", icon: LayoutDashboard },
  { id: "dealers", label: "Dealer Verification", icon: Users },
  { id: "auctions", label: "Auction Moderation", icon: Gavel },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "cms", label: "CMS / Banners", icon: FileText },
  { id: "audit", label: "Audit Log", icon: ClipboardList },
];

const MOCK_DEALERS = [
  {
    id: "DLR-001",
    name: "Apex Mobiles Ltd",
    gst: "29ABCDE1234F1Z5",
    submitted: "Mar 28",
    status: "Pending",
  },
  {
    id: "DLR-002",
    name: "Mumbai Gadgets Co",
    gst: "27XYZPQ9876G2K7",
    submitted: "Mar 27",
    status: "Approved",
  },
  {
    id: "DLR-003",
    name: "Delhi Tech Traders",
    gst: "07LMNOP4567H3L9",
    submitted: "Mar 26",
    status: "Rejected",
  },
  {
    id: "DLR-004",
    name: "Bengaluru Devices",
    gst: "29QRSTU8901I4M1",
    submitted: "Mar 25",
    status: "Pending",
  },
  {
    id: "DLR-005",
    name: "Hyderabad iHub",
    gst: "36VWXYZ2345J5N3",
    submitted: "Mar 24",
    status: "Approved",
  },
];

const MOCK_AUCTIONS = [
  {
    id: "AUC-101",
    model: "iPhone 16 Pro 256GB",
    highBid: "₹82,000",
    bidders: 9,
    timeLeft: "14:22",
    status: "Live",
  },
  {
    id: "AUC-102",
    model: "Samsung S25 Ultra",
    highBid: "₹74,500",
    bidders: 6,
    timeLeft: "02:44",
    status: "Live",
  },
  {
    id: "AUC-103",
    model: "MacBook Pro M3 Max",
    highBid: "₹1,28,000",
    bidders: 3,
    timeLeft: "45:10",
    status: "Live",
  },
  {
    id: "AUC-104",
    model: "iPad Pro M4 512GB",
    highBid: "₹94,000",
    bidders: 5,
    timeLeft: "1:02:30",
    status: "Live",
  },
];

const MOCK_WITHDRAWALS = [
  {
    id: "WD-501",
    dealer: "DLR-002",
    amount: "₹32,000",
    date: "Mar 31",
    status: "Pending",
  },
  {
    id: "WD-502",
    dealer: "DLR-005",
    amount: "₹50,000",
    date: "Mar 30",
    status: "Pending",
  },
  {
    id: "WD-503",
    dealer: "DLR-001",
    amount: "₹18,500",
    date: "Mar 29",
    status: "Approved",
  },
];

const MOCK_BANNERS = [
  {
    id: "BNR-1",
    title: "Live Auction: iPhone 17 Pro",
    type: "Buyer",
    active: true,
  },
  {
    id: "BNR-2",
    title: "Trending Now: High demand for S25 series",
    type: "Seller",
    active: true,
  },
  {
    id: "BNR-3",
    title: "Bulk Wholesale Lots Available",
    type: "Buyer",
    active: false,
  },
];

const MOCK_AUDIT = [
  {
    ts: "2026-04-01 14:32",
    admin: "superadmin",
    action: "APPROVED_DEALER",
    target: "DLR-002",
    ip: "103.21.45.12",
  },
  {
    ts: "2026-04-01 13:10",
    admin: "superadmin",
    action: "REJECTED_DEALER",
    target: "DLR-003",
    ip: "103.21.45.12",
  },
  {
    ts: "2026-04-01 12:05",
    admin: "moderator1",
    action: "REMOVED_AUCTION",
    target: "AUC-099",
    ip: "192.168.1.5",
  },
  {
    ts: "2026-04-01 11:44",
    admin: "superadmin",
    action: "APPROVED_WITHDRAWAL",
    target: "WD-498",
    ip: "103.21.45.12",
  },
  {
    ts: "2026-03-31 17:22",
    admin: "moderator1",
    action: "UPDATED_BANNER",
    target: "BNR-1",
    ip: "192.168.1.5",
  },
  {
    ts: "2026-03-31 16:00",
    admin: "superadmin",
    action: "CREATED_BANNER",
    target: "BNR-3",
    ip: "103.21.45.12",
  },
  {
    ts: "2026-03-31 14:15",
    admin: "superadmin",
    action: "APPROVED_DEALER",
    target: "DLR-005",
    ip: "103.21.45.12",
  },
  {
    ts: "2026-03-31 13:30",
    admin: "moderator2",
    action: "FLAGGED_LISTING",
    target: "LST-772",
    ip: "10.0.0.4",
  },
  {
    ts: "2026-03-30 10:20",
    admin: "superadmin",
    action: "APPROVED_WITHDRAWAL",
    target: "WD-491",
    ip: "103.21.45.12",
  },
  {
    ts: "2026-03-29 09:00",
    admin: "superadmin",
    action: "SYSTEM_LOGIN",
    target: "—",
    ip: "103.21.45.12",
  },
];

const WEEKLY_BAR_DATA = [18, 24, 31, 28, 34, 40, 34];
const WEEKLY_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    Pending: { bg: "#FEF3C7", color: "#D97706" },
    Approved: { bg: "#D1FAE5", color: "#059669" },
    Rejected: { bg: "#FEE2E2", color: "#DC2626" },
    Live: { bg: "#FEE2E2", color: "#DC2626" },
  };
  const s = styles[status] ?? { bg: "#F1F5F9", color: "#6B7280" };
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

function PulseModule() {
  const maxBar = Math.max(...WEEKLY_BAR_DATA);
  return (
    <div>
      <h2 className="text-xl font-bold mb-5" style={{ color: "#1E293B" }}>
        Platform Pulse
      </h2>
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Dealers", value: "247", color: "#1D4ED8" },
          { label: "Active Auctions", value: "34", color: "#059669" },
          { label: "Pending KYC", value: "12", color: "#D97706" },
          { label: "Daily Volume", value: "₹18.4L", color: "#7C3AED" },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-xl"
            style={{
              background: "#fff",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <p
              className="text-xs font-medium mb-1"
              style={{ color: "#6B7280" }}
            >
              {s.label}
            </p>
            <p className="text-2xl font-black" style={{ color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Weekly Volume highlight */}
      <div
        className="p-4 rounded-xl mb-6 flex items-center justify-between"
        style={{ background: "#EFF6FF", border: "1.5px solid #BFDBFE" }}
      >
        <div>
          <p
            className="text-xs font-medium mb-0.5"
            style={{ color: "#1D4ED8" }}
          >
            Weekly Volume
          </p>
          <p className="text-2xl font-black" style={{ color: "#1D4ED8" }}>
            ₹4.8 Cr
          </p>
          <p className="text-[10px]" style={{ color: "#60A5FA" }}>
            +22% vs last week
          </p>
        </div>
        <BarChart2 className="w-10 h-10" style={{ color: "#BFDBFE" }} />
      </div>

      {/* Bar chart */}
      <div
        className="p-5 rounded-xl mb-6"
        style={{
          background: "#fff",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <h3 className="text-sm font-bold mb-4" style={{ color: "#1E293B" }}>
          Weekly Auctions
        </h3>
        <div className="flex items-end gap-3" style={{ height: "80px" }}>
          {WEEKLY_BAR_DATA.map((val, i) => (
            <div
              key={WEEKLY_DAYS[i]}
              className="flex flex-col items-center flex-1 gap-1"
            >
              <div
                className="w-full rounded-t-md transition-all"
                style={{
                  height: `${(val / maxBar) * 68}px`,
                  background: i === 6 ? "#1D4ED8" : "#BFDBFE",
                }}
              />
              <span className="text-[10px]" style={{ color: "#9CA3AF" }}>
                {WEEKLY_DAYS[i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Platform health */}
      <div
        className="p-5 rounded-xl"
        style={{
          background: "#fff",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <h3 className="text-sm font-bold mb-3" style={{ color: "#1E293B" }}>
          Platform Health
        </h3>
        {["API Status", "Database", "Payment Gateway"].map((service) => (
          <div key={service} className="flex items-center gap-2.5 py-2">
            <CheckCircle className="w-4 h-4" style={{ color: "#059669" }} />
            <span className="text-sm" style={{ color: "#1E293B" }}>
              {service}
            </span>
            <span
              className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "#D1FAE5", color: "#059669" }}
            >
              Operational
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DealersModule() {
  const [filter, setFilter] = useState("All");
  const [dealerStatuses, setDealerStatuses] = useState<Record<string, string>>(
    {},
  );
  const allDealers = MOCK_DEALERS.map((d) => ({
    ...d,
    status: dealerStatuses[d.id] ?? d.status,
  }));
  const filtered =
    filter === "All"
      ? allDealers
      : allDealers.filter((d) => d.status === filter);
  return (
    <div>
      <h2 className="text-xl font-bold mb-5" style={{ color: "#1E293B" }}>
        Dealer Verification (KYC)
      </h2>
      <div className="flex gap-2 mb-4">
        {["All", "Pending", "Approved", "Rejected"].map((f) => (
          <button
            key={f}
            type="button"
            data-ocid={`admin.dealers.filter.${f.toLowerCase()}.tab`}
            onClick={() => setFilter(f)}
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              background: filter === f ? "#1D4ED8" : "#F1F5F9",
              color: filter === f ? "#fff" : "#6B7280",
            }}
          >
            {f}
          </button>
        ))}
      </div>
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid #E2E8F0" }}
        data-ocid="admin.dealers.table"
      >
        <table className="w-full">
          <thead style={{ background: "#F8FAFC" }}>
            <tr>
              {[
                "Dealer ID",
                "Business Name",
                "GST / PAN",
                "Submitted",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-semibold px-4 py-3"
                  style={{ color: "#6B7280" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => (
              <tr
                key={d.id}
                data-ocid={`admin.dealers.row.${i + 1}`}
                style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFC" }}
              >
                <td
                  className="px-4 py-3 text-xs font-mono"
                  style={{ color: "#1D4ED8" }}
                >
                  {d.id}
                </td>
                <td
                  className="px-4 py-3 text-sm font-medium"
                  style={{ color: "#1E293B" }}
                >
                  {d.name}
                </td>
                <td
                  className="px-4 py-3 text-xs font-mono"
                  style={{ color: "#6B7280" }}
                >
                  {d.gst}
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "#6B7280" }}>
                  {d.submitted}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={d.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      data-ocid={`admin.dealers.approve.${i + 1}.button`}
                      className="px-2 py-1 rounded text-[11px] font-bold"
                      style={{
                        background: "#D1FAE5",
                        color: "#059669",
                        minHeight: "44px",
                        minWidth: "44px",
                      }}
                      onClick={() => {
                        setDealerStatuses((prev) => ({
                          ...prev,
                          [d.id]: "Approved",
                        }));
                        toast.success(`${d.name} approved`);
                      }}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      data-ocid={`admin.dealers.reject.${i + 1}.button`}
                      className="px-2 py-1 rounded text-[11px] font-bold"
                      style={{
                        background: "#FEE2E2",
                        color: "#DC2626",
                        minHeight: "44px",
                        minWidth: "44px",
                      }}
                      onClick={() => {
                        setDealerStatuses((prev) => ({
                          ...prev,
                          [d.id]: "Rejected",
                        }));
                        toast.error(`${d.name} rejected`);
                      }}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      data-ocid={`admin.dealers.docs.${i + 1}.button`}
                      className="px-2 py-1 rounded text-[11px] font-bold"
                      style={{ background: "#EFF6FF", color: "#1D4ED8" }}
                    >
                      View Docs
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuctionsModule() {
  const [auctions, setAuctions] = useState(MOCK_AUCTIONS);
  return (
    <div>
      <h2 className="text-xl font-bold mb-5" style={{ color: "#1E293B" }}>
        Auction Moderation
      </h2>
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid #E2E8F0" }}
        data-ocid="admin.auctions.table"
      >
        <table className="w-full">
          <thead style={{ background: "#F8FAFC" }}>
            <tr>
              {[
                "Device",
                "High Bid",
                "Bidders",
                "Time Left",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-semibold px-4 py-3"
                  style={{ color: "#6B7280" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {auctions.map((a, i) => (
              <tr
                key={a.id}
                data-ocid={`admin.auctions.row.${i + 1}`}
                style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFC" }}
              >
                <td
                  className="px-4 py-3 text-sm font-medium"
                  style={{ color: "#1E293B" }}
                >
                  {a.model}
                </td>
                <td
                  className="px-4 py-3 text-sm font-bold"
                  style={{ color: "#1D4ED8" }}
                >
                  {a.highBid}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: "#1E293B" }}>
                  {a.bidders}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: "#EF4444" }}>
                  {a.timeLeft}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: "#EF4444",
                        animation: "pulse 1.5s infinite",
                      }}
                    />
                    <span
                      className="text-xs font-bold"
                      style={{ color: "#EF4444" }}
                    >
                      {a.status}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      data-ocid={`admin.auctions.monitor.${i + 1}.button`}
                      className="px-2 py-1 rounded text-[11px] font-bold"
                      style={{ background: "#EFF6FF", color: "#1D4ED8" }}
                    >
                      Monitor
                    </button>
                    <button
                      type="button"
                      data-ocid={`admin.auctions.delete.${i + 1}.delete_button`}
                      className="px-2 py-1 rounded text-[11px] font-bold"
                      style={{
                        background: "#FEE2E2",
                        color: "#DC2626",
                        minHeight: "44px",
                      }}
                      onClick={() => {
                        setAuctions((prev) =>
                          prev.filter((x) => x.id !== a.id),
                        );
                        toast.success("Auction removed");
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WalletModule() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-5" style={{ color: "#1E293B" }}>
        Wallet & Financials
      </h2>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Escrow", value: "₹4.2L", color: "#1D4ED8" },
          { label: "Pending Withdrawals", value: "₹82,000", color: "#D97706" },
          { label: "Settled Today", value: "₹1.1L", color: "#059669" },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 rounded-xl"
            style={{
              background: "#fff",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <p
              className="text-xs font-medium mb-1"
              style={{ color: "#6B7280" }}
            >
              {s.label}
            </p>
            <p className="text-xl font-black" style={{ color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>
      <h3 className="text-sm font-bold mb-3" style={{ color: "#1E293B" }}>
        Withdrawal Requests
      </h3>
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid #E2E8F0" }}
        data-ocid="admin.wallet.table"
      >
        <table className="w-full">
          <thead style={{ background: "#F8FAFC" }}>
            <tr>
              {["ID", "Dealer", "Amount", "Date", "Status", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold px-4 py-3"
                    style={{ color: "#6B7280" }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {MOCK_WITHDRAWALS.map((w, i) => (
              <tr
                key={w.id}
                data-ocid={`admin.wallet.row.${i + 1}`}
                style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFC" }}
              >
                <td
                  className="px-4 py-3 text-xs font-mono"
                  style={{ color: "#1D4ED8" }}
                >
                  {w.id}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: "#1E293B" }}>
                  {w.dealer}
                </td>
                <td
                  className="px-4 py-3 text-sm font-bold"
                  style={{ color: "#1E293B" }}
                >
                  {w.amount}
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "#6B7280" }}>
                  {w.date}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={w.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      data-ocid={`admin.wallet.approve.${i + 1}.button`}
                      className="px-2 py-1 rounded text-[11px] font-bold"
                      style={{ background: "#D1FAE5", color: "#059669" }}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      data-ocid={`admin.wallet.reject.${i + 1}.delete_button`}
                      className="px-2 py-1 rounded text-[11px] font-bold"
                      style={{ background: "#FEE2E2", color: "#DC2626" }}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CmsModule() {
  const [banners, setBanners] = useState(MOCK_BANNERS);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const toggleBanner = (id: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b)),
    );
  };

  const saveEdit = () => {
    if (!editId) return;
    setBanners((prev) =>
      prev.map((b) => (b.id === editId ? { ...b, title: editTitle } : b)),
    );
    setEditId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold" style={{ color: "#1E293B" }}>
          CMS / Home Banners
        </h2>
        <button
          type="button"
          data-ocid="admin.cms.add_banner.button"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold"
          style={{ background: "#1D4ED8", color: "#fff" }}
          onClick={() =>
            setBanners((prev) => [
              ...prev,
              {
                id: `b${Date.now()}`,
                title: "New Banner",
                type: "promotional",
                active: false,
              },
            ])
          }
        >
          <Plus className="w-4 h-4" />
          Add Banner
        </button>
      </div>
      <div className="flex flex-col gap-4" data-ocid="admin.cms.list">
        {banners.map((b, i) => (
          <div
            key={b.id}
            data-ocid={`admin.cms.item.${i + 1}`}
            className="p-4 rounded-xl"
            style={{
              background: "#fff",
              border: "1px solid #E2E8F0",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            {editId === b.id ? (
              <div className="flex gap-2">
                <input
                  data-ocid="admin.cms.edit.input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 border rounded-lg px-3 py-1.5 text-sm outline-none"
                  style={{ borderColor: "#1D4ED8" }}
                />
                <button
                  type="button"
                  data-ocid="admin.cms.save.button"
                  onClick={saveEdit}
                  className="px-3 py-1.5 rounded-lg text-sm font-bold"
                  style={{ background: "#1D4ED8", color: "#fff" }}
                >
                  Save
                </button>
                <button
                  type="button"
                  data-ocid="admin.cms.cancel.button"
                  onClick={() => setEditId(null)}
                  className="px-3 py-1.5 rounded-lg text-sm"
                  style={{ background: "#F1F5F9" }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm font-semibold mb-0.5"
                    style={{ color: "#1E293B" }}
                  >
                    {b.title}
                  </p>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{ background: "#EFF6FF", color: "#1D4ED8" }}
                  >
                    {b.type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: b.active ? "#D1FAE5" : "#F1F5F9",
                      color: b.active ? "#059669" : "#9CA3AF",
                    }}
                  >
                    {b.active ? "Active" : "Inactive"}
                  </span>
                  <button
                    type="button"
                    data-ocid={`admin.cms.toggle.${i + 1}.toggle`}
                    onClick={() => toggleBanner(b.id)}
                    className="px-2 py-1 rounded text-[11px] font-bold"
                    style={{ background: "#F1F5F9", color: "#6B7280" }}
                  >
                    Toggle
                  </button>
                  <button
                    type="button"
                    data-ocid={`admin.cms.edit.${i + 1}.edit_button`}
                    onClick={() => {
                      setEditId(b.id);
                      setEditTitle(b.title);
                    }}
                    className="p-1.5 rounded"
                    style={{ background: "#EFF6FF" }}
                  >
                    <Edit2
                      className="w-3.5 h-3.5"
                      style={{ color: "#1D4ED8" }}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditModule() {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold" style={{ color: "#1E293B" }}>
          Audit Log
        </h2>
        <span
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
          style={{ background: "#FEF3C7", color: "#D97706" }}
        >
          <AlertTriangle className="w-3 h-3" />
          Audit logs are immutable
        </span>
      </div>
      <p className="text-xs mb-4" style={{ color: "#9CA3AF" }}>
        All admin actions are permanently recorded and cannot be edited or
        deleted.
      </p>
      {/* Date filter UI */}
      <div className="flex gap-2 mb-4">
        <input
          data-ocid="admin.audit.from.input"
          type="date"
          defaultValue="2026-03-29"
          className="border rounded-lg px-3 py-1.5 text-xs outline-none"
          style={{ borderColor: "#E2E8F0" }}
        />
        <span className="text-xs self-center" style={{ color: "#9CA3AF" }}>
          to
        </span>
        <input
          data-ocid="admin.audit.to.input"
          type="date"
          defaultValue="2026-04-01"
          className="border rounded-lg px-3 py-1.5 text-xs outline-none"
          style={{ borderColor: "#E2E8F0" }}
        />
      </div>
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid #E2E8F0" }}
        data-ocid="admin.audit.table"
      >
        <table className="w-full">
          <thead style={{ background: "#F8FAFC" }}>
            <tr>
              {["Timestamp", "Admin", "Action", "Target", "IP Address"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold px-4 py-3"
                    style={{ color: "#6B7280" }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {MOCK_AUDIT.map((log, i) => (
              <tr
                key={`${log.ts}-${i}`}
                data-ocid={`admin.audit.row.${i + 1}`}
                style={{ background: i % 2 === 0 ? "#fff" : "#F8FAFC" }}
              >
                <td
                  className="px-4 py-2.5 text-xs font-mono"
                  style={{ color: "#6B7280" }}
                >
                  {log.ts}
                </td>
                <td
                  className="px-4 py-2.5 text-xs font-semibold"
                  style={{ color: "#1D4ED8" }}
                >
                  {log.admin}
                </td>
                <td
                  className="px-4 py-2.5 text-xs font-mono"
                  style={{ color: "#1E293B" }}
                >
                  {log.action}
                </td>
                <td
                  className="px-4 py-2.5 text-xs"
                  style={{ color: "#6B7280" }}
                >
                  {log.target}
                </td>
                <td
                  className="px-4 py-2.5 text-xs font-mono"
                  style={{ color: "#9CA3AF" }}
                >
                  {log.ip}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [activeModule, setActiveModule] = useState<AdminModule>("pulse");

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const handleLogin = () => {
    if (pin === "77admin") {
      setAuthed(true);
      setError("");
    } else {
      setError("Invalid PIN. Access denied.");
    }
  };

  if (!authed) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#F8FAFC" }}
      >
        <div
          className="w-full max-w-sm p-8 rounded-2xl"
          style={{
            background: "#fff",
            border: "1px solid #E2E8F0",
            boxShadow: "0 4px 24px rgba(29,78,216,0.08)",
          }}
          data-ocid="admin.login.modal"
        >
          <div className="flex flex-col items-center mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: "#1D4ED8" }}
            >
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-black" style={{ color: "#1E293B" }}>
              77mobiles.pro
            </h1>
            <p className="text-sm" style={{ color: "#6B7280" }}>
              Admin Portal
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <label
              htmlFor="admin-pin"
              className="text-xs font-semibold"
              style={{ color: "#6B7280" }}
            >
              Admin PIN
            </label>
            <input
              data-ocid="admin.login.input"
              type="password"
              className="w-full border rounded-xl px-4 py-3 text-sm outline-none"
              style={{
                borderColor: error ? "#EF4444" : "#E2E8F0",
                color: "#1E293B",
              }}
              placeholder="Enter your admin PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            {error && (
              <p
                className="text-xs"
                style={{ color: "#EF4444" }}
                data-ocid="admin.login.error_state"
              >
                {error}
              </p>
            )}
            <button
              type="button"
              data-ocid="admin.login.submit_button"
              onClick={handleLogin}
              className="w-full py-3 rounded-xl text-sm font-bold"
              style={{ background: "#1D4ED8", color: "#fff" }}
            >
              Access Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside
          className="flex flex-col"
          style={{
            width: "240px",
            minHeight: "100vh",
            background: "#fff",
            borderRight: "1px solid #E2E8F0",
            flexShrink: 0,
          }}
        >
          <div className="p-5 border-b" style={{ borderColor: "#E2E8F0" }}>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#1D4ED8" }}
              >
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-black" style={{ color: "#1E293B" }}>
                  77mobiles.pro
                </p>
                <p className="text-[10px]" style={{ color: "#6B7280" }}>
                  Admin Portal
                </p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-3">
            {MODULES.map(({ id, label, icon: Icon }) => {
              const active = activeModule === id;
              return (
                <button
                  key={id}
                  type="button"
                  data-ocid={`admin.sidebar.${id}.link`}
                  onClick={() => setActiveModule(id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-left transition-colors"
                  style={{
                    background: active ? "#EFF6FF" : "transparent",
                    color: active ? "#1D4ED8" : "#6B7280",
                  }}
                >
                  <Icon
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: active ? "#1D4ED8" : "#6B7280" }}
                  />
                  <span className="text-sm font-semibold">{label}</span>
                  {active && (
                    <ChevronRight
                      className="w-3.5 h-3.5 ml-auto"
                      style={{ color: "#1D4ED8" }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
          <div className="p-3 border-t" style={{ borderColor: "#E2E8F0" }}>
            <button
              type="button"
              data-ocid="admin.sidebar.logout.button"
              onClick={() => setAuthed(false)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl"
              style={{ color: "#DC2626" }}
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-semibold">Logout</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header
            className="flex items-center justify-between px-6 py-4"
            style={{
              background: "#fff",
              borderBottom: "1px solid #E2E8F0",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <div>
              <h1 className="text-base font-black" style={{ color: "#1E293B" }}>
                77mobiles.pro Admin
              </h1>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>
                {dateStr}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ background: "#EFF6FF", color: "#1D4ED8" }}
              >
                <Shield className="w-3 h-3" />
                Super Admin
              </span>
              <button
                type="button"
                data-ocid="admin.header.logout.button"
                onClick={() => setAuthed(false)}
                className="lg:hidden flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: "#FEE2E2", color: "#DC2626" }}
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          </header>

          {/* Mobile nav */}
          <div
            className="lg:hidden flex gap-2 px-4 py-2 overflow-x-auto"
            style={{
              borderBottom: "1px solid #E2E8F0",
              scrollbarWidth: "none",
            }}
          >
            {MODULES.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                data-ocid={`admin.mobile.${id}.tab`}
                onClick={() => setActiveModule(id)}
                className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: activeModule === id ? "#1D4ED8" : "#F1F5F9",
                  color: activeModule === id ? "#fff" : "#6B7280",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <main className="flex-1 p-6 overflow-auto">
            {activeModule === "pulse" && <PulseModule />}
            {activeModule === "dealers" && <DealersModule />}
            {activeModule === "auctions" && <AuctionsModule />}
            {activeModule === "wallet" && <WalletModule />}
            {activeModule === "cms" && <CmsModule />}
            {activeModule === "audit" && <AuditModule />}
          </main>
        </div>
      </div>
    </div>
  );
}
