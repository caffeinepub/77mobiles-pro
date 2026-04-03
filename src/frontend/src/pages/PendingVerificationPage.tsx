import { useNavigate } from "@tanstack/react-router";
import { Clock, LogOut, Mail, Phone, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

export default function PendingVerificationPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isApproved, setIsApproved] = useState(false);

  // Poll localStorage every 5 seconds for admin approval
  useEffect(() => {
    const check = () => {
      const status = localStorage.getItem("77m_verification_status");
      if (status === "verified") {
        setIsApproved(true);
        localStorage.setItem("77m_is_verified", "true");
        toast.success("Your account is now active! Welcome to 77mobiles.pro");
        setTimeout(() => navigate({ to: "/app" }), 1500);
      }
    };
    check(); // immediate check
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleSignOut = () => {
    logout();
    localStorage.removeItem("77m_verification_status");
    localStorage.removeItem("77m_is_verified");
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
            <p className="text-xs text-gray-500">Auto-refreshing every 5s</p>
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
