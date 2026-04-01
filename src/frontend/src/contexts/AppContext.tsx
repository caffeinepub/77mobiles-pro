import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

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
  price: number; // INR value (not paise)
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
  showPostLead: boolean;
  setShowPostLead: (v: boolean) => void;
  watchlist: Set<string>;
  toggleWatchlist: (id: string) => void;
  isWatchlisted: (id: string) => boolean;
  activeCategory: string;
  setActiveCategory: (c: string) => void;
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
  showPostLead: false,
  setShowPostLead: () => {},
  watchlist: new Set(),
  toggleWatchlist: () => {},
  isWatchlisted: () => false,
  activeCategory: "smartphones",
  setActiveCategory: () => {},
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppMode>(() => {
    const stored = localStorage.getItem("77m_mode");
    return (stored as AppMode) || "seller";
  });
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadAlerts, setUnreadAlerts] = useState(4);
  const [showPostLead, setShowPostLead] = useState(false);
  const [activeCategory, setActiveCategory] = useState("smartphones");
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("77m_watchlist");
      return new Set(stored ? JSON.parse(stored) : []);
    } catch {
      return new Set();
    }
  });

  const setMode = (m: AppMode) => {
    setModeState(m);
    localStorage.setItem("77m_mode", m);
    setActiveTab("home");
    setSearchQuery("");
    setActiveCategory("smartphones");
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
        showPostLead,
        setShowPostLead,
        watchlist: watchlistIds,
        toggleWatchlist,
        isWatchlisted,
        activeCategory,
        setActiveCategory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
