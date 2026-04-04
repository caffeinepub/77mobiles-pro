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
      style={{
        // Task 2 & 3: Fixed to bottom of viewport, outside scroll container
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        // Task 5: Glassmorphism — semi-transparent so blur shows through
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        // Task 5: Blur backdrop — -webkit- prefix required for iOS Safari PWA
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        // Task 5: Soft shadow for depth — replaces solid border-top
        boxShadow:
          "0 -10px 15px -3px rgba(0, 0, 0, 0.05), 0 -4px 6px -2px rgba(0, 0, 0, 0.02)",
        // Task 2: Height 80px + safe area inset
        height: "80px",
        paddingBottom: "env(safe-area-inset-bottom, 20px)",
        // box-sizing: content-box so height is just the icon area, padding is extra
        boxSizing: "content-box",
        zIndex: 999999,
        width: "100%",
      }}
    >
      {/*
       * Task 5: isolation:isolate creates a new stacking context.
       * This ensures the blur affects only what's BEHIND the nav bar,
       * NOT the icons or labels inside it.
       */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          height: "80px",
          width: "100%",
          isolation: "isolate",
          position: "relative",
        }}
      >
        {leftTabs.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              type="button"
              key={id}
              data-ocid={`nav.${id}.link`}
              onClick={() => handleTabClick(id)}
              style={{
                width: "20%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                border: "none",
                padding: 0,
              }}
            >
              <Icon
                size={28}
                strokeWidth={1.5}
                style={{ color: isActive ? "#2563EB" : "#6B7280" }}
              />
              <span
                className="font-semibold"
                style={{
                  fontSize: "11px",
                  marginTop: "4px",
                  color: isActive ? "#2563EB" : "#6B7280",
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
              style={{
                width: "20%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                border: "none",
                padding: 0,
                position: "relative",
              }}
            >
              <div className="relative">
                <Icon
                  size={28}
                  strokeWidth={1.5}
                  style={{ color: isActive ? "#2563EB" : "#6B7280" }}
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
                  fontSize: "11px",
                  marginTop: "4px",
                  color: isActive ? "#2563EB" : "#6B7280",
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
