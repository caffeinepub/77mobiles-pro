# 77mobiles.pro

## Current State
Full-stack PWA B2B electronics auction marketplace. Frontend is React/TypeScript with Tailwind. Key files: BottomNav.tsx, AuthPage.tsx, AdminDashboard.tsx, SellerPortal.tsx, WalletPage.tsx, SearchOverlay.tsx, BidStore.ts, index.css.

## Requested Changes (Diff)

### Add
- Login screen: 'Login as Seller' / 'Login as Buyer' role toggle with session persistence (localStorage)
- Search scanner: wire `onClick` on the ScanBarcode icon in SearchOverlay to open camera BarcodeDetector flow (same as IMEI scanner)
- Wallet demo mode: add mock transaction state mutations so Add Money / Withdraw buttons work in demo
- Seller listing cards: show current high bid amount on each card in My Listings section

### Modify
- **BottomNav**: set `z-index: 9999`, use `100svh` instead of `100vh` for any viewport-height references, ensure the outer nav uses `paddingBottom: calc(env(safe-area-inset-bottom) + 8px)` so content clears home bar on iPhone; remove any `margin-bottom` conflict on the nav container itself; ensure the main scrollable content has `padding-bottom` equal to nav height + safe-area
- **index.css**: replace all `100vh` / `min-height: 100vh` with `100svh`; add `.pb-safe-nav { padding-bottom: calc(80px + env(safe-area-inset-bottom)); }` utility; ensure html/body have `height: 100%` not `100vh`
- **AuthPage login flow**: add Seller/Buyer toggle tabs; on login, normalize phone by stripping/adding +91 before localStorage lookup; read `77m_role` from storage for auto-routing; persist role on successful login
- **AdminDashboard Users section**: merge `pending` sub-tab and main user table into a single unified table; add Filter dropdown (All / Pending / Verified / Rejected); sort pending to top; show color-coded badges (yellow=Pending, green=Verified, red=Rejected); keep Approve/Reject inline buttons only for pending rows; show Full Name + Phone (not UID) in the KYC cards
- **AdminDashboard KYC cards**: map `data.name` and `data.phone_number` fields instead of doc ID; add Business Name + Location fields; fix View Document button to use download URL (open in new tab); use `onSnapshot` listener for real-time refresh
- **BidStore / SellerPortal**: ensure `subscribeBids` fires correctly and SellerPortal listing cards subscribe to the BidStore and re-render with latest `current_high_bid` when a bid is placed in buyer portal
- **WalletPage**: in demo mode (isDemoMode from localStorage), wire Add Money button to add mock ₹5,000 to local balance state and push a mock transaction entry; wire Withdraw to deduct and push transaction

### Remove
- Separate 'Users' and 'KYC Verification' navigation buttons in Admin — replace with single 'User Management' entry

## Implementation Plan
1. Fix BottomNav z-index to 9999, padding-bottom with safe-area, no margin-bottom conflict
2. Fix index.css: replace vh with svh for containers, add pb-safe-nav utility
3. Fix AuthPage: add Seller/Buyer toggle, normalize +91 prefix, persist role
4. Fix AdminDashboard Users+KYC: unified table, filter dropdown, sorted pending, real field names
5. Fix SellerPortal listing cards: subscribe to BidStore per listing and display current_high_bid
6. Fix BidStore to emit updates that SellerPortal subscribes to correctly
7. Fix WalletPage demo mode: mock add/withdraw transactions
8. Fix SearchOverlay scanner: wire ScanBarcode button onClick to BarcodeDetector camera flow
