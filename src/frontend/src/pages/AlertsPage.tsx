import { useNavigate } from "@tanstack/react-router";
import { Bell, CheckCircle, Package, ShoppingBag, Zap } from "lucide-react";
import { useApp } from "../contexts/AppContext";

const SELLER_ALERTS = [
  {
    id: "a1",
    type: "bid" as const,
    text: "New bid received on iPhone 17 Pro — ₹1,12,500 by Dealer #217",
    time: "2m ago",
    action: "View Auction",
    route: "/listing/s-1",
  },
  {
    id: "a2",
    type: "lead" as const,
    text: "Matching buying lead: Wanted 5x iPhone 16 by Dealer #341",
    time: "15m ago",
    action: "View Lead",
    route: "/market-demand",
  },
  {
    id: "a3",
    type: "bid" as const,
    text: "New bid on Samsung S24 Ultra — ₹87,000 by Dealer #189",
    time: "1h ago",
    action: "View Auction",
    route: "/listing/s-1",
  },
  {
    id: "a4",
    type: "sold" as const,
    text: "iPhone 15 Pro sold! Payment of ₹65,000 is being processed.",
    time: "2h ago",
    action: "View Receipt",
    route: "/app",
  },
];

const BUYER_ALERTS = [
  {
    id: "b1",
    type: "outbid" as const,
    text: "You've been outbid on Samsung S24 Ultra. Current bid: ₹87,500",
    time: "5m ago",
    action: "Place Bid",
    route: "/listing/b-2",
  },
  {
    id: "b2",
    type: "success" as const,
    text: "Direct Buy confirmed for iPhone 15 Pro. Payment received.",
    time: "30m ago",
    action: "View Receipt",
    route: "/app",
  },
  {
    id: "b3",
    type: "outbid" as const,
    text: "Outbid on iPhone 16 Pro. New high: ₹78,500",
    time: "1h ago",
    action: "Place Bid",
    route: "/listing/b-2",
  },
  {
    id: "b4",
    type: "info" as const,
    text: "New listing matching your lead: iPhone 16 Pro 256GB available at ₹75,000",
    time: "2h ago",
    action: "View Listing",
    route: "/listing/b-3",
  },
];

type AlertType = "bid" | "lead" | "sold" | "outbid" | "success" | "info";

const borderColor = (type: AlertType) => {
  if (type === "outbid") return "#ef4444";
  if (type === "success" || type === "sold") return "#22c55e";
  if (type === "bid") return "#007AFF";
  if (type === "lead") return "#f97316";
  return "#6b7280";
};

const AlertIcon = ({ type }: { type: AlertType }) => {
  if (type === "bid")
    return <Zap className="w-4 h-4" style={{ color: "#007AFF" }} />;
  if (type === "lead") return <Package className="w-4 h-4 text-orange-500" />;
  if (type === "outbid") return <Bell className="w-4 h-4 text-red-500" />;
  if (type === "success" || type === "sold")
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  return <ShoppingBag className="w-4 h-4" style={{ color: "#007AFF" }} />;
};

export default function AlertsPage() {
  const { mode } = useApp();
  const navigate = useNavigate();
  const alerts = mode === "seller" ? SELLER_ALERTS : BUYER_ALERTS;

  return (
    <div className="px-4 pt-4 pb-6 bg-[#F8F9FA] min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-black text-lg text-gray-900">Alerts</h1>
        <span
          className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
          style={{ background: "#007AFF" }}
        >
          {alerts.length} New
        </span>
      </div>

      {alerts.length === 0 ? (
        <div data-ocid="alerts.empty_state" className="text-center py-16">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-bold text-gray-600">No alerts yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, idx) => (
            <div
              key={alert.id}
              data-ocid={`alerts.item.${idx + 1}`}
              className="bg-white rounded-2xl p-4 flex items-start gap-3"
              style={{
                borderLeft: `4px solid ${borderColor(alert.type)}`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: `${borderColor(alert.type)}15`,
                }}
              >
                <AlertIcon type={alert.type} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-800 leading-relaxed">
                  {alert.text}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-gray-400">
                    {alert.time}
                  </span>
                  <button
                    type="button"
                    data-ocid={`alerts.action.button.${idx + 1}`}
                    onClick={() => navigate({ to: alert.route as any })}
                    className="text-[11px] font-bold px-3 py-1 rounded-full"
                    style={{
                      background: `${borderColor(alert.type)}20`,
                      color: borderColor(alert.type),
                      border: `1px solid ${borderColor(alert.type)}40`,
                      cursor: "pointer",
                    }}
                  >
                    {alert.action}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
