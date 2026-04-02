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
  "Samsung Galaxy S25 Ultra":
    "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop&crop=center",
  "Samsung S24 Ultra":
    "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop&crop=center",
  "Samsung Galaxy S24":
    "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop&crop=center",
  "Samsung Galaxy Z Fold 6":
    "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop&crop=center",
  "Samsung Galaxy Z Fold6":
    "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop&crop=center",
  "Samsung Galaxy A55":
    "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop&crop=center",
  "OnePlus 13":
    "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=200&h=200&fit=crop&crop=center",
  "OnePlus 12":
    "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=200&h=200&fit=crop&crop=center",
  "OnePlus 12 Pro":
    "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=200&h=200&fit=crop&crop=center",
  "Google Pixel 9 Pro":
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200&h=200&fit=crop&crop=center",
  "Google Pixel 9":
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200&h=200&fit=crop&crop=center",
  "Google Pixel 8a":
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200&h=200&fit=crop&crop=center",
  "MacBook Pro M3 Max":
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=200&fit=crop&crop=center",
  "MacBook Pro M2":
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=200&fit=crop&crop=center",
  "MacBook Air M3":
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=200&fit=crop&crop=center",
  "iPad Pro M4":
    "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=200&h=200&fit=crop&crop=center",
  "iPad Air M2":
    "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=200&h=200&fit=crop&crop=center",
  "Apple Watch Ultra 2":
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&h=200&fit=crop&crop=center",
  "Sony WH-1000XM5":
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop&crop=center",
  "Xiaomi 14 Ultra":
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
  if (lower.includes("macbook") || lower.includes("laptop")) {
    return "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=200&fit=crop&crop=center";
  }
  if (lower.includes("ipad") || lower.includes("tablet")) {
    return "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=200&h=200&fit=crop&crop=center";
  }
  if (lower.includes("watch")) {
    return "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&h=200&fit=crop&crop=center";
  }
  if (
    lower.includes("sony") ||
    lower.includes("headphone") ||
    lower.includes("wh-")
  ) {
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop&crop=center";
  }
  if (lower.includes("iphone") || lower.includes("apple")) {
    return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop&crop=center";
  }
  if (lower.includes("samsung")) {
    return "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop&crop=center";
  }
  return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop&crop=center";
}

// 20 demo seller listings (Tasks 7)
export const SELLER_LISTINGS: Listing[] = [
  {
    listingId: "s-1",
    title: "Apple iPhone 16 Pro Max 256GB",
    brand: "Apple",
    model: "iPhone 16 Pro Max",
    storage: 256n,
    batteryHealth: 98n,
    warranty: 10n,
    condition: "Like New",
    color: "Desert Titanium",
    description:
      "Barely used. Original box with all accessories. USB-verified by 77mobiles Pro.",
    basePrice: 12500000n,
    auctionType: "Live20min",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: true,
    usbVerified: true,
    serialNumberHash: "sha256:s1a1",
    sellerId: "demo-seller",
    endsAt: now + sec(1240),
    createdAt: now,
  },
  {
    listingId: "s-2",
    title: "Samsung Galaxy S25 Ultra 512GB",
    brand: "Samsung",
    model: "Samsung Galaxy S25 Ultra",
    storage: 512n,
    batteryHealth: 100n,
    warranty: 12n,
    condition: "New",
    color: "Titanium Black",
    description:
      "Brand new sealed box. International warranty. S-Pen included.",
    basePrice: 11500000n,
    auctionType: "Live20min",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: true,
    usbVerified: true,
    serialNumberHash: "sha256:s2b2",
    sellerId: "demo-seller",
    endsAt: now + sec(780),
    createdAt: now,
  },
  {
    listingId: "s-3",
    title: "Apple MacBook Pro M3 Max 1TB",
    brand: "Apple",
    model: "MacBook Pro M3 Max",
    storage: 1024n,
    batteryHealth: 96n,
    warranty: 8n,
    condition: "Excellent",
    color: "Space Black",
    description:
      "Excellent condition. Used for 6 months. Minor scuffs on lid. Full cycle count under 50.",
    basePrice: 22000000n,
    auctionType: "SevenDay",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: true,
    usbVerified: false,
    serialNumberHash: "sha256:s3c3",
    sellerId: "demo-seller",
    endsAt: now + sevenDays,
    createdAt: now,
  },
  {
    listingId: "s-4",
    title: "Apple iPad Pro M4 256GB",
    brand: "Apple",
    model: "iPad Pro M4",
    storage: 256n,
    batteryHealth: 97n,
    warranty: 9n,
    condition: "Like New",
    color: "Silver",
    description:
      "Excellent display. Used lightly. Apple Pencil Pro compatible.",
    basePrice: 9500000n,
    auctionType: "SevenDay",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: true,
    usbVerified: false,
    serialNumberHash: "sha256:s4d4",
    sellerId: "demo-seller",
    endsAt: now + sevenDays,
    createdAt: now,
  },
  {
    listingId: "s-5",
    title: "OnePlus 13 256GB",
    brand: "OnePlus",
    model: "OnePlus 13",
    storage: 256n,
    batteryHealth: 91n,
    warranty: 4n,
    condition: "Gently Used",
    color: "Arctic Dawn",
    description:
      "Minor wear on back panel. Screen is pristine. 100W charging included.",
    basePrice: 4200000n,
    auctionType: "Live20min",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: false,
    usbVerified: false,
    serialNumberHash: "sha256:s5e5",
    sellerId: "demo-seller",
    endsAt: now + sec(460),
    createdAt: now,
  },
  {
    listingId: "s-6",
    title: "Google Pixel 9 Pro 128GB",
    brand: "Google",
    model: "Google Pixel 9 Pro",
    storage: 128n,
    batteryHealth: 94n,
    warranty: 10n,
    condition: "Excellent",
    color: "Obsidian",
    description:
      "Excellent condition. 7 years of Android updates. Tensor G4 chip.",
    basePrice: 6800000n,
    auctionType: "Live20min",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: true,
    usbVerified: true,
    serialNumberHash: "sha256:s6f6",
    sellerId: "demo-seller",
    endsAt: now + sec(1650),
    createdAt: now,
  },
  {
    listingId: "s-7",
    title: "Apple iPhone 15 Pro 512GB",
    brand: "Apple",
    model: "iPhone 15 Pro",
    storage: 512n,
    batteryHealth: 92n,
    warranty: 6n,
    condition: "Like New",
    color: "Black Titanium",
    description: "Like new, used for 6 months. Original packaging included.",
    basePrice: 8800000n,
    auctionType: "Live20min",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: true,
    usbVerified: true,
    serialNumberHash: "sha256:s7g7",
    sellerId: "demo-seller",
    endsAt: now + sec(950),
    createdAt: now,
  },
  {
    listingId: "s-8",
    title: "Samsung Galaxy Z Fold 6 512GB",
    brand: "Samsung",
    model: "Samsung Galaxy Z Fold 6",
    storage: 512n,
    batteryHealth: 99n,
    warranty: 11n,
    condition: "New",
    color: "Navy",
    description: "Brand new. Sealed box. Dual SIM. S-Pen compatible cover.",
    basePrice: 15500000n,
    auctionType: "SevenDay",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: true,
    usbVerified: true,
    serialNumberHash: "sha256:s8h8",
    sellerId: "demo-seller",
    endsAt: now + sevenDays,
    createdAt: now,
  },
  {
    listingId: "s-9",
    title: "Sony WH-1000XM5 Headphones",
    brand: "Sony",
    model: "Sony WH-1000XM5",
    storage: 0n,
    batteryHealth: 95n,
    warranty: 3n,
    condition: "Like New",
    color: "Midnight Black",
    description:
      "Excellent noise cancellation. Barely used. Carrying case included.",
    basePrice: 2200000n,
    auctionType: "Live20min",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: false,
    usbVerified: false,
    serialNumberHash: "sha256:s9i9",
    sellerId: "demo-seller",
    endsAt: now + sec(820),
    createdAt: now,
  },
  {
    listingId: "s-10",
    title: "Apple MacBook Air M3 512GB",
    brand: "Apple",
    model: "MacBook Air M3",
    storage: 512n,
    batteryHealth: 93n,
    warranty: 7n,
    condition: "Excellent",
    color: "Starlight",
    description: "Ultra-thin design. Excellent performance for business use.",
    basePrice: 10500000n,
    auctionType: "SevenDay",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: false,
    usbVerified: false,
    serialNumberHash: "sha256:s10j10",
    sellerId: "demo-seller",
    endsAt: now + sevenDays,
    createdAt: now,
  },
  {
    listingId: "s-11",
    title: "Apple iPhone 16 128GB",
    brand: "Apple",
    model: "iPhone 16",
    storage: 128n,
    batteryHealth: 100n,
    warranty: 12n,
    condition: "New",
    color: "Ultramarine",
    description: "Brand new sealed. A18 chip. Apple Intelligence ready.",
    basePrice: 7500000n,
    auctionType: "Live20min",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: true,
    usbVerified: false,
    serialNumberHash: "sha256:s11k11",
    sellerId: "demo-seller",
    endsAt: now + sec(2100),
    createdAt: now,
  },
  {
    listingId: "s-12",
    title: "OnePlus 12 256GB",
    brand: "OnePlus",
    model: "OnePlus 12",
    storage: 256n,
    batteryHealth: 88n,
    warranty: 0n,
    condition: "Gently Used",
    color: "Flowy Emerald",
    description: "1 year old. Minor scratches on frame. Screen perfect.",
    basePrice: 3500000n,
    auctionType: "Live20min",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: false,
    usbVerified: false,
    serialNumberHash: "sha256:s12l12",
    sellerId: "demo-seller",
    endsAt: now + sec(340),
    createdAt: now,
  },
  {
    listingId: "s-13",
    title: "Samsung Galaxy S24 256GB",
    brand: "Samsung",
    model: "Samsung Galaxy S24",
    storage: 256n,
    batteryHealth: 90n,
    warranty: 5n,
    condition: "Like New",
    color: "Marble Grey",
    description: "Excellent condition. Exynos 2400 variant. All accessories.",
    basePrice: 5500000n,
    auctionType: "Live20min",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: false,
    usbVerified: false,
    serialNumberHash: "sha256:s13m13",
    sellerId: "demo-seller",
    endsAt: now + sec(1800),
    createdAt: now,
  },
  {
    listingId: "s-14",
    title: "Apple iPad Air M2 128GB",
    brand: "Apple",
    model: "iPad Air M2",
    storage: 128n,
    batteryHealth: 96n,
    warranty: 8n,
    condition: "Excellent",
    color: "Blue",
    description: "M2 chip tablet. Perfect for B2B work. Light use only.",
    basePrice: 6200000n,
    auctionType: "SevenDay",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: true,
    usbVerified: false,
    serialNumberHash: "sha256:s14n14",
    sellerId: "demo-seller",
    endsAt: now + sevenDays,
    createdAt: now,
  },
  {
    listingId: "s-15",
    title: "Google Pixel 8a 128GB",
    brand: "Google",
    model: "Google Pixel 8a",
    storage: 128n,
    batteryHealth: 92n,
    warranty: 3n,
    condition: "Like New",
    color: "Bay",
    description: "Mid-range flagship. Tensor G3 chip. Clean IMEI.",
    basePrice: 3800000n,
    auctionType: "Live20min",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: false,
    usbVerified: false,
    serialNumberHash: "sha256:s15o15",
    sellerId: "demo-seller",
    endsAt: now + sec(1100),
    createdAt: now,
  },
  {
    listingId: "s-16",
    title: "Apple iPhone 14 Pro 256GB",
    brand: "Apple",
    model: "iPhone 14 Pro",
    storage: 256n,
    batteryHealth: 84n,
    warranty: 0n,
    condition: "Gently Used",
    color: "Deep Purple",
    description: "14 months old. No screen damage. Dynamic Island model.",
    basePrice: 6500000n,
    auctionType: "Live20min",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: false,
    usbVerified: false,
    serialNumberHash: "sha256:s16p16",
    sellerId: "demo-seller",
    endsAt: now + sec(700),
    createdAt: now,
  },
  {
    listingId: "s-17",
    title: "Samsung Galaxy A55 256GB",
    brand: "Samsung",
    model: "Samsung Galaxy A55",
    storage: 256n,
    batteryHealth: 100n,
    warranty: 12n,
    condition: "New",
    color: "Navy",
    description: "Brand new. Exynos 1480. IP67 water resistant. OIS camera.",
    basePrice: 2800000n,
    auctionType: "Live20min",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: false,
    usbVerified: false,
    serialNumberHash: "sha256:s17q17",
    sellerId: "demo-seller",
    endsAt: now + sec(2500),
    createdAt: now,
  },
  {
    listingId: "s-18",
    title: "Apple MacBook Pro M2 512GB",
    brand: "Apple",
    model: "MacBook Pro M2",
    storage: 512n,
    batteryHealth: 89n,
    warranty: 4n,
    condition: "Excellent",
    color: "Silver",
    description:
      "M2 chip. 16GB RAM. Used for software development. Cycle count under 120.",
    basePrice: 14500000n,
    auctionType: "SevenDay",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: false,
    usbVerified: false,
    serialNumberHash: "sha256:s18r18",
    sellerId: "demo-seller",
    endsAt: now + sevenDays,
    createdAt: now,
  },
  {
    listingId: "s-19",
    title: "Apple Watch Ultra 2",
    brand: "Apple",
    model: "Apple Watch Ultra 2",
    storage: 0n,
    batteryHealth: 97n,
    warranty: 9n,
    condition: "Like New",
    color: "Natural Titanium",
    description: "49mm case. Alpine Loop band included. Barely worn.",
    basePrice: 7200000n,
    auctionType: "Live20min",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: false,
    usbVerified: false,
    serialNumberHash: "sha256:s19s19",
    sellerId: "demo-seller",
    endsAt: now + sec(1380),
    createdAt: now,
  },
  {
    listingId: "s-20",
    title: "Xiaomi 14 Ultra 512GB",
    brand: "Xiaomi",
    model: "Xiaomi 14 Ultra",
    storage: 512n,
    batteryHealth: 100n,
    warranty: 12n,
    condition: "New",
    color: "Titanium Black",
    description:
      "Brand new. Leica Summilux optics. 90W HyperCharge. Snapdragon 8 Gen 3.",
    basePrice: 6800000n,
    auctionType: "Live20min",
    status: "Active",
    imageUrl: "",
    isDemo: true,
    screenPassCertified: false,
    usbVerified: false,
    serialNumberHash: "sha256:s20t20",
    sellerId: "demo-seller",
    endsAt: now + sec(580),
    createdAt: now,
  },
];

// BUYER_AUCTIONS is empty — buyer portal uses SELLER_LISTINGS directly
export const BUYER_AUCTIONS: Listing[] = [];

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
    model: "Samsung Galaxy S24",
    brand: "Samsung",
    condition: "Good",
    price: 4200000,
    storage: "256GB",
  },
];

export const DEMO_BIDS: Record<string, number> = {
  "s-1": 12750000,
  "s-2": 11800000,
  "s-3": 22500000,
  "s-4": 9700000,
  "s-5": 4300000,
  "s-6": 6900000,
  "s-7": 9000000,
  "s-8": 15800000,
  "s-9": 2250000,
  "s-10": 10700000,
  "s-11": 7600000,
  "s-12": 3600000,
  "s-13": 5600000,
  "s-14": 6300000,
  "s-15": 3900000,
  "s-16": 6600000,
  "s-17": 2850000,
  "s-18": 14700000,
  "s-19": 7300000,
  "s-20": 6900000,
};

export const DEMO_BID_COUNTS: Record<string, number> = {
  "s-1": 14,
  "s-2": 9,
  "s-3": 5,
  "s-4": 7,
  "s-5": 3,
  "s-6": 11,
  "s-7": 8,
  "s-8": 6,
  "s-9": 4,
  "s-10": 2,
  "s-11": 12,
  "s-12": 3,
  "s-13": 6,
  "s-14": 1,
  "s-15": 5,
  "s-16": 7,
  "s-17": 0,
  "s-18": 4,
  "s-19": 9,
  "s-20": 3,
};

// Alias for backward compat
export const DEMO_LISTINGS = SELLER_LISTINGS;
