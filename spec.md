# 77mobiles.pro

## Current State
A full-stack PWA B2B electronics auction marketplace. Frontend has BuyerPortal, SellerPortal, ListingDetail, CreateListing, ProfilePage, BottomNav, PortalCarousel, RecentSalesSlider, and demoListings data. App icons exist. PWA is set up.

## Requested Changes (Diff)

### Add
- New app icon: royal blue rounded square, '77' in white + 'mobiles.pro' in light gray, small red '6 Live' dot in top-right corner (192x192, 512x512, 180x180 variants)
- Debug notification button on ProfilePage: triggers local push notification (Title: '77mobiles.pro - Outbid Alert', Body: bidding alert for Samsung S24 Ultra, navigates to Activity on click)
- 'Enable Notifications' button on ProfilePage (separate from debug button): checks support, calls requestPermission, shows toast for granted, shows message for denied
- Guided Diagnostic sell flow: new page/modal sequence triggered when user taps Post/Sell. Steps: (1) Smart Start - Quick Scan auto-detects device model/resolution/browser, (2) Touch Test - full-screen grid swipe test, (3) Camera & Mic Check - WebRTC front/back camera 2s check + audio recording, (4) Screen Burn Test - cycle Red/Green/Blue/White full-screen colors, (5) Battery Health manual input with tooltip, (6) Final Report - auto-generate Diagnostic Score + 'Verified by 77mobiles' badge on listing
- 20 demo listings in demoListings.ts for seller portal (visible in buyer portal)

### Modify
- **app icons**: Update manifest.json to reference new generated icon
- **BottomNav**: height 80px, padding-bottom env(safe-area-inset-bottom), icons w-6 h-6 (20% larger), labels text-[12px], floating Post button properly scaled/vertically centered
- **PortalCarousel**: Reduce paddingBottom from 45% to 38.25% (15% height reduction)
- **RecentSalesSlider**: shrink card size by ~15%, reduce section vertical padding
- **BuyerPortal**: tighten vertical spacing between categories and Bidding War banner; ensure Live Auctions tab bar + top 50% of first listing visible on 800px screen; fix BENTO_12 duplicate listingIds (bn10 and bn11 had duplicate b-5/b-6 IDs - assign unique IDs); clear all demo listings from buyer portal (remove BENTO_12 hardcoded items, keep only sharedListings from seller)
- **demoListings.ts**: Remove all BUYER_AUCTIONS demo data; add 20 new seller demo listings (SELLER_DEMO_20) with unique IDs, realistic device names, prices, imageUrl as empty string
- **ListingDetail.tsx**: Fix mockFallback to use the actual passed id instead of always returning Samsung S24 Ultra; ensure find() uses listingId correctly across combined seller+buyer arrays
- **CreateListing.tsx**: Fix handlePublish to set imageUrl to uploadedPhotos[0] (cover photo base64) instead of hardcoded ''; clear uploadedPhotos state after publish
- **SellerPortal.tsx listing cards**: Ensure key={listing.listingId} is unique; imageUrl dynamically from listing.imageUrl || getDeviceImage

### Remove
- All BENTO_12 hardcoded demo listings from BuyerPortal (buyer portal shows only seller-posted listings)
- BUYER_AUCTIONS demo data from demoListings.ts

## Implementation Plan
1. Generate new 192x192 and 180x180 app icons from the 512x512 already generated
2. Update BottomNav: height 80px total, safe-area padding, larger icons (w-6 h-6), 12px labels, Post button recentered
3. Update PortalCarousel: reduce paddingBottom from 45% to 38.25%
4. Update RecentSalesSlider: compact cards, less section padding
5. Update BuyerPortal: tighten spacing, fix BENTO_12 duplicate IDs, clear hardcoded demo listings (only show sharedListings)
6. Update demoListings.ts: remove BUYER_AUCTIONS demo data, add 20 seller demo listings
7. Fix ListingDetail.tsx: fix mockFallback and find logic to use correct IDs
8. Fix CreateListing.tsx: save uploadedPhotos[0] to imageUrl on publish, clear state
9. Add ProfilePage notification buttons (debug + enable notifications)
10. Add Guided Diagnostic sell flow as a new page sequence
11. Update manifest.json to reference new icon
