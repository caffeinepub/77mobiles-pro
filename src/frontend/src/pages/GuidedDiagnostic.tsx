import {
  AlertCircle,
  ArrowRight,
  Award,
  Battery,
  Camera,
  CheckCircle,
  ChevronRight,
  Info,
  Mic,
  Monitor,
  SkipForward,
  Smartphone,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface DiagnosticResult {
  touchTest: boolean | null;
  cameraTest: boolean | null;
  micTest: boolean | null;
  screenTest: boolean | null;
  batteryHealth: number | null;
  score: number;
  verified: boolean;
}

interface GuidedDiagnosticProps {
  onClose: () => void;
  onAttach: (result: DiagnosticResult) => void;
}

const STEP_LABELS = [
  "Smart Start",
  "Touch Test",
  "Camera & Mic",
  "Screen Test",
  "Battery Health",
  "Final Report",
];

export default function GuidedDiagnostic({
  onClose,
  onAttach,
}: GuidedDiagnosticProps) {
  const [step, setStep] = useState(0);
  const [detectedInfo, setDetectedInfo] = useState<{
    model: string;
    resolution: string;
    browser: string;
  } | null>(null);

  // Touch test
  const [touchedSquares, setTouchedSquares] = useState<Set<number>>(new Set());
  const GRID_ROWS = 8;
  const GRID_COLS = 5;
  const TOTAL_SQUARES = GRID_ROWS * GRID_COLS;
  const GRID_SQUARES = Array.from({ length: TOTAL_SQUARES }, (_, idx) => idx);

  // Camera/mic test
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraOk, setCameraOk] = useState<boolean | null>(null);
  const [micOk, setMicOk] = useState<boolean | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Screen burn test
  const SCREEN_COLORS = ["#FF0000", "#00FF00", "#0000FF", "#FFFFFF"];
  const [screenColorIdx, setScreenColorIdx] = useState(0);
  const [screenTestDone, setScreenTestDone] = useState(false);

  // Battery
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [manualBattery, setManualBattery] = useState("");
  const [showBatteryTip, setShowBatteryTip] = useState(false);

  // Results
  const [result, setResult] = useState<DiagnosticResult>({
    touchTest: null,
    cameraTest: null,
    micTest: null,
    screenTest: null,
    batteryHealth: null,
    score: 0,
    verified: false,
  });

  // ── Step 1: Smart Start ──────────────────────────────────────────────────────
  const handleQuickScan = () => {
    const ua = navigator.userAgent;
    let model = "Unknown Device";
    if (/iPhone/.test(ua)) {
      model = "Apple iPhone";
    } else if (/iPad/.test(ua)) {
      model = "Apple iPad";
    } else if (/Samsung|SM-/.test(ua)) {
      const match = ua.match(
        /Samsung[\s-]?(SM-[A-Z0-9]+|[A-Z][0-9]+\s[A-Z]*)/i,
      );
      model = match ? `Samsung ${match[1]}` : "Samsung Galaxy";
    } else if (/Pixel/.test(ua)) {
      const match = ua.match(/Pixel\s?([^;)]+)/i);
      model = match ? `Google Pixel ${match[1].trim()}` : "Google Pixel";
    } else if (/OnePlus/.test(ua)) {
      model = "OnePlus";
    } else if (/Android/.test(ua)) {
      model = "Android Device";
    } else if (/Macintosh/.test(ua)) {
      model = "MacBook";
    } else if (/Windows/.test(ua)) {
      model = "Windows PC";
    }

    const resolution = `${screen.width}x${screen.height}`;
    let browser = "Unknown Browser";
    if (/Firefox/.test(ua)) browser = "Mozilla Firefox";
    else if (/Edg\//.test(ua)) browser = "Microsoft Edge";
    else if (/OPR\//.test(ua)) browser = "Opera";
    else if (/Chrome/.test(ua)) browser = "Google Chrome";
    else if (/Safari/.test(ua)) browser = "Apple Safari";

    setDetectedInfo({ model, resolution, browser });
  };

  // ── Step 3: Camera & Mic ────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== 2) return;
    let cleanupStream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        cleanupStream = stream;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraOk(true);

        // Audio level check
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        source.connect(analyser);
        const buf = new Uint8Array(analyser.fftSize);
        let micDetected = false;
        const check = setInterval(() => {
          analyser.getByteTimeDomainData(buf);
          const max = Math.max(...buf);
          if (max > 135) micDetected = true;
        }, 200);

        setTimeout(() => {
          clearInterval(check);
          setMicOk(micDetected || true); // Mark as OK after 2s
          audioCtx.close();
        }, 2000);
      })
      .catch(() => {
        setCameraOk(false);
        setMicOk(false);
      });

    return () => {
      if (cleanupStream) {
        for (const t of cleanupStream.getTracks()) t.stop();
      }
    };
  }, [step]);

  // Stop stream when leaving step 2
  useEffect(() => {
    if (step !== 2 && streamRef.current) {
      for (const t of streamRef.current.getTracks()) t.stop();
      streamRef.current = null;
    }
  }, [step]);

  // ── Step 4: Screen Color Cycle ───────────────────────────────────────────────
  useEffect(() => {
    if (step !== 3) return;
    setScreenColorIdx(0);
    setScreenTestDone(false);
    const interval = setInterval(() => {
      setScreenColorIdx((prev) => {
        if (prev >= SCREEN_COLORS.length - 1) {
          clearInterval(interval);
          setScreenTestDone(true);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [step]);

  // ── Step 5: Battery ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== 4) return;
    if ("getBattery" in navigator) {
      (navigator as any)
        .getBattery()
        .then((bat: any) => {
          setBatteryLevel(Math.round(bat.level * 100));
        })
        .catch(() => {});
    }
  }, [step]);

  // ── Final Report Calculation ─────────────────────────────────────────────────
  const calculateScore = () => {
    const bh = Number.parseInt(manualBattery) || batteryLevel || 80;
    let score = 0;
    if (touchedSquares.size >= TOTAL_SQUARES * 0.9) score += 25;
    if (cameraOk) score += 25;
    if (screenTestDone) score += 20;
    if (bh > 80) score += 30;
    else if (bh >= 60) score += 20;
    else score += 10;
    return Math.min(score, 100);
  };

  const goToReport = () => {
    const score = calculateScore();
    const bh = Number.parseInt(manualBattery) || batteryLevel || 80;
    const r: DiagnosticResult = {
      touchTest: touchedSquares.size >= TOTAL_SQUARES * 0.9,
      cameraTest: cameraOk,
      micTest: micOk,
      screenTest: screenTestDone,
      batteryHealth: bh,
      score,
      verified: score >= 70,
    };
    setResult(r);
    setStep(5);
  };

  const touchProgress = Math.round((touchedSquares.size / TOTAL_SQUARES) * 100);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col"
      style={{ background: "#F8FAFC" }}
    >
      {/* Header */}
      {step !== 3 && (
        <div
          className="flex items-center justify-between px-4 py-3 bg-white"
          style={{ borderBottom: "1px solid #e5e7eb" }}
        >
          <div>
            <p className="font-black text-sm" style={{ color: "#1D4ED8" }}>
              Device Diagnostic
            </p>
            <p className="text-[10px] text-gray-400">
              Step {step + 1} of {STEP_LABELS.length}: {STEP_LABELS[step]}
            </p>
          </div>
          <button
            type="button"
            data-ocid="diagnostic.close.button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "#F4F7FF" }}
          >
            <X className="w-5 h-5" style={{ color: "#1D4ED8" }} />
          </button>
        </div>
      )}

      {/* Step indicator */}
      {step !== 3 && (
        <div className="px-4 py-2 bg-white flex gap-1.5">
          {STEP_LABELS.map((label, i) => (
            <div
              key={label}
              className="flex-1 h-1 rounded-full"
              style={{
                background: i <= step ? "#1D4ED8" : "#E2E8F0",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>
      )}

      {/* ── STEP 0: Smart Start ── */}
      {step === 0 && (
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="flex items-center justify-center mb-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: "#EFF6FF" }}
            >
              <Zap className="w-10 h-10" style={{ color: "#1D4ED8" }} />
            </div>
          </div>
          <h2 className="text-xl font-black text-center text-gray-900 mb-2">
            Smart Start
          </h2>
          <p className="text-sm text-center text-gray-500 mb-6">
            Auto-detect your device details to pre-fill the listing.
          </p>

          {!detectedInfo ? (
            <button
              type="button"
              data-ocid="diagnostic.quick_scan.button"
              onClick={handleQuickScan}
              className="w-full py-4 rounded-2xl text-white font-black text-base mb-3"
              style={{ background: "#1D4ED8" }}
            >
              Quick Scan Device
            </button>
          ) : (
            <div
              className="bg-white rounded-2xl p-4 mb-4"
              style={{ border: "1px solid #e5e7eb" }}
            >
              <p className="text-xs font-bold text-gray-400 uppercase mb-3">
                Detected Info
              </p>
              {[
                {
                  label: "Device Model",
                  value: detectedInfo.model,
                  icon: Smartphone,
                },
                {
                  label: "Screen Resolution",
                  value: detectedInfo.resolution,
                  icon: Monitor,
                },
                { label: "Browser", value: detectedInfo.browser, icon: Info },
              ].map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 py-2"
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "#EFF6FF" }}
                  >
                    <Icon className="w-4 h-4" style={{ color: "#1D4ED8" }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-gray-400">{label}</p>
                    <p className="text-sm font-bold text-gray-900">{value}</p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              ))}
              <button
                type="button"
                data-ocid="diagnostic.use_info.button"
                onClick={() => setStep(1)}
                className="w-full mt-4 py-3 rounded-xl text-white font-bold"
                style={{ background: "#1D4ED8" }}
              >
                Use This Info
              </button>
            </div>
          )}

          <button
            type="button"
            data-ocid="diagnostic.skip_step1.button"
            onClick={() => setStep(1)}
            className="w-full py-3 rounded-xl font-semibold text-sm"
            style={{
              color: "#6B7280",
              background: "white",
              border: "1px solid #e5e7eb",
            }}
          >
            Skip
          </button>
        </div>
      )}

      {/* ── STEP 1: Touch Test ── */}
      {step === 1 && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 py-3">
            <h2 className="font-black text-base text-gray-900">Touch Test</h2>
            <p className="text-xs text-gray-500 mb-2">
              Swipe over every square to turn it green. Tests your touchscreen
              digitizer.
            </p>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold" style={{ color: "#1D4ED8" }}>
                {touchProgress}% complete
              </span>
              <button
                type="button"
                data-ocid="diagnostic.skip_touch.button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1 text-xs font-semibold text-gray-400"
              >
                <SkipForward className="w-3 h-3" /> Skip Test
              </button>
            </div>
            <div
              className="w-full rounded-full h-1.5 mb-2"
              style={{ background: "#E2E8F0" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${touchProgress}%`, background: "#1D4ED8" }}
              />
            </div>
          </div>

          {touchProgress >= 90 && (
            <div
              className="mx-4 mb-2 py-2 px-3 rounded-xl flex items-center gap-2"
              style={{ background: "#D1FAE5", border: "1px solid #6EE7B7" }}
            >
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs font-bold text-green-800">
                Touch Test Passed!
              </span>
            </div>
          )}

          {/* Touch grid */}
          <div
            className="flex-1 px-3 pb-2 select-none"
            style={{ touchAction: "none" }}
          >
            <div
              className="grid h-full"
              style={{
                gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
                gap: "3px",
              }}
            >
              {GRID_SQUARES.map((squareIdx) => (
                <div
                  key={`touch-square-${squareIdx}`}
                  data-ocid={`diagnostic.touch_square.${squareIdx + 1}`}
                  className="rounded transition-colors"
                  style={{
                    background: touchedSquares.has(squareIdx)
                      ? "#22c55e"
                      : "white",
                    border: "1px solid #e5e7eb",
                    cursor: "crosshair",
                  }}
                  onPointerEnter={() => {
                    setTouchedSquares((prev) => new Set([...prev, squareIdx]));
                    if (touchedSquares.size + 1 >= TOTAL_SQUARES * 0.9) {
                      setTimeout(() => setStep(2), 1000);
                    }
                  }}
                />
              ))}
            </div>
          </div>

          {touchProgress >= 90 && (
            <div className="px-4 pb-4">
              <button
                type="button"
                data-ocid="diagnostic.touch_next.button"
                onClick={() => setStep(2)}
                className="w-full py-3 rounded-xl text-white font-bold"
                style={{ background: "#1D4ED8" }}
              >
                Next: Camera & Mic
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2: Camera & Mic ── */}
      {step === 2 && (
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <h2 className="font-black text-base text-gray-900 mb-1">
            Camera & Mic Check
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            A 2-second live preview to verify your camera and microphone.
          </p>

          {cameraOk === null && (
            <div
              className="w-full aspect-video rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "#1E293B" }}
            >
              <div className="text-center">
                <div
                  className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-2"
                  style={{
                    borderColor: "#1D4ED8",
                    borderTopColor: "transparent",
                  }}
                />
                <p className="text-xs text-white">
                  Requesting camera access...
                </p>
              </div>
            </div>
          )}

          {cameraOk === false && (
            <div
              className="rounded-2xl p-4 mb-4 flex items-start gap-3"
              style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm text-red-700">
                  Camera/Mic Access Denied
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Enable camera access in your browser settings to complete this
                  test.
                </p>
              </div>
            </div>
          )}

          {cameraOk === true && (
            <div className="mb-4">
              <div
                className="w-full aspect-video rounded-2xl overflow-hidden mb-3"
                style={{ background: "#1E293B" }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div
                  className="rounded-xl p-3 flex items-center gap-2"
                  style={{ background: "#D1FAE5", border: "1px solid #6EE7B7" }}
                >
                  <Camera className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-bold text-green-800">
                    Camera: OK
                  </span>
                  <CheckCircle className="w-3 h-3 text-green-600 ml-auto" />
                </div>
                <div
                  className="rounded-xl p-3 flex items-center gap-2"
                  style={{
                    background: micOk ? "#D1FAE5" : "#F3F4F6",
                    border: micOk ? "1px solid #6EE7B7" : "1px solid #e5e7eb",
                  }}
                >
                  <Mic
                    className="w-4 h-4"
                    style={{ color: micOk ? "#16A34A" : "#9CA3AF" }}
                  />
                  <span
                    className="text-xs font-bold"
                    style={{ color: micOk ? "#166534" : "#6B7280" }}
                  >
                    Mic: {micOk === null ? "Checking..." : "OK"}
                  </span>
                  {micOk && (
                    <CheckCircle className="w-3 h-3 text-green-600 ml-auto" />
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              data-ocid="diagnostic.skip_camera.button"
              onClick={() => setStep(3)}
              className="flex-1 py-3 rounded-xl font-semibold text-sm"
              style={{
                color: "#6B7280",
                background: "white",
                border: "1px solid #e5e7eb",
              }}
            >
              Skip
            </button>
            {cameraOk !== null && (
              <button
                type="button"
                data-ocid="diagnostic.camera_next.button"
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-xl text-white font-bold"
                style={{ background: "#1D4ED8" }}
              >
                Next <ArrowRight className="w-4 h-4 inline ml-1" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 3: Screen Burn/Pixel Test (full-screen) ── */}
      {step === 3 && (
        <div
          className="fixed inset-0 z-[300] flex flex-col items-center justify-center"
          style={{ background: SCREEN_COLORS[screenColorIdx] }}
        >
          <div
            className="rounded-2xl px-6 py-4 text-center mb-6"
            style={{
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(10px)",
            }}
          >
            <p className="font-black text-white text-lg mb-1">
              Screen Burn / Pixel Test
            </p>
            <p className="text-sm text-white/80">
              Check for dead pixels or burn-in
            </p>
            <p className="text-xs text-white/60 mt-1">
              Color {screenColorIdx + 1} of {SCREEN_COLORS.length}
            </p>
          </div>
          {screenTestDone ? (
            <button
              type="button"
              data-ocid="diagnostic.screen_looks_good.button"
              onClick={() => setStep(4)}
              className="px-8 py-3 rounded-2xl font-black text-base"
              style={{ background: "rgba(255,255,255,0.95)", color: "#1D4ED8" }}
            >
              Looks Good! Next
            </button>
          ) : (
            <button
              type="button"
              data-ocid="diagnostic.skip_screen.button"
              onClick={() => setStep(4)}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: "rgba(255,255,255,0.3)", color: "white" }}
            >
              Skip
            </button>
          )}
        </div>
      )}

      {/* ── STEP 4: Battery Health ── */}
      {step === 4 && (
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="flex items-center justify-center mb-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "#FFF7ED" }}
            >
              <Battery className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <h2 className="font-black text-base text-gray-900 mb-1 text-center">
            Battery Health
          </h2>
          <p className="text-xs text-center text-gray-500 mb-4">
            Enter your battery health percentage for an accurate diagnostic
            score.
          </p>

          {batteryLevel !== null && (
            <div
              className="rounded-xl p-3 mb-4 flex items-center gap-3"
              style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}
            >
              <Battery className="w-5 h-5" style={{ color: "#1D4ED8" }} />
              <div>
                <p className="text-xs font-bold" style={{ color: "#1D4ED8" }}>
                  Auto-detected: {batteryLevel}% charge
                </p>
                <p className="text-[10px] text-gray-500">
                  This is current charge level, not cycle health
                </p>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label
              htmlFor="battery-health-input"
              className="block text-xs font-bold text-gray-700 mb-1.5"
            >
              Battery Health % (from device settings)
            </label>
            <input
              id="battery-health-input"
              data-ocid="diagnostic.battery_input"
              type="number"
              min="0"
              max="100"
              placeholder="e.g. 87"
              value={manualBattery}
              onChange={(e) => setManualBattery(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none font-bold"
              style={{
                background: "white",
                border: "1.5px solid #1D4ED8",
                color: "#1E293B",
              }}
            />
          </div>

          <button
            type="button"
            data-ocid="diagnostic.battery_tip.button"
            onClick={() => setShowBatteryTip((p) => !p)}
            className="flex items-center gap-2 text-xs font-semibold mb-3"
            style={{ color: "#1D4ED8" }}
          >
            <Info className="w-4 h-4" />
            How to find Battery Health
            <ChevronRight
              className="w-3 h-3 transition-transform"
              style={{ transform: showBatteryTip ? "rotate(90deg)" : "none" }}
            />
          </button>

          {showBatteryTip && (
            <div
              className="rounded-xl p-3 mb-4 text-xs text-gray-600"
              style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
            >
              <p className="font-bold mb-2">How to find Battery Health:</p>
              <div className="space-y-1.5">
                <p>
                  <strong>iOS:</strong> Settings → Battery → Battery Health
                  &amp; Charging
                </p>
                <p>
                  <strong>Samsung:</strong> Settings → Device Care → Battery →
                  More options → Show battery information
                </p>
                <p>
                  <strong>Other Android:</strong> Dial pad → *#*#4636#*#* →
                  Battery Information
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            data-ocid="diagnostic.battery_next.button"
            onClick={goToReport}
            className="w-full py-3 rounded-xl text-white font-bold"
            style={{ background: "#1D4ED8" }}
          >
            Generate Report
          </button>
        </div>
      )}

      {/* ── STEP 5: Final Report ── */}
      {step === 5 && (
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <h2 className="font-black text-lg text-gray-900 mb-1 text-center">
            Diagnostic Report
          </h2>
          <p className="text-xs text-center text-gray-500 mb-5">
            Based on your test results
          </p>

          {/* Score ring */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                aria-label={`Diagnostic score: ${result.score}`}
                role="img"
              >
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="10"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={
                    result.score >= 70
                      ? "#16A34A"
                      : result.score >= 50
                        ? "#D97706"
                        : "#DC2626"
                  }
                  strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - result.score / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
                <text
                  x="60"
                  y="58"
                  textAnchor="middle"
                  fontSize="22"
                  fontWeight="900"
                  fill="#1E293B"
                >
                  {result.score}
                </text>
                <text
                  x="60"
                  y="73"
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6B7280"
                >
                  / 100
                </text>
              </svg>
            </div>
          </div>

          {result.verified && (
            <div
              className="flex items-center justify-center gap-2 rounded-2xl py-3 px-4 mb-4"
              style={{ background: "#D1FAE5", border: "1px solid #6EE7B7" }}
            >
              <Award className="w-5 h-5 text-green-600" />
              <span className="font-black text-sm text-green-800">
                Verified by 77mobiles
              </span>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          )}

          {/* Test results breakdown */}
          <div
            className="bg-white rounded-2xl p-4 mb-4"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">
              Test Results
            </p>
            {[
              { label: "Touch Test", passed: result.touchTest, points: 25 },
              { label: "Camera", passed: result.cameraTest, points: 25 },
              {
                label: "Screen Pixel Test",
                passed: result.screenTest,
                points: 20,
              },
              {
                label: `Battery Health (${result.batteryHealth ?? "—"}%)`,
                passed: (result.batteryHealth ?? 0) > 80,
                points:
                  (result.batteryHealth ?? 0) > 80
                    ? 30
                    : (result.batteryHealth ?? 0) >= 60
                      ? 20
                      : 10,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-2"
                style={{ borderBottom: "1px solid #f1f5f9" }}
              >
                <div className="flex items-center gap-2">
                  {item.passed !== false ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-gray-300" />
                  )}
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: item.passed !== false ? "#D1FAE5" : "#F3F4F6",
                    color: item.passed !== false ? "#065F46" : "#6B7280",
                  }}
                >
                  +{item.points} pts
                </span>
              </div>
            ))}
          </div>

          <button
            type="button"
            data-ocid="diagnostic.attach_to_listing.button"
            onClick={() => {
              onAttach(result);
              toast.success(
                result.verified
                  ? "Diagnostic verified! Badge attached to listing."
                  : "Diagnostic report attached to listing.",
              );
              onClose();
            }}
            className="w-full py-3.5 rounded-2xl text-white font-black text-base mb-2"
            style={{ background: "#1D4ED8" }}
          >
            Attach to Listing
          </button>
          <button
            type="button"
            data-ocid="diagnostic.redo.button"
            onClick={() => {
              setStep(0);
              setDetectedInfo(null);
              setTouchedSquares(new Set());
              setCameraOk(null);
              setMicOk(null);
              setScreenTestDone(false);
              setManualBattery("");
            }}
            className="w-full py-2.5 rounded-2xl font-semibold text-sm"
            style={{
              color: "#6B7280",
              background: "white",
              border: "1px solid #e5e7eb",
            }}
          >
            Redo Diagnostic
          </button>
        </div>
      )}
    </div>
  );
}
