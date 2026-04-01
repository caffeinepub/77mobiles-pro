import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {

module Listing {
  public func compare(listing1 : Listing, listing2 : Listing) : Order.Order {
    Text.compare(listing1.listingId, listing2.listingId);
  };
};

module Bid {
  public func compare(bid1 : Bid, bid2 : Bid) : Order.Order {
    if (bid1.amount == bid2.amount) {
      return Text.compare(bid1.bidId, bid2.bidId);
    };
    Nat.compare(bid1.amount, bid2.amount);
  };
};

module Role {
  public type UserRole = {
    #sellerDealer;
    #businessBuyer;
  };
};

public type UserProfile = {
  userId : Text;
  userRole : Role.UserRole;
  businessName : Text;
  verificationId : Text;
  mobileNumber : Text;
  aadhaarNumber : Text;
  createdAt : Int;
};

type Listing = {
  listingId : Text;
  sellerId : Text;
  title : Text;
  brand : Text;
  model : Text;
  storage : Nat;
  batteryHealth : Nat;
  warranty : Nat;
  condition : Text;
  color : Text;
  description : Text;
  basePrice : Nat;
  auctionType : Text;
  status : Text;
  imageUrl : Text;
  isDemo : Bool;
  screenPassCertified : Bool;
  usbVerified : Bool;
  serialNumberHash : Text;
  createdAt : Int;
  endsAt : Int;
};

type Bid = {
  bidId : Text;
  listingId : Text;
  bidderId : Text;
  amount : Nat;
  createdAt : Int;
};

module ListingFilter {
  public type Type = {
    #allListings;
    #liveListings;
    #sevenDayListings;
  };
};

let users = Map.empty<Principal, UserProfile>();
let listings = Map.empty<Text, Listing>();
let bids = Map.empty<Text, List.List<Bid>>();

let accessControlState = AccessControl.initState();
include MixinAuthorization(accessControlState);

// Helper function to check if caller is a registered user
func isRegisteredUser(caller : Principal) : Bool {
  users.containsKey(caller);
};

// Helper function to get user profile or trap
func getUserProfileOrTrap(caller : Principal) : UserProfile {
  switch (users.get(caller)) {
    case (null) { Runtime.trap("User not registered") };
    case (?profile) { profile };
  };
};

// Helper function to check if user is a seller
func isSeller(caller : Principal) : Bool {
  switch (users.get(caller)) {
    case (null) { false };
    case (?profile) {
      switch (profile.userRole) {
        case (#sellerDealer) { true };
        case (_) { false };
      };
    };
  };
};

// Helper function to check if user is a buyer
func isBuyer(caller : Principal) : Bool {
  switch (users.get(caller)) {
    case (null) { false };
    case (?profile) {
      switch (profile.userRole) {
        case (#businessBuyer) { true };
        case (_) { false };
      };
    };
  };
};

// Public to all - guests can browse demo listings
public query ({ caller }) func getDemoListings() : async [Listing] {
  let isDemo = func(listing : Listing) : Bool { listing.isDemo };
  listings.values().toArray().filter(isDemo);
};

// Public to all - anyone can register (guests become users)
public shared ({ caller }) func registerUser(profile : UserProfile) : async () {
  if (users.containsKey(caller)) { 
    Runtime.trap("User already registered") 
  };
  users.add(caller, profile);
};

// Authenticated users only - get own profile
public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
  if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
    Runtime.trap("Unauthorized: Only authenticated users can access profiles");
  };
  users.get(caller);
};

// Get another user's profile - only admins or self
public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
  if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
    Runtime.trap("Unauthorized: Can only view your own profile");
  };
  users.get(user);
};

// Authenticated users only - save own profile
public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
  if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
    Runtime.trap("Unauthorized: Only authenticated users can save profiles");
  };
  users.add(caller, profile);
};

// Sellers only - create listing
public shared ({ caller }) func createListing(listing : Listing) : async () {
  // Must be authenticated
  if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
    Runtime.trap("Unauthorized: Only authenticated users can create listings");
  };
  
  // Must be registered
  if (not isRegisteredUser(caller)) {
    Runtime.trap("Unauthorized: User must be registered to create listings");
  };
  
  // Must be a seller
  if (not isSeller(caller)) {
    Runtime.trap("Unauthorized: Only sellers can create listings");
  };
  
  // Verify the sellerId matches the caller's userId
  let profile = getUserProfileOrTrap(caller);
  if (listing.sellerId != profile.userId) {
    Runtime.trap("Unauthorized: Listing sellerId must match your userId");
  };
  
  listings.add(listing.listingId, listing);
};

// Public to all - anyone can view listings (for browsing)
public query ({ caller }) func getListing(listingId : Text) : async Listing {
  switch (listings.get(listingId)) {
    case (null) { Runtime.trap("Listing not found") };
    case (?listing) { listing };
  };
};

// Public to all - anyone can browse listings
public query ({ caller }) func getFilteredListings(filter : ListingFilter.Type) : async [Listing] {
  let now = Time.now();
  switch (filter) {
    case (#allListings) {
      listings.values().toArray().sort();
    };
    case (#liveListings) {
      listings.values().toArray().filter(
        func(listing : Listing) : Bool { 
          listing.auctionType == "Live20min" and listing.endsAt > now 
        }
      ).sort();
    };
    case (#sevenDayListings) {
      listings.values().toArray().filter(
        func(listing : Listing) : Bool { 
          listing.auctionType == "SevenDay" and listing.endsAt > now 
        }
      ).sort();
    };
  };
};

// Buyers only - place bid
public shared ({ caller }) func placeBid(bid : Bid) : async () {
  // Must be authenticated
  if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
    Runtime.trap("Unauthorized: Only authenticated users can place bids");
  };
  
  // Must be registered
  if (not isRegisteredUser(caller)) {
    Runtime.trap("Unauthorized: User must be registered to place bids");
  };
  
  // Must be a buyer
  if (not isBuyer(caller)) {
    Runtime.trap("Unauthorized: Only buyers can place bids");
  };
  
  // Verify the bidderId matches the caller's userId
  let profile = getUserProfileOrTrap(caller);
  if (bid.bidderId != profile.userId) {
    Runtime.trap("Unauthorized: Bid bidderId must match your userId");
  };
  
  let listingOpt = listings.get(bid.listingId);
  switch (listingOpt) {
    case (null) { Runtime.trap("Listing not found") };
    case (?listing) {
      // Check if listing is still active
      if (listing.status != "Active") {
        Runtime.trap("Cannot bid on inactive listing");
      };
      
      // Check if auction has ended
      let now = Time.now();
      if (listing.endsAt <= now) {
        Runtime.trap("Auction has ended");
      };
      
      let existingBids = switch (bids.get(bid.listingId)) {
        case (null) { List.empty<Bid>() };
        case (?bidsForListing) { bidsForListing };
      };
      
      let currentHighestAmount = switch (existingBids.last()) {
        case (?lastBid) { lastBid.amount };
        case (null) { listing.basePrice };
      };
      
      if (bid.amount <= currentHighestAmount) {
        Runtime.trap("Bid must exceed current high bid");
      };
      
      let bidList = bids.get(bid.listingId);
      switch (bidList) {
        case (null) {
          let newBidList = List.singleton<Bid>(bid);
          bids.add(bid.listingId, newBidList);
        };
        case (?existingList) {
          existingList.add(bid);
        };
      };
    };
  };
};

// Public to all - anyone can view bids (transparency in auction)
public query ({ caller }) func getListingBids(listingId : Text) : async [Bid] {
  switch (bids.get(listingId)) {
    case (null) { [] };
    case (?bidsForListing) { bidsForListing.toArray().sort() };
  };
};

};
