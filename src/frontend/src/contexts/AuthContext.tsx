import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { type UserProfile, UserRole } from "../backend.d";

const IDB_DB_NAME = "77mobiles-auth";
const IDB_STORE = "session";
const IDB_KEY = "user_profile";
const LS_FALLBACK_KEY = "77mobiles_user";

// IndexedDB helpers
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(key: string): Promise<any> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, "readonly");
      const req = tx.objectStore(IDB_STORE).get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function idbSet(key: string, value: any): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {}
}

async function idbRemove(key: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(IDB_STORE, "readwrite");
      tx.objectStore(IDB_STORE).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {}
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (profile: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Load session from IndexedDB first, fallback to localStorage
    idbGet(IDB_KEY).then((stored) => {
      if (stored) {
        if (stored.createdAt) stored.createdAt = BigInt(stored.createdAt);
        setUser(stored);
        // Restore localStorage backup keys
        if (stored.userRole !== undefined) {
          localStorage.setItem("77m_userRole", String(stored.userRole ?? ""));
        }
        if (stored.userId) {
          // Ensure userId is set from profile
          stored.userId = stored.userId || stored.mobileNumber || "";
        }
        setLoaded(true);
        return;
      }
      // Fallback: try localStorage
      try {
        const ls = localStorage.getItem(LS_FALLBACK_KEY);
        if (ls) {
          const parsed = JSON.parse(ls);
          if (parsed.createdAt) parsed.createdAt = BigInt(parsed.createdAt);
          // Ensure userId is populated
          if (!parsed.userId) parsed.userId = parsed.mobileNumber || "";
          setUser(parsed);
          // Migrate to IndexedDB
          const toStore = { ...parsed, createdAt: parsed.createdAt.toString() };
          idbSet(IDB_KEY, toStore);
        }
      } catch {}
      setLoaded(true);
    });
  }, []);

  const login = (profile: UserProfile) => {
    // Ensure userId is always set
    const enriched: UserProfile = {
      ...profile,
      userId: profile.userId || profile.mobileNumber || "",
    };
    setUser(enriched);
    // Store in both IndexedDB (primary) and localStorage (fallback)
    const toStore = { ...enriched, createdAt: enriched.createdAt.toString() };
    idbSet(IDB_KEY, toStore);
    localStorage.setItem(LS_FALLBACK_KEY, JSON.stringify(toStore));
    // Task 3: localStorage backup for UI role/verification state
    localStorage.setItem("77m_userRole", String(enriched.userRole ?? ""));
    localStorage.setItem(
      "77m_isVerified",
      String((enriched as any).isVerified ?? false),
    );
  };

  const logout = () => {
    setUser(null);
    idbRemove(IDB_KEY);
    localStorage.removeItem(LS_FALLBACK_KEY);
    localStorage.removeItem("77m_verification_status");
    localStorage.removeItem("77m_phone_session");
    localStorage.removeItem("77m_role");
    localStorage.removeItem("77m_mode");
    // Task 3: clear backup keys
    localStorage.removeItem("77m_userRole");
    localStorage.removeItem("77m_isVerified");
  };

  // Don't render until session is loaded (prevents flash of logged-out state)
  if (!loaded) {
    return (
      <div
        className="mobile-container flex items-center justify-center"
        style={{ minHeight: "100dvh" }}
      >
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { UserRole };
