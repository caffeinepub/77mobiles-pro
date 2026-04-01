import { useNavigate } from "@tanstack/react-router";
import {
  ChevronRight,
  HelpCircle,
  LogOut,
  RefreshCw,
  Settings,
  Shield,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { type AppMode, useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";

export default function ProfilePage() {
  const { mode, setMode } = useApp();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSwitchMode = () => {
    const newMode: AppMode = mode === "seller" ? "buyer" : "seller";
    setMode(newMode);
    toast.success(
      `Switched to ${newMode === "seller" ? "Seller" : "Buyer"} Mode`,
    );
  };

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <div className="px-4 pt-6 pb-6 bg-[#F8F9FA] min-h-screen">
      {/* Profile header */}
      <div
        className="bg-white rounded-2xl p-5 text-center mb-4"
        style={{
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <div
          className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center"
          style={{ background: "#EEF2FF", border: "3px solid #007AFF" }}
        >
          <User className="w-10 h-10" style={{ color: "#007AFF" }} />
        </div>
        <h2 className="font-black text-lg text-gray-900">
          Verified Dealer #402
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">B2B Dealer</p>
        <div className="flex items-center justify-center gap-1.5 mt-2">
          <Shield className="w-3.5 h-3.5" style={{ color: "#007AFF" }} />
          <span className="text-xs font-semibold" style={{ color: "#007AFF" }}>
            Verified Account
          </span>
        </div>
        <div className="mt-3 bg-gray-50 rounded-xl px-3 py-2 text-left">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">GST / PAN</span>
            <span className="text-xs font-bold text-gray-900">••••••••••</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">Mobile</span>
            <span className="text-xs font-bold text-gray-900">
              ••••••{user?.mobileNumber?.slice(-4) || "XXXX"}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">Current Mode</span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
              style={{ background: mode === "seller" ? "#007AFF" : "#16a34a" }}
            >
              {mode === "seller" ? "Seller" : "Buyer"}
            </span>
          </div>
        </div>
      </div>

      {/* Switch Mode */}
      <div
        className="bg-white rounded-2xl p-4 mb-4"
        style={{
          border: "2px solid #007AFF",
          boxShadow: "0 1px 3px rgba(0,82,212,0.1)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-sm text-gray-900">
              Switch to {mode === "seller" ? "Buyer" : "Seller"} Mode
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {mode === "seller"
                ? "Browse and bid on listings"
                : "List your devices for auction"}
            </p>
          </div>
          <button
            type="button"
            data-ocid="profile.switch_mode.toggle"
            onClick={handleSwitchMode}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: "#007AFF" }}
          >
            <RefreshCw className="w-4 h-4" />
            Switch
          </button>
        </div>
      </div>

      {/* Settings list */}
      <div
        className="bg-white rounded-2xl overflow-hidden"
        style={{
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        {[
          { icon: Settings, label: "My Account", ocid: "profile.account.link" },
          {
            icon: HelpCircle,
            label: "Help & Support",
            ocid: "profile.help.link",
          },
        ].map((item, idx) => (
          <button
            key={item.label}
            type="button"
            data-ocid={item.ocid}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
            style={{
              borderBottom: idx < 1 ? "1px solid #f3f4f6" : "none",
            }}
            onClick={() => toast("Coming soon")}
          >
            <item.icon className="w-4.5 h-4.5 text-gray-500" />
            <span className="text-sm font-medium text-gray-800 flex-1">
              {item.label}
            </span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        type="button"
        data-ocid="profile.logout.button"
        onClick={handleLogout}
        className="w-full mt-4 py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
        style={{
          background: "#fef2f2",
          color: "#dc2626",
          border: "1px solid #fecaca",
        }}
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>

      {/* Footer */}
      <p className="text-center text-[10px] text-gray-400 mt-6">
        © {new Date().getFullYear()}. Built with ♥ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          caffeine.ai
        </a>
      </p>
    </div>
  );
}
