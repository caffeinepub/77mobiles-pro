# 77mobiles.pro

## Current State
- ProfilePage has a 'Switch to Buyer/Seller Mode' card and a 'Current Mode' tag in the profile header
- AuthPage registration creates a random UUID per user with no role in the key; credentials stored by phone only (no role suffix); dealer counter is shared between buyer and seller
- All KYC data stored in `77m_kyc_submissions` with a `role` field — no separate buyers/sellers separation
- BottomNav uses height 70px, icons w-6 h-6 (24px), no explicit 20% width per item
- CreateListing Step 0: `canContinueStep0 = imeiDigits.length === 15` — does NOT require imeiStatus === 'success'
- BuyerPortal list view uses static `item.timer` string instead of CountdownTimer component; list view price always shows basePrice, not bidMap highest bid; grid view correctly uses bidMap

## Requested Changes (Diff)

### Add
- Composite key login/registration: credentials stored as `[phone]_[role]` (e.g. `88015xxxxx_buyer`)
- Separate dealer ID counters: `77m_dealer_counter_seller` and `77m_dealer_counter_buyer`
- Separate KYC submission stores: `77m_kyc_submissions_buyers` and `77m_kyc_submissions_sellers`
- Toast message on disabled Continue click in IMEI step: 'Please verify a valid IMEI number to proceed.'
- useEffect in CreateListing to react to isImeiVerified changes

### Modify
- ProfilePage: remove Switch Mode card entirely, remove Current Mode tag from header
- AuthPage: registration now uses composite key `phone_role` for credentials and KYC lookup; uid generated as `crypto.randomUUID()` but credential key is role-aware; duplicate check is role-aware
- BottomNav: height 80px, icons 28px fixed, padding-bottom env(safe-area-inset-bottom, 20px), z-index 999999, border-top 1px solid #E5E5E5, each nav item width 20%, label 11px
- AppShell / main content wrapper: padding-bottom 100px on scrollable container
- CreateListing Step 0: `canContinueStep0 = imeiDigits.length === 15 && imeiStatus === 'success'`; Continue button uses this; show toast on blocked click attempt
- BuyerPortal list view cards: replace static `item.timer` with `<CountdownTimer expiryTimestamp={item.endsAt} />` where `item.endsAt` is derived from listing data; replace basePrice display with bidMap-aware price (same logic as grid view)

### Remove
- ProfilePage: `handleSwitchMode` function, Switch Mode card JSX (lines 811-839), Current Mode tag JSX (lines 800-808)
- Any shared dealer counter logic between roles

## Implementation Plan
1. ProfilePage.tsx — remove Current Mode tag block and Switch Mode card block; remove handleSwitchMode function
2. AuthPage.tsx — change credential key from phone to `${phone}_${role}`; change KYC lookup/storage to role-specific keys (`77m_kyc_submissions_buyers` / `77m_kyc_submissions_sellers`); change dealer counter to role-specific (`77m_dealer_counter_seller` / `77m_dealer_counter_buyer`); ensure duplicate check is role-aware
3. BottomNav.tsx — update container to height 80px, z-index 999999, padding-bottom env(safe-area-inset-bottom, 20px), border-top 1px solid #E5E5E5; icons to exactly 28px w/h; each item width 20%; labels 11px
4. AppShell.tsx (or main content div) — ensure scrollable content has padding-bottom 100px
5. CreateListing.tsx — change canContinueStep0 to require imeiStatus === 'success'; add onClick handler to disabled button showing toast; add useEffect watching imeiStatus
6. BuyerPortal.tsx — fix list view: use CountdownTimer with endsAt timestamp; fix price to use bidMap highest bid when available (same as grid view)
