# 77mobiles.pro

## Current State
Full B2B electronics auction marketplace with Seller and Buyer portals, listing detail, alerts, wallet, activity, and market trends pages. Data uses demo listings with shared state. Currency rendered via unicode escapes in some places. Sparklines in Market Trends. No view toggle for listing grids. Market Demand lacks View All. Watchlist exists in Activity. Listing detail has a sticky quick-bid footer with increment buttons. Alerts page buttons are styled but not wired to navigation.

## Requested Changes (Diff)

### Add
- View toggle (List/Grid) at top of Seller "My Listings" and Buyer search/listing results
- "View All →" link in Market Demand section header (matching Recent Sales style)
- Market Demand "View All" full page (MarketDemandPage) listing all demand leads
- Dynamic bid input: pre-fill with base price (no bids) or highBid + 100 (if bids exist)
- Bid input validation: red border + disabled button if amount < current high bid
- Route /market-demand page for all leads

### Modify
- Replace ALL \u20b9 and \u20B9 unicode escapes with literal ₹ symbol throughout: WalletPage, MarketTrendsPage, SellerPortal, BuyerPortal, ListingDetail, RecentSalesSlider, demoListings, ActivityPage
- MarketTrendsPage: Remove sparkline graphs and Sparkline component, remove price-change delta text (+₹X) from each card
- ListingDetail: Remove the sticky bottom footer bar with quick-increment buttons (+₹100, +₹500, +₹1,000) and secondary Place Bid button. Add 24px bottom padding so content can scroll fully. Implement smart bid input placeholder.
- AlertsPage: Wire all action buttons to navigate to relevant routes ("View Auction" → /listing/b-1, "View Lead" → /app, "View Receipt" → /app, "Place Bid" → /listing/b-2 etc.)
- ActivityPage: Remove the Watchlist sub-tab and watchlist section entirely from both buyer and seller mode
- AppContext: Remove watchlist-related state (watchlist, toggleWatchlist, isWatchlisted) OR keep but just hide from UI
- SellerPortal: Add "View All →" button to Market Demand section header. Add listing count "8 total" secondary text next to "My Listings". Add List/Grid view toggle.
- BuyerPortal: Add List/Grid view toggle for auction listings. 
- RecentSalesSlider / SellerPortal: Wire recently sold data to use SELLER_LISTINGS with status=="Sold" dynamically, plus any new listings created in session
- AppContext: Add shared listings state so newly created listings appear in buyer portal immediately
- CreateListing: On submit success, add the new listing to the shared listings state

### Remove
- Watchlist tab from Activity page (both buyer and seller)
- Sparkline component and sparkline rendering from MarketTrendsPage
- Price delta text (e.g., "+₹3,200") from MarketTrendsPage cards
- Sticky quick-bid footer from ListingDetail

## Implementation Plan
1. Fix all \u20b9 → ₹ in all files
2. Update MarketTrendsPage: remove Sparkline, remove price delta row, remove TrendingUp/TrendingDown delta display
3. Remove watchlist tab from ActivityPage
4. Add view toggle state + List/Grid rendering to SellerPortal (My Listings) and BuyerPortal (auction listings)
5. Add "View All →" to Market Demand section in SellerPortal and BuyerPortal
6. Create MarketDemandPage at /market-demand with all leads
7. Wire alerts buttons in AlertsPage using useNavigate
8. Remove sticky footer from ListingDetail, add bottom padding, implement smart bid input
9. Add shared listings context in AppContext, wire CreateListing to add to it, wire BuyerPortal to show shared listings
10. Update RecentSalesSlider to use SELLER_LISTINGS Sold items + shared sold items as data source
