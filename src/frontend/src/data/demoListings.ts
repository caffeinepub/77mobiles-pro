import type { Listing } from "../backend.d";

const now = BigInt(Date.now()) * 1_000_000n;
const sec = (s: number) => BigInt(s * 1000) * 1_000_000n;
const sevenDays = BigInt(7 * 24 * 60 * 60 * 1000) * 1_000_000n;

// Device image map — real product photos
export const DEVICE_IMAGES: Record<string, string> = {
  "iPhone 17 Pro":
    "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=200&h=200&fit=crop&crop=center",
  "iPhone 17 Pro Max":
    "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=200&h=200&fit=crop&crop=center",
  "iPhone 16 Pro":
    "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200&h=200&fit=crop&crop=center",
  "iPhone 16 Pro Max":
    "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200&h=200&fit=crop&crop=center",
  "iPhone 16":
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop&crop=center",
  "iPhone 15 Pro":
    "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=200&h=200&fit=crop&crop=center",
  "iPhone 15 Pro Max":
    "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=200&h=200&fit=crop&crop=center",
  "iPhone 15":
    "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=200&h=200&fit=crop&crop=center",
  "iPhone 14 Pro":
    "https://images.unsplash.com/photo-1574755393849-623942496936?w=200&h=200&fit=crop&crop=center",
  "iPhone 14":
    "https://images.unsplash.com/photo-1574755393849-623942496936?w=200&h=200&fit=crop&crop=center",
  "iPhone 15 Pro 256GB":
    "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=200&h=200&fit=crop&crop=center",
  "Samsung S24 Ultra":
    "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop&crop=center",
  "Samsung Galaxy S24 Ultra":
    "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop&crop=center",
  "Samsung Galaxy Z Fold6":
    "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop&crop=center",
  "Samsung Galaxy S23":
    "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop&crop=center",
  "OnePlus 12 Pro":
    "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=200&h=200&fit=crop&crop=center",
  "OnePlus 12":
    "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=200&h=200&fit=crop&crop=center",
  "OnePlus 11":
    "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=200&h=200&fit=crop&crop=center",
  "Google Pixel 9 Pro":
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200&h=200&fit=crop&crop=center",
  "Google Pixel 9":
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200&h=200&fit=crop&crop=center",
  "Xiaomi 14 Ultra":
    "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=200&h=200&fit=crop&crop=center",
  "Xiaomi 14 Pro":
    "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=200&h=200&fit=crop&crop=center",
};

export function getDeviceImage(model: string): string {
  if (DEVICE_IMAGES[model]) return DEVICE_IMAGES[model];
  const lower = model.toLowerCase();
  for (const [key, url] of Object.entries(DEVICE_IMAGES)) {
    if (
      lower.includes(key.toLowerCase()) ||
      key.toLowerCase().includes(lower.split(" ").slice(0, 2).join(" "))
    ) {
      return url;
    }
  }
  if (lower.includes("iphone") || lower.includes("apple")) {
    return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop&crop=center";
  }
  if (lower.includes("samsung")) {
    return "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop&crop=center";
  }
  return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop&crop=center";
}

// Seller's inventory listings (8 items)
export const SELLER_LISTINGS: Listing[] = [
  {
    listingId: "s-1",
    title: "Apple iPhone 17 Pro 256GB",
    brand: "Apple",
    model: "iPhone 17 Pro",
    storage: 256n,
    batteryHealth: 89n,
    warranty: 0n,
    condition: "Fair",
    color: "Natural Titanium",
    description: "Fully functional. USB-verified by 77mobiles Pro.",
    basePrice: 11000000n,
    auctionType: "Live20min",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: true,
    usbVerified: true,
    serialNumberHash: "sha256:a1b2",
    sellerId: "demo-seller",
    endsAt: now + sec(358),
    createdAt: now,
  },
  {
    listingId: "s-2",
    title: "Apple iPhone 16 128GB",
    brand: "Apple",
    model: "iPhone 16",
    storage: 128n,
    batteryHealth: 92n,
    warranty: 6n,
    condition: "Like New",
    color: "Black",
    description: "Like new condition, original box included.",
    basePrice: 7200000n,
    auctionType: "SevenDay",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: false,
    usbVerified: false,
    serialNumberHash: "",
    sellerId: "demo-seller",
    endsAt: now + sevenDays,
    createdAt: now,
  },
  {
    listingId: "s-3",
    title: "Samsung Galaxy S24 Ultra 256GB",
    brand: "Samsung",
    model: "Samsung S24 Ultra",
    storage: 256n,
    batteryHealth: 88n,
    warranty: 8n,
    condition: "Good",
    color: "Titanium Gray",
    description: "Good condition. S-Pen included.",
    basePrice: 8500000n,
    auctionType: "Live20min",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: false,
    usbVerified: false,
    serialNumberHash: "",
    sellerId: "demo-seller",
    endsAt: now + sec(750),
    createdAt: now,
  },
  {
    listingId: "s-4",
    title: "Apple iPhone 15 Pro 256GB",
    brand: "Apple",
    model: "iPhone 15 Pro",
    storage: 256n,
    batteryHealth: 91n,
    warranty: 3n,
    condition: "Like New",
    color: "Black Titanium",
    description: "Excellent condition.",
    basePrice: 6500000n,
    auctionType: "SevenDay",
    status: "Sold",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: true,
    usbVerified: true,
    serialNumberHash: "sha256:c3d4",
    sellerId: "demo-seller",
    endsAt: now - sec(100),
    createdAt: now,
  },
  {
    listingId: "s-5",
    title: "OnePlus 12 256GB",
    brand: "OnePlus",
    model: "OnePlus 12",
    storage: 256n,
    batteryHealth: 87n,
    warranty: 0n,
    condition: "Good",
    color: "Flowy Emerald",
    description: "Used but good condition.",
    basePrice: 3800000n,
    auctionType: "Live20min",
    status: "Sold",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: false,
    usbVerified: false,
    serialNumberHash: "",
    sellerId: "demo-seller",
    endsAt: now - sec(100),
    createdAt: now,
  },
  {
    listingId: "s-6",
    title: "Google Pixel 9 Pro 256GB",
    brand: "Google",
    model: "Google Pixel 9 Pro",
    storage: 256n,
    batteryHealth: 93n,
    warranty: 10n,
    condition: "Like New",
    color: "Obsidian",
    description: "Near mint. 7 years updates guaranteed.",
    basePrice: 5500000n,
    auctionType: "SevenDay",
    status: "Sold",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: true,
    usbVerified: true,
    serialNumberHash: "sha256:e5f6",
    sellerId: "demo-seller",
    endsAt: now - sec(100),
    createdAt: now,
  },
  {
    listingId: "s-7",
    title: "Xiaomi 14 Pro 256GB",
    brand: "Xiaomi",
    model: "Xiaomi 14 Pro",
    storage: 256n,
    batteryHealth: 84n,
    warranty: 0n,
    condition: "Fair",
    color: "Black",
    description: "Moderate use. Minor wear.",
    basePrice: 3200000n,
    auctionType: "Live20min",
    status: "Sold",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: false,
    usbVerified: false,
    serialNumberHash: "",
    sellerId: "demo-seller",
    endsAt: now - sec(100),
    createdAt: now,
  },
  {
    listingId: "s-8",
    title: "Samsung Galaxy Z Fold6 256GB",
    brand: "Samsung",
    model: "Samsung Galaxy Z Fold6",
    storage: 256n,
    batteryHealth: 96n,
    warranty: 11n,
    condition: "Like New",
    color: "Phantom Black",
    description: "Barely used. Full kit.",
    basePrice: 12000000n,
    auctionType: "SevenDay",
    status: "Sold",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: true,
    usbVerified: true,
    serialNumberHash: "sha256:g7h8",
    sellerId: "demo-seller",
    endsAt: now - sec(100),
    createdAt: now,
  },
];

// Buyer auction listings (6 items with live timers)
export const BUYER_AUCTIONS: Listing[] = [
  {
    listingId: "b-1",
    title: "Apple iPhone 17 Pro 256GB",
    brand: "Apple",
    model: "iPhone 17 Pro",
    storage: 256n,
    batteryHealth: 89n,
    warranty: 0n,
    condition: "Fair",
    color: "Natural Titanium",
    description: "USB-verified by 77mobiles Pro diagnostic system.",
    basePrice: 11000000n,
    auctionType: "Live20min",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: true,
    usbVerified: true,
    serialNumberHash: "sha256:b1b2",
    sellerId: "seller-#402",
    endsAt: now + sec(358),
    createdAt: now,
  },
  {
    listingId: "b-2",
    title: "Samsung Galaxy S24 Ultra 256GB",
    brand: "Samsung",
    model: "Samsung S24 Ultra",
    storage: 256n,
    batteryHealth: 88n,
    warranty: 8n,
    condition: "Good",
    color: "Titanium Gray",
    description: "S-Pen included. Verified condition.",
    basePrice: 8500000n,
    auctionType: "Live20min",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: false,
    usbVerified: false,
    serialNumberHash: "",
    sellerId: "seller-#189",
    endsAt: now + sec(750),
    createdAt: now,
  },
  {
    listingId: "b-3",
    title: "Apple iPhone 16 Pro 256GB",
    brand: "Apple",
    model: "iPhone 16 Pro",
    storage: 256n,
    batteryHealth: 95n,
    warranty: 10n,
    condition: "Like New",
    color: "Desert Titanium",
    description: "Near mint. Original box.",
    basePrice: 7500000n,
    auctionType: "Live20min",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: true,
    usbVerified: true,
    serialNumberHash: "sha256:c3c4",
    sellerId: "seller-#341",
    endsAt: now + sec(1125),
    createdAt: now,
  },
  {
    listingId: "b-4",
    title: "OnePlus 12 Pro 256GB",
    brand: "OnePlus",
    model: "OnePlus 12 Pro",
    storage: 256n,
    batteryHealth: 90n,
    warranty: 6n,
    condition: "Good",
    color: "Flowy Emerald",
    description: "Good condition. All accessories.",
    basePrice: 4000000n,
    auctionType: "Live20min",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: false,
    usbVerified: false,
    serialNumberHash: "",
    sellerId: "seller-#217",
    endsAt: now + sec(500),
    createdAt: now,
  },
  {
    listingId: "b-5",
    title: "Google Pixel 9 256GB",
    brand: "Google",
    model: "Google Pixel 9",
    storage: 256n,
    batteryHealth: 94n,
    warranty: 12n,
    condition: "Like New",
    color: "Obsidian",
    description: "Like new. 7 years Android updates.",
    basePrice: 5500000n,
    auctionType: "Live20min",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: true,
    usbVerified: true,
    serialNumberHash: "sha256:e5e6",
    sellerId: "seller-#402",
    endsAt: now + sec(900),
    createdAt: now,
  },
  {
    listingId: "b-6",
    title: "Xiaomi 14 Ultra 256GB",
    brand: "Xiaomi",
    model: "Xiaomi 14 Ultra",
    storage: 256n,
    batteryHealth: 86n,
    warranty: 4n,
    condition: "Fair",
    color: "Black",
    description: "Leica optics. Minor wear.",
    basePrice: 3300000n,
    auctionType: "Live20min",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: false,
    usbVerified: false,
    serialNumberHash: "",
    sellerId: "seller-#189",
    endsAt: now + sec(195),
    createdAt: now,
  },
];

export interface DirectBuyItem {
  id: string;
  model: string;
  brand: string;
  condition: string;
  price: number; // in paise
  storage: string;
}

export const DIRECT_BUY_ITEMS: DirectBuyItem[] = [
  {
    id: "d-1",
    model: "iPhone 15 Pro 256GB",
    brand: "Apple",
    condition: "Like New",
    price: 6500000,
    storage: "256GB",
  },
  {
    id: "d-2",
    model: "Samsung Galaxy S23",
    brand: "Samsung",
    condition: "Good",
    price: 4200000,
    storage: "256GB",
  },
  {
    id: "d-3",
    model: "iPhone 14",
    brand: "Apple",
    condition: "Fair",
    price: 3500000,
    storage: "128GB",
  },
  {
    id: "d-4",
    model: "OnePlus 11",
    brand: "OnePlus",
    condition: "Like New",
    price: 2800000,
    storage: "128GB",
  },
];

export const DEMO_BIDS: Record<string, number> = {
  "b-1": 11250000,
  "b-2": 8700000,
  "b-3": 7850000,
  "b-4": 4200000,
  "b-5": 5800000,
  "b-6": 3500000,
  "s-1": 11250000,
  "s-2": 7380000,
  "s-3": 8670000,
};

export const DEMO_BID_COUNTS: Record<string, number> = {
  "b-1": 7,
  "b-2": 12,
  "b-3": 9,
  "b-4": 4,
  "b-5": 6,
  "b-6": 2,
  "s-1": 0,
  "s-2": 3,
  "s-3": 1,
};

// Keep DEMO_LISTINGS as alias for backward compat
export const DEMO_LISTINGS = SELLER_LISTINGS;
