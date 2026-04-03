# 77mobiles.pro

## Current State
- Registration flow (`AuthPage.tsx`) redirects users directly to `/app` after clicking Register as Seller/Buyer, bypassing verification
- No `/pending-verification` route or screen exists
- `router.tsx` has no auth guard checking `isVerified` status before allowing access to `/app`
- `AuthContext.tsx` stores user but has no `isVerified` field in the profile
- Bid placement in `ListingDetail.tsx` uses `toast.success("Bid placed! (Demo mode)")` in catch block
- BidStore pub/sub exists but real-time pulse animation on price update is missing
- IMEI API in `CreateListing.tsx` calls `dhru.checkimei.com` — needs to also handle `alpha.imeicheck.com/api/php-api/create` endpoint format with polling
- `WalletPage.tsx` and `PlatformFeeCard.tsx` still have `\u20b9` raw Unicode strings instead of ₹
- No global Demo Mode toggle with admin visibility
- App icons exist but use old naming; `manifest.json` needs versioned icon paths
- `index.css` is missing `overflow-x: hidden`, `overscroll-behavior-y: contain`, GPU acceleration CSS
- No `/pending-verification` route in `router.tsx`

## Requested Changes (Diff)

### Add
- `PendingVerificationPage.tsx` — full-screen shield/clock centered layout, Firestore-like `onSnapshot` polling every 5s on localStorage, auto-redirect on status → verified, Contact Support + Sign Out buttons
- `PrivateRoute.tsx` wrapper component — checks `isVerified` from AuthContext/localStorage, redirects to `/pending-verification` if false
- `/pending-verification` route in `router.tsx`
- `isDemoMode` global toggle in `AppContext.tsx` — persisted to localStorage, visible only when admin PIN is set in session
- Demo Mode badge visible in both portals when active
- Demo Mode settings panel in Admin Dashboard (Settings tab)

### Modify
- `AuthContext.tsx` — add `isVerified: boolean` and `verificationStatus: 'pending' | 'verified' | 'rejected'` to user profile and state
- `AuthPage.tsx` — after `handleRegisterSeller` and `handleRegisterBuyer`, instead of `goToApp()`, write profile with `isVerified: false` / `verificationStatus: 'pending'` to localStorage and navigate to `/pending-verification`. Login flow: check stored verificationStatus, redirect to `/pending-verification` if not verified.
- `router.tsx` — `/app` route uses `PrivateRoute` wrapper. Add `/pending-verification` route. Guard all protected routes.
- `ListingDetail.tsx` — remove `(Demo mode)` text from toast in catch block. In demo mode (global flag), show Demo banner. In live mode, write to real BidStore only.
- `ListingDetail.tsx` — add pulse/green-highlight animation class on `liveBid` change (2-second green flash on price display)
- `WalletPage.tsx` — replace all `\u20b9` with `₹`
- `PlatformFeeCard.tsx` — replace all `\u20b9` with `₹`
- `CreateListing.tsx` — update IMEI API: if demo mode, skip API call; if live mode, use `alpha.imeicheck.com/api/php-api/create?key=...&service=11&imei=...` with 3s polling fallback, show specific error message from API response
- `index.css` — add `overflow-x: hidden`, `overscroll-behavior-y: contain`, `-webkit-overflow-scrolling: touch` to html/body; add `backface-visibility: hidden`, GPU `translate3d(0,0,0)` to global `*`
- `manifest.json` — update icon paths with `?v=2` cache-busting, ensure `purpose: maskable`
- `index.html` — bump service worker version hint (add `?v=2` to sw.js registration)
- `AppContext.tsx` — add `isDemoMode: boolean`, `setIsDemoMode` to context
- `AdminDashboard.tsx` — add Demo Mode toggle in Settings section, updates global localStorage flag

### Remove
- `(Demo mode)` text from bid success toast in `ListingDetail.tsx` catch block (when demo mode is OFF)

## Implementation Plan
1. Update `AuthContext.tsx` — add `isVerified`, `verificationStatus` fields, expose `setVerified` helper
2. Update `AuthPage.tsx` — register flows write `isVerified: false`, navigate to `/pending-verification` not `/app`; login flow checks stored status
3. Create `PendingVerificationPage.tsx` — shield icon, heading, subtext, Contact Support + Sign Out, 5s polling via `setInterval` on localStorage, auto-redirect with success toast when verified
4. Create `PrivateRoute.tsx` — checks `isVerified`, redirects unverified users to `/pending-verification`
5. Update `router.tsx` — add `/pending-verification` route, wrap `/app` with auth guard logic
6. Update `AppContext.tsx` — add `isDemoMode` global state from localStorage
7. Update `AdminDashboard.tsx` — Demo Mode toggle in Settings
8. Update `ListingDetail.tsx` — remove `(Demo mode)` from toast, add pulse animation on price update, respect `isDemoMode`
9. Update `WalletPage.tsx` + `PlatformFeeCard.tsx` — replace `\u20b9` with ₹
10. Update `CreateListing.tsx` — IMEI API switched to `alpha.imeicheck.com` format, poll logic, specific error messages, skip if demo mode
11. Update `index.css` — add scroll/GPU stability CSS
12. Update `manifest.json` + `index.html` — icon versioning, SW bump
13. Generate new '77' centered icons (192, 512, 180)
