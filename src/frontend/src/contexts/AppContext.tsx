import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { type AlertNotification, BidStore } from "../stores/BidStore";

export type AppMode = "seller" | "buyer";
export type AppTab =
  | "home"
  | "activity"
  | "alerts"
  | "profile"
  | "watchlist"
  | "wallet";

export interface CheckoutItem {
  model: string;
  condition: string;
  price: number;
}

interface AppContextType {
  mode: AppMode;
  setMode: (m: AppMode) => void;
  activeTab: AppTab;
  setActiveTab: (t: AppTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  unreadAlerts: number;
  setUnreadAlerts: (n: number) => void;
  alerts: AlertNotification[];
  addAlert: (a: AlertNotification) => void;
  showPostLead: boolean;
  setShowPostLead: (v: boolean) => void;
  watchlist: Set<string>;
  toggleWatchlist: (id: string) => void;
  isWatchlisted: (id: string) => boolean;
  activeCategory: string;
  setActiveCategory: (c: string) => void;
  sharedListings: any[];
  addSharedListing: (listing: any) => void;
  isDemoMode: boolean;
  setIsDemoMode: (v: boolean) => void;
}

const AppContext = createContext<AppContextType>({
  mode: "seller",
  setMode: () => {},
  activeTab: "home",
  setActiveTab: () => {},
  searchQuery: "",
  setSearchQuery: () => {},
  unreadAlerts: 4,
  setUnreadAlerts: () => {},
  alerts: [],
  addAlert: () => {},
  showPostLead: false,
  setShowPostLead: () => {},
  watchlist: new Set(),
  toggleWatchlist: () => {},
  isWatchlisted: () => false,
  activeCategory: "smartphones",
  setActiveCategory: () => {},
  sharedListings: [],
  addSharedListing: () => {},
  isDemoMode: true,
  setIsDemoMode: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>(() => {
    const stored = localStorage.getItem("77m_mode");
    return (stored as AppMode) || "seller";
  });
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadAlerts, setUnreadAlerts] = useState(4);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [showPostLead, setShowPostLead] = useState(false);
  const [activeCategory, setActiveCategory] = useState("smartphones");
  const [sharedListings, setSharedListings] = useState<any[]>([]);
  const [isDemoMode, setIsDemoModeState] = useState<boolean>(() => {
    return localStorage.getItem("77m_demo_mode") === "true";
  });
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("77m_watchlist");
      return new Set(stored ? JSON.parse(stored) : []);
    } catch {
      return new Set();
    }
  });

  // Subscribe to BidStore alerts for real-time unread count
  useEffect(() => {
    const unsub = BidStore.subscribeAlerts((newAlerts) => {
      setAlerts(newAlerts);
      setUnreadAlerts(newAlerts.filter((a) => !a.read).length);
    });
    return unsub;
  }, []);

  // Check for persistent phone session on mount
  useEffect(() => {
    try {
      const session = localStorage.getItem("77m_phone_session");
      if (session) {
        const parsed = JSON.parse(session);
        const age = Date.now() - parsed.token;
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        if (age < thirtyDays && parsed.role) {
          localStorage.setItem("77m_mode", parsed.role);
          setModeState(parsed.role);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const setMode = (m: AppMode) => {
    setModeState(m);
    localStorage.setItem("77m_mode", m);
    setActiveTab("home");
    setSearchQuery("");
    setActiveCategory("smartphones");
  };

  const setIsDemoMode = (v: boolean) => {
    setIsDemoModeState(v);
    localStorage.setItem("77m_demo_mode", String(v));
  };

  const toggleWatchlist = (id: string) => {
    setWatchlistIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem("77m_watchlist", JSON.stringify([...next]));
      return next;
    });
  };

  const isWatchlisted = (id: string) => watchlistIds.has(id);

  const addSharedListing = (listing: any) => {
    setSharedListings((prev) => [listing, ...prev]);
  };

  const addAlert = (a: AlertNotification) => {
    BidStore.addBid({
      bidId: a.id,
      listingId: a.listingId,
      dealerId: "system",
      amount: 0,
      placedAt: a.timestamp,
    });
  };

  useEffect(() => {
    const stored = localStorage.getItem("77m_mode");
    if (stored === "seller" || stored === "buyer") {
      setModeState(stored);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        unreadAlerts,
        setUnreadAlerts,
        alerts,
        addAlert,
        showPostLead,
        setShowPostLead,
        watchlist: watchlistIds,
        toggleWatchlist,
        isWatchlisted,
        activeCategory,
        setActiveCategory,
        sharedListings,
        addSharedListing,
        isDemoMode,
        setIsDemoMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
