# 77mobiles.pro

## Current State
Full B2B auction marketplace with Buyer/Seller portals, category navigation, listing detail pages, admin dashboard, market demand cards, and recent sales slider.

## Requested Changes (Diff)

### Add
- Verification HUD in ListingDetail: 4-card trust grid (Battery Health ring, IMEI masked, Cosmetic Grade pill, Functional Check)
- Auction Engine in ListingDetail: Bidding War alert banner, Dealer Leaderboard (top 5 anon bidders), sticky footer with +₹100/+₹500/+₹1000 quick-bid buttons
- Financial Transparency: Tiered sourcing fee calculator + GST 18% + TCS 1% in ListingDetail
- Admin Pulse Dashboard: Total Dealers, Active Auctions, Pending KYC, Weekly Volume chart
- Category Screen: When any category is tapped, navigate to a full dedicated screen with listing previews

### Modify
- Listing thumbnails: 1:1 square ratio, 16px radius container with #F4F7FF background, 1px inner stroke
- Fulfill Lead cards: decrease size (more compact/dense)
- RecentSalesSlider: change "Recently Sold on 77mobiles" to "Recently Sold on 77mobiles.pro"
- Admin dashboard: restore previous version with all functions working
- CategoryListingView: upgrade to full-screen dedicated page with better listing previews

### Remove
- Nothing

## Implementation Plan
1. Fix RecentSalesSlider title text
2. Make Fulfill Lead cards more compact
3. Upgrade CategoryListingView to a proper full-screen page with listing previews including photo frames
4. Add Verification HUD to ListingDetail
5. Add Auction Engine components (bidding war, leaderboard, quick-bid footer)
6. Add Sourcing Fee / Tax breakdown section
7. Add Admin Pulse Dashboard stats to AdminDashboard
8. Apply 1:1 square photo framing to listing cards throughout
