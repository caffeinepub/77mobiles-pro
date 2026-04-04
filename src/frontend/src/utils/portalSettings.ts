// Shared portal settings utility for 77mobiles.pro
// Used by Admin (write) and Buyer/Seller portals (read)

const PORTAL_SETTINGS_KEY = "77m_portal_settings";
const APPROVED_PHONES_KEY = "77m_approved_phones";
const BANNERS_KEY = "77m_banners";

export interface PortalSettings {
  buyerMinBidIncrement: number; // ₹ increment per bid
  buyerAuctionDuration: number; // minutes
  buyerMaxListings: number; // per page
  sellerListingFee: number; // ₹
  sellerMaxPhotos: number;
  sellerAutoExpireDays: number;
}

export const DEFAULT_PORTAL_SETTINGS: PortalSettings = {
  buyerMinBidIncrement: 500,
  buyerAuctionDuration: 20,
  buyerMaxListings: 20,
  sellerListingFee: 0,
  sellerMaxPhotos: 6,
  sellerAutoExpireDays: 14,
};

export interface BannerItem {
  id: string;
  imageUrl: string;
  title: string;
  target: "buyer" | "seller" | "both";
  active: boolean;
  link?: string;
  createdAt: number;
}

// ── Portal Settings ──────────────────────────────────────────────────

export function readPortalSettings(): PortalSettings {
  try {
    const raw = localStorage.getItem(PORTAL_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_PORTAL_SETTINGS };
    return { ...DEFAULT_PORTAL_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PORTAL_SETTINGS };
  }
}

/**
 * Returns portal settings in a structured buyer/seller object.
 * Used by the app portals to read admin-configured values.
 */
export function getPortalSettings(): {
  buyer: {
    minBidIncrement: number;
    auctionDurationDays: number;
    maxListings: number;
  };
  seller: {
    listingFee: number;
    maxPhotos: number;
    autoExpireDays: number;
  };
} {
  const s = readPortalSettings();
  return {
    buyer: {
      minBidIncrement: s.buyerMinBidIncrement,
      auctionDurationDays: Math.round(s.buyerAuctionDuration / (60 * 24)) || 7,
      maxListings: s.buyerMaxListings,
    },
    seller: {
      listingFee: s.sellerListingFee,
      maxPhotos: s.sellerMaxPhotos,
      autoExpireDays: s.sellerAutoExpireDays,
    },
  };
}

export function writePortalSettings(settings: Partial<PortalSettings>): void {
  try {
    const current = readPortalSettings();
    const merged = { ...current, ...settings };
    localStorage.setItem(PORTAL_SETTINGS_KEY, JSON.stringify(merged));
    // Dispatch storage event so other tabs / components update
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: PORTAL_SETTINGS_KEY,
        newValue: JSON.stringify(merged),
      }),
    );
  } catch {}
}

// ── Per-User Approval ─────────────────────────────────────────────────

export function getApprovedPhones(): string[] {
  try {
    return JSON.parse(localStorage.getItem(APPROVED_PHONES_KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * Approve a user by phone number, optionally scoped to a role.
 * Stores both a composite key (phone_role) and the plain phone for backward compat.
 */
export function approveUserByPhone(phone: string, role?: string): void {
  try {
    const norm = phone.replace(/^\+91/, "").replace(/^0+/, "");
    const phones = getApprovedPhones();

    // Always store plain phone (backward compat)
    if (!phones.includes(norm)) {
      phones.unshift(norm);
    }

    // Also store composite key if role provided
    if (role) {
      const compositeKey = `${norm}_${role.toLowerCase()}`;
      if (!phones.includes(compositeKey)) {
        phones.unshift(compositeKey);
      }
    }

    localStorage.setItem(APPROVED_PHONES_KEY, JSON.stringify(phones));

    // 1. Dispatch StorageEvent so same-window listeners react immediately
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: APPROVED_PHONES_KEY,
        newValue: JSON.stringify(phones),
      }),
    );

    // 2. BroadcastChannel for instant same-origin cross-context signalling
    try {
      const ch = new BroadcastChannel("77m_kyc_channel");
      ch.postMessage({ type: "KYC_APPROVED", phone: norm, role });
      // Close after a tick so the message is delivered
      setTimeout(() => ch.close(), 100);
    } catch {
      // BroadcastChannel not available — StorageEvent + polling covers it
    }
  } catch {}
}

/**
 * Check if a phone is approved, optionally for a specific role.
 * Checks composite key (phone_role) first, then plain phone (backward compat).
 */
export function isPhoneApprovedForRole(phone: string, role: string): boolean {
  try {
    const norm = phone.replace(/^\+91/, "").replace(/^0+/, "");
    const phones = getApprovedPhones();
    const compositeKey = `${norm}_${role.toLowerCase()}`;
    // Check composite key first (role-specific), then plain phone (backward compat)
    return phones.includes(compositeKey) || phones.includes(norm);
  } catch {
    return false;
  }
}

export function isPhoneApproved(phone: string): boolean {
  try {
    const norm = phone.replace(/^\+91/, "").replace(/^0+/, "");
    const phones = getApprovedPhones();
    return phones.includes(norm);
  } catch {
    return false;
  }
}

// ── Banners ───────────────────────────────────────────────────────────

export function readBanners(): BannerItem[] {
  try {
    const raw = localStorage.getItem(BANNERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function writeBanners(banners: BannerItem[]): void {
  try {
    localStorage.setItem(BANNERS_KEY, JSON.stringify(banners));
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: BANNERS_KEY,
        newValue: JSON.stringify(banners),
      }),
    );
  } catch {}
}

/**
 * Get banners filtered for the current user's role.
 * Only shows banners where status is ON and target matches the user's role.
 */
export function getBannersForRole(userRole: "buyer" | "seller"): BannerItem[] {
  try {
    const all = readBanners();
    return all.filter(
      (b) =>
        b.active === true && (b.target === "both" || b.target === userRole),
    );
  } catch {
    return [];
  }
}
