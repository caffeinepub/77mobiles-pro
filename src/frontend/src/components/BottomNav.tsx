import { useNavigate } from "@tanstack/react-router";
import { Activity, Home, Plus, Star, User, Wallet } from "lucide-react";
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

  const buyerLeftTabs: { id: AppTab; label: string; Icon: LucideIcon }[] = [
    { id: "home", label: "Home", Icon: Home },
    { id: "watchlist", label: "Watchlist", Icon: Star },
  ];
  const buyerRightTabs: {
    id: AppTab;
    label: string;
    Icon: LucideIcon;
    badge?: number;
  }[] = [
    { id: "wallet", label: "Wallet", Icon: Wallet },
    { id: "activity", label: "Activity", Icon: Activity, badge: unreadAlerts },
  ];

  const sellerLeftTabs: { id: AppTab; label: string; Icon: LucideIcon }[] = [
    { id: "home", label: "Home", Icon: Home },
    { id: "activity", label: "Activity", Icon: Activity },
  ];
  const sellerRightTabs: {
    id: AppTab;
    label: string;
    Icon: LucideIcon;
    badge?: number;
  }[] = [
    { id: "wallet", label: "Wallet", Icon: Wallet },
    { id: "profile", label: "Profile", Icon: User },
  ];

  const leftTabs = mode === "buyer" ? buyerLeftTabs : sellerLeftTabs;
  const rightTabs = mode === "buyer" ? buyerRightTabs : sellerRightTabs;

  const handleTabClick = (id: AppTab) => {
    setActiveTab(id);
    if (id === "activity") {
      setUnreadAlerts(0);
    }
  };

  const isHighPriority = unreadAlerts >= 3;

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50"
      style={{
        backdropFilter: "blur(10px) saturate(180%)",
        WebkitBackdropFilter: "blur(10px) saturate(180%)",
        background: "rgba(255,255,255,0.88)",
        borderTop: "1px solid rgba(229,231,235,0.7)",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
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
                className="w-5 h-5"
                strokeWidth={1.5}
                style={{ color: isActive ? "#1D4ED8" : "#9CA3AF" }}
              />
              <span
                className="text-[10px] font-semibold"
                style={{ color: isActive ? "#1D4ED8" : "#9CA3AF" }}
              >
                {label}
              </span>
            </button>
          );
        })}

        {/* Center POST/SELL button */}
        <button
          type="button"
          data-ocid="nav.post.primary_button"
          onClick={handlePost}
          className="w-14 h-14 rounded-full flex flex-col items-center justify-center flex-shrink-0"
          style={{
            background: "#1D4ED8",
            marginTop: "-20px",
            boxShadow: "0 4px 16px rgba(29,78,216,0.4)",
          }}
        >
          <Plus size={24} strokeWidth={2.5} style={{ color: "#FFFFFF" }} />
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
                  className="w-5 h-5"
                  strokeWidth={1.5}
                  style={{ color: isActive ? "#1D4ED8" : "#9CA3AF" }}
                />
                {isActivityWithBadge && (
                  <>
                    {/* Pulse ring for high-priority (>= 3 alerts) */}
                    {isHighPriority && (
                      <span
                        className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full animate-ping"
                        style={{ background: "rgba(239,68,68,0.4)" }}
                      />
                    )}
                    {/* Solid red dot */}
                    <span
                      className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"
                      data-ocid="nav.activity.badge"
                    />
                  </>
                )}
              </div>
              <span
                className="text-[10px] font-semibold"
                style={{ color: isActive ? "#1D4ED8" : "#9CA3AF" }}
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
