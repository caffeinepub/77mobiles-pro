# 77mobiles.pro — Batch Update (Tasks 1-15)

## Current State
PWA with Seller, Buyer, and Admin portals. Auth uses localStorage. Bottom nav has existing safe-area CSS. Login is phone-only (no password). Diagnostic flow is visible. IMEI API is wired but removable. Listing cards show Verified badge. CreateListing has simple condition buttons and no country/bill status fields. AdminDashboard has bell icon but inactive; KYC cards show mock data. Profile page has basic analytics stub.

## Requested Changes (Diff)

### Add
- IndexedDB session store for auth persistence (Task 1)
- Service worker skip-waiting + session-safe update flow (Task 1)
- Password field to registration and login forms; email-mapped Firebase Auth pattern (Task 2)
- 100dvh container, content-box nav, env() safe-area, margin-bottom scroll offset (Task 3)
- Auction winner auto-select logic + in-app + WhatsApp notifications (Task 5)
- KYC doc lightbox modal in AdminDashboard (Task 7)
- Bell notification panel with real-time alerts in admin header (Task 8)
- Profile mini-dashboard with 2x2 analytics grid (Task 9)
- Multi-select condition chips, bill status section, country searchable dropdown (Tasks 14-15)
- Comprehensive device catalog (Apple/Samsung/OnePlus up to 2026) (Task 13)

### Modify
- sw.js: bump cache version, add skip-waiting message handler (Task 1)
- manifest.json: stable start_url="/" (already correct, verify)
- AuthContext: persist session in IndexedDB instead of localStorage (Task 1)
- AuthPage: replace OTP-only login with phone+password single box; add password field to registration (Task 2)
- BottomNav + AppShell: 100dvh, content-box, env(safe-area-inset-bottom,20px) (Task 3)
- AppContext/SellerPortal/BuyerPortal: isDemoMode default false, remove demo banners (Task 4)
- AdminDashboard: real-time KYC doc modal, full field display, bell panel (Tasks 7-8)
- ListingDetail + BuyerPortal + SellerPortal: remove Verified/usbVerified badge (Task 12)
- CreateListing: hide diagnostic button, remove IMEI lookup, add comprehensive device list, multi-select condition chips, bill status, country selector (Tasks 10-11, 13-15)

### Remove
- Demo mode top banner (yellow DEMO MODE bar) (Task 4)
- GuidedDiagnostic trigger button in CreateListing (Task 10)
- IMEI API call / imeicheck.com fetch logic (Task 11)
- usbVerified / Verified badge from listing cards and detail pages (Task 12)

## Implementation Plan
1. Update sw.js with skip-waiting handler + bumped cache name
2. Update AuthContext to use IndexedDB with localStorage fallback
3. Rewrite AuthPage login to phone+password, add password fields to registration forms
4. CSS triple-lock in index.css and BottomNav
5. Remove demo banner from AppContext/AppShell; set isDemoMode default to false
6. Auction winner automation in AuctionTimer/BidStore
7. Admin KYC modal + bell notification panel
8. Profile analytics mini-dashboard
9. CreateListing: hide diagnostic, remove IMEI, add comprehensive models, multi-select condition chips, bill status, country selector
10. Remove Verified badges from ListingDetail and BuyerPortal
