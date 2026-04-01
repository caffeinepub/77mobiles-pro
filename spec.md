# 77mobiles.pro

## Current State
- BuyerPortal: Has 3-tab switcher (Live Auctions, Direct Buy, Ending Soon). Grid view shows model, price, bids, timer but NOT brand, warranty, or condition. BENTO_12 items share listingIds (e.g., multiple items use 'b-1'). Market Demand cards are narrow (minWidth 105px). Currency artifacts `\u20B9` in GAMING_ITEMS, LAPTOP_ITEMS, etc.
- SellerPortal: Has a 'Sold History' button that shows sold listings inline. Grid view doesn't show brand, warranty, or condition.
- ListingDetail (BiddingCard): Increment buttons use template literal `+\u20B9{inc}` which renders as raw unicode. Bottom floating footer was previously removed. Bid input has placeholder `Min ₹{minBid}` and red border validation.
- BottomNav: Has Activity + Alerts (Bell) on the right side. Order: Home, Wallet, [Sell], Activity, Alerts.
- AppShell header: No bell icon in header.
- ListingDetail seller section: Has 'Manage This Listing' card with Edit Listing (blue) and Promote Listing (yellow) buttons + Current Bids section.

## Requested Changes (Diff)

### Add
- Bell icon with red dot badge in AppShell top header (Buyer portal only, top-right area near profile)
- Star (Watchlist) icon as 5th nav item replacing Alerts in BottomNav
- Mini bid history in seller detail card: High Bid, last 2-3 bids with timestamps, 'Waiting for first bid...' empty state
- Brand Name, Warranty (~8mo), Condition tags in Grid View cards (both portals)

### Modify
- BuyerPortal: Remove 'Direct Buy' tab, keep only 'Live Auctions' and 'Ending Soon'
- BuyerPortal: BENTO_12 items must use unique listingIds (b-1 through b-12)
- BuyerPortal Grid View: Add brand, warranty, condition to card body
- SellerPortal Grid View: Add brand/condition/warranty to card body (use listing.condition, listing.brand or model-derived brand)
- SellerPortal: Rename 'Sold History' button to 'Activity', onClick -> setActiveTab('activity') via useApp hook (navigate to activity tab, not inline sold history)
- Market Demand cards: Increase minWidth to ~calc(100vw / 2.5) approx 140-150px, increase internal padding to p-3, make price text larger (text-sm font-bold), make FULFILL LEAD button taller (py-1.5 text-[10px])
- BiddingCard increment buttons: Change `+\u20B9{inc}` to actual ₹ symbol using template literal with correct unicode or literal ₹
- ListingDetail seller management card: Remove 'Manage This Listing' header, remove 'Edit Listing' and 'Promote Listing' buttons, expand Current Bids to top with mini bid history
- BottomNav: Replace Alerts (Bell) with Watchlist (Star) as 5th item. Label = 'Watchlist'. Navigate to 'activity' tab (watchlist sub-section) or dedicated watchlist tab.

### Remove
- 'Direct Buy' tab option from BuyerPortal tab switcher
- 'Direct Buy' rendering block from BuyerPortal
- 'Edit Listing' and 'Promote Listing' buttons from ListingDetail seller section
- 'Manage This Listing' header label from ListingDetail
- Bell icon from BottomNav rightTabs

## Implementation Plan
1. **BottomNav.tsx**: Replace `Bell`/alerts with `Star`/watchlist. Import Star from lucide. Change rightTabs to: activity (Activity), watchlist (Watchlist, Star icon). Clicking watchlist sets activeTab to 'watchlist' or navigates to watchlist.
2. **AppShell.tsx**: Add Bell icon with red dot to the header branding bar, visible only in buyer mode. Wire to setActiveTab('alerts') or show unread badge.
3. **BuyerPortal.tsx**: 
   - Remove 'direct' from CategoryTab type and tab array
   - Remove Direct Buy rendering block
   - Fix BENTO_12 listingIds to be unique (b-1 through b-12)
   - Grid view card: add brand, warrantyMonths, condition
   - Navigation uses item.listingId (already correct after fix)
4. **SellerPortal.tsx**:
   - Change 'Sold History' button to 'Activity', onClick calls setActiveTab('activity') from useApp, remove soldHistoryVisible state logic
   - Grid view card: add condition badge and warranty
5. **ListingDetail.tsx**:
   - BiddingCard: Fix `+\u20B9` to `+₹` using literal rupee symbol
   - Seller management section: Remove header, remove Edit/Promote buttons, expand Current Bids with mock bid history
6. **SellerPortal.tsx Market Demand**: Increase card minWidth to 148px, padding to p-3, price text-sm font-black, button py-2 text-[9px] font-bold
