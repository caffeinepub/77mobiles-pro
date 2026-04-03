# 77mobiles.pro

## Current State

- Full-stack B2B electronics auction marketplace PWA
- React + TypeScript frontend, Motoko backend (ICP)
- Seller Portal, Buyer Portal, Admin Dashboard at `/admin`
- In-memory BidStore for real-time bid pub/sub
- In-memory AppContext for shared listings between portals
- AuthContext for local session management (localStorage)
- 20 demo listings in `demoListings.ts` (SELLER_LISTINGS) visible in both portals
- Admin Dashboard at `/admin` (PIN: 770777) with 6 modules + Portal Controls (slider management already present)
- GuidedDiagnostic with touch test (tap-to-color), camera/mic check, screen burn test
- Scanner in AppShell header uses BarcodeDetector API to scan barcodes into search
- Scanner in CreateListing uses BarcodeDetector for IMEI field
- IMEI API integration (DHRU) in CreateListing
- PWA: manifest.json, sw.js, Apple touch icon tags
- Firebase config references exist in AuthPage (mock OTP, phone auth)
- ProfilePage has Account + Help sub-pages; no Analytics view

## Requested Changes (Diff)

### Add
- **Firebase integration layer** (`src/frontend/src/lib/firebase.ts`): initialize Firebase app with the given config (mobilespro-19dd7), export `db` (Firestore), `auth` (Firebase Auth), `storage` (Firebase Storage). Add firebase packages to package.json.
- **FirestoreService** (`src/frontend/src/lib/firestoreService.ts`): helper functions for writing/reading Sellers collection (KYC docs), Users collection, Bids collection, banners collection. All writes include `created_at` timestamps.
- **Real-time Admin user feed**: Admin Dashboard Users section → replace static MOCK_USERS with a simulated real-time feed using `setInterval` (since we cannot actually connect to Firebase from Caffeine, simulate onSnapshot behavior with local state that updates every 15s with new pending registrations). Show a toast when a new user registers. Track `pendingCount` from pending KYC items.
- **KYC sync (Task 3)**: After OTP login success in AuthPage, immediately write a document to `sellers` collection with `{status:'pending', kyc_submitted:true, phone, documents:{pan_url:'',aadhaar_url:''}}` — use FirestoreService (graceful fallback if Firebase unavailable).
- **User Analytics dashboard (Task 4)**: Add an `analytics` view to ProfilePage accessible from the Profile settings list as "My Analytics". Seller view: Total Listings, Active Auctions, Sold Items, Total Revenue cards + bar chart of last 7 days activity. Buyer view: Total Bids Placed, Auctions Won, Total Spent cards + activity chart. Time filter: 7 Days / 30 Days / All Time tabs. Use Recharts (already available via shadcn chart component) or simple CSS bars if not available.
- **iOS Chrome Safari redirect guide (Tasks 6 & 7)**: Create `src/frontend/src/components/IOSInstallGuide.tsx`. Detect `CriOS` in userAgent + iOS + not in standalone mode. Show a bottom-sheet overlay: "To install 77mobiles.pro as an app, please open this page in Safari." Include Safari icon (SVG), 3-step animated guide (Share → Add to Home Screen), Copy Link button (copies current URL), and dismiss/close button. Hide when already in standalone. Mount in `main.tsx` or `App.tsx` outside router.
- **Slider Management in Admin sidebar (Task 14)**: Ensure "Slider Management" appears as a child nav item under "Portal Controls" in the AdminDashboard sidebar. Verify it is already rendered and accessible — if missing from sidebar nav, add it. The banners section already exists at line 2079 but needs to be listed in sidebar under Portal Controls.
- **Touch Test Samsung-style pan (Task 11)**: Refactor GuidedDiagnostic Step 1 (Touch Test, step index 1) to use `onTouchMove`/`onPointerMove` events instead of `onClick`. As finger drags, hit-test each grid square coordinate and turn it green. Use smaller squares (32px). Auto-advance to step 2 when all squares are green (with vibration haptic).
- **IMEI success card (Task 9)**: In CreateListing, after IMEI API returns a successful match, show a green "Device Details" card below the IMEI field with Brand, Model, Storage/Color. Clear error on new IMEI input. If response is null → show nothing; error → show red error box; success → show green card.
- **Demo mode removal / live listings (Task 10)**: In `demoListings.ts`, add `isDemo` flag (already present). In SellerPortal, allow filtering to show only `!isDemo` listings when `sharedListings` has entries from real user posts. When a seller publishes a listing via CreateListing, it goes into `sharedListings` in AppContext (already implemented via `addSharedListing`). Remove demo data from both portals when user has posted at least one real listing — or keep demo listings but clearly mark them as "Demo" in seller portal. For real-mode testing: add a toggle in SellerPortal header to "Hide Demo Listings" that filters out `isDemo: true` items.

### Modify
- **AppShell scanner (Task 5)**: The scanner icon button already calls `setShowScanner(true)` and starts getUserMedia — but the scanner overlay only populates `setSearchQuery`. Verify the button `data-ocid="header.camera.button"` click handler properly opens the camera. If BarcodeDetector is not supported, show a fallback modal with a manual IMEI input field. Also add scanner button to SearchOverlay if not already present.
- **Admin Dashboard (Tasks 1, 12, 13)**: 
  - Dashboard stats cards: replace hardcoded "4" Users count with `pendingKycCount` from simulated real-time listener
  - Users section: add KYC Status filter tabs (All / Pending / Verified / Rejected). Show pending count badge on Users nav item in sidebar
  - Red notification badge on top nav shows pending KYC count (not hardcoded "4")
  - All admin user data pulls from `adminUsers` state that auto-updates
  - Approve button on KYC items changes status to 'verified' instantly and shows success toast
  - Slider Management nav link visible under Portal Controls in sidebar
- **AdminDashboard Portal Controls section**: Make "Slider Management" appear as a distinct nav entry in sidebar, not just a sub-section. Add it as its own `AdminSection` type value `"slider-management"` or as a clickable item within Portal Controls that jumps to that section.
- **Manifest + icons (Task 8)**: Update `manifest.json` to ensure `"purpose": "any maskable"` for all icons, `background_color: "#1D4ED8"`. No changes to icon images (already generated). Update `index.html` if needed.
- **AuthPage Firebase wiring (Task 2)**: Import FirestoreService, after successful OTP login write user doc to Firestore `users` collection with `{isVerified: false, phone, role}`. Check `isVerified` field: if false, redirect to pending screen (already done). After admin approval (simulated), set `isVerified: true` and navigate to app.
- **ProfilePage**: Add "My Analytics" menu item in settings list (between My Account and Help & Support) that opens the analytics sub-view.

### Remove
- No removals — all existing features retained.

## Implementation Plan

1. Create `src/frontend/src/lib/firebase.ts` with Firebase config initialization (safe — if import fails gracefully, app still works)
2. Create `src/frontend/src/lib/firestoreService.ts` with helper write/read functions (all wrapped in try/catch)
3. Update AdminDashboard:
   - Add `slider-management` to NAV_ITEMS or as sub-item under portal-controls
   - Replace hardcoded user count with simulated real-time `pendingKycCount` state
   - Add KYC filter tabs in Users section
   - Wire Approve button to update local state and show toast
   - Dynamic red badge showing pending count
4. Update GuidedDiagnostic Touch Test to Samsung pan-draw style (onPointerMove, smaller grid, auto-advance)
5. Update CreateListing IMEI section: conditional rendering for null/error/success states with Device Details card
6. Add IOSInstallGuide component and mount it in App.tsx
7. Update ProfilePage: add "My Analytics" option, create analytics sub-view with Seller/Buyer stats and 7/30/All filter
8. Update AuthPage: write to Firestore users collection on OTP success (graceful fallback)
9. Verify scanner in AppShell works; add fallback for browsers without BarcodeDetector
10. Update manifest.json maskable purpose field
11. In SellerPortal: add "Hide Demo Listings" toggle, wire it to filter out `isDemo` items
12. Validate and build
