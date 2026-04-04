import { useNavigate } from "@tanstack/react-router";
import { Activity, Bell, Home, Plus, Star, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { type AppTab, useApp } from "../contexts/AppContext";

export default function BottomNav() {
  const navigate = useNavigate();
  const {
    activeTab,
    setActiveTab,
    mode,
    setShowPostLead,
    unreadAlerts,
    setUnreadAlerts,
  } = useApp();

  const handlePost = () => {
    if (mode === "seller") {
      navigate({ to: "/sell-category" });
    } else {
      setShowPostLead(true);
    }
  };

  const isBuyer = mode === "buyer";
  const leftTabs: { id: AppTab; label: string; Icon: LucideIcon }[] = isBuyer
    ? [
        { id: "home", label: "Home", Icon: Home },
        { id: "watchlist", label: "Watchlist", Icon: Star },
      ]
    : [
        { id: "home", label: "Home", Icon: Home },
        { id: "wallet", label: "Wallet", Icon: Wallet },
      ];
  const rightTabs: {
    id: AppTab;
    label: string;
    Icon: LucideIcon;
    badge?: number;
  }[] = [
    { id: "activity", label: "Activity", Icon: Activity, badge: unreadAlerts },
    { id: "alerts", label: "Alerts", Icon: Bell },
  ];

  const handleTabClick = (id: AppTab) => {
    setActiveTab(id);
    if (id === "activity") {
      setUnreadAlerts(0);
    }
  };

  const isHighPriority = unreadAlerts >= 3;

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px]"
      style={{
        zIndex: 9999,
        backdropFilter: "blur(10px) saturate(180%)",
        WebkitBackdropFilter: "blur(10px) saturate(180%)",
        background: "rgba(255,255,255,0.88)",
        borderTop: "1px solid rgba(229,231,235,0.7)",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
        height: "calc(80px + env(safe-area-inset-bottom, 0px))",
        boxSizing: "content-box",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div
        className="flex items-center justify-around px-2"
        style={{ height: "80px" }}
      >
        {leftTabs.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              type="button"
              key={id}
              data-ocid={`nav.${id}.link`}
              onClick={() => handleTabClick(id)}
              className="flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1"
            >
              <Icon
                className="w-6 h-6"
                strokeWidth={1.5}
                style={{ color: isActive ? "#1D4ED8" : "#9CA3AF" }}
              />
              <span
                className="font-semibold"
                style={{
                  fontSize: "12px",
                  color: isActive ? "#1D4ED8" : "#9CA3AF",
                }}
              >
                {label}
              </span>
            </button>
          );
        })}

        {/* Center POST/SELL button — lifted 30px above toolbar */}
        <button
          type="button"
          data-ocid="nav.post.primary_button"
          onClick={handlePost}
          className="w-14 h-14 rounded-full flex flex-col items-center justify-center flex-shrink-0"
          style={{
            background: "#1D4ED8",
            marginTop: "-30px",
            boxShadow: "0 4px 16px rgba(29,78,216,0.4)",
          }}
        >
          <Plus size={28} strokeWidth={2.5} style={{ color: "#FFFFFF" }} />
          <span
            className="font-bold"
            style={{ fontSize: "9px", color: "#FFFFFF", marginTop: "1px" }}
          >
            {mode === "seller" ? "Sell" : "Post"}
          </span>
        </button>

        {rightTabs.map(({ id, label, Icon, badge }) => {
          const isActive = activeTab === id;
          const hasBadge = (badge ?? 0) > 0;
          const isActivityWithBadge = id === "activity" && hasBadge;
          return (
            <button
              type="button"
              key={id}
              data-ocid={`nav.${id}.link`}
              onClick={() => handleTabClick(id)}
              className="flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1 relative"
            >
              <div className="relative">
                <Icon
                  className="w-6 h-6"
                  strokeWidth={1.5}
                  style={{ color: isActive ? "#1D4ED8" : "#9CA3AF" }}
                />
                {isActivityWithBadge && (
                  <>
                    {isHighPriority && (
                      <span
                        className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full animate-ping"
                        style={{ background: "rgba(239,68,68,0.4)" }}
                      />
                    )}
                    <span
                      className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"
                      data-ocid="nav.activity.badge"
                    />
                  </>
                )}
              </div>
              <span
                className="font-semibold"
                style={{
                  fontSize: "12px",
                  color: isActive ? "#1D4ED8" : "#9CA3AF",
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
