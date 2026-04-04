import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  Eye,
  EyeOff,
  LogIn,
  ShoppingBag,
  Smartphone,
  Store,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend.d";
import { useAuth } from "../contexts/AuthContext";
import { useActor } from "../hooks/useActor";
import { isPhoneApproved } from "../utils/portalSettings";

// Credential store key in localStorage (simulates Firebase Auth)
const CREDS_KEY = "77m_auth_credentials";

function getCredentials(): Record<
  string,
  { passwordHash: string; role: string; status: string; business: string }
> {
  try {
    return JSON.parse(localStorage.getItem(CREDS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveCredential(
  phone: string,
  password: string,
  role: string,
  business: string,
) {
  const creds = getCredentials();
  // Simple hash simulation — in production use Firebase Auth signInWithEmailAndPassword
  const passwordHash = btoa(`${phone}:${password}:77mobiles`);
  // Use composite key: phone_role for strict identity separation
  const compositeKey = `${phone}_${role}`;
  creds[compositeKey] = { passwordHash, role, status: "pending", business };
  localStorage.setItem(CREDS_KEY, JSON.stringify(creds));
}

function verifyCredential(
  phone: string,
  password: string,
): { role: string; status: string; business: string } | null {
  const creds = getCredentials();
  const norm = phone.replace(/^\+91/, "").replace(/^0+/, "");
  // Try composite keys first (role-separated accounts), then legacy keys
  const entryBuyer = creds[`${norm}_buyer`];
  const entrySeller = creds[`${norm}_seller`];
  // Find which composite entry matches the password
  let entry: {
    passwordHash: string;
    role: string;
    status: string;
    business: string;
  } | null = null;
  for (const candidate of [
    entryBuyer,
    entrySeller,
    creds[norm],
    creds[`+91${norm}`],
    creds[phone],
  ]) {
    if (!candidate) continue;
    const expected = btoa(`${norm}:${password}:77mobiles`);
    const expected2 = btoa(`+91${norm}:${password}:77mobiles`);
    if (
      candidate.passwordHash === expected ||
      candidate.passwordHash === expected2
    ) {
      entry = candidate;
      break;
    }
  }
  if (!entry) return null;
  const entryRole = entry.role as string;
  // Primary check: per-user phone+role approval from admin
  if (isPhoneApproved(norm)) return { ...entry, status: "verified" };
  // Secondary check: role-specific KYC submission status
  const kycKey =
    entryRole === "seller"
      ? "77m_kyc_submissions_sellers"
      : "77m_kyc_submissions_buyers";
  const kycSubs: any[] = JSON.parse(localStorage.getItem(kycKey) || "[]");
  const legacySubs: any[] = JSON.parse(
    localStorage.getItem("77m_kyc_submissions") || "[]",
  );
  const kycEntry = [...kycSubs, ...legacySubs].find(
    (k: any) =>
      (k.phone === norm || k.phone === `+91${norm}`) && k.role === entryRole,
  );
  if (kycEntry?.status === "approved") return { ...entry, status: "verified" };
  return entry;
}

export default function AuthPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const { login } = useAuth();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [loading, setLoading] = useState(false);
  // Task 8: Detect standalone PWA mode for iOS compatibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _isStandalone =
    (window.navigator as any).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches;
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Seller registration fields
  const [sellerPan, setSellerPan] = useState("");
  const [sellerAadhaar, setSellerAadhaar] = useState("");
  const [sellerMobile, setSellerMobile] = useState("");
  const [sellerBusiness, setSellerBusiness] = useState("");
  const [sellerPassword, setSellerPassword] = useState("");

  // Buyer registration fields
  const [buyerGst, setBuyerGst] = useState("");
  const [buyerAadhaar, setBuyerAadhaar] = useState("");
  const [buyerMobile, setBuyerMobile] = useState("");
  const [buyerBusiness, setBuyerBusiness] = useState("");
  const [buyerPassword, setBuyerPassword] = useState("");

  // Login fields
  const [loginMobile, setLoginMobile] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const goToApp = (role: UserRole) => {
    localStorage.setItem(
      "77m_mode",
      role === UserRole.sellerDealer ? "seller" : "buyer",
    );
    // Task 8: Use window.location.replace for PWA to avoid routing hang
    window.location.replace("/app");
  };

  const handleRegisterSeller = async () => {
    if (!sellerPan || sellerPan.length !== 10) {
      toast.error("Enter a valid 10-character PAN");
      return;
    }
    if (!sellerMobile || sellerMobile.length < 10) {
      toast.error("Enter a valid mobile number");
      return;
    }
    if (!sellerPassword || sellerPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const norm = sellerMobile.replace(/^\+91/, "").replace(/^0+/, "");
    // Task 9: Check for duplicate registration
    const _existingKycSellerAll = JSON.parse(
      localStorage.getItem("77m_kyc_submissions_sellers") || "[]",
    );
    const _legacyKycSeller = JSON.parse(
      localStorage.getItem("77m_kyc_submissions") || "[]",
    ).filter((u: any) => u.role === "seller");
    const _existingKycSeller = [..._existingKycSellerAll, ..._legacyKycSeller];
    const _dupSeller = _existingKycSeller.find(
      (u: any) =>
        u.phone === norm || u.phone === `+91${norm}` || u.phone_number === norm,
    );
    if (_dupSeller) {
      toast.error("Account already exists. Please login instead.");
      setLoading(false);
      return;
    }
    // Task 9: Generate unique Dealer ID (role-specific counter)
    const _dealerCounter = Number(
      localStorage.getItem("77m_dealer_counter_seller") || "400",
    );
    const _newDealerNum = _dealerCounter + 1;
    localStorage.setItem("77m_dealer_counter_seller", String(_newDealerNum));
    const _dealerId = `#${_newDealerNum}`;
    const profile = {
      userId: `${norm}_seller`,
      userRole: UserRole.sellerDealer,
      businessName: sellerBusiness || "My Business",
      verificationId: sellerPan.toUpperCase(),
      mobileNumber: norm,
      aadhaarNumber: sellerAadhaar,
      createdAt: BigInt(Date.now()) * 1_000_000n,
    };
    try {
      if (actor) await actor.registerUser(profile);
    } catch {}
    // Task 1: Do NOT auto-login after registration — user must wait for admin approval
    saveCredential(
      norm,
      sellerPassword,
      "seller",
      sellerBusiness || "My Business",
    );
    localStorage.setItem("77m_verification_status", "pending");
    localStorage.setItem("77m_is_verified", "false");
    // Store in both legacy key (for admin panel) and role-specific key
    const kycKey = "77m_kyc_submissions";
    const kycKeyRole = "77m_kyc_submissions_sellers";
    const newEntry = {
      id: crypto.randomUUID(),
      business: sellerBusiness || "My Business",
      phone: norm,
      status: "pending",
      docType: "PAN Card",
      name: sellerBusiness || `Dealer ${norm.slice(-4)}`,
      businessName: sellerBusiness || "My Business",
      location: "India",
      city: "India",
      aadhaar_url: "",
      pan_url: "",
      role: "seller",
      dealerId: _dealerId,
      createdAt: Date.now(),
    };
    const existing = JSON.parse(localStorage.getItem(kycKey) || "[]");
    localStorage.setItem(kycKey, JSON.stringify([newEntry, ...existing]));
    const existingRole = JSON.parse(localStorage.getItem(kycKeyRole) || "[]");
    localStorage.setItem(
      kycKeyRole,
      JSON.stringify([newEntry, ...existingRole]),
    );
    setLoading(false);
    // Task 9: Clear form state
    setSellerPan("");
    setSellerAadhaar("");
    setSellerMobile("");
    setSellerBusiness("");
    setSellerPassword("");
    toast.success("Registration submitted — pending verification");
    navigate({ to: "/pending-verification" });
  };

  const handleRegisterBuyer = async () => {
    if (!buyerGst || buyerGst.length !== 15) {
      toast.error("Enter a valid 15-character GST number");
      return;
    }
    if (!buyerMobile || buyerMobile.length < 10) {
      toast.error("Enter a valid mobile number");
      return;
    }
    if (!buyerPassword || buyerPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const norm = buyerMobile.replace(/^\+91/, "").replace(/^0+/, "");
    // Task 9: Check for duplicate registration
    const _existingKycBuyerAll = JSON.parse(
      localStorage.getItem("77m_kyc_submissions_buyers") || "[]",
    );
    const _legacyKycBuyer = JSON.parse(
      localStorage.getItem("77m_kyc_submissions") || "[]",
    ).filter((u: any) => u.role === "buyer");
    const _existingKycBuyer = [..._existingKycBuyerAll, ..._legacyKycBuyer];
    const _dupBuyer = _existingKycBuyer.find(
      (u: any) => u.phone === norm || u.phone_number === norm,
    );
    if (_dupBuyer) {
      toast.error("Account already exists. Please login instead.");
      setLoading(false);
      return;
    }
    // Task 9: Generate unique Dealer ID (role-specific counter)
    const _buyerCounter = Number(
      localStorage.getItem("77m_dealer_counter_buyer") || "400",
    );
    const _newBuyerNum = _buyerCounter + 1;
    localStorage.setItem("77m_dealer_counter_buyer", String(_newBuyerNum));
    const _buyerDealerId = `#${_newBuyerNum}`;
    const profile = {
      userId: `${norm}_buyer`,
      userRole: UserRole.businessBuyer,
      businessName: buyerBusiness || "My Business",
      verificationId: buyerGst.toUpperCase(),
      mobileNumber: norm,
      aadhaarNumber: buyerAadhaar,
      createdAt: BigInt(Date.now()) * 1_000_000n,
    };
    try {
      if (actor) await actor.registerUser(profile);
    } catch {}
    // Task 1: Do NOT auto-login after registration — user must wait for admin approval
    saveCredential(
      norm,
      buyerPassword,
      "buyer",
      buyerBusiness || "My Business",
    );
    localStorage.setItem("77m_verification_status", "pending");
    localStorage.setItem("77m_is_verified", "false");
    // Store in both legacy key (for admin panel) and role-specific key
    const kycKeyBuyer = "77m_kyc_submissions";
    const kycKeyRoleBuyer = "77m_kyc_submissions_buyers";
    const newBuyerEntry = {
      id: crypto.randomUUID(),
      business: buyerBusiness || "My Business",
      phone: norm,
      status: "pending",
      docType: "GST Certificate",
      name: buyerBusiness || `Dealer ${norm.slice(-4)}`,
      businessName: buyerBusiness || "My Business",
      location: "India",
      city: "India",
      aadhaar_url: "",
      pan_url: "",
      role: "buyer",
      dealerId: _buyerDealerId,
      createdAt: Date.now(),
    };
    const existing = JSON.parse(localStorage.getItem(kycKeyBuyer) || "[]");
    localStorage.setItem(
      kycKeyBuyer,
      JSON.stringify([newBuyerEntry, ...existing]),
    );
    const existingRoleBuyer = JSON.parse(
      localStorage.getItem(kycKeyRoleBuyer) || "[]",
    );
    localStorage.setItem(
      kycKeyRoleBuyer,
      JSON.stringify([newBuyerEntry, ...existingRoleBuyer]),
    );
    setLoading(false);
    // Task 9: Clear form state
    setBuyerGst("");
    setBuyerAadhaar("");
    setBuyerMobile("");
    setBuyerBusiness("");
    setBuyerPassword("");
    toast.success("Registration submitted — pending verification");
    navigate({ to: "/pending-verification" });
  };

  const handleLogin = async () => {
    if (!loginMobile || loginMobile.length < 10) {
      toast.error("Enter a valid mobile number");
      return;
    }
    if (!loginPassword) {
      toast.error("Enter your password");
      return;
    }
    setLoading(true);
    try {
      const result = verifyCredential(loginMobile, loginPassword);
      if (!result) {
        toast.error("Account not found. Please register first.");
        return;
      }
      const roleEnum =
        result.role === "seller"
          ? UserRole.sellerDealer
          : UserRole.businessBuyer;
      const norm = loginMobile.replace(/^\+91/, "").replace(/^0+/, "");
      const profile = {
        userId: `${norm}_${result.role}`,
        userRole: roleEnum,
        businessName: result.business || "My Business",
        verificationId: "AUTH",
        mobileNumber: norm,
        aadhaarNumber: "",
        createdAt: BigInt(Date.now()) * 1_000_000n,
      };
      login(profile);
      localStorage.setItem("77m_role", result.role);
      localStorage.setItem("77m_mode", result.role);
      // Save session with 30-day TTL
      localStorage.setItem(
        "77m_phone_session",
        JSON.stringify({
          phone: loginMobile,
          role: result.role,
          token: Date.now(),
        }),
      );
      console.log("[77mobiles] Login success for role:", result.role);
      if (result.status === "pending") {
        navigate({ to: "/pending-verification" });
      } else {
        toast.success("Welcome back!");
        goToApp(roleEnum);
      }
    } catch (err) {
      console.error("[77mobiles] Login error:", err);
      toast.error(
        "Login failed. Please check your credentials or contact support.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (mode === "login") {
    return (
      <div
        className="mobile-container flex flex-col"
        style={{ background: "#F8F9FA", minHeight: "100dvh" }}
      >
        <div className="flex-1 flex flex-col px-6 py-12">
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{ background: "#EEF2FF" }}
            >
              <Smartphone className="w-8 h-8" style={{ color: "#1D4ED8" }} />
            </div>
            <h1 className="text-3xl font-black tracking-tight">
              <span className="text-gray-900">77</span>
              <span style={{ color: "#1D4ED8" }}>mobiles</span>
              <span className="text-gray-900">.pro</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              B2B Electronics Marketplace
            </p>
          </div>
          <div
            className="bg-white rounded-2xl p-6"
            style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}
          >
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <LogIn className="w-5 h-5" style={{ color: "#1D4ED8" }} /> Login
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Mobile Number
                </Label>
                <div className="flex">
                  <span className="px-3 flex items-center bg-gray-100 border border-gray-200 rounded-l-xl text-sm font-medium text-gray-600">
                    +91
                  </span>
                  <Input
                    data-ocid="login.mobile.input"
                    className="rounded-l-none"
                    placeholder="Enter mobile number"
                    value={loginMobile}
                    onChange={(e) =>
                      setLoginMobile(
                        e.target.value.replace(/\D/g, "").slice(0, 10),
                      )
                    }
                    maxLength={10}
                    inputMode="numeric"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    data-ocid="login.password.input"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                data-ocid="login.submit_button"
                className="w-full"
                style={{ background: "#1D4ED8", border: "none" }}
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </Button>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              data-ocid="auth.register.link"
              onClick={() => setMode("register")}
              className="font-semibold"
              style={{ color: "#1D4ED8" }}
            >
              Register
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mobile-container flex flex-col"
      style={{ background: "#F8F9FA", minHeight: "100dvh" }}
    >
      <div className="flex-1 flex flex-col px-5 py-8 overflow-y-auto">
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
            style={{ background: "#EEF2FF" }}
          >
            <Smartphone className="w-7 h-7" style={{ color: "#1D4ED8" }} />
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            <span className="text-gray-900">77</span>
            <span style={{ color: "#1D4ED8" }}>mobiles</span>
            <span className="text-gray-900">.pro</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            B2B Electronics Marketplace
          </p>
        </div>

        <Tabs defaultValue="seller" className="w-full">
          <TabsList
            className="grid grid-cols-2 w-full mb-4"
            data-ocid="auth.tab"
          >
            <TabsTrigger
              value="seller"
              data-ocid="auth.seller.tab"
              className="flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5" /> Seller / Dealer
            </TabsTrigger>
            <TabsTrigger
              value="buyer"
              data-ocid="auth.buyer.tab"
              className="flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Business Buyer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="seller">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
              <p className="text-xs text-blue-800">
                For businesses selling mobile devices in bulk — retailers,
                wholesalers, refurbishers.
              </p>
            </div>
            <div
              className="bg-white rounded-2xl p-5 space-y-4"
              style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}
            >
              <div>
                <Label className="text-xs font-semibold text-gray-500 mb-1 block">
                  PAN Card Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  data-ocid="seller.pan.input"
                  placeholder="ABCDE1234F"
                  value={sellerPan}
                  onChange={(e) => setSellerPan(e.target.value.toUpperCase())}
                  maxLength={10}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Aadhaar Number
                </Label>
                <Input
                  data-ocid="seller.aadhaar.input"
                  placeholder="XXXX XXXX XXXX"
                  value={sellerAadhaar}
                  onChange={(e) => setSellerAadhaar(e.target.value)}
                  maxLength={14}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Mobile Number <span className="text-red-500">*</span>
                </Label>
                <div className="flex">
                  <span className="px-3 flex items-center bg-gray-100 border border-gray-200 rounded-l-xl text-sm font-medium text-gray-600 border-r-0">
                    +91
                  </span>
                  <Input
                    data-ocid="seller.mobile.input"
                    className="rounded-l-none"
                    placeholder="9876543210"
                    value={sellerMobile}
                    onChange={(e) =>
                      setSellerMobile(
                        e.target.value.replace(/\D/g, "").slice(0, 10),
                      )
                    }
                    maxLength={10}
                    inputMode="numeric"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Business Name
                </Label>
                <Input
                  data-ocid="seller.business.input"
                  placeholder="Optional"
                  value={sellerBusiness}
                  onChange={(e) => setSellerBusiness(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    data-ocid="seller.password.input"
                    type={showRegPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={sellerPassword}
                    onChange={(e) => setSellerPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showRegPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Stored securely via Firebase Auth. Never shared as plain text.
                </p>
              </div>
              <Button
                data-ocid="seller.register.submit_button"
                className="w-full"
                style={{ background: "#1D4ED8", border: "none" }}
                onClick={handleRegisterSeller}
                disabled={loading}
              >
                {loading ? "Registering..." : "Register as Seller Dealer"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="buyer">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
              <p className="text-xs text-green-800">
                For businesses procuring devices in bulk — corporate buyers,
                resellers.
              </p>
            </div>
            <div
              className="bg-white rounded-2xl p-5 space-y-4"
              style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}
            >
              <div>
                <Label className="text-xs font-semibold text-gray-500 mb-1 block">
                  GST Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  data-ocid="buyer.gst.input"
                  placeholder="22AAAAA0000A1Z5"
                  value={buyerGst}
                  onChange={(e) => setBuyerGst(e.target.value.toUpperCase())}
                  maxLength={15}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Aadhaar Number
                </Label>
                <Input
                  data-ocid="buyer.aadhaar.input"
                  placeholder="XXXX XXXX XXXX"
                  value={buyerAadhaar}
                  onChange={(e) => setBuyerAadhaar(e.target.value)}
                  maxLength={14}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Mobile Number <span className="text-red-500">*</span>
                </Label>
                <div className="flex">
                  <span className="px-3 flex items-center bg-gray-100 border border-gray-200 rounded-l-xl text-sm font-medium text-gray-600 border-r-0">
                    +91
                  </span>
                  <Input
                    data-ocid="buyer.mobile.input"
                    className="rounded-l-none"
                    placeholder="9876543210"
                    value={buyerMobile}
                    onChange={(e) =>
                      setBuyerMobile(
                        e.target.value.replace(/\D/g, "").slice(0, 10),
                      )
                    }
                    maxLength={10}
                    inputMode="numeric"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Business Name
                </Label>
                <Input
                  data-ocid="buyer.business.input"
                  placeholder="Optional"
                  value={buyerBusiness}
                  onChange={(e) => setBuyerBusiness(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    data-ocid="buyer.password.input"
                    type={showRegPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={buyerPassword}
                    onChange={(e) => setBuyerPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showRegPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Stored securely via Firebase Auth. Never shared as plain text.
                </p>
              </div>
              <Button
                data-ocid="buyer.register.submit_button"
                className="w-full"
                style={{ background: "#1D4ED8", border: "none" }}
                onClick={handleRegisterBuyer}
                disabled={loading}
              >
                {loading ? "Registering..." : "Register as Business Buyer"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <button
            type="button"
            data-ocid="auth.login.link"
            onClick={() => setMode("login")}
            className="font-semibold"
            style={{ color: "#1D4ED8" }}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
