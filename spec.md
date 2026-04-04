# 77mobiles.pro Admin Panel Upgrade

## Current State
- Admin Dashboard at `/admin` (PIN: 770777) is fully functional with light mode.
- User Management (`users` section) shows a unified list from localStorage (`77m_kyc_submissions`) with a single filter dropdown (All/Pending/Verified/Rejected) and basic user cards.
- The section has no role-based tab separation — sellers and buyers appear in the same list.
- User cards show name, phone, business, location and doc type, but no password reset option.
- Reject action is a basic inline select; no reason-prompt dialog.
- Mock data arrays exist at the top of AdminDashboard.tsx: MOCK_USERS, MOCK_KYC, MOCK_BIDS, MOCK_LISTINGS, MOCK_AUCTIONS, MOCK_TRANSACTIONS, MOCK_ESCROW, MOCK_DISPUTES, MOCK_HEATMAP, MOCK_BENCHMARKS, MOCK_AUDIT.
- Live feed still uses MOCK_BIDS.
- PWA icons show '77' already in manifest, but generated icon may only show '7'.

## Requested Changes (Diff)

### Add
- **Two-tab navigation** inside the `users` section: "Seller Verification" tab and "Buyer Verification" tab.
- **Tab counts** showing pending count per role, e.g. "Sellers (3 Pending)".
- **Full detail modal** when clicking a user card:
  - Profile section: Full Name, Phone Number, Password (masked + Reset button).
  - Business Info section: Business Name, City, Role (Seller/Buyer).
  - Documents section: Document type label (PAN Card / GST Certificate) with "View Doc" button that opens the stored URL or shows a placeholder if empty.
- **Reject reason dialog**: When clicking Reject, show a modal/prompt asking for a reason (preset options + free text), then confirm the rejection.
- **New PWA icons** with bold '77' text centered on royal blue background for all sizes (512x512, 192x192, 180x180 Apple).
- **Firebase Firestore wiring**: Query `Users` collection with `.where('role', '==', 'seller')` for Seller tab and `.where('role', '==', 'buyer')` for Buyer tab, falling back to localStorage if Firestore unavailable.

### Modify
- Split `users` section UI from a single unified list to two tabs (Sellers / Buyers), each with their own filter and search.
- Pending users sort to top within each tab (newest first).
- Remove MOCK_USERS array from dashboard stats — replace with real counts from localStorage/Firestore.
- Remove MOCK_BIDS from live feed — replace with real bids from localStorage `77m_bids` or show empty state.
- Remove MOCK_LISTINGS and MOCK_AUCTIONS from listing/auction sections — replace with real data from localStorage `77m_listings` or show empty state.
- Remove MOCK_TRANSACTIONS and MOCK_ESCROW from payments section — replace with real data from localStorage `77m_wallet_transactions` or show empty state.
- Dashboard stats (Active Auctions, Total Revenue, Pending Verifications, User Growth) should derive from real localStorage data.
- AuthPage registration must also save `role` field ('seller'/'buyer') into the `77m_kyc_submissions` entry for proper tab separation.

### Remove
- Remove MOCK_DISPUTES hardcoded data from payments section.
- Remove MOCK_HEATMAP and MOCK_BENCHMARKS static data — replace with data derived from real listings.
- Remove MOCK_AUDIT static entries — keep the audit log but seed it from admin actions.

## Implementation Plan
1. Update `AuthPage.tsx`: add `role: 'seller'` to seller KYC submission and `role: 'buyer'` to buyer KYC submission in localStorage.
2. Update `AdminDashboard.tsx`:
   a. Add `userTab` state (`'seller' | 'buyer'`) to control which tab is active.
   b. In the `users` section, render two tab buttons (Seller Verification / Buyer Verification) with pending count badges.
   c. Filter `kycItems` by `role` field in addition to kycFilter.
   d. Add `selectedUser` state and a detail modal that shows Profile / Business / Documents sections.
   e. Add `rejectTarget` state and a reject-reason modal with preset options.
   f. Replace MOCK_BIDS with `bidStore` from localStorage (`77m_bids`), with empty state fallback.
   g. Replace MOCK_LISTINGS/MOCK_AUCTIONS with data from localStorage `77m_listings`.
   h. Replace dashboard stat cards with values derived from localStorage.
   i. Generate new '77' PWA icons.
3. Update manifest.json and index.html to point to new icons with cache-busting.
