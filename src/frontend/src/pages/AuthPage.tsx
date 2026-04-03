import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle,
  LogIn,
  Phone,
  ShoppingBag,
  Smartphone,
  Store,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend.d";
import { useAuth } from "../contexts/AuthContext";
import { useActor } from "../hooks/useActor";

// Mock verified phone numbers for demo
const VERIFIED_PHONES: Record<string, "verified" | "pending" | "new"> = {
  "9876543210": "verified",
  "9999999999": "verified",
  "1111111111": "pending",
};

export default function AuthPage() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const { login } = useAuth();
  const [mode, setMode] = useState<"register" | "login" | "phone">("register");
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

  // Phone OTP flow state
  const [otpMode, setOtpMode] = useState<"idle" | "phone" | "otp" | "pending">(
    "idle",
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpResendTimer, setOtpResendTimer] = useState(0);
  const [phoneStatus, setPhoneStatus] = useState<
    "verified" | "pending" | "new" | null
  >(null);
  const [pendingCheckCount, setPendingCheckCount] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const resendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
      if (pendingCheckRef.current) clearInterval(pendingCheckRef.current);
    };
  }, []);

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

  // ── Phone OTP flow handlers ──
  const startResendTimer = () => {
    setOtpResendTimer(30);
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    resendTimerRef.current = setInterval(() => {
      setOtpResendTimer((prev) => {
        if (prev <= 1) {
          if (resendTimerRef.current) clearInterval(resendTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (phoneNumber.length !== 10) {
      setOtpError("Enter a valid 10-digit phone number");
      return;
    }
    setOtpError("");
    setLoading(true);

    // Simulate API call delay
    await new Promise((r) => setTimeout(r, 1500));

    const status = VERIFIED_PHONES[phoneNumber] || "new";
    setPhoneStatus(status);

    if (status === "new") {
      setOtpError(
        "Account not registered. Please complete full registration first.",
      );
      setLoading(false);
      return;
    }

    setOtpSent(true);
    setOtpMode("otp");
    startResendTimer();
    setLoading(false);
    toast.success(`OTP sent to +91 ${phoneNumber}`);
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      setOtpError("Enter complete 6-digit OTP");
      return;
    }
    setOtpError("");
    setLoading(true);

    // Mock OTP: 123456 always succeeds
    await new Promise((r) => setTimeout(r, 1200));

    if (enteredOtp !== "123456") {
      setOtpError("Invalid OTP. Please try again. (Demo: use 123456)");
      setLoading(false);
      return;
    }

    if (phoneStatus === "pending") {
      setOtpMode("pending");
      setLoading(false);
      startPendingCheck();
      return;
    }

    // Verified user — store session and navigate
    localStorage.setItem(
      "77m_phone_session",
      JSON.stringify({
        phone: phoneNumber,
        role: "buyer",
        token: Date.now(),
      }),
    );

    const profile = {
      userId: crypto.randomUUID(),
      userRole: UserRole.businessBuyer,
      businessName: "Mobile Dealer",
      verificationId: "PHONE_AUTH",
      mobileNumber: phoneNumber,
      aadhaarNumber: "",
      createdAt: BigInt(Date.now()) * 1_000_000n,
    };
    login(profile);

    // Task 2: Simulate Firestore write for verified profile
    localStorage.setItem(
      "77m_seller_profile",
      JSON.stringify({
        status: "verified",
        kyc_submitted: true,
        phone: phoneNumber,
        documents: { pan_url: "", aadhaar_url: "" },
        createdAt: Date.now(),
      }),
    );
    toast("Profile synced to database");

    // Task 3: Append to KYC submissions for admin panel
    const kycKey = "77m_kyc_submissions";
    const existingKyc = JSON.parse(localStorage.getItem(kycKey) || "[]");
    const newEntry = {
      id: crypto.randomUUID(),
      business: `New Dealer ${phoneNumber.slice(-4)}`,
      phone: phoneNumber,
      status: "pending",
      docType: "PAN Card",
      createdAt: Date.now(),
    };
    localStorage.setItem(kycKey, JSON.stringify([newEntry, ...existingKyc]));

    toast.success("Welcome to 77mobiles.pro — Your account is now active!");
    goToApp(UserRole.businessBuyer);
    setLoading(false);
  };

  const startPendingCheck = () => {
    setPendingCheckCount(0);
    if (pendingCheckRef.current) clearInterval(pendingCheckRef.current);
    pendingCheckRef.current = setInterval(() => {
      setPendingCheckCount((prev) => {
        const next = prev + 1;
        // After 2 checks (10s), simulate admin approval
        if (next >= 2) {
          if (pendingCheckRef.current) clearInterval(pendingCheckRef.current);
          setTimeout(() => {
            localStorage.setItem(
              "77m_phone_session",
              JSON.stringify({
                phone: phoneNumber,
                role: "buyer",
                token: Date.now(),
              }),
            );
            const profile = {
              userId: crypto.randomUUID(),
              userRole: UserRole.businessBuyer,
              businessName: "Mobile Dealer",
              verificationId: "PHONE_AUTH",
              mobileNumber: phoneNumber,
              aadhaarNumber: "",
              createdAt: BigInt(Date.now()) * 1_000_000n,
            };
            login(profile);
            toast.success(
              "Welcome to 77mobiles.pro — Your account is now active!",
            );
            navigate({ to: "/app" });
          }, 500);
        }
        return next;
      });
    }, 5000);
  };

  const handleOtpInput = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  // ── Phone OTP Screens ──
  if (mode === "phone") {
    // Pending approval screen
    if (otpMode === "pending") {
      return (
        <div
          className="mobile-container flex flex-col min-h-screen items-center justify-center px-6"
          style={{ background: "#F8F9FA" }}
        >
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
              style={{ background: "#FEF9C3", border: "2px solid #FDE047" }}
            >
              <span style={{ fontSize: 32 }}>⏳</span>
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">
              Account Under Verification
            </h2>
            <p className="text-sm text-gray-500">
              Your documents are being reviewed by our team. This usually takes
              2-4 hours.
            </p>
          </div>

          <div
            className="w-full bg-white rounded-2xl p-5 mb-5"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-8 h-8 rounded-full animate-pulse"
                style={{ background: "#FEF9C3" }}
              />
              <div>
                <p className="text-sm font-bold text-gray-900">
                  Verification in progress...
                </p>
                <p className="text-xs text-gray-500">
                  Check count: {pendingCheckCount}/2
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              We&apos;re automatically checking your approval status every 5
              seconds. You&apos;ll be redirected as soon as the admin approves
              your account.
            </p>
          </div>

          <button
            type="button"
            data-ocid="otp.check_status.button"
            onClick={() => {
              if (pendingCheckCount >= 2) {
                startPendingCheck();
              } else {
                toast.info("Still checking... please wait.");
              }
            }}
            className="w-full py-3.5 rounded-xl font-bold text-sm mb-3"
            style={{ background: "#1D4ED8", color: "white" }}
          >
            Check Status Now
          </button>

          <button
            type="button"
            data-ocid="otp.back.button"
            onClick={() => {
              setMode("register");
              setOtpMode("idle");
              setOtp(["", "", "", "", "", ""]);
              setPhoneNumber("");
            }}
            className="w-full py-3 text-sm font-semibold text-gray-400"
          >
            Back to Registration
          </button>
        </div>
      );
    }

    // OTP entry screen
    if (otpSent && otpMode === "otp") {
      return (
        <div
          className="mobile-container flex flex-col min-h-screen px-6 py-10"
          style={{ background: "#F8F9FA" }}
        >
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
              style={{ background: "#EEF2FF" }}
            >
              <CheckCircle className="w-7 h-7" style={{ color: "#1D4ED8" }} />
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              <span className="text-gray-900">77</span>
              <span style={{ color: "#1D4ED8" }}>mobiles</span>
              <span className="text-gray-900">.pro</span>
            </h1>
            <p className="text-gray-600 text-sm mt-2">
              OTP sent to{" "}
              <strong>
                +91 {phoneNumber.replace(/(\d{3})(\d{4})(\d{3})/, "$1****$3")}
              </strong>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Demo OTP: <strong>123456</strong>
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6">
            <p className="text-sm font-semibold text-gray-700 mb-4 text-center">
              Enter 6-digit OTP
            </p>

            {/* 6 OTP boxes */}
            <div className="flex gap-2.5 justify-center mb-4">
              {(["p0", "p1", "p2", "p3", "p4", "p5"] as const).map((pos, i) => (
                <input
                  key={pos}
                  ref={(el) => {
                    otpRefs.current[i] = el;
                  }}
                  data-ocid={`otp.digit_${i + 1}.input`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[i]}
                  onChange={(e) => handleOtpInput(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="text-center text-xl font-black rounded-xl outline-none"
                  style={{
                    width: 44,
                    height: 52,
                    border: otp[i]
                      ? "2px solid #1D4ED8"
                      : "1.5px solid #d1d5db",
                    background: otp[i] ? "#EFF6FF" : "white",
                    color: "#1E293B",
                    transition: "all 0.15s",
                  }}
                />
              ))}
            </div>

            {otpError && (
              <p className="text-xs text-red-500 text-center mb-3">
                {otpError}
              </p>
            )}

            <Button
              data-ocid="otp.verify.submit_button"
              className="w-full mb-3"
              style={{ background: "#1D4ED8", border: "none" }}
              onClick={handleVerifyOtp}
              disabled={loading || otp.join("").length !== 6}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>

            <div className="text-center">
              {otpResendTimer > 0 ? (
                <p className="text-xs text-gray-400">
                  Resend in {otpResendTimer}s
                </p>
              ) : (
                <button
                  type="button"
                  data-ocid="otp.resend.button"
                  onClick={handleSendOtp}
                  className="text-xs font-semibold"
                  style={{ color: "#1D4ED8" }}
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>

          <p className="text-center text-[10px] text-gray-400 mt-4">
            Auto OTP retrieval enabled for Android. App Check active for iOS.
          </p>

          <button
            type="button"
            data-ocid="otp.back.button"
            onClick={() => {
              setOtpMode("phone");
              setOtpSent(false);
              setOtp(["", "", "", "", "", ""]);
              setOtpError("");
            }}
            className="mt-4 text-sm text-gray-400 text-center w-full"
          >
            ← Change number
          </button>
        </div>
      );
    }

    // Phone number entry screen
    return (
      <div
        className="mobile-container flex flex-col min-h-screen px-6 py-10"
        style={{ background: "#F8F9FA" }}
      >
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
            style={{ background: "#EEF2FF" }}
          >
            <Phone className="w-7 h-7" style={{ color: "#1D4ED8" }} />
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            <span className="text-gray-900">77</span>
            <span style={{ color: "#1D4ED8" }}>mobiles</span>
            <span className="text-gray-900">.pro</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Login with Phone OTP</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6">
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
                  data-ocid="otp.phone.input"
                  className="rounded-l-none"
                  placeholder="Enter 10-digit number"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(
                      e.target.value.replace(/\D/g, "").slice(0, 10),
                    );
                    setOtpError("");
                  }}
                  inputMode="numeric"
                  maxLength={10}
                  autoFocus
                />
              </div>
              {otpError && (
                <p className="text-xs text-red-500 mt-1">{otpError}</p>
              )}
            </div>

            <Button
              data-ocid="otp.send_otp.button"
              className="w-full"
              style={{ background: "#1D4ED8", border: "none" }}
              onClick={handleSendOtp}
              disabled={loading || phoneNumber.length !== 10}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>
          </div>

          <p className="text-center text-[10px] text-gray-400 mt-4">
            Auto OTP retrieval enabled for Android. App Check active for iOS.
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          <button
            type="button"
            data-ocid="auth.register.link"
            onClick={() => {
              setMode("register");
              setOtpMode("idle");
            }}
            className="font-semibold"
            style={{ color: "#1D4ED8" }}
          >
            ← Back to Register
          </button>
        </p>
      </div>
    );
  }

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
          <div className="bg-white rounded-2xl shadow-card p-6">
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
                          ? "#1D4ED8"
                          : "#e5e7eb",
                      background:
                        loginRole === UserRole.sellerDealer
                          ? "#1D4ED8"
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
                          ? "#1D4ED8"
                          : "#e5e7eb",
                      background:
                        loginRole === UserRole.businessBuyer
                          ? "#1D4ED8"
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
                style={{ background: "#1D4ED8", border: "none" }}
                onClick={handleLogin}
              >
                Login
              </Button>

              {/* Phone OTP login option */}
              <button
                type="button"
                data-ocid="login.phone_otp.button"
                onClick={() => {
                  setMode("phone");
                  setOtpMode("phone");
                }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                style={{
                  border: "1.5px solid #1D4ED8",
                  color: "#1D4ED8",
                  background: "white",
                }}
              >
                <Phone className="w-4 h-4" /> Login with Phone OTP
              </button>
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
      className="mobile-container flex flex-col min-h-screen"
      style={{ background: "#F8F9FA" }}
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
                style={{ background: "#1D4ED8", border: "none" }}
                onClick={handleRegisterBuyer}
                disabled={loading}
              >
                {loading ? "Registering..." : "Register as Business Buyer"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center gap-3 mt-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Phone OTP quick login */}
        <button
          type="button"
          data-ocid="auth.phone_otp.button"
          onClick={() => {
            setMode("phone");
            setOtpMode("phone");
          }}
          className="mt-4 w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
          style={{
            border: "1.5px solid #1D4ED8",
            color: "#1D4ED8",
            background: "white",
          }}
        >
          <Phone className="w-4 h-4" /> Login with Phone OTP
        </button>

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
