// Global listings store — simulates Firestore 'listings' collection
// Persists to localStorage under '77m_listings_db'

export interface StoreListing {
  listingId: string;
  sellerId: string;
  title: string;
  model: string;
  brand: string;
  condition: string;
  auctionType: string;
  basePrice: bigint;
  endsAt: bigint;
  createdAt: bigint;
  status: "live" | "sold" | "expired" | "draft" | "Active";
  visibility: "public" | "private";
  storage?: bigint;
  color?: string;
  description?: string;
  imageUrl?: string;
  images?: string[];
  batteryHealth?: bigint;
  warranty?: bigint;
  serialNumberHash?: string;
  usbVerified?: boolean;
  screenPassCertified?: boolean;
  isDemo?: boolean;
  countryOrigin?: string;
  billStatus?: string;
  sealedBox?: boolean;
  [key: string]: unknown;
}

type Listener = (listings: StoreListing[]) => void;

const STORAGE_KEY = "77m_listings_db";

class ListingsStoreClass {
  private listings: StoreListing[] = [];
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.load();
    // Listen for cross-tab updates
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) {
        this.load();
        this.notify();
      }
    });
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.listings = [];
        return;
      }
      const parsed = JSON.parse(raw);
      // Re-inflate bigints (stored as strings with 'n' suffix)
      this.listings = parsed.map((l: any) => ({
        ...l,
        basePrice: BigInt(String(l.basePrice).replace("n", "")),
        endsAt: BigInt(String(l.endsAt).replace("n", "")),
        createdAt: BigInt(String(l.createdAt).replace("n", "")),
        storage:
          l.storage !== undefined
            ? BigInt(String(l.storage).replace("n", ""))
            : 0n,
        batteryHealth:
          l.batteryHealth !== undefined
            ? BigInt(String(l.batteryHealth).replace("n", ""))
            : 0n,
        warranty:
          l.warranty !== undefined
            ? BigInt(String(l.warranty).replace("n", ""))
            : 0n,
      }));
    } catch {
      this.listings = [];
    }
  }

  private save() {
    try {
      // Store bigints as strings
      const serializable = this.listings.map((l) => ({
        ...l,
        basePrice: String(l.basePrice),
        endsAt: String(l.endsAt),
        createdAt: String(l.createdAt),
        storage: String(l.storage ?? 0n),
        batteryHealth: String(l.batteryHealth ?? 0n),
        warranty: String(l.warranty ?? 0n),
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
      // Notify other tabs
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: STORAGE_KEY,
          newValue: JSON.stringify(serializable),
        }),
      );
    } catch {}
  }

  private notify() {
    for (const cb of this.listeners) cb([...this.listings]);
  }

  /**
   * Add a listing to the global collection with status='live' and visibility='public'.
   */
  add(
    listing: Omit<StoreListing, "status" | "visibility"> & {
      status?: string;
      visibility?: string;
    },
  ) {
    const normalized: StoreListing = {
      ...listing,
      status: "live",
      visibility: "public",
    } as StoreListing;
    // Remove duplicate
    this.listings = this.listings.filter(
      (l) => l.listingId !== normalized.listingId,
    );
    this.listings.unshift(normalized);
    this.save();
    this.notify();
  }

  /**
   * Update a listing's status.
   */
  updateStatus(listingId: string, status: StoreListing["status"]) {
    this.listings = this.listings.map((l) =>
      l.listingId === listingId ? { ...l, status } : l,
    );
    this.save();
    this.notify();
  }

  /**
   * Extend a listing with a new 7-day auction window.
   */
  extendAs7DayAuction(listingId: string) {
    const now = BigInt(Date.now()) * 1_000_000n;
    const sevenDays = BigInt(7 * 24 * 60 * 60 * 1000) * 1_000_000n;
    this.listings = this.listings.map((l) =>
      l.listingId === listingId
        ? {
            ...l,
            status: "live",
            auctionType: "7Day",
            endsAt: now + sevenDays,
            createdAt: now,
          }
        : l,
    );
    this.save();
    this.notify();
  }

  /**
   * Get all listings filtered to only 'live' + 'public', ordered by createdAt DESC.
   * This mirrors: db.collection('listings').where('status','==','live').orderBy('createdAt','desc')
   */
  getLiveListings(): StoreListing[] {
    const now = BigInt(Date.now()) * 1_000_000n;
    return this.listings
      .filter(
        (l) =>
          (l.status === "live" || l.status === "Active") &&
          l.visibility === "public" &&
          l.endsAt > now,
      )
      .sort((a, b) => Number(b.createdAt - a.createdAt));
  }

  /**
   * Get listings for a specific seller.
   */
  getSellerListings(sellerId: string): StoreListing[] {
    return this.listings
      .filter((l) => l.sellerId === sellerId)
      .sort((a, b) => Number(b.createdAt - a.createdAt));
  }

  getAll(): StoreListing[] {
    return [...this.listings];
  }

  /**
   * onSnapshot-style subscription. Returns unsubscribe function.
   * Fires immediately with current data.
   */
  subscribe(cb: Listener): () => void {
    this.listeners.add(cb);
    cb([...this.listings]);
    return () => this.listeners.delete(cb);
  }

  /**
   * Subscribe to only live listings.
   */
  subscribeLive(cb: Listener): () => void {
    const wrapped: Listener = () => cb(this.getLiveListings());
    this.listeners.add(wrapped);
    wrapped(this.listings);
    return () => this.listeners.delete(wrapped);
  }
}

export const ListingsStore = new ListingsStoreClass();
