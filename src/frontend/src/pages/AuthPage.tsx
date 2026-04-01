import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import { LogIn, ShoppingBag, Smartphone, Store } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend.d";
import { useAuth } from "../contexts/AuthContext";
import { useActor } from "../hooks/useActor";

export default function AuthPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const { login } = useAuth();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [loading, setLoading] = useState(false);

  const [sellerPan, setSellerPan] = useState("");
  const [sellerAadhaar, setSellerAadhaar] = useState("");
  const [sellerMobile, setSellerMobile] = useState("");
  const [sellerBusiness, setSellerBusiness] = useState("");

  const [buyerGst, setBuyerGst] = useState("");
  const [buyerAadhaar, setBuyerAadhaar] = useState("");
  const [buyerMobile, setBuyerMobile] = useState("");
  const [buyerBusiness, setBuyerBusiness] = useState("");

  const [loginMobile, setLoginMobile] = useState("");
  const [loginRole, setLoginRole] = useState<UserRole>(UserRole.sellerDealer);

  const goToApp = (role: UserRole) => {
    localStorage.setItem(
      "77m_mode",
      role === UserRole.sellerDealer ? "seller" : "buyer",
    );
    navigate({ to: "/app" });
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
    setLoading(true);
    try {
      const profile = {
        userId: crypto.randomUUID(),
        userRole: UserRole.sellerDealer,
        businessName: sellerBusiness || "My Business",
        verificationId: sellerPan.toUpperCase(),
        mobileNumber: sellerMobile,
        aadhaarNumber: sellerAadhaar,
        createdAt: BigInt(Date.now()) * 1_000_000n,
      };
      if (actor) await actor.registerUser(profile);
      login(profile);
      toast.success("Registered as Seller Dealer!");
      goToApp(UserRole.sellerDealer);
    } catch {
      const profile = {
        userId: crypto.randomUUID(),
        userRole: UserRole.sellerDealer,
        businessName: sellerBusiness || "My Business",
        verificationId: sellerPan.toUpperCase(),
        mobileNumber: sellerMobile,
        aadhaarNumber: sellerAadhaar,
        createdAt: BigInt(Date.now()) * 1_000_000n,
      };
      login(profile);
      toast.success("Welcome to Seller Portal!");
      goToApp(UserRole.sellerDealer);
    } finally {
      setLoading(false);
    }
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
    setLoading(true);
    try {
      const profile = {
        userId: crypto.randomUUID(),
        userRole: UserRole.businessBuyer,
        businessName: buyerBusiness || "My Business",
        verificationId: buyerGst.toUpperCase(),
        mobileNumber: buyerMobile,
        aadhaarNumber: buyerAadhaar,
        createdAt: BigInt(Date.now()) * 1_000_000n,
      };
      if (actor) await actor.registerUser(profile);
      login(profile);
      toast.success("Registered as Business Buyer!");
      goToApp(UserRole.businessBuyer);
    } catch {
      const profile = {
        userId: crypto.randomUUID(),
        userRole: UserRole.businessBuyer,
        businessName: buyerBusiness || "My Business",
        verificationId: buyerGst.toUpperCase(),
        mobileNumber: buyerMobile,
        aadhaarNumber: buyerAadhaar,
        createdAt: BigInt(Date.now()) * 1_000_000n,
      };
      login(profile);
      toast.success("Welcome to Buyer Portal!");
      goToApp(UserRole.businessBuyer);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (!loginMobile || loginMobile.length < 10) {
      toast.error("Enter a valid mobile number");
      return;
    }
    const profile = {
      userId: crypto.randomUUID(),
      userRole: loginRole,
      businessName: "Demo Business",
      verificationId:
        loginRole === UserRole.sellerDealer
          ? "DEMOSEL001"
          : "DEMOGST000000A1Z5",
      mobileNumber: loginMobile,
      aadhaarNumber: "",
      createdAt: BigInt(Date.now()) * 1_000_000n,
    };
    login(profile);
    toast.success("Logged in successfully!");
    goToApp(loginRole);
  };

  if (mode === "login") {
    return (
      <div
        className="mobile-container flex flex-col min-h-screen"
        style={{ background: "#F8F9FA" }}
      >
        <div className="flex-1 flex flex-col px-6 py-12">
          <div className="text-center mb-10">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{ background: "#EEF2FF" }}
            >
              <Smartphone className="w-8 h-8" style={{ color: "#007AFF" }} />
            </div>
            <h1 className="text-3xl font-black tracking-tight">
              <span className="text-gray-900">77</span>
              <span style={{ color: "#007AFF" }}>mobiles</span>
              <span className="text-gray-900">.pro</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              B2B Electronics Marketplace
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <LogIn className="w-5 h-5" style={{ color: "#007AFF" }} /> Login
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
                    data-ocid="login.input"
                    className="rounded-l-none"
                    placeholder="Enter mobile number"
                    value={loginMobile}
                    onChange={(e) => setLoginMobile(e.target.value)}
                    maxLength={10}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-500 mb-1 block">
                  Login as
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    data-ocid="login.seller.toggle"
                    onClick={() => setLoginRole(UserRole.sellerDealer)}
                    className="py-2 px-3 rounded-xl text-sm font-semibold border-2 transition-all"
                    style={{
                      borderColor:
                        loginRole === UserRole.sellerDealer
                          ? "#007AFF"
                          : "#e5e7eb",
                      background:
                        loginRole === UserRole.sellerDealer
                          ? "#007AFF"
                          : "white",
                      color:
                        loginRole === UserRole.sellerDealer
                          ? "white"
                          : "#374151",
                    }}
                  >
                    Seller / Dealer
                  </button>
                  <button
                    type="button"
                    data-ocid="login.buyer.toggle"
                    onClick={() => setLoginRole(UserRole.businessBuyer)}
                    className="py-2 px-3 rounded-xl text-sm font-semibold border-2 transition-all"
                    style={{
                      borderColor:
                        loginRole === UserRole.businessBuyer
                          ? "#007AFF"
                          : "#e5e7eb",
                      background:
                        loginRole === UserRole.businessBuyer
                          ? "#007AFF"
                          : "white",
                      color:
                        loginRole === UserRole.businessBuyer
                          ? "white"
                          : "#374151",
                    }}
                  >
                    Business Buyer
                  </button>
                </div>
              </div>
              <Button
                data-ocid="login.submit_button"
                className="w-full"
                style={{ background: "#007AFF", border: "none" }}
                onClick={handleLogin}
              >
                Login
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
              style={{ color: "#007AFF" }}
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
      className="mobile-container flex flex-col min-h-screen"
      style={{ background: "#F8F9FA" }}
    >
      <div className="flex-1 flex flex-col px-5 py-8 overflow-y-auto">
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
            style={{ background: "#EEF2FF" }}
          >
            <Smartphone className="w-7 h-7" style={{ color: "#007AFF" }} />
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            <span className="text-gray-900">77</span>
            <span style={{ color: "#007AFF" }}>mobiles</span>
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
            <div className="bg-white rounded-2xl shadow-card p-5 space-y-4">
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
                    onChange={(e) => setSellerMobile(e.target.value)}
                    maxLength={10}
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
              <Button
                data-ocid="seller.register.submit_button"
                className="w-full"
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
            <div className="bg-white rounded-2xl shadow-card p-5 space-y-4">
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
                    onChange={(e) => setBuyerMobile(e.target.value)}
                    maxLength={10}
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
              <Button
                data-ocid="buyer.register.submit_button"
                className="w-full"
                style={{ background: "#007AFF", border: "none" }}
                onClick={handleRegisterBuyer}
                disabled={loading}
              >
                {loading ? "Registering..." : "Register as Business Buyer"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <button
            type="button"
            data-ocid="auth.login.link"
            onClick={() => setMode("login")}
            className="font-semibold"
            style={{ color: "#007AFF" }}
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
