import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function IOSInstallGuide() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    const isChrome = /CriOS/.test(ua);
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    const dismissed = localStorage.getItem("77m_ios_guide_dismissed");

    if (isIOS && isChrome && !isStandalone && !dismissed) {
      // Slight delay so the app renders first
      const t = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(t);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem("77m_ios_guide_dismissed", "1");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied!");
    } catch {
      toast.error("Could not copy link — please copy it from the address bar.");
    }
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.5)" }}
      data-ocid="ios_install_guide.modal"
    >
      <div
        className="w-full max-w-lg bg-white pb-8 px-6 pt-5"
        style={{
          borderRadius: "24px 24px 0 0",
          boxShadow: "0 -4px 32px rgba(0,0,0,0.18)",
          paddingBottom: "calc(2rem + env(safe-area-inset-bottom))",
        }}
      >
        {/* Close button */}
        <div className="flex items-center justify-between mb-4">
          <div />
          <button
            type="button"
            data-ocid="ios_install_guide.close_button"
            onClick={handleDismiss}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "#F3F4F6" }}
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Safari icon + title */}
        <div className="text-center mb-5">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl"
            style={{
              background: "linear-gradient(135deg, #007AFF 0%, #005CBF 100%)",
              boxShadow: "0 4px 12px rgba(0,122,255,0.3)",
            }}
          >
            🧭
          </div>
          <h2 className="font-black text-lg text-gray-900">
            Open in Safari to Install
          </h2>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            77mobiles.pro works best when installed. Chrome on iPhone doesn't
            support installation — open this page in Safari.
          </p>
        </div>

        {/* Steps */}
        <div
          className="rounded-2xl p-4 mb-4 space-y-3"
          style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
        >
          {[
            {
              num: "1",
              text: "Copy the link below",
              icon: "📋",
            },
            {
              num: "2",
              text: "Open Safari and paste the link",
              icon: "🧭",
            },
            {
              num: "3",
              text: "Tap Share → Add to Home Screen",
              icon: "⬆️",
            },
          ].map((step) => (
            <div key={step.num} className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                style={{ background: "#1D4ED8" }}
              >
                {step.num}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">{step.icon}</span>
                <span className="text-sm font-medium text-gray-800">
                  {step.text}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Copy Link button */}
        <button
          type="button"
          data-ocid="ios_install_guide.copy_link.button"
          onClick={handleCopyLink}
          className="w-full py-3.5 rounded-2xl font-bold text-white text-sm mb-3"
          style={{ background: "#1D4ED8" }}
        >
          Copy Link
        </button>

        {/* Dismiss */}
        <button
          type="button"
          data-ocid="ios_install_guide.dismiss.button"
          onClick={handleDismiss}
          className="w-full py-2 text-sm text-gray-400 font-medium"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
