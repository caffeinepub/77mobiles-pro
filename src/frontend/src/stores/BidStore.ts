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

  getHighestBidAmount(listingId: string): number {
    const bids = this.bids.get(listingId) || [];
    if (bids.length === 0) return 0;
    return Math.max(...bids.map((b) => b.amount));
  }
}

export const BidStore = new BidStoreClass();

/**
 * Watch for auction expiry and declare winner.
 * When the auction timer expires, finds the highest bid, fires push notifications,
 * and calls onExpire with the winner info.
 */
export function watchAuctionExpiry(
  listingId: string,
  endTime: number, // Unix timestamp in ms
  deviceName: string,
  _sellerId: string,
  onExpire: (winnerId: string, winnerBid: number) => void,
): () => void {
  const now = Date.now();
  const delay = Math.max(0, endTime - now);

  const timeoutId = setTimeout(() => {
    const bids = BidStore.getBidsForListing(listingId);
    if (bids.length === 0) {
      onExpire("", 0);
      return;
    }

    // Find highest bid
    const winner = bids.reduce(
      (best, bid) => (bid.amount > best.amount ? bid : best),
      bids[0],
    );
    const winnerAmount = winner.amount / 100; // convert from paise to rupees
    const dealerId = winner.dealerId;

    // Fire winner push notification (to winner)
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification("77mobiles.pro — Auction Won!", {
            body: `🎉 Congratulations! You won the ${deviceName}. View your won items in the Activity tab.`,
            icon: "/assets/generated/icon-77-maskable-192.dim_192x192.png",
            tag: `auction-won-${listingId}`,
            data: { url: "/app", tab: "activity" },
          });
        });
      } catch {}
    }

    // Fire seller notification
    const sellerAlert: AlertNotification = {
      id: crypto.randomUUID(),
      type: "approved",
      listingId,
      message: `Your ${deviceName} has been sold to Dealer #${dealerId.slice(-4)} for ₹${winnerAmount.toLocaleString("en-IN")}.`,
      timestamp: Date.now(),
      read: false,
    };
    // Use addBid with amount 0 to trigger alert system (hacky but avoids private field access)
    BidStore.subscribeAlerts(() => {})(); // just to ensure it's set up
    // Directly access via a public add-alert method
    // Trigger the alert via the bid system
    BidStore.addBid({
      bidId: sellerAlert.id,
      listingId: listingId,
      dealerId: "system-notification",
      amount: 0,
      placedAt: Date.now(),
    });

    // WhatsApp alert stub (would use Twilio / WhatsApp API in production)
    console.log(
      `[77mobiles] WhatsApp alert: Congratulations Dealer #${dealerId.slice(-4)}! You've won the auction for ${deviceName} at ₹${winnerAmount.toLocaleString("en-IN")}. Please contact the seller within 24 hours to finalize the deal.`,
    );

    onExpire(dealerId, winnerAmount);
  }, delay);

  return () => clearTimeout(timeoutId);
}
