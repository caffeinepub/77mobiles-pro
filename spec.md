# 77mobiles.pro

## Current State
- BuyerPortal reads from `sharedListings` (AppContext) + `SELLER_LISTINGS` (demo data). Listings posted by sellers are added to `sharedListings` in-memory but do NOT persist status='live'/visibility='public'.
- Buyer query combines both arrays without a Firestore-style `where status==live` filter.
- CountdownTimer exists but BuyerPortal listing cards still show static '20:00' text in some places; the component uses `expiryTimestamp` from `endsAt` (BigInt nanoseconds) but `sharedBentoItems` don't carry `endsAt`.
- Analytics cards (AccountPage/ProfilePage) all navigate to '/home' regardless of which card is clicked.
- Admin Catalog Manager (brands/models) exists in AdminDashboard but the Add Listing / Post Lead forms do NOT listen to `77m_brands` / `77m_models` localStorage keys via `onSnapshot`-style listeners.
- Portal Controls sliders in Admin exist but bidding logic in BuyerPortal doesn't enforce `minBidIncrement`. Banner publish/toggle works but auction duration is not applied when creating a listing.
- No expired-listing handling: when `endsAt` passes, Seller Portal continues to show the listing normally without offering a "Start 7-Day Auction" button.

## Requested Changes (Diff)

### Add
- `ListingsStore.ts` — a singleton that acts as the global `listings` collection. Stores all listings with `status` and `visibility` fields. Supports `onSnapshot`-style subscribers. Persists to `localStorage` under `77m_listings_db`.
- `LiveCountdown` component — wraps `CountdownTimer`, takes `expiryTimestamp`, uses `setInterval` every second, formats MM:SS, turns red when < 5 min, uses `React.memo`.
- `usePortalSettings` hook — subscribes to `77m_portal_settings` localStorage key and returns live settings object.
- "Extend to 7-Day Auction" button logic in SellerPortal for expired listings.

### Modify
- `AppContext.tsx` — `addSharedListing` now saves to `ListingsStore` with `status: 'live'` and `visibility: 'public'`.
- `BuyerPortal.tsx` — replace static listing arrays with `ListingsStore.subscribe()` filtered by `status === 'live'`, use `LiveCountdown` on every card, enforce `minBidIncrement` from portal settings.
- `SellerPortal.tsx` — read from `ListingsStore` for seller's own listings, show "Start 7-Day Auction" button for expired listings, set `auctionEndTime` from portal settings when creating.
- `ProfilePage.tsx` / analytics cards — add `?filter=` query params to navigate calls; read `filter` param on home screen and apply correct filter chip.
- `AppShell.tsx` / Home screen listing filter — read URL `?filter=` param and highlight the correct tab.
- Admin Catalog Manager — `onSnapshot` pattern: broadcast changes to `77m_brands` and `77m_models` localStorage so Add Listing forms re-read them live.
- Admin Portal Controls — `Save Changes` batch-writes all slider values to `77m_portal_settings`; `Publish Banner` saves to `77m_banners`; toggle updates `isActive`.
- `CreateListing.tsx` — read brands/models from `ListingsStore`/localStorage with live listener; set `auctionEndTime = now + auctionDuration` from portal settings; enforce `maxPhotos` limit.

### Remove
- Static price/timer text hardcoded into BuyerPortal listing cards (replaced by `LiveCountdown` and dynamic bid price).

## Implementation Plan
1. Create `ListingsStore.ts` — global listings pub/sub singleton with localStorage persistence, `add()`, `subscribe()`, `getAll()`, and filtering helpers.
2. Update `AppContext.tsx` — `addSharedListing` writes to `ListingsStore` with `status: 'live'`; `sharedListings` reads from `ListingsStore` on mount and subscribes.
3. Create `LiveCountdown.tsx` — memo component with 1-second interval, MM:SS format, red when < 5 min.
4. Update `BuyerPortal.tsx` — subscribe to `ListingsStore` for live listings, use `LiveCountdown` on cards, enforce `minBidIncrement` from `usePortalSettings`.
5. Update `SellerPortal.tsx` — subscribe to `ListingsStore`, filter by `sellerId`, show expired listings with "Start 7-Day Auction" button.
6. Update `ProfilePage.tsx` / analytics cards — navigate with `?filter=all_listings`, `?filter=live`, `?filter=sold`.
7. Update `AppShell.tsx` home screen — read `?filter=` URL param and activate correct filter chip on My Listings.
8. Update Admin Catalog Manager — on brand/model save, broadcast `StorageEvent` to `77m_brands` / `77m_models`.
9. Update Admin Portal Controls — `Save Changes` writes to `77m_portal_settings`; Banner publish/toggle writes to `77m_banners`.
10. Update `CreateListing.tsx` — read brands/models from localStorage live; apply `auctionEndTime` from portal settings; enforce `maxPhotos`.
