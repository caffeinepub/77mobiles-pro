# 77mobiles.pro

## Current State

- Full PWA B2B electronics auction marketplace with Seller Portal, Buyer Portal, and Admin Panel at `/admin` (PIN: 770777)
- BidStore is an in-memory pub/sub system simulating Firestore onSnapshot for real-time bid updates
- ListingDetail has BidStore subscriptions for live bid count + BiddingCard already reacts with pulse animation
- AuthPage: password-based login/register, stores credentials in localStorage; buyer registrations save with `role: 'buyer'` in KYC submissions
- SellerPortal and BuyerPortal use `sharedListings` from AppContext for new listings
- ActivityPage and AlertsPage show static SELLER_ACTIVITY / BUYER_ACTIVITY / SELLER_ALERTS / BUYER_ALERTS arrays
- WalletPage: reactive balance state with Add Money / Withdraw; shows ₹85,000 escrow hardcoded
- RecentSalesSlider: has a static fallback array with `CheckCircle` "Verified" badge
- AdminDashboard: has `kycItems` from localStorage, two-tab user management (seller/buyer), Bell panel
- BottomNav: height 80px, `env(safe-area-inset-bottom, 20px)` padding; uses `box-sizing: content-box`
- ProfilePage: has `My Analytics` section with demo stats and time filters
- Device Verification section on ListingDetail: has Battery Health (dynamic from `listing.batteryHealth`) + IMEI Status + Cosmetic Grade + Functional Check cards
- index.html: has PWA meta tags and icon links
- manifest.json: defines icon paths and theme_color

## Requested Changes (Diff)

### Add
- **Task 1**: Seller-side real-time bid feed on ListingDetail: when seller views a listing, subscribe to BidStore for that listingId and render a live sortable list of bids with dealer IDs, amounts, timestamps. The `pricePulsing` animation already exists in BiddingCard but the Seller panel (Current Bids section) needs to also use it.
- **Task 3**: Login button loading spinner using `loading` state that already exists but is not shown as a spinner; add `setLoading(true)` before login attempt and `setLoading(false)` after; wrap `handleLogin` in try/catch with red toast error; log errors to console; save session with 30-day TTL in localStorage.
- **Task 4**: AppContext `sharedListings` currently works but SellerPortal/BuyerPortal listing cards don't sync bid prices. Add a `bidMap` state in both portals that subscribes to `BidStore.subscribeAllBids` and updates only the affected card's currentBid + bidCount.
- **Task 5**: viewport meta tag fix in index.html: add `viewport-fit=cover`. Update BottomNav to use `position: fixed !important; bottom: 0 !important; height: calc(80px + env(safe-area-inset-bottom)) !important; padding-bottom: env(safe-area-inset-bottom) !important`. Main app wrapper in AppShell: change to `min-height: -webkit-fill-available`. FAB center button: add `bottom: 30px` relative offset.
- **Task 6**: ActivityPage and AlertsPage: replace static arrays with BidStore subscriptions. Alerts tab: add mark-as-read on entry (call `BidStore.markAllRead()` on mount), clear the badge. Activity items should have clickable action buttons routing to correct listing pages. AlertsPage: replace hardcoded `alerts.length` badge with real `unreadAlerts` from AppContext, add mark-all-read button.
- **Task 9**: ProfilePage analytics section: replace static demo data. For seller: derive Active Listings count from `sharedListings` filtered by status + SELLER_LISTINGS; Total Earned from sold items. For buyer: Bids Placed from BidStore all bids by 'demo-buyer'; Won count from sold listings. Time filters (7d/30d/All) filter BidStore bids by `placedAt`. Chart bars map day-of-week.
- **Task 10**: ListingDetail Device Verification: remove "Cosmetic Grade" card and "Functional Check" card entirely. Keep Battery Health (already dynamic from `listing.batteryHealth`) and IMEI Status showing actual IMEI from `(listing as any).imei` or masked fallback.
- **Task 11**: RecentSalesSlider: remove the `CheckCircle` + "Verified" text from sold cards. Use `sharedListings` from AppContext + SELLER_LISTINGS filtered for status==='Sold'. If none, show empty state instead of STATIC_RECENT_SALES.
- **Task 12**: BiddingCard: add wallet balance check before allowing Place Bid. Read balance from `localStorage.getItem('77m_wallet_balance')`. Calculate: totalRequired = bidAmount + platformFee (₹1500) * 1.18 GST * 1.01 TCS. If balance < totalRequired, disable button and show inline message. On successful bid, deduct bid amount from wallet and mark as "Locked/Escrow" by storing in `77m_escrow` in localStorage.
- **Task 13**: AdminDashboard dashboard section: make metric cards clickable (navigate to correct section via `setActiveSection`). Add "Global Wallet Management" card group below existing cards showing: Total Platform Balance (sum all user wallet balances), Total Escrow (sum of 77m_escrow), Admin Earnings (platform fees accumulated). Add Transaction History table (most recent 20 from localStorage `77m_global_transactions`). Fix Live Bid Activity to subscribe to BidStore.subscribeAllBids and display real bids.
- **Task 2**: Buyer registrations already write `role: 'buyer'` to KYC submissions. AdminDashboard already has buyer tab. Ensure the buyer tab reads from kycItems filtered by `role === 'buyer'` (case-insensitive lowercase). Add `onSnapshot`-style polling (setInterval 5s) for kycItems refresh in Admin.
- **Task 7**: Generate new 77 icons and update manifest.json + index.html.

### Modify
- `ListingDetail.tsx`: Seller Current Bids section — subscribe to BidStore and render sorted live bid list with pulsing green price
- `AuthPage.tsx`: handleLogin — add loading spinner, try/catch with red toast, console.error, 30-day session save
- `SellerPortal.tsx` + `BuyerPortal.tsx`: subscribe to BidStore.subscribeAllBids, update bid prices per-card without full re-render
- `BottomNav.tsx`: safe-area height/padding fix; FAB bottom offset
- `AppShell.tsx`: main wrapper height fix for Safari
- `index.html`: add `viewport-fit=cover`
- `ActivityPage.tsx`: connect to BidStore alerts; real action buttons
- `AlertsPage.tsx`: use real `unreadAlerts`, add mark-all-read
- `ProfilePage.tsx`: analytics from real BidStore data
- `ListingDetail.tsx` Device Verification: remove Cosmetic Grade and Functional Check cards
- `RecentSalesSlider.tsx`: remove Verified badge; use real sold data; empty state
- `BiddingCard` in ListingDetail: wallet balance pre-bid check + escrow logic
- `AdminDashboard.tsx`: clickable metric cards, Global Wallet section, transaction table, real bid feed

### Remove
- Static SELLER_ALERTS, BUYER_ALERTS from AlertsPage (replaced by real BidStore)
- Static SELLER_ACTIVITY, BUYER_ACTIVITY from ActivityPage (replaced by real BidStore)
- Cosmetic Grade card and Functional Check card from ListingDetail Device Verification
- CheckCircle "Verified" badge from RecentSalesSlider
- STATIC_RECENT_SALES fallback (replaced by empty state)

## Implementation Plan

1. **ListingDetail.tsx**: In Seller Current Bids panel, subscribe to `BidStore.subscribeBids(listing.listingId, ...)` and render sorted live bids list with green pulse when new bid arrives. Remove Cosmetic Grade + Functional Check cards from Device Verification section.
2. **AuthPage.tsx**: Wrap `handleLogin` with setLoading, try/catch, console.error, red toast via `toast.error()`, save 30-day session.
3. **SellerPortal.tsx + BuyerPortal.tsx**: Use `BidStore.subscribeAllBids` in useEffect; store `bidMap: Map<listingId, {bid, count}>` in state; pass into listing card renders.
4. **BottomNav.tsx + AppShell.tsx + index.html**: Apply Safe Area fixes.
5. **ActivityPage.tsx**: Subscribe to `BidStore.subscribeAlerts`; render real notifications as activity items with View Auction/View Lead buttons navigating to correct routes.
6. **AlertsPage.tsx**: Subscribe to `BidStore.subscribeAlerts` from AppContext `alerts`; show `unreadAlerts` badge; Add Mark All Read button that calls `BidStore.markAllRead()`.
7. **ProfilePage.tsx**: Read real data from BidStore and sharedListings for analytics stats and chart.
8. **RecentSalesSlider.tsx**: Remove Verified badge; use only real sold listings; show empty state if none.
9. **BiddingCard** in ListingDetail: wallet balance check with GST/TCS calculation; escrow on bid placement.
10. **AdminDashboard.tsx**: Metric cards navigate to sections; Global Wallet card; Transaction History table from localStorage; BidStore subscription for live feed.
