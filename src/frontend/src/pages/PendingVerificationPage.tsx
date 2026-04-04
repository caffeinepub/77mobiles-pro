import { useNavigate } from "@tanstack/react-router";
import { Clock, LogOut, Mail, Phone, Shield } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { isPhoneApproved } from "../utils/portalSettings";

/** Resolve the current user's phone from session or most-recent pending KYC submission. */
function resolveUserPhone(): string {
  try {
    const session = JSON.parse(
      localStorage.getItem("77m_phone_session") || "null",
    );
    if (session?.phone)
      return String(session.phone).replace(/^\+91/, "").replace(/^0+/, "");
    const subs: { phone?: string; status?: string }[] = JSON.parse(
      localStorage.getItem("77m_kyc_submissions") || "[]",
    );
    const pending = subs.find((k) => k.status === "pending");
    if (pending?.phone)
      return String(pending.phone).replace(/^\+91/, "").replace(/^0+/, "");
  } catch {}
  return "";
}

/** Unified approval check — checks all approval signals */
function checkApproval(): boolean {
  const phone = resolveUserPhone();

  // 1. Per-user phone approval (primary) — set by Admin via approveUserByPhone()
  if (phone && isPhoneApproved(phone)) return true;

  // 2. Direct isVerified flag — may be set by admin or login flow
  if (localStorage.getItem("77m_is_verified") === "true") return true;

  // 3. KYC submission status changed to approved/verified
  try {
    const subs: { phone?: string; status?: string }[] = JSON.parse(
      localStorage.getItem("77m_kyc_submissions") || "[]",
    );
    const myPhone = phone;
    const myEntry = myPhone
      ? subs.find(
          (k) => k.phone?.replace(/^\+91/, "").replace(/^0+/, "") === myPhone,
        )
      : null;
    if (
      myEntry?.status === "Approved" ||
      myEntry?.status === "approved" ||
      myEntry?.status === "verified"
    )
      return true;
  } catch {}

  return false;
}

export default function PendingVerificationPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isApproved, setIsApproved] = useState(false);
  const approvedRef = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: navigate is stable
  useEffect(() => {
    // Guard: if already approved on mount, redirect immediately
    if (checkApproval()) {
      handleApproval();
      return;
    }

    function handleApproval() {
      if (approvedRef.current) return; // prevent double-fire
      approvedRef.current = true;
      localStorage.setItem("77m_is_verified", "true");
      localStorage.setItem("77m_verification_status", "verified");
      setIsApproved(true);
      toast.success("Your account is now active! Welcome to 77mobiles.pro");
      setTimeout(() => navigate({ to: "/app" }), 1500);
    }

    // 1. Poll every 3s (fast polling for reliability)
    const interval = setInterval(() => {
      if (checkApproval()) handleApproval();
    }, 3000);

    // 2. Listen for storage events (fired when Admin panel changes localStorage
    //    from the same window via window.dispatchEvent OR from another tab natively)
    function onStorageEvent(e: StorageEvent) {
      if (
        e.key === "77m_approved_phones" ||
        e.key === "77m_is_verified" ||
        e.key === "77m_verification_status" ||
        e.key === "77m_kyc_submissions"
      ) {
        if (checkApproval()) handleApproval();
      }
    }
    window.addEventListener("storage", onStorageEvent);

    // 3. BroadcastChannel for instant same-origin cross-tab/same-tab communication
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("77m_kyc_channel");
      channel.onmessage = (e) => {
        if (e.data?.type === "KYC_APPROVED") {
          handleApproval();
        }
      };
    } catch {
      // BroadcastChannel not supported in this env — polling covers it
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", onStorageEvent);
      channel?.close();
    };
  }, [navigate]);

  const handleSignOut = () => {
    logout();
    localStorage.removeItem("77m_verification_status");
    localStorage.removeItem("77m_is_verified");
    localStorage.removeItem("77m_phone_session");
    navigate({ to: "/" });
  };

  const handleContactSupport = () => {
    window.open(
      "https://wa.me/917906XXXXXX?text=KYC+verification+query+from+77mobiles.pro",
      "_blank",
    );
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: "#F8FAFC" }}
    >
      {/* Success animation overlay */}
      {isApproved && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(16, 185, 129, 0.95)" }}
        >
          <div className="text-center text-white">
            <div className="text-8xl mb-4">✓</div>
            <p className="text-2xl font-black">Account Approved!</p>
            <p className="text-sm opacity-80 mt-2">
              Redirecting to dashboard...
            </p>
          </div>
        </div>
      )}

      {/* Icon */}
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
        style={{ background: "#EFF6FF", border: "3px solid #BFDBFE" }}
      >
        <Shield className="w-12 h-12" style={{ color: "#1D4ED8" }} />
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-black text-center text-gray-900 mb-3">
        Document Verification in Progress
      </h1>
      <p className="text-sm text-center text-gray-500 mb-8 max-w-sm leading-relaxed">
        To maintain a secure B2B environment, our team is currently reviewing
        your PAN and Aadhaar details. This usually takes{" "}
        <strong>12–24 business hours</strong>.
      </p>

      {/* Status card */}
      <div
        className="w-full max-w-sm rounded-2xl p-5 mb-6"
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "#FEF9C3" }}
          >
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="font-bold text-sm text-gray-900">KYC Under Review</p>
            <p className="text-xs text-gray-500">Checking for approval...</p>
          </div>
          <div
            className="ml-auto w-2 h-2 rounded-full animate-pulse"
            style={{ background: "#FACC15" }}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-xs text-gray-600">
              Registration submitted
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-xs text-gray-600">
              KYC documents under review
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            <span className="text-xs text-gray-400">
              Admin approval pending
            </span>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="w-full max-w-sm space-y-3">
        <button
          type="button"
          data-ocid="pending.whatsapp.button"
          onClick={handleContactSupport}
          className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
          style={{ background: "#1D4ED8", color: "white" }}
        >
          <Phone className="w-4 h-4" /> Contact Support via WhatsApp
        </button>
        <button
          type="button"
          data-ocid="pending.email.button"
          onClick={() => window.open("mailto:support@77mobiles.pro", "_blank")}
          className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
          style={{
            background: "white",
            color: "#1D4ED8",
            border: "1.5px solid #1D4ED8",
          }}
        >
          <Mail className="w-4 h-4" /> Email Support
        </button>
        <button
          type="button"
          data-ocid="pending.signout.button"
          onClick={handleSignOut}
          className="w-full py-3 text-sm font-semibold text-gray-400 flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-8 text-center">
        77mobiles.pro — Secure B2B Electronics Marketplace
      </p>
    </div>
  );
}
