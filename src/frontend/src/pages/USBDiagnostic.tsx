import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowLeft,
  Battery,
  CheckCircle2,
  Loader2,
  Monitor,
  Shield,
  Smartphone,
  Usb,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const USB_STEPS = [
  { label: "Connecting to device...", icon: Usb },
  { label: "Reading IMEI & Serial Number...", icon: Shield },
  { label: "Running battery diagnostics...", icon: Battery },
  { label: "Running 7-point screen test...", icon: Monitor },
];

const DEMO_DATA = {
  model: "iPhone 17 Pro",
  storage: "256GB",
  batteryHealth: "92%",
  serialNumber: "••••••••••",
  imei: "353xxxxxxxxx7014",
};

type UsbState = "idle" | "connected" | "scanning" | "verified";

export default function USBDiagnostic() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { scrap?: string };
  const isScrap = search?.scrap === "true";

  const [state, setState] = useState<UsbState>("idle");
  const [completedSteps, setCompletedSteps] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Simulate device detection after 2s
    timerRef.current = setTimeout(() => {
      setState("connected");
    }, 2000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const startScan = () => {
    setState("scanning");
    setCompletedSteps(0);
    let step = 0;
    const advance = () => {
      step += 1;
      setCompletedSteps(step);
      if (step < USB_STEPS.length) {
        timerRef.current = setTimeout(advance, 700);
      } else {
        timerRef.current = setTimeout(() => setState("verified"), 500);
      }
    };
    timerRef.current = setTimeout(advance, 600);
  };

  const proceedToListing = () => {
    navigate({
      to: "/sell",
      search: {
        mode: "manual",
        scrap: isScrap ? "true" : "false",
        prefillBrand: "Apple",
        prefillModel: DEMO_DATA.model,
        category: "",
      },
    });
  };

  return (
    <div className="mobile-container bg-white min-h-screen flex flex-col">
      <header
        className="px-4 py-3 flex items-center gap-3"
        style={{ background: "#F8F9FA", borderBottom: "1px solid #e5e7eb" }}
      >
        <button
          type="button"
          data-ocid="usb.back.button"
          onClick={() => navigate({ to: "/sell-choice" })}
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <span className="font-black text-base text-gray-900 flex-1">
          Device Diagnostics
        </span>
        <Usb className="w-5 h-5" style={{ color: "#007AFF" }} />
      </header>

      <div className="flex-1 px-4 py-6 space-y-5">
        {/* IDLE — waiting for connection */}
        {state === "idle" && (
          <div className="text-center py-10">
            <div
              className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ background: "#EEF2FF" }}
            >
              <Usb
                className="w-12 h-12 animate-pulse"
                style={{ color: "#007AFF" }}
              />
            </div>
            <h2 className="font-black text-xl text-gray-900">
              Connect Device via USB
            </h2>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed px-6">
              Please connect the device to your system/hub to run the 77mobiles
              Pro Diagnostic System.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Loader2
                className="w-4 h-4 animate-spin"
                style={{ color: "#007AFF" }}
              />
              <span className="text-sm" style={{ color: "#007AFF" }}>
                Waiting for device...
              </span>
            </div>
          </div>
        )}

        {/* CONNECTED */}
        {state === "connected" && (
          <div className="space-y-5">
            <div
              className="flex items-center gap-3 p-4 rounded-2xl"
              style={{ background: "#f0fdf4", border: "2px solid #22c55e" }}
            >
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-bold text-sm text-green-800">
                  Device Connected ✓
                </p>
                <p className="text-xs text-green-600 mt-0.5">Ready to scan</p>
              </div>
            </div>

            <div className="text-center py-4">
              <div
                className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: "#EEF2FF" }}
              >
                <Smartphone
                  className="w-10 h-10"
                  style={{ color: "#007AFF" }}
                />
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                USB diagnostic will auto-verify:
                <br />
                Model, Storage, Battery Health, Screen condition
              </p>
            </div>

            <button
              type="button"
              data-ocid="usb.start_scan.primary_button"
              onClick={startScan}
              className="w-full py-3.5 rounded-2xl text-white font-black text-base"
              style={{ background: "#007AFF" }}
            >
              Start Scan
            </button>
          </div>
        )}

        {/* SCANNING */}
        {state === "scanning" && (
          <div className="space-y-4">
            <h2 className="font-black text-lg text-gray-900 text-center">
              Running Diagnostics...
            </h2>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(completedSteps / USB_STEPS.length) * 100}%`,
                  background: "#007AFF",
                }}
              />
            </div>
            <div className="space-y-2">
              {USB_STEPS.map((s, idx) => {
                const done = idx < completedSteps;
                const active = idx === completedSteps;
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all"
                    style={{
                      background: done
                        ? "#f0fdf4"
                        : active
                          ? "#eff6ff"
                          : "#F8F9FA",
                      border: done
                        ? "1px solid #bbf7d0"
                        : active
                          ? "1px solid #bfdbfe"
                          : "1px solid #f3f4f6",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: done
                          ? "#dcfce7"
                          : active
                            ? "#dbeafe"
                            : "#f3f4f6",
                      }}
                    >
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : active ? (
                        <Loader2
                          className="w-4 h-4 animate-spin"
                          style={{ color: "#007AFF" }}
                        />
                      ) : (
                        <Icon className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <span
                      className="text-xs font-medium"
                      style={{
                        color: done
                          ? "#166534"
                          : active
                            ? "#1d4ed8"
                            : "#9ca3af",
                      }}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VERIFIED */}
        {state === "verified" && (
          <div className="space-y-4">
            <div
              className="text-center py-5 rounded-2xl"
              style={{ background: "#f0fdf4", border: "2px solid #22c55e" }}
            >
              <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center bg-green-100">
                <CheckCircle2 className="w-9 h-9 text-green-600" />
              </div>
              <p className="font-black text-green-800">
                USB-Verified by 77mobiles Pro
              </p>
              <p className="text-xs text-green-600 mt-1">
                Device successfully scanned
              </p>
            </div>

            {/* Auto-populated fields */}
            <div
              className="bg-white rounded-2xl p-4 space-y-3"
              style={{ border: "1px solid #e5e7eb" }}
            >
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Auto-populated Device Data
              </p>
              {[
                { label: "Model", value: DEMO_DATA.model, icon: Smartphone },
                { label: "Storage", value: DEMO_DATA.storage, icon: Shield },
                {
                  label: "Battery Health",
                  value: DEMO_DATA.batteryHealth,
                  icon: Battery,
                },
                {
                  label: "Serial Number",
                  value: DEMO_DATA.serialNumber,
                  icon: Shield,
                },
              ].map((field) => (
                <div key={field.label} className="flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: "#f3f4f6" }}
                  >
                    <field.icon className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400">{field.label}</p>
                    <p className="text-sm font-bold text-gray-900">
                      {field.value}
                    </p>
                  </div>
                  <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    READ-ONLY
                  </span>
                </div>
              ))}
            </div>

            {/* Screen pass */}
            <div
              className="flex items-center gap-3 p-3.5 rounded-xl"
              style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
            >
              <Monitor className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-green-800">
                    100% Screen Pass
                  </span>
                  <span className="bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    PASSED
                  </span>
                </div>
                <p className="text-xs text-green-700 mt-0.5">
                  No dead pixels or touch issues.
                </p>
              </div>
            </div>

            {/* 77mobiles Pro badge */}
            <div className="text-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100">
                <Shield className="w-4 h-4 text-purple-700" />
                <span className="text-sm font-bold text-purple-700">
                  77mobiles Pro Certified
                </span>
              </span>
            </div>

            <button
              type="button"
              data-ocid="usb.proceed.button"
              onClick={proceedToListing}
              className="w-full py-3 rounded-2xl text-white font-bold"
              style={{ background: "#007AFF" }}
            >
              Proceed to Listing →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
