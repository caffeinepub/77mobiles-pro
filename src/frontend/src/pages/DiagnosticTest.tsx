import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowLeft,
  Battery,
  CheckCircle,
  Download,
  Fingerprint,
  Loader2,
  Monitor,
  Shield,
  Smartphone,
  TouchpadOff,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const CHECKS = [
  {
    id: "battery",
    label: "Battery Health",
    result: "92%",
    icon: Battery,
    color: "#22c55e",
  },
  {
    id: "screen",
    label: "Screen Pixels",
    result: "No dead pixels",
    icon: Monitor,
    color: "#22c55e",
  },
  {
    id: "touch",
    label: "Touch Sensitivity",
    result: "All zones pass",
    icon: TouchpadOff,
    color: "#22c55e",
  },
  {
    id: "faceid",
    label: "Face ID / Biometrics",
    result: "Operational",
    icon: Fingerprint,
    color: "#22c55e",
  },
];

export default function DiagnosticTest() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { scrap?: string };
  const isScrap = search?.scrap === "true";

  const [step, setStep] = useState<"idle" | "running" | "done">("idle");
  const [completedChecks, setCompletedChecks] = useState(0);
  const [progress, setProgress] = useState(0);
  const [certReady, setCertReady] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runDiagnostic = () => {
    setStep("running");
    setCompletedChecks(0);
    setProgress(0);
    let current = 0;
    timerRef.current = setInterval(() => {
      current += 1;
      setCompletedChecks(current);
      setProgress((current / CHECKS.length) * 100);
      if (current >= CHECKS.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        setStep("done");
      }
    }, 700);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const generateCert = () => {
    toast.success("Diagnostic certificate generated!");
    setCertReady(true);
  };

  const proceedToListing = () => {
    navigate({
      to: "/sell",
      search: {
        mode: "manual",
        scrap: isScrap ? "true" : "false",
        prefillBrand: "",
        prefillModel: "",
        category: "",
      },
    });
  };

  return (
    <div className="mobile-container bg-white min-h-screen flex flex-col">
      {/* Header */}
      <header
        className="px-4 py-3 flex items-center gap-3"
        style={{ background: "#F8F9FA", borderBottom: "1px solid #e5e7eb" }}
      >
        <button
          type="button"
          data-ocid="diagnostic.back.button"
          onClick={() => navigate({ to: "/sell-choice" })}
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <span className="font-black text-base text-gray-900 flex-1">
          Device Diagnostics — 60s Test
        </span>
        <Smartphone className="w-5 h-5" style={{ color: "#007AFF" }} />
      </header>

      <div className="flex-1 px-4 py-6 space-y-5">
        {isScrap && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "#fef2f2", border: "1px solid #fca5a5" }}
          >
            <Shield className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold text-red-700">
              Scrap/Parts mode active — condition will be locked to &quot;Parts
              Only&quot;
            </span>
          </div>
        )}

        {step === "idle" && (
          <div className="text-center py-8">
            <div
              className="w-24 h-24 rounded-full mx-auto mb-5 flex items-center justify-center"
              style={{ background: "#EEF2FF", border: "3px solid #007AFF" }}
            >
              <Smartphone className="w-12 h-12" style={{ color: "#007AFF" }} />
            </div>
            <h2 className="font-black text-xl text-gray-900">
              Scan This Phone
            </h2>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed px-6">
              Run a 60-second diagnostic to auto-verify specs and battery
              health.
            </p>
            <div className="mt-6 space-y-2 text-left">
              {CHECKS.map((check) => (
                <div
                  key={check.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{ background: "#F8F9FA", border: "1px solid #e5e7eb" }}
                >
                  <check.icon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{check.label}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              data-ocid="diagnostic.start.primary_button"
              onClick={runDiagnostic}
              className="mt-6 w-full py-3.5 rounded-2xl text-white font-black text-base"
              style={{ background: "#007AFF" }}
            >
              Start 60s Diagnostic
            </button>
          </div>
        )}

        {step === "running" && (
          <div className="space-y-4">
            <h2 className="font-black text-lg text-gray-900 text-center">
              Running Diagnostics...
            </h2>

            {/* Progress bar */}
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: "#007AFF" }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center">
              {completedChecks}/{CHECKS.length} checks complete
            </p>

            <div className="space-y-3">
              {CHECKS.map((check, idx) => {
                const done = idx < completedChecks;
                const active = idx === completedChecks;
                return (
                  <div
                    key={check.id}
                    className="flex items-center gap-3 p-3.5 rounded-xl transition-all"
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
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: done
                          ? "#dcfce7"
                          : active
                            ? "#dbeafe"
                            : "#f3f4f6",
                      }}
                    >
                      {done ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : active ? (
                        <Loader2
                          className="w-5 h-5 animate-spin"
                          style={{ color: "#007AFF" }}
                        />
                      ) : (
                        <check.icon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className="text-sm font-bold"
                        style={{
                          color: done
                            ? "#166534"
                            : active
                              ? "#1d4ed8"
                              : "#9ca3af",
                        }}
                      >
                        {check.label}
                      </p>
                      {done && (
                        <p className="text-xs text-green-600">
                          {check.result} ✓
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="space-y-4">
            {/* All passed */}
            <div
              className="text-center py-5 rounded-2xl"
              style={{ background: "#f0fdf4", border: "2px solid #22c55e" }}
            >
              <div
                className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ background: "#dcfce7" }}
              >
                <CheckCircle className="w-9 h-9 text-green-600" />
              </div>
              <h2 className="font-black text-lg text-green-800">
                All Checks Passed!
              </h2>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100">
                <Shield className="w-3.5 h-3.5 text-purple-700" />
                <span className="text-xs font-bold text-purple-700">
                  77mobiles Pro Certified
                </span>
              </div>
            </div>

            {/* Check results */}
            <div className="space-y-2">
              {CHECKS.map((check) => (
                <div
                  key={check.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
                >
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-green-800">
                      {check.label}
                    </span>
                    <span className="text-xs text-green-600 ml-2">
                      {check.result}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Certificate */}
            {!certReady ? (
              <button
                type="button"
                data-ocid="diagnostic.generate_cert.button"
                onClick={generateCert}
                className="w-full py-3 rounded-2xl text-white font-bold text-sm"
                style={{ background: "#7c3aed" }}
              >
                Generating Diagnostic Certificate...
              </button>
            ) : (
              <button
                type="button"
                data-ocid="diagnostic.download_cert.button"
                onClick={() => toast.success("Certificate downloaded!")}
                className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                style={{
                  background: "#f3e8ff",
                  color: "#7c3aed",
                  border: "1px solid #c4b5fd",
                }}
              >
                <Download className="w-4 h-4" />
                Certificate Ready — Download PDF
              </button>
            )}

            <button
              type="button"
              data-ocid="diagnostic.proceed.button"
              onClick={proceedToListing}
              className="w-full py-3 rounded-2xl text-white font-bold text-sm"
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
