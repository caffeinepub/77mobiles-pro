import { ArrowUp, ScanBarcode, Search, User, Wallet, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../contexts/AppContext";
import { SELLER_LISTINGS } from "../data/demoListings";
import ActivityPage from "../pages/ActivityPage";
import AlertsPage from "../pages/AlertsPage";
import BuyerPortal from "../pages/BuyerPortal";
import ProfilePage from "../pages/ProfilePage";
import SellerPortal from "../pages/SellerPortal";
import WalletPage from "../pages/WalletPage";
import WatchlistPage from "../pages/WatchlistPage";
import BottomNav from "./BottomNav";
import {
  AccessoriesIcon,
  GamingIcon,
  LaptopIcon,
  SmartphoneIcon,
  SparePartsIcon,
  TabletIcon,
  WatchIcon,
} from "./CategorySvgIcons";
import PostLeadModal from "./PostLeadModal";
import SearchOverlay from "./SearchOverlay";

const CATEGORIES = [
  { id: "smartphones", label: "Smartphones", tint: "#EFF6FF" },
  { id: "macbook-laptops", label: "MacBook & Laptops", tint: "#F3E8FF" },
  { id: "ipads", label: "iPads", tint: "#ECFDF5" },
  { id: "watches", label: "Watches", tint: "#FFF7ED" },
  { id: "gaming-consoles", label: "Gaming Consoles", tint: "#FFF1F2" },
  { id: "accessories", label: "Accessories", tint: "#F0FDF4" },
  { id: "spare-parts", label: "Spare Parts", tint: "#FFFBEB" },
];

function CategoryIcon({ id, active }: { id: string; active: boolean }) {
  const props = { active, size: 28 };
  switch (id) {
    case "smartphones":
      return <SmartphoneIcon {...props} />;
    case "macbook-laptops":
      return <LaptopIcon {...props} />;
    case "ipads":
      return <TabletIcon {...props} />;
    case "watches":
      return <WatchIcon {...props} />;
    case "gaming-consoles":
      return <GamingIcon {...props} />;
    case "accessories":
      return <AccessoriesIcon {...props} />;
    case "spare-parts":
      return <SparePartsIcon {...props} />;
    default:
      return <SmartphoneIcon {...props} />;
  }
}

const SUB_PAGE_TITLES: Record<string, string> = {
  watchlist: "Your Watchlist",
  activity: "Activity",
  alerts: "Alerts",
  profile: "Profile",
  wallet: "My Wallet",
};

export default function AppShell() {
  const {
    mode,
    activeTab,
    searchQuery,
    setSearchQuery,
    setActiveTab,
    activeCategory,
    setActiveCategory,
    sharedListings,
  } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [manualImei, setManualImei] = useState("");
  const [hasBarcodeDetector, setHasBarcodeDetector] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [categoriesVisible, setCategoriesVisible] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const prevTabRef = useRef(activeTab);
  const lastScrollY = useRef(0);
  const [liveCount, setLiveCount] = useState(0);

  const isSubPage = activeTab !== "home";

  // Start camera when scanner opens
  useEffect(() => {
    if (!showScanner) return;
    setHasBarcodeDetector("BarcodeDetector" in window);
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {
        // Camera failed, will show manual input
      });
    return () => {
      if (videoRef.current?.srcObject) {
        for (const t of (videoRef.current.srcObject as MediaStream).getTracks())
          t.stop();
      }
    };
  }, [showScanner]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      setShowBackToTop(el.scrollTop > 2000);
      const currentY = el.scrollTop;
      if (currentY > lastScrollY.current && currentY > 80) {
        setCategoriesVisible(false);
      } else {
        setCategoriesVisible(true);
      }
      lastScrollY.current = currentY;
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (prevTabRef.current !== activeTab) {
      prevTabRef.current = activeTab;
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  useEffect(() => {
    const count = [...sharedListings, ...SELLER_LISTINGS].filter(
      (l) => l.status === "Active",
    ).length;
    setLiveCount(
      count > 0
        ? count
        : SELLER_LISTINGS.filter((l) => l.status === "Active").length,
    );
  }, [sharedListings]);

  const scrollToTop = () =>
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });

  const isSeller = mode === "seller";
  const isWalletTab = activeTab === "wallet";

  return (
    // Task 2 & 3: Outer wrapper is position:relative, height:100dvh, overflow:hidden
    // BottomNav lives OUTSIDE the scroll div as a direct sibling
    <div
      style={{
        position: "relative",
        height: "100dvh",
        overflow: "hidden",
        // Fallback for older iOS browsers
        minHeight: "-webkit-fill-available",
      }}
    >
      {/* Scrollable content area — paddingBottom clears the fixed nav bar */}
      <div
        ref={scrollRef}
        className="scroll-container"
        style={{
          height: "100dvh",
          overflowY: "auto",
          // Push last listing above the fixed nav bar (80px + safe-area)
          paddingBottom: "calc(90px + env(safe-area-inset-bottom, 20px))",
          overscrollBehavior: "none",
          WebkitOverflowScrolling: "touch" as any,
        }}
      >
        {/* STICKY HEADER */}
        {!isWalletTab && (
          <div className="sticky top-0 z-50">
            <div
              style={{
                backdropFilter: "blur(10px) saturate(180%)",
                WebkitBackdropFilter: "blur(10px) saturate(180%)",
                background: "rgba(255,255,255,0.85)",
                borderBottom: "1px solid rgba(229,231,235,0.8)",
              }}
            >
              {/* Branding bar */}
              <div
                className="flex items-center justify-between"
                style={{
                  paddingLeft: "20px",
                  paddingRight: "16px",
                  paddingTop: "12px",
                  paddingBottom: "8px",
                }}
              >
                <div className="flex flex-col gap-0.5">
                  <span
                    className="font-black leading-none tracking-tight"
                    style={{ fontSize: "26px", color: "#1D4ED8" }}
                  >
                    77mobiles.pro
                  </span>
                  <span
                    className="font-medium"
                    style={{ fontSize: "12px", color: "#6B7280" }}
                  >
                    {isSeller ? "Seller Portal" : "Buyer Portal"}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  {!isSeller && !isSubPage && (
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{
                        background: "#EFF6FF",
                        border: "1px solid #BFDBFE",
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{
                          background: "#ef4444",
                          animation: "pulse 1.5s ease-in-out infinite",
                        }}
                      />
                      <span
                        className="font-bold"
                        style={{ fontSize: "11px", color: "#1D4ED8" }}
                      >
                        {liveCount > 0 ? liveCount : 6} Live
                      </span>
                    </div>
                  )}

                  {!isSeller && (
                    <button
                      type="button"
                      data-ocid="header.wallet.button"
                      onClick={() => setActiveTab("wallet")}
                      className="flex items-center justify-center rounded-full relative"
                      style={{
                        width: "38px",
                        height: "38px",
                        border: "1.5px solid #E2E8F0",
                        background: "#F8FAFC",
                      }}
                    >
                      <Wallet
                        className="w-5 h-5"
                        style={{ color: "#1D4ED8" }}
                        strokeWidth={1.5}
                      />
                    </button>
                  )}
                  <button
                    type="button"
                    data-ocid="header.profile.button"
                    onClick={() => setActiveTab("profile")}
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: "38px",
                      height: "38px",
                      border: "1.5px solid #E2E8F0",
                      background: "#F8FAFC",
                    }}
                  >
                    <User
                      className="w-5 h-5"
                      style={{ color: "#1E293B" }}
                      strokeWidth={1.5}
                    />
                  </button>
                </div>
              </div>

              {/* Sub-page title OR search bar */}
              {isSubPage ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#1E293B",
                    fontWeight: "bold",
                    fontSize: "18px",
                    padding: "8px 0 14px",
                  }}
                >
                  {SUB_PAGE_TITLES[activeTab] ?? ""}
                </div>
              ) : (
                <div className="px-4 pb-3">
                  {/* Search bar row — clicking opens overlay */}
                  <div
                    className="flex items-center gap-2 rounded-2xl px-3 py-2.5 cursor-pointer"
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                    }}
                    onClick={() => setShowSearch(true)}
                    onKeyDown={(e) => e.key === "Enter" && setShowSearch(true)}
                    data-ocid="header.search.open_modal_button"
                  >
                    <Search
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: "#9CA3AF" }}
                    />
                    <span
                      className="flex-1 text-sm"
                      style={{ color: searchQuery ? "#1E293B" : "#9CA3AF" }}
                    >
                      {searchQuery || "Search Model, Brand, or IMEI"}
                    </span>
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchQuery("");
                        }}
                        className="flex-shrink-0 p-0.5"
                        aria-label="Clear search"
                      >
                        <X
                          className="w-3.5 h-3.5"
                          style={{ color: "#9ca3af" }}
                        />
                      </button>
                    )}
                    <button
                      type="button"
                      data-ocid="header.camera.button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowScanner(true);
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "#EFF6FF" }}
                      aria-label="Scan barcode"
                    >
                      <ScanBarcode
                        className="w-4 h-4"
                        style={{ color: "#1D4ED8" }}
                        strokeWidth={1.5}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Horizontal-scroll category row — buyer only, home only */}
            {!isSeller && !isSubPage && (
              <div
                style={{
                  overflow: "hidden",
                  maxHeight: categoriesVisible ? "120px" : "0px",
                  transition: "max-height 0.3s ease",
                  opacity: categoriesVisible ? 1 : 0,
                }}
              >
                <div
                  className="bg-white px-4 pt-2 pb-0"
                  style={{ borderBottom: "1px solid #f0f0f0" }}
                >
                  <div
                    className="flex gap-4 overflow-x-auto pb-3"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {CATEGORIES.map((cat) => {
                      const isActive = activeCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          data-ocid={`category.${cat.id}.button`}
                          onClick={() => setActiveCategory(cat.id)}
                          className="flex flex-col items-center flex-shrink-0"
                          style={{ minWidth: "52px" }}
                        >
                          <div
                            className="flex items-center justify-center mb-1.5"
                            style={{
                              width: "52px",
                              height: "65px",
                              borderRadius: "12px",
                              background: isActive ? "#1D4ED8" : cat.tint,
                              padding: "12px",
                              transition: "all 0.15s ease",
                            }}
                          >
                            <CategoryIcon id={cat.id} active={!isActive} />
                          </div>
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: isActive ? 700 : 500,
                              color: isActive ? "#1D4ED8" : "#6B7280",
                              textAlign: "center",
                              lineHeight: "1.2",
                              maxWidth: "56px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {cat.label}
                          </span>
                          <div
                            style={{
                              height: "2px",
                              width: "24px",
                              borderRadius: "2px",
                              background: isActive ? "#1D4ED8" : "transparent",
                              marginTop: "4px",
                              transition: "background 0.15s ease",
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {(isSeller || isSubPage) && !isWalletTab && (
              <div style={{ height: "1px", background: "#E2E8F0" }} />
            )}
          </div>
        )}

        <main
          key={activeTab}
          className="transition-opacity duration-200"
          style={{ background: "#F8FAFC" }}
        >
          {activeTab === "home" && isSeller && <SellerPortal />}
          {activeTab === "home" && !isSeller && <BuyerPortal />}
          {activeTab === "activity" && <ActivityPage />}
          {activeTab === "alerts" && <AlertsPage />}
          {activeTab === "watchlist" && <WatchlistPage />}
          {activeTab === "profile" && <ProfilePage />}
          {activeTab === "wallet" && <WalletPage />}
        </main>
      </div>

      {/* Task 2 & 3: BottomNav is OUTSIDE the scroll div — direct child of root wrapper */}
      <BottomNav />

      {showBackToTop && (
        <button
          type="button"
          data-ocid="app.back_to_top.button"
          onClick={scrollToTop}
          className="fixed w-12 h-12 rounded-full flex items-center justify-center z-40"
          style={{
            bottom: "84px",
            right: "max(1rem, calc(50vw - 215px + 1rem))",
            background: "white",
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          }}
        >
          <ArrowUp className="w-5 h-5" style={{ color: "#1D4ED8" }} />
        </button>
      )}

      <PostLeadModal />

      {/* Barcode Scanner Overlay */}
      {showScanner && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: "rgba(0,0,0,0.95)" }}
        >
          <div className="w-full max-w-[430px] px-4">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-white text-base">
                Scan Barcode / IMEI
              </p>
              <button
                type="button"
                data-ocid="scanner.close.button"
                onClick={() => {
                  setShowScanner(false);
                  setManualImei("");
                  if (videoRef.current?.srcObject) {
                    for (const t of (
                      videoRef.current.srcObject as MediaStream
                    ).getTracks())
                      t.stop();
                  }
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div
              className="relative w-full rounded-2xl overflow-hidden"
              style={{ aspectRatio: "4/3", background: "#1E293B" }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                onCanPlay={() => {
                  if (!hasBarcodeDetector) return;
                  const detector = new (window as any).BarcodeDetector({
                    formats: ["qr_code", "code_128", "ean_13", "code_39"],
                  });
                  const scan = setInterval(async () => {
                    if (!videoRef.current) {
                      clearInterval(scan);
                      return;
                    }
                    try {
                      const barcodes = await detector.detect(videoRef.current);
                      if (barcodes.length > 0) {
                        const val = barcodes[0].rawValue;
                        setSearchQuery(val);
                        clearInterval(scan);
                        setShowScanner(false);
                        setManualImei("");
                        for (const t of (
                          videoRef.current?.srcObject as MediaStream
                        )?.getTracks() ?? [])
                          t.stop();
                      }
                    } catch {}
                  }, 500);
                }}
              />
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ pointerEvents: "none" }}
              >
                <div
                  className="w-48 h-48 border-2 rounded-xl"
                  style={{
                    borderColor: "#1D4ED8",
                    boxShadow: "0 0 0 2000px rgba(0,0,0,0.4)",
                  }}
                />
              </div>
            </div>

            {/* Manual IMEI input — when BarcodeDetector is unavailable */}
            {!hasBarcodeDetector && (
              <div className="mt-4">
                <p className="text-center text-xs text-amber-300 mb-2 font-medium">
                  Scanner not supported on this browser. Enter manually:
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    data-ocid="scanner.manual_imei.input"
                    value={manualImei}
                    onChange={(e) => setManualImei(e.target.value)}
                    placeholder="Enter IMEI / barcode"
                    className="flex-1 px-3 py-2.5 rounded-xl text-sm font-bold outline-none"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.25)",
                      color: "white",
                    }}
                  />
                  <button
                    type="button"
                    data-ocid="scanner.manual_imei.submit_button"
                    onClick={() => {
                      if (manualImei.trim()) {
                        setSearchQuery(manualImei.trim());
                        setShowScanner(false);
                        setManualImei("");
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl font-bold text-sm text-white"
                    style={{ background: "#1D4ED8" }}
                  >
                    Search
                  </button>
                </div>
              </div>
            )}

            <p className="text-center text-xs text-gray-400 mt-3">
              {hasBarcodeDetector ? "Point camera at barcode or IMEI" : ""}
            </p>
          </div>
        </div>
      )}
      {/* Search overlay */}
      {showSearch && <SearchOverlay onClose={() => setShowSearch(false)} />}
    </div>
  );
}
