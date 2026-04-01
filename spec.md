# 77mobiles.pro

## Current State
Fully built B2B auction marketplace with Buyer/Seller portals, admin dashboard, wallet, listing detail with bidding, market trends, activity, and watchlist pages. Royal Blue (#1D4ED8) theme, glassmorphic UI, single-column seller listings, existing bidding card in ListingDetail, market trends list with basic data.

## Requested Changes (Diff)

### Add
- 2-column grid layout for My Listings in SellerPortal with skeleton loaders, status/auction-type badge overlays on images, countdown timers on active cards
- Increment buttons (+₹100, +₹500, +₹1,000) in bidding interface with haptic feedback
- Storage, age, condition details to each MarketTrends item; sparkline trend indicator + price delta; "Why this is moving" micro-label
- Watchlist section in ActivityPage showing starred/watched listings with star icon
- Functional IMEI/barcode scanner in CreateListing (wire up the camera icon)

### Modify
- SellerPortal My Listings: vertical list → 2-column card grid; square image top, badges overlaid corners, bold price in blue, condensed timer
- ListingDetail BiddingCard: reorganize input + increment buttons + Place Bid CTA with visual hierarchy
- MarketTrendsPage: expand each row with config details, right-aligned price, colored delta indicator
- BuyerPortal listing cards: show full (unmasked) IMEI where displayed
- All listing cards in category screens: ensure every card is tappable/navigates to ListingDetail
- SellerPortal FULFILL LEAD cards: reduce card height/padding by ~30%
- All timers/counters/bids/wallet data: use setInterval polling to simulate real-time updates
- ActivityPage: add "Watchlist" sub-tab with star icon showing items added to watchlist

### Remove
- Nothing to remove

## Implementation Plan
1. **SellerPortal.tsx** — Replace single-column My Listings with 2-col responsive grid. Each card: square image with badge overlays (top-left status, top-right auction type), below: bold title, condition+verified line, blue price, countdown timer for active. Add skeleton loader (6 shimmer cards) that shows for 1.2s on mount. Reduce DEMAND_FEED card height (less padding, smaller text).
2. **ListingDetail.tsx** — Restructure BiddingCard: label + input top, then horizontal row of 3 outline buttons (+₹100/+₹500/+₹1K) that add to bid amount + haptic, then full-width solid "Place Bid →" button at bottom.
3. **MarketTrendsPage.tsx** — Expand each card to show: model|storage on main line, then "Condition • Age • X months" metadata line. Right-aligned bold price. Below price: sparkline SVG (5-point path, green/red) + delta badge (e.g. "+₹3,200" in green). "Why this is moving" small chip (e.g. "High Demand").
4. **BuyerPortal.tsx** — In listing cards where IMEI is shown, render full 15-digit IMEI. Ensure every bento card, category card, and listing row has onClick → navigate to /listing/$id.
5. **ActivityPage.tsx** — Add "Watchlist" tab (star icon) alongside existing tabs. When selected, show the user's watchlist items (from context) as compact cards with device image, title, current price, and a star icon. Wire from same watchlist context as WatchlistPage.
6. **All countdown/timer components** — Add useEffect with setInterval(1000ms) refresh to ensure real-time ticking. Wire bid counts with a simulated +1 increment every 30-45s for demo realism.
7. **CreateListing.tsx** — Wire the camera/scanner icon on the IMEI field to actually invoke the browser's camera (getUserMedia or input[capture]) or use a BarcodeDetector API approach. Show scan overlay UI. Fallback to file input with capture=environment.
