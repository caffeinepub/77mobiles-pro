import { useNavigate } from "@tanstack/react-router";
import { CheckCircle, Clock, Download, Package, X, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { type AlertNotification, BidStore } from "../stores/BidStore";

const SELLER_ACTIVITY = [
  {
    id: "sa-1",
    text: "Bid received on iPhone 17 Pro — ₹1,12,500",
    time: "2m ago",
    type: "bid",
  },
  {
    id: "sa-2",
    text: "Samsung S24 Ultra sold for ₹85,000",
    time: "2h ago",
    type: "sold",
  },
  {
    id: "sa-3",
    text: "New buying lead matches your iPhone 16 stock",
    time: "3h ago",
    type: "lead",
  },
];

const BUYER_WINS = [
  {
    id: "bw-1",
    model: "iPhone 15 Pro 256GB",
    price: "₹65,000",
    seller: "Verified Seller #189",
    txn: "TXN998877",
    paid: true,
  },
];

const BUYER_ACTIVITY = [
  {
    id: "ba-1",
    text: "You placed a bid of ₹1,12,500 on iPhone 17 Pro",
    time: "5m ago",
  },
  {
    id: "ba-2",
    text: "Outbid on Samsung S24 Ultra. Current: ₹87,000",
    time: "15m ago",
  },
  { id: "ba-3", text: "Direct Buy confirmed: iPhone 15 Pro", time: "1h ago" },
];

export default function ActivityPage() {
  const { mode } = useApp();
  const { user } = useAuth();
  const [liveAlerts, setLiveAlerts] = useState<AlertNotification[]>([]);
  const [pendingStates, setPendingStates] = useState<
    Record<string, "pending" | "accepted" | "declined">
  >({});
  const [activeSubTab, setActiveSubTab] = useState<"activity" | "leads">(
    "activity",
  );
  // Task 3: Real-time highest bid for the pending sale card
  const [pendingSaleBid, setPendingSaleBid] = useState<number>(0);
  const pendingSaleListingId = "ps-1";
  const navigate = useNavigate();
  // Suppress unused variable warning
  const _user = user;
  const _userRef = useRef(_user);
  _userRef.current = _user;

  // Task 6: Real-time alerts from BidStore
  useEffect(() => {
    const unsub = BidStore.subscribeAlerts(setLiveAlerts);
    return unsub;
  }, []);

  // Task 3: Subscribe to BidStore for highest bid on pending sale listing
  useEffect(() => {
    const unsub = BidStore.subscribeBids(pendingSaleListingId, (bids) => {
      if (bids.length > 0) {
        const highest = Math.max(...bids.map((b) => b.amount));
        setPendingSaleBid(highest);
      }
    });
    return unsub;
  }, []);

  const handleAccept = (id: string, amount: number) => {
    setPendingStates((prev) => ({ ...prev, [id]: "accepted" }));
    const price =
      amount > 0
        ? new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          }).format(amount / 100)
        : "₹1,10,000";
    toast.success(
      `Sale accepted for ${price}! Item marked as Payment Pending.`,
    );
  };

  const handleDecline = (id: string) => {
    setPendingStates((prev) => ({ ...prev, [id]: "declined" }));
    toast("Sale declined.");
  };

  // Task 4: Filter alerts by mode
  const userAlerts =
    liveAlerts.length > 0
      ? liveAlerts.filter((a) =>
          mode === "seller"
            ? a.type === "new_bid" || a.type === "approved"
            : a.type === "outbid" || a.type === "new_bid",
        )
      : [];

  // Computed values for pending sale display
  const pendingState = pendingStates[pendingSaleListingId] || "pending";
  const pendingSalePrice =
    pendingSaleBid > 0
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(pendingSaleBid / 100)
      : "₹1,10,000";

  return (
    <div className="px-4 pt-4 pb-6 bg-[#F8F9FA] min-h-screen">
      <h1 className="font-black text-lg text-gray-900 mb-4">Activity</h1>

      {/* Sub-tabs */}
      <div
        className="flex gap-1 bg-white rounded-xl p-1 mb-4"
        style={{ border: "1px solid #e5e7eb" }}
      >
        <button
          type="button"
          data-ocid="activity.my_activity.tab"
          onClick={() => setActiveSubTab("activity")}
          className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
          style={{
            background: activeSubTab === "activity" ? "#007AFF" : "transparent",
            color: activeSubTab === "activity" ? "white" : "#6b7280",
          }}
        >
          My Activity
        </button>
        <button
          type="button"
          data-ocid="activity.leads.tab"
          onClick={() => setActiveSubTab("leads")}
          className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
          style={{
            background: activeSubTab === "leads" ? "#007AFF" : "transparent",
            color: activeSubTab === "leads" ? "white" : "#6b7280",
          }}
        >
          {mode === "seller" ? "Demand Feed" : "Buying Leads"}
        </button>
      </div>

      {activeSubTab === "activity" && mode === "seller" && (
        <div className="space-y-3">
          {/* Task 3: Dynamic pending sale card with real-time highest bid */}
          {pendingState !== "declined" && (
            <div
              key="ps-1"
              data-ocid="activity.pending_sale.item.1"
              className="bg-white rounded-2xl p-4"
              style={{
                border: "2px solid #007AFF",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span
                    className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
                    style={{ background: "#007AFF" }}
                  >
                    PENDING SALE
                  </span>
                  <p className="font-bold text-sm text-gray-900 mt-1.5">
                    iPhone 17 Pro
                  </p>
                  <p className="text-xs text-gray-500">
                    Buyer: Verified Dealer #402
                  </p>
                  <p
                    className="font-black text-base mt-1"
                    style={{ color: "#007AFF" }}
                  >
                    {pendingSalePrice}
                  </p>
                </div>
                <span className="text-[10px] text-gray-400">5 min ago</span>
              </div>
              {pendingState === "pending" ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    data-ocid="activity.accept_sale.button.1"
                    onClick={() =>
                      handleAccept(pendingSaleListingId, pendingSaleBid)
                    }
                    className="flex-1 py-2 rounded-xl text-sm font-bold text-white"
                    style={{ background: "#16a34a" }}
                  >
                    Accept Sale
                  </button>
                  <button
                    type="button"
                    data-ocid="activity.decline.button.1"
                    onClick={() => handleDecline(pendingSaleListingId)}
                    className="flex-1 py-2 rounded-xl text-sm font-bold"
                    style={{ background: "#f3f4f6", color: "#374151" }}
                  >
                    Decline
                  </button>
                </div>
              ) : pendingState === "accepted" ? (
                <div
                  className="flex items-center gap-2 py-2 px-3 rounded-xl"
                  style={{ background: "#f0fdf4" }}
                >
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-bold text-green-700">
                    Accepted — Payment Pending
                  </span>
                </div>
              ) : (
                <div
                  className="flex items-center gap-2 py-2 px-3 rounded-xl"
                  style={{ background: "#fef2f2" }}
                >
                  <X className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-bold text-red-600">
                    Sale Declined
                  </span>
                </div>
              )}
            </div>
          )}

          <h2 className="font-bold text-sm text-gray-700 mt-2">
            Recent Activity
          </h2>

          {/* Task 4: Show user-filtered live alerts, fall back to static */}
          {liveAlerts.length > 0 ? (
            userAlerts.length > 0 ? (
              userAlerts.map((alert, idx) => (
                <div
                  key={alert.id}
                  data-ocid={`activity.live.item.${idx + 1}`}
                  className="bg-white rounded-2xl p-3.5 flex items-center gap-3"
                  style={{ border: "1px solid #e5e7eb" }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        alert.type === "new_bid" ? "#eff6ff" : "#f0fdf4",
                    }}
                  >
                    {alert.type === "new_bid" ? (
                      <Zap className="w-4 h-4" style={{ color: "#1D4ED8" }} />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-800">{alert.message}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-gray-400">just now</span>
                    <button
                      type="button"
                      data-ocid={`activity.view_auction.button.${idx + 1}`}
                      onClick={() =>
                        navigate({ to: `/listing/${alert.listingId}` as any })
                      }
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: "#eff6ff",
                        color: "#1D4ED8",
                        border: "1px solid #bfdbfe",
                      }}
                    >
                      View Auction
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div
                data-ocid="activity.seller.empty_state"
                className="text-center py-8"
              >
                <p className="text-xs text-gray-400 font-medium">
                  No new activity on your listings
                </p>
              </div>
            )
          ) : (
            SELLER_ACTIVITY.map((item, idx) => (
              <div
                key={item.id}
                data-ocid={`activity.seller.item.${idx + 1}`}
                className="bg-white rounded-2xl p-3.5 flex items-center gap-3"
                style={{ border: "1px solid #e5e7eb" }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      item.type === "bid"
                        ? "#eff6ff"
                        : item.type === "sold"
                          ? "#f0fdf4"
                          : "#fff7ed",
                  }}
                >
                  {item.type === "bid" && (
                    <Clock className="w-4 h-4" style={{ color: "#007AFF" }} />
                  )}
                  {item.type === "sold" && (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                  {item.type === "lead" && (
                    <Package className="w-4 h-4 text-orange-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-800">{item.text}</p>
                </div>
                <span className="text-[10px] text-gray-400 flex-shrink-0">
                  {item.time}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {activeSubTab === "activity" && mode === "buyer" && (
        <div className="space-y-3">
          <h2 className="font-bold text-sm text-gray-700">My Wins</h2>
          {BUYER_WINS.map((win, idx) => (
            <div
              key={win.id}
              data-ocid={`activity.win.item.${idx + 1}`}
              className="bg-white rounded-2xl p-4"
              style={{
                border: "2px solid #22c55e",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full bg-green-600">
                    WON
                  </span>
                  <p className="font-bold text-sm text-gray-900 mt-1.5">
                    {win.model}
                  </p>
                  <p className="text-xs text-gray-500">Seller: {win.seller}</p>
                  <p className="font-black text-base mt-1 text-green-700">
                    {win.price}
                  </p>
                  <p className="text-[10px] text-gray-400">TXN: {win.txn}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {win.paid ? (
                  <div className="flex items-center gap-2 flex-1 py-2 px-3 rounded-xl bg-green-50">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-bold text-green-700">
                      Payment Complete
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    data-ocid={`activity.pay_now.button.${idx + 1}`}
                    className="flex-1 py-2 rounded-xl text-sm font-bold text-white"
                    style={{ background: "#007AFF" }}
                    onClick={() => toast("Navigating to payment...")}
                  >
                    Pay Now
                  </button>
                )}
                <button
                  type="button"
                  data-ocid={`activity.download_invoice.button.${idx + 1}`}
                  onClick={() => toast.success("Invoice downloaded!")}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-bold"
                  style={{
                    background: "#f3f4f6",
                    color: "#374151",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Download className="w-4 h-4" /> Invoice
                </button>
              </div>
            </div>
          ))}

          <h2 className="font-bold text-sm text-gray-700 mt-2">
            Recent Activity
          </h2>
          {/* Task 4: Filter live alerts for buyer, fall back to static */}
          {liveAlerts.length > 0 ? (
            userAlerts.length > 0 ? (
              userAlerts.map((alert, idx) => (
                <div
                  key={alert.id}
                  data-ocid={`activity.live_buyer.item.${idx + 1}`}
                  className="bg-white rounded-2xl p-3.5 flex items-center gap-3"
                  style={{ border: "1px solid #e5e7eb" }}
                >
                  <Zap
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: "#007AFF" }}
                  />
                  <div className="flex-1">
                    <p className="text-xs text-gray-800">{alert.message}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">
                    just now
                  </span>
                </div>
              ))
            ) : (
              <div
                data-ocid="activity.buyer.empty_state"
                className="text-center py-8"
              >
                <p className="text-xs text-gray-400 font-medium">
                  No recent bidding activity
                </p>
              </div>
            )
          ) : (
            BUYER_ACTIVITY.map((item, idx) => (
              <div
                key={item.id}
                data-ocid={`activity.buyer.item.${idx + 1}`}
                className="bg-white rounded-2xl p-3.5 flex items-center gap-3"
                style={{ border: "1px solid #e5e7eb" }}
              >
                <Clock
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: "#007AFF" }}
                />
                <div className="flex-1">
                  <p className="text-xs text-gray-800">{item.text}</p>
                </div>
                <span className="text-[10px] text-gray-400 flex-shrink-0">
                  {item.time}
                </span>
              </div>
            ))
          )}
        </div>
      )}

      {activeSubTab === "leads" && (
        <div
          data-ocid="activity.leads.empty_state"
          className="text-center py-12"
        >
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-sm text-gray-600">
            {mode === "seller"
              ? "No demand leads yet"
              : "No buying leads posted yet"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {mode === "buyer" ? "Use the + button to post a buying lead" : ""}
          </p>
          {mode === "seller" && (
            <button
              type="button"
              data-ocid="activity.view_all_leads.button"
              onClick={() => navigate({ to: "/market-demand" })}
              className="mt-4 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "#1D4ED8" }}
            >
              View Market Demand
            </button>
          )}
        </div>
      )}
    </div>
  );
}
