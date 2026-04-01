# 77mobiles.pro

## Current State
Full-featured B2B auction marketplace with Buyer/Seller portals, AppShell with frosted glass header, horizontal category scroll, bento grid listings, BottomNav with wallet/activity tabs, carousel slides, RecentSalesSlider, and CreateListing flow. The search bar in AppShell is a simple text input. Category icons use generated PNG images. The Activity tab in BottomNav shows a red dot badge when `unreadAlerts > 0`. No admin portal exists.

## Requested Changes (Diff)

### Add
- **SearchPage**: Full-screen search overlay with: barcode/IMEI scanner button, type-ahead suggestions split into "Live Matches" vs "Recently Sold" sections, results page with 3 tabs (Live Inventory / Market Trends / Buyer Leads), category filter chips, and sort options ("Ending Soon" / "Highest Demand")
- **Admin Dashboard** (`/admin` route): Desktop-optimized, protected by a Super-Admin password (hardcoded PIN for demo). Modules: Pulse (global stats), Dealer Verification (KYC list), Auction Moderation (live monitor), Wallet (escrow/withdrawals), CMS (banner management), Audit Log (read-only). RBAC with Super-Admin and Moderator roles. Visible at /admin with a login gate.
- SVG line-art icons for category cards (Smartphones, Laptops, Tablets, Watches, Parts/Accessories) as inline SVG components — Brand Blue (#1D4ED8) when active, grey (#9CA3AF) when inactive

### Modify
- **AppShell search bar**: Replace static placeholder with "Search Model, Brand, or IMEI"; make the camera/barcode button open the new SearchPage overlay; tapping the search input opens SearchPage in focused state
- **BottomNav Activity icon**: Remove any hardcoded "0" text; ensure badge is only shown when `unreadAlerts > 0`; add pulse animation on badge for high-priority events; ensure icon/label vertical alignment and font size matches other nav items
- **CategoryCard in AppShell**: Use inline SVG glyphs instead of `<img>` tags; active = Brand Blue, inactive = grey

### Remove
- Any hardcoded badge counter "0" on Activity nav item
- Placeholder question mark icons from category tiles

## Implementation Plan
1. Create `src/frontend/src/components/SearchOverlay.tsx` — full-screen overlay with barcode icon button, search input (auto-focused), type-ahead suggestions ("Live Matches" / "Recently Sold" sections using mock data), results split into 3 tabs with category filter chips and sort toggle
2. Create `src/frontend/src/components/CategorySvgIcons.tsx` — inline SVG components for each category; accepts `active: boolean` prop
3. Update `AppShell.tsx` — change search placeholder, wire search input tap to open SearchOverlay, replace `<img>` category icons with SVG components
4. Update `BottomNav.tsx` — verify no hardcoded "0"; add `animate-ping` ring on badge for high-priority (badge > 1); fix vertical centering
5. Create `src/frontend/src/pages/AdminDashboard.tsx` — desktop layout, login gate (PIN: 77admin), tabs for Pulse / Dealers / Auctions / Wallet / CMS / Audit Log; mock data for all modules
6. Add `/admin` route to `router.tsx`
