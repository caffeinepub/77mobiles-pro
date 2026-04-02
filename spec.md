# 77mobiles.pro

## Current State
- Full B2B electronics auction marketplace with Buyer, Seller, and Admin portals.
- PWA files (manifest.json, sw.js) are missing — index.html has no manifest link or theme-color meta.
- ProfilePage has two buttons ("My Account", "Help & Support") that show `toast("Coming soon")`.
- Buyer portal search/barcode scanner overlay is wired but the IMEI scanner in CreateListing also needs verification.
- All other major features (wallet, bidding, alerts, watchlist, category nav, admin panel, carousel sliders) are functional.

## Requested Changes (Diff)

### Add
- `public/manifest.json` — name: "77mobiles.pro", short_name: "77", display: standalone, theme_color: #1D4ED8, start_url: "/", icons for 192x192 and 512x512 using category smartphone asset.
- `public/sw.js` — service worker caching homepage, index.html, manifest.json, and critical icon assets for offline use; uses cache-first strategy.
- `<link rel="manifest">` and `<meta name="theme-color">` in index.html `<head>`.
- Service worker registration script in index.html.
- Functional My Account sub-page (modal or inline) showing dealer profile data.
- Functional Help & Support sub-page with FAQs and contact info.

### Modify
- `index.html` — add PWA meta tags, manifest link, SW registration.
- `ProfilePage.tsx` — wire "My Account" to navigate to AccountPage and "Help & Support" to a help modal/section instead of `toast("Coming soon")`.

### Remove
- `toast("Coming soon")` from ProfilePage menu buttons.

## Implementation Plan
1. Create `public/manifest.json` with full PWA manifest config.
2. Create `public/sw.js` with install + fetch handlers caching critical files.
3. Update `index.html` with manifest link, theme-color meta, apple-mobile-web-app tags, and SW registration.
4. Update `ProfilePage.tsx` — My Account navigates to `/account` route, Help & Support opens an inline help section.
5. Create/update `AccountPage.tsx` with real dealer profile info display.
