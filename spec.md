# 77mobiles.pro

## Current State
A fully-built B2B mobile auction marketplace with Buyer/Seller portals, Admin dashboard, wallet system, and category navigation. Royal Blue (#1D4ED8) theme, glassmorphic headers, horizontal category row in AppShell (buyer only), and a RecentSalesSlider with basic phone+price cards.

## Requested Changes (Diff)

### Add
- RecentSalesSlider: Enhanced cards with model+storage ("iPhone 15 Pro | 256GB"), condition+age metadata line ("Mint Condition • 3 months old"), green "Sold: ₹X" badge, and a verified checkmark icon
- AppShell: Scroll-direction detection to hide/show category bar (hide on scroll down, show on scroll up)
- WalletPage: Razorpay payment integration for Add Money (buyer portal only); load Razorpay checkout script
- BottomNav: "Alerts" tab item using Bell icon

### Modify
- **BottomNav**: Rearrange both buyer and seller nav to: Home | Wallet | SellButton | Activity | Alerts (remove Watchlist and Profile from nav tabs)
- **BuyerPortal**: Remove carousel slides b1, b2, b3 — keep only b4 and b5
- **AuthPage**: Change all login/register button colors from current (blue/green) to #007AFF to match logo color
- **SellerPortal**: Remove the "Move to 7-Day Auction" ghost button from all listing cards; make Market Demand cards more compact (reduce minWidth, font sizes)
- **WalletPage**: Import useApp, check mode; hide "Add Money" button when mode === "seller"
- **AdminDashboard**: (a) Remove mobile warning banner (`lg:hidden` amber div), (b) Remove `hidden lg:` from sidebar aside so it shows on mobile, (c) Wire "Add Banner" button with onClick that adds a new banner entry to state, (d) Increase all small button padding to min 44px touch targets
- **RecentSalesSlider**: Complete redesign of cards — add condition/age/storage fields, green sold badge, verified checkmark
- **SellerPortal Market Demand cards**: Convert badge tints to neutral gray (#F5F5F7), make cards more compact/high-density to save vertical space

### Remove
- BuyerPortal: Slides b1, b2, b3 from BUYER_CAROUSEL_SLIDES array
- SellerPortal: The entire "Move to 7-Day Auction" ghost button block in listing cards
- AdminDashboard: The mobile warning banner div
- WalletPage: "Add Money" button when mode === "seller"

## Implementation Plan
1. **BottomNav.tsx**: Restructure both buyer/seller tabs: Left=[Home, Wallet], Right=[Activity, Alerts]. Import Bell for alerts. Both portals use same structure.
2. **AppShell.tsx**: Add `scrollY` and `prevScrollY` tracking refs; derive `showCategories` boolean (true when scrolling up or near top < 80px); apply CSS transition to hide/show category section.
3. **BuyerPortal.tsx**: Delete b1, b2, b3 entries from BUYER_CAROUSEL_SLIDES.
4. **SellerPortal.tsx**: Remove ghost button block (lines 580-608 region). Reduce Market Demand card minWidth from 160px to 140px, font sizes down slightly.
5. **AuthPage.tsx**: Replace all button background styles/variants with `style={{ background: "#007AFF" }}`.
6. **WalletPage.tsx**: (a) Import useApp, read mode. (b) Wrap Add Money button in `{mode !== 'seller' && ...}`. (c) Add Razorpay integration: load script, on click open Razorpay checkout with test key and amount input flow.
7. **RecentSalesSlider.tsx**: Extend RECENT_SALES data with `storage`, `condition`, `age` fields. Redesign cards: title line (model | storage), subtitle (condition • age), green "Sold:" badge with CheckCircle icon.
8. **AdminDashboard.tsx**: Remove amber warning div, remove `hidden lg:` from aside, wire Add Banner onClick, update small button padding to `p-2.5 min-w-[44px] min-h-[44px]`.
