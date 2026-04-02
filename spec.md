# 77mobiles.pro

## Current State
- React + TypeScript PWA, TanStack Router, Tailwind/shadcn
- AppContext: sharedListings (simple array), unreadAlerts count, watchlist
- ListingDetail: ImageCarousel with swipe + pagination dots + fullscreen zoom already built; currently only builds image array from single `imageUrl` field
- CreateListing: 6-step flow; IMEI lookup uses a public free API (imeicheck.net); photo upload has a separate '+ Add Photos' blue button plus dotted placeholder slots; AGES array has 5 options; base price input is type=number with no formatting
- GuidedDiagnostic: Touch Test grid is rendered inside the normal scroll container, no fullscreen safe-area CSS
- AdminDashboard: PIN-gated, 8 sections; Portal Controls has slider toggles but no upload feature; Users section shows mock data with approve buttons that fire toast but don't persist
- AuthPage: Standard email/mobile form, no OTP flow
- AppContext: no real-time bid listener, no alerts collection, bids are optimistic only
- manifest.json: `background_color: #F8FAFC` (light), icons use `any` and `maskable` purposes but icon images have red dot artifacts
- index.html: has `viewport-fit=cover`, Apple meta tags already present
- sw.js: basic network-first/cache-first strategy

## Requested Changes (Diff)

### Add
- **BidStore** (context/singleton): in-memory bid collection with `subscribe(listingId, cb)` and `addBid(bid)` — simulates real-time Firestore listener pattern; fires callbacks on write
- **AlertsStore**: when a bid is added, automatically push a notification document to an in-memory alerts collection; both Seller and Buyer watch it
- **Indian currency formatter** utility function `formatIndianCurrency(n)` → `₹ 1,35,000`; used in base price input with live comma formatting; underlying state stays numeric
- **Sealed Box** age option at top of AGES list in CreateListing; selecting it auto-sets condition to 'New'; badge shown on listing cards in Buyer Portal
- **Multi-photo gallery**: listing.images[] array support in ListingDetail ImageCarousel (was single imageUrl)
- **IMEI lookup via DHRU API** (Service ID 11) in CreateListing step 0
- **Slider Management** module in AdminDashboard under Portal Controls: upload banner image, set target (Buyer/Seller/Both), Active toggle, Publish button
- **Phone OTP Auth** flow in AuthPage: enter mobile → send OTP (simulated, with invisible reCAPTCHA note) → 6-digit OTP verify → check user verification status → navigate or show pending message
- **Real-time verification listener** in AuthPage/AppContext: if user is on Pending screen and admin approves, auto-navigate to dashboard with welcome toast
- **New maskable app icon** — clean square, brand blue fill, no red dot, `background_color: #0047AB` in manifest
- **Touch Test safe-area fix**: fullscreen overlay with `100vw/100vh`, `env(safe-area-inset-*)` padding, grid recalculated from `window.innerWidth/Height`
- **PWA Chrome iOS audit**: ensure sw.js scope covers root, icon paths are valid in manifest
- **Admin real-time user feed**: setInterval simulating onSnapshot; pending count badge increases with toast; Approve button updates user status in local store immediately

### Modify
- CreateListing: Remove `+ Add Photos` blue label/button; make all dotted placeholder boxes directly trigger file input (multi-select); photos shift when one is deleted
- CreateListing: Base Price input changes to text type with live Indian number formatting; numeric value stored separately
- CreateListing: IMEI lookup replaces current imeicheck.net call with DHRU API (https://dhru.checkimei.com, Service ID 11)
- CreateListing AGES: reorder to start with 'Sealed Box (New)' then month-by-month
- ListingDetail: BiddingCard subscribes to BidStore for live updates; Seller panel subscribes to bid count
- manifest.json: `background_color: #0047AB`, `theme_color: #1D4ED8`, icons updated to `any maskable` purpose combined
- index.html: ensure `apple-mobile-web-app-status-bar-style` is `black-translucent` for notch coverage
- sw.js: ensure scope is `/` and health check passes
- GuidedDiagnostic touch test: use fixed overlay (`position: fixed; inset: 0`) with `env(safe-area-inset-*)` padding
- AdminDashboard Users section: Approve/Reject buttons update in-memory user store and fire real-time update events
- AdminDashboard Portal Controls: add Slider Management tool with image upload
- AuthPage: add OTP mode; add pending-approval screen with real-time status watcher

### Remove
- `+ Add Photos` blue button label from CreateListing step 0

## Implementation Plan
1. Create `src/frontend/src/stores/BidStore.ts` — in-memory pub/sub bid collection with `addBid`, `subscribe`, `getAlerts`
2. Update `AppContext.tsx` — add bid store integration, alerts array, pending user verification listener
3. Update `CreateListing.tsx` — DHRU IMEI API, Indian formatter, Sealed Box option, photo UI (remove Add Photos button, make slots clickable with multi-select, shift on delete)
4. Update `ListingDetail.tsx` — BiddingCard subscribes to BidStore; Seller bid panel live updates; images[] array support
5. Update `GuidedDiagnostic.tsx` — Touch Test fixed overlay with safe-area CSS and window-based grid calculation
6. Update `AdminDashboard.tsx` — real-time user feed with pending count badge + toast, instant Approve action, Slider Management module
7. Update `AuthPage.tsx` — Phone OTP flow with pending-approval reactive screen
8. Update `manifest.json` — background_color, icon purpose, new icon paths
9. Update `index.html` — apple-mobile-web-app-status-bar-style fix
10. Generate new app icon — solid royal blue square, "77mobiles.pro" text, no red dot
