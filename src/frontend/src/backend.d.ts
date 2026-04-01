import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Listing {
    status: string;
    model: string;
    title: string;
    screenPassCertified: boolean;
    auctionType: string;
    listingId: string;
    storage: bigint;
    createdAt: bigint;
    color: string;
    serialNumberHash: string;
    description: string;
    isDemo: boolean;
    imageUrl: string;
    batteryHealth: bigint;
    brand: string;
    sellerId: string;
    warranty: bigint;
    basePrice: bigint;
    usbVerified: boolean;
    endsAt: bigint;
    condition: string;
}
export interface UserProfile {
    userRole: UserRole;
    userId: string;
    createdAt: bigint;
    businessName: string;
    mobileNumber: string;
    verificationId: string;
    aadhaarNumber: string;
}
export interface Bid {
    listingId: string;
    createdAt: bigint;
    bidId: string;
    bidderId: string;
    amount: bigint;
}
export enum Type {
    allListings = "allListings",
    liveListings = "liveListings",
    sevenDayListings = "sevenDayListings"
}
export enum UserRole {
    sellerDealer = "sellerDealer",
    businessBuyer = "businessBuyer"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    createListing(listing: Listing): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getDemoListings(): Promise<Array<Listing>>;
    getFilteredListings(filter: Type): Promise<Array<Listing>>;
    getListing(listingId: string): Promise<Listing>;
    getListingBids(listingId: string): Promise<Array<Bid>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeBid(bid: Bid): Promise<void>;
    registerUser(profile: UserProfile): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
