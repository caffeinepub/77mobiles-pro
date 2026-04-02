# 77mobiles.pro

## Current State
Full B2B auction marketplace with Buyer/Seller portals, AppShell, BottomNav, ListingDetail, WalletPage, and AdminDashboard. Bottom nav has Home/Wallet/Sell/Activity/Alerts. Header has Bell icon for buyer. Admin panel is dark navy themed.

## Requested Changes (Diff)

### Add
- Dynamic `Estimated Total Payable` breakdown below Place Bid button (real-time as user types): Bid Amount, Sourcing Fee ₹1500, GST 18% on fee, 1% TCS on bid, Total Payable
- Watchlist tab in buyer bottom nav (Star icon, replaces Wallet slot)
- Wallet icon in buyer header (replaces Bell)
- Admin panel slider controls for both buyer/seller portal settings
- Real-time bid update when a bid is placed (currentBid state updates)

### Modify
- **Task 1**: BuyerPortal listing cards must navigate to `/listing/${listing.listingId}` (fix navigation to use listingId not index)
- **Task 2**: List and Grid views in both portals must show identical info (brand, condition, warranty, price, status, verified badge, timer)
- **Task 3**: In AppShell header (buyer only), remove Bell icon, add Wallet icon that navigates to wallet tab
- **Task 4**: In BottomNav buyer mode, replace Wallet slot with Watchlist (Star icon, label "Watchlist", navigates to watchlist tab)
- **Task 5**: BiddingCard min increment ₹500; validation error "Minimum bid increment is ₹500"; quick buttons +₹500, +₹1,000, +₹2,000
- **Task 7**: After placing bid, update `currentBid` state to reflect new bid amount
- **Task 9**: Scanner icon in search bar should launch BarcodeDetector camera; search overlay scanner button must actually open camera
- **Task 10a**: AdminDashboard switch from dark navy to light mode (white/light grey surfaces, blue accents)
- **Task 10b**: Add portal slider controls section in admin panel
- **Task 12**: WalletPage - fix all \u20b9 to ₹; simplify transaction labels; move dates to grey sub-text; color code +/-; buyer escrow remove sub-text; seller: "Balance"/"Ready for Payout"; seller transaction labels simplified

### Remove
- **Task 8**: Remove Fee & Tax Summary section from ListingDetail (the static bottom chart section, buyer view only — keep the dynamic breakdown from Task 6)
- Bell icon from buyer header
- Wallet slot from buyer bottom nav

## Implementation Plan
1. Fix BuyerPortal listing click navigation (Task 1)
2. Sync List/Grid metadata in both portals (Task 2)
3. Header: replace Bell with Wallet icon in buyer (Task 3)
4. BottomNav: buyer replaces Wallet with Watchlist star (Task 4)
5. BiddingCard: ₹500 min increment, +500/+1000/+2000 buttons, validation message (Task 5)
6. BiddingCard: add real-time Estimated Total Payable breakdown below Place Bid (Task 6)
7. BiddingCard: after placing bid, update currentBid state (Task 7)
8. ListingDetail: remove static Fee & Tax Summary section (Task 8)
9. AppShell SearchOverlay scanner: launch BarcodeDetector camera (Task 9)
10. AdminDashboard: convert to light mode (Task 10a)
11. AdminDashboard: add portal slider controls (Task 10b)
12. WalletPage: full cleanup - ₹ symbols, labels, sub-text dates, colors (Task 12)
