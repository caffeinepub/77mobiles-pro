# 77mobiles.pro

## Current State
- AdminDashboard.tsx: existing admin panel with some modules but outdated design
- AuthPage.tsx: login/register uses #007AFF blue buttons
- CreateListing.tsx: listing form uses #002F34 (Deep Teal) as primary color
- BottomNav.tsx: right tabs are Activity + Watchlist (Star icon)
- AppShell renders WatchlistPage for 'watchlist' tab
- AppContext AppTab type includes 'watchlist' and 'alerts'
- SellerPortal shows both buyer and seller nav

## Requested Changes (Diff)

### Add
- New full-featured AdminDashboard.tsx with Deep Navy & Electric Blue theme (#0F172A navy, #3B82F6 electric blue)
- Admin panel sections: Dashboard (4 stats + live bid feed), User Management (searchable table, KYC, action buttons), Inventory/Auction Control (listing approval queue, auction manipulation), Financial/Escrow Tracking (transaction log, escrow monitor, dispute resolution), Market Trends & Analytics (demand heatmap, price benchmarking), Settings
- Sidebar navigation with icons for: Dashboard, Users, Listings, Payments, Diagnostics, Settings
- Global search bar at top (by IMEI, Model, Dealer ID)
- MFA login screen for admin (PIN-based)
- System Audit Log tab
- In SellerPortal BottomNav: replace Watchlist tab with Alerts tab (Bell icon)

### Modify
- AdminDashboard.tsx: completely replace with new design
- AuthPage.tsx: change all #007AFF to #1D4ED8 (logo blue) throughout buttons, icons, borders, text
- CreateListing.tsx: change primary accent color to #1D4ED8 (logo blue) for progress bars, active borders, buttons, step indicators
- BottomNav.tsx: for seller mode, replace 'watchlist' tab with 'alerts' tab (Bell icon, label 'Alerts')
- AppShell.tsx: render AlertsPage for 'alerts' tab in seller mode (already exists), hide watchlist for seller

### Remove
- Old AdminDashboard content
- Watchlist tab from seller portal bottom nav

## Implementation Plan
1. Replace AdminDashboard.tsx with a comprehensive new admin panel (Deep Navy sidebar + Electric Blue accents, all 6 modules, MFA login, audit log, mock data)
2. Update AuthPage.tsx: replace all #007AFF with #1D4ED8
3. Update CreateListing.tsx: replace primary color with #1D4ED8
4. Update BottomNav.tsx: in seller mode, swap watchlist → alerts (Bell icon)
5. Update AppShell.tsx: in seller mode render AlertsPage for 'alerts' tab instead of WatchlistPage for 'watchlist'
