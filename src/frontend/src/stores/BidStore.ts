// In-memory pub/sub bid store simulating Firestore onSnapshot
export interface Bid {
  bidId: string;
  listingId: string;
  dealerId: string;
  amount: number; // in paise (e.g. 7200000 = ₹72,000)
  placedAt: number; // timestamp ms
}

export interface AlertNotification {
  id: string;
  type: "new_bid" | "outbid" | "approved" | "rejected";
  listingId: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export type BidEntry = Bid;
type BidListener = (bids: Bid[]) => void;
type AlertListener = (alerts: AlertNotification[]) => void;
type AllBidsListener = (listingId: string, bids: Bid[]) => void;

class BidStoreClass {
  private bids: Map<string, Bid[]> = new Map();
  private alerts: AlertNotification[] = [];
  private bidListeners: Map<string, BidListener[]> = new Map();
  private alertListeners: AlertListener[] = [];
  private allBidsListeners: Map<string, AllBidsListener> = new Map();

  addBid(bid: Bid) {
    const existing = this.bids.get(bid.listingId) || [];
    const updated = [bid, ...existing];
    this.bids.set(bid.listingId, updated);
    // Fire per-listing bid listeners
    const listeners = this.bidListeners.get(bid.listingId) || [];
    for (const cb of listeners) cb(updated);
    // Fire all-bids listeners
    for (const cb of this.allBidsListeners.values()) cb(bid.listingId, updated);
    // Auto-generate alert notification
    const alert: AlertNotification = {
      id: crypto.randomUUID(),
      type: "new_bid",
      listingId: bid.listingId,
      message: `New bid ₹${(bid.amount / 100).toLocaleString("en-IN")} on listing`,
      timestamp: Date.now(),
      read: false,
    };
    this.alerts = [alert, ...this.alerts];
    for (const cb of this.alertListeners) cb(this.alerts);
  }

  subscribeBids(listingId: string, cb: BidListener): () => void {
    const listeners = this.bidListeners.get(listingId) || [];
    this.bidListeners.set(listingId, [...listeners, cb]);
    // Fire immediately with current data
    cb(this.bids.get(listingId) || []);
    return () => {
      const l = this.bidListeners.get(listingId) || [];
      this.bidListeners.set(
        listingId,
        l.filter((x) => x !== cb),
      );
    };
  }

  subscribeAllBids(cb: AllBidsListener): () => void {
    const id = Math.random().toString(36).slice(2);
    this.allBidsListeners.set(id, cb);
    // Fire immediately for any existing bids
    this.bids.forEach((bids, listingId) => {
      if (bids.length > 0) cb(listingId, bids);
    });
    return () => {
      this.allBidsListeners.delete(id);
    };
  }

  subscribeAlerts(cb: AlertListener): () => void {
    this.alertListeners = [...this.alertListeners, cb];
    cb(this.alerts);
    return () => {
      this.alertListeners = this.alertListeners.filter((x) => x !== cb);
    };
  }

  getBidsForListing(listingId: string): Bid[] {
    return this.bids.get(listingId) || [];
  }

  getAlerts(): AlertNotification[] {
    return this.alerts;
  }

  markAllRead() {
    this.alerts = this.alerts.map((a) => ({ ...a, read: true }));
    for (const cb of this.alertListeners) cb(this.alerts);
  }
}

export const BidStore = new BidStoreClass();
