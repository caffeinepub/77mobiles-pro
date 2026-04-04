# 77mobiles.pro

## Current State

- Full B2B mobile marketplace PWA with Seller Portal, Buyer Portal, and Admin Panel
- CreateListing form uses static BRANDS/MODELS arrays and MODEL_SPECS lookup tables — no API integration
- PostLeadModal has plain text inputs for Device Model, Quantity, Budget with no API-driven dropdowns
- BottomNav is `position: fixed; z-index: 9999` but PostLeadModal has `z-index: 51`, causing nav bar overlap
- AuthContext persists session in IndexedDB + localStorage but does not store `userRole`/`isVerified` for fast UI pre-render
- BidStore tracks bids in-memory; SellerPortal subscribes and updates listing cards in real-time
- BuyerPortal and SellerPortal listing cards show base price; high bid already propagated via BidStore but dynamic price label/color is not applied to all contexts
- ListingDetail shows `batteryHealth` from listing object but ProductSpecs section correctly shows `listing.batteryHealth.toString()%`; Device Verification circle uses `Number(listing.batteryHealth) || 87` fallback (wrong default, should be N/A)
- No GSMArena RapidAPI integration anywhere
- market_leads: buyer leads saved locally in PostLeadModal, not persisted to a shared collection
- No global onSnapshot listener for buyer leads on seller side

## Requested Changes (Diff)

### Add
- `src/frontend/src/utils/rapidApi.ts` — GSMArena RapidAPI helper with debounced search and device detail fetch
- Battery Health (%) field in CreateListing Step 4 (below How Old)
- Global market_leads store in AppContext for buyer leads shared across portals
- Per-listing real-time price labels ("Current Bid" in blue, "Base" in default) on BuyerPortal home cards
- UID saved on all newly created listings/bids/leads

### Modify
- `CreateListing.tsx` Step 2 (model selection): replace static list with RapidAPI searchable dropdown with 500ms debounce; auto-fill brand/model/storage/color; show stock image preview; add battery_health state field
- `PostLeadModal.tsx`: replace plain model text input with API-driven brand dropdown + searchable model dropdown; enforce numeric-only for qty/budget; disable Post button until valid; hide BottomNav when modal is open; set z-index 9999 on modal
- `BottomNav.tsx`: lower z-index to 9990; hide when a modal is active (via AppContext flag)
- `AuthContext.tsx`: on login, also save `userRole` and `isVerified` to localStorage as fast-access keys
- `BuyerPortal.tsx`: listing cards show dynamic price — highest bid in blue with "Current Bid" label, or base price; use BidStore.subscribeAllBids for real-time updates; sort by createdAt DESC; filter status==Active only
- `SellerPortal.tsx`: market demand section subscribes to global market_leads from AppContext
- `ListingDetail.tsx`: Device Verification battery circle fallback changed from `87` to showing "N/A" when `batteryHealth` is 0 or unset; ProductSpecs battery entry uses same dynamic value
- `AppContext.tsx`: add `marketLeads` state + `addMarketLead` + hide-nav-for-modal flag

### Remove
- Hardcoded `87` fallback battery health percentage in ListingDetail (replace with N/A)

## Implementation Plan

1. Create `src/frontend/src/utils/rapidApi.ts` with search-phones and get-phone-detail helpers using the provided RapidAPI credentials
2. Update `CreateListing.tsx` Step 2 to use RapidAPI search with 500ms debounce; auto-fill storage/color from API result; show stock image preview on Step 3 header
3. Add Battery Health field to CreateListing Step 4 (below How Old section) with maxLength 3, inputMode numeric, range validation ≤100
4. Update `PostLeadModal.tsx`: API-driven brand dropdown + searchable model dropdown (must select from list); numeric qty/budget inputs; Post button disabled until valid; z-index 9999; hide BottomNav when open
5. Update `BottomNav.tsx`: lower z-index to 9990; check AppContext flag to hide when modal is active
6. Update `AuthContext.tsx`: save userRole + isVerified to localStorage on login for fast UI pre-render; check on app load
7. Update `BuyerPortal.tsx` listing cards: subscribe to BidStore.subscribeAllBids; show "Current Bid" in blue when bids exist, else base price; sort by createdAt DESC; filter Live only
8. Update `AppContext.tsx`: add marketLeads state and addMarketLead; add modalOpen flag
9. Update `SellerPortal.tsx` Market Demand section to read from AppContext marketLeads
10. Fix `ListingDetail.tsx` battery fallback to show N/A for 0/unset batteryHealth
