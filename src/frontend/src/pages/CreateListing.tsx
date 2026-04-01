import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  Camera as CameraIcon,
  CheckCircle2,
  Info,
  Plus,
  Shield,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useApp } from "../contexts/AppContext";
import { useAuth } from "../contexts/AuthContext";
import { useActor } from "../hooks/useActor";

const BRANDS = [
  "Apple",
  "Samsung",
  "OnePlus",
  "Xiaomi",
  "Realme",
  "Vivo",
  "Oppo",
  "Google",
  "Motorola",
  "Nokia",
  "Sony",
  "Nothing",
  "iQOO",
  "Poco",
  "Redmi",
];

const MODELS: Record<string, string[]> = {
  Apple: [
    "iPhone 17 Pro Max",
    "iPhone 17 Pro",
    "iPhone 17",
    "iPhone 16 Pro Max",
    "iPhone 16 Pro",
    "iPhone 16",
    "iPhone 15 Pro Max",
    "iPhone 15 Pro",
    "iPhone 15",
    "iPhone 14 Pro",
    "iPhone 14",
    "iPhone 13",
  ],
  Samsung: [
    "Samsung S26 Ultra",
    "Samsung S26+",
    "Samsung S26",
    "Samsung S25 Ultra",
    "Samsung S25+",
    "Samsung S25",
    "Samsung S24 Ultra",
    "Samsung S24",
    "Galaxy Z Fold6",
    "Galaxy Z Flip6",
    "Galaxy A55",
  ],
  OnePlus: [
    "OnePlus 13",
    "OnePlus 12",
    "OnePlus 11",
    "OnePlus Nord 4",
    "OnePlus Nord CE4",
  ],
  Xiaomi: ["Xiaomi 14 Ultra", "Xiaomi 14 Pro", "Xiaomi 14", "Xiaomi 13 Pro"],
  Realme: ["Realme GT 6", "Realme GT Neo 6", "Realme 12 Pro+"],
  Vivo: ["Vivo X100 Pro", "Vivo X100", "Vivo V30 Pro"],
  Oppo: ["OPPO Find X7 Pro", "OPPO Reno 12 Pro", "OPPO F25 Pro"],
  Google: ["Pixel 9 Pro Fold", "Pixel 9 Pro", "Pixel 9", "Pixel 8a"],
  Motorola: ["Edge 50 Ultra", "Edge 50 Pro", "Moto G85"],
  Nokia: ["Nokia G42", "Nokia C32"],
  Sony: ["Xperia 1 VI", "Xperia 5 VI"],
  Nothing: ["Nothing Phone (2a)", "Nothing Phone (2)"],
  iQOO: ["iQOO 12", "iQOO Neo 9 Pro"],
  Poco: ["Poco X6 Pro", "Poco F6 Pro"],
  Redmi: ["Redmi Note 13 Pro+", "Redmi Note 13 Pro"],
};

const STORAGES = ["64GB", "128GB", "256GB", "512GB", "1TB"];
const COLORS = [
  "Black",
  "White",
  "Gold",
  "Silver",
  "Blue",
  "Purple",
  "Green",
  "Pink",
  "Red",
  "Other",
];
const CONDITIONS = [
  "New",
  "Like New",
  "Gently Used",
  "Refurbished",
  "Cracked/Damaged",
];
const AGES = [
  "Less than 1 month",
  "1-3 months",
  "3-6 months",
  "6-12 months",
  "1 year+",
];

const MODEL_SPECS: Record<string, { storages: string[]; colors: string[] }> = {
  "iPhone 17 Pro Max": {
    storages: ["256GB", "512GB", "1TB"],
    colors: [
      "Black Titanium",
      "White Titanium",
      "Desert Titanium",
      "Natural Titanium",
    ],
  },
  "iPhone 17 Pro": {
    storages: ["128GB", "256GB", "512GB", "1TB"],
    colors: [
      "Black Titanium",
      "White Titanium",
      "Desert Titanium",
      "Natural Titanium",
    ],
  },
  "iPhone 17": {
    storages: ["128GB", "256GB", "512GB"],
    colors: ["Ultramarine", "Teal", "Pink", "White", "Black"],
  },
  "iPhone 16 Pro Max": {
    storages: ["256GB", "512GB", "1TB"],
    colors: [
      "Black Titanium",
      "White Titanium",
      "Desert Titanium",
      "Natural Titanium",
    ],
  },
  "iPhone 16 Pro": {
    storages: ["128GB", "256GB", "512GB", "1TB"],
    colors: [
      "Black Titanium",
      "White Titanium",
      "Desert Titanium",
      "Natural Titanium",
    ],
  },
  "iPhone 16": {
    storages: ["128GB", "256GB", "512GB"],
    colors: ["Ultramarine", "Teal", "Pink", "White", "Black"],
  },
  "iPhone 15 Pro": {
    storages: ["128GB", "256GB", "512GB", "1TB"],
    colors: [
      "Black Titanium",
      "White Titanium",
      "Blue Titanium",
      "Natural Titanium",
    ],
  },
  "iPhone 14 Pro": {
    storages: ["128GB", "256GB", "512GB", "1TB"],
    colors: ["Deep Purple", "Gold", "Silver", "Space Black"],
  },
  "Galaxy S24 Ultra": {
    storages: ["256GB", "512GB", "1TB"],
    colors: [
      "Titanium Black",
      "Titanium Gray",
      "Titanium Violet",
      "Titanium Yellow",
    ],
  },
  "Galaxy S24+": {
    storages: ["256GB", "512GB"],
    colors: ["Cobalt Violet", "Onyx Black", "Marble Gray", "Jade Green"],
  },
  "Galaxy S24": {
    storages: ["128GB", "256GB"],
    colors: ["Cobalt Violet", "Onyx Black", "Marble Gray", "Amber Yellow"],
  },
  "Pixel 9 Pro": {
    storages: ["128GB", "256GB", "512GB", "1TB"],
    colors: ["Obsidian", "Porcelain", "Hazel", "Rose Quartz"],
  },
  "Pixel 9": {
    storages: ["128GB", "256GB"],
    colors: ["Obsidian", "Porcelain", "Wintergreen", "Peony"],
  },
};

type SearchParams = {
  mode?: string;
  scrap?: string;
  prefillBrand?: string;
  prefillModel?: string;
  category?: string;
};

type VerifiedDevice = {
  model_name: string;
  storage_gb: string;
  color_name: string;
};

type ImeiStatus = "idle" | "loading" | "success" | "error";

/** Luhn algorithm — ISO/IEC 7812 IMEI checksum validation */
function luhnCheck(imei: string): boolean {
  let sum = 0;
  let shouldDouble = false;
  for (let i = imei.length - 1; i >= 0; i--) {
    let digit = Number.parseInt(imei[i], 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export default function CreateListing() {
  const navigate = useNavigate();
  const { actor } = useActor();
  const { addSharedListing } = useApp();
  const { user } = useAuth();
  const search = useSearch({ strict: false }) as SearchParams;

  const isScrap = search?.scrap === "true";
  const prefillBrand = search?.prefillBrand || "";
  const prefillModel = search?.prefillModel || "";

  // Steps: 0=imei+photos, 1=brand, 2=model, 3=storage+color, 4=condition, 5=auction+price
  const [step, setStep] = useState(prefillBrand ? 3 : 0);
  const [brand, setBrand] = useState(prefillBrand);
  const [model, setModel] = useState(prefillModel);
  const [storage, setStorage] = useState("128GB");
  const [color, setColor] = useState("Black");
  const [condition, setCondition] = useState(
    isScrap ? "Cracked/Damaged" : "Like New",
  );
  const [age, setAge] = useState("3-6 months");
  const [auctionType, setAuctionType] = useState("Live20min");
  const [basePrice, setBasePrice] = useState("");
  const [imei, setImei] = useState("");
  const [showImeiTooltip, setShowImeiTooltip] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Search states for brand/model
  const [brandSearch, setBrandSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");

  // IMEI verification states
  const [imeiStatus, setImeiStatus] = useState<ImeiStatus>("idle");
  const [imeiError, setImeiError] = useState("");
  const [verifiedDevice, setVerifiedDevice] = useState<VerifiedDevice | null>(
    null,
  );
  const [editedSpecs, setEditedSpecs] = useState<{
    model_name: string;
    storage_gb: string;
    color_name: string;
  }>({ model_name: "", storage_gb: "", color_name: "" });

  const [uploadedPhotos, setUploadedPhotos] = useState<(string | null)[]>(
    Array(5).fill(null),
  );
  const [photoMenu, setPhotoMenu] = useState<number | null>(null);
  const verifyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imeiInputRef = useRef<HTMLInputElement | null>(null);
  // Auto-focus IMEI on step 0, search bar on steps 1-2
  // (done via useEffect to satisfy a11y linting rules)
  useEffect(() => {
    if (step === 0) {
      const t = setTimeout(() => imeiInputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
    if (step === 1 || step === 2) {
      const t = setTimeout(() => {
        const inp =
          document.querySelector<HTMLInputElement>(".search-step-input");
        if (inp) inp.focus();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [step]);

  const imeiDigits = imei.replace(/\D/g, "");
  // Frictionless: continue as soon as 15 digits are entered, regardless of lookup result
  const canContinueStep0 = imeiDigits.length === 15;

  const handleImeiChange = (val: string) => {
    setImei(val);
    setVerifiedDevice(null);
    setEditedSpecs({ model_name: "", storage_gb: "", color_name: "" });
    setImeiError("");
    setImeiStatus("idle");
    if (verifyTimer.current) clearTimeout(verifyTimer.current);

    const digits = val.replace(/\D/g, "");
    if (digits.length !== 15) return;

    // Step 1: Luhn checksum validation — fail fast, no API call
    if (!luhnCheck(digits)) {
      setImeiError("Invalid IMEI — please check the number.");
      setImeiStatus("error");
      return;
    }

    // Step 2: Luhn passed — call real IMEI lookup API
    setImeiStatus("loading");

    const controller = new AbortController();
    verifyTimer.current = setTimeout(() => controller.abort(), 8000);

    fetch(`https://imeicheck.net/api/checkImei?imei=${digits}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("API error");
        return res.json();
      })
      .then((data) => {
        if (verifyTimer.current) clearTimeout(verifyTimer.current);
        const modelName =
          data?.model ||
          data?.model_name ||
          data?.deviceName ||
          data?.name ||
          data?.brand_name ||
          null;
        const storageVal =
          data?.storage || data?.storage_gb || data?.capacity || null;
        const colorVal = data?.color || data?.color_name || null;

        const device: VerifiedDevice = {
          model_name: modelName || "",
          storage_gb: storageVal || "",
          color_name: colorVal || "",
        };
        setVerifiedDevice(device);
        setEditedSpecs({
          model_name: device.model_name,
          storage_gb: device.storage_gb,
          color_name: device.color_name,
        });
        setImeiStatus("success");
      })
      .catch(() => {
        if (verifyTimer.current) clearTimeout(verifyTimer.current);
        setImeiStatus("error");
        setImeiError(
          "Device not found — you can still continue and enter details manually in the next steps.",
        );
      });
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, 1200 / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas
          .getContext("2d")!
          .drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(blob!);
          },
          "image/jpeg",
          0.85,
        );
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handlePhotoUpload = (idx: number, file: File) => {
    compressImage(file).then((dataUrl) => {
      setUploadedPhotos((prev) => {
        const next = [...prev];
        next[idx] = dataUrl;
        return next;
      });
    });
  };

  const handleMultiPhotoSelect = async (files: FileList) => {
    const slots = Array.from(files).slice(0, 5);
    const compressed = await Promise.all(slots.map((f) => compressImage(f)));
    setUploadedPhotos((prev) => {
      const next = [...prev];
      compressed.forEach((dataUrl, i) => {
        if (i < next.length) next[i] = dataUrl;
      });
      return next;
    });
  };

  const totalSteps = 6;
  const displayStep = step + 1;

  const handlePublish = async () => {
    if (!basePrice) {
      toast.error("Enter a base price");
      return;
    }
    setPublishing(true);
    const finalModel =
      editedSpecs.model_name || verifiedDevice?.model_name || model;
    const finalStorage =
      editedSpecs.storage_gb || verifiedDevice?.storage_gb || storage;
    const finalColor =
      editedSpecs.color_name || verifiedDevice?.color_name || color;
    const autoTitle = [brand, finalModel, finalStorage]
      .filter(Boolean)
      .join(" ");
    const durationNs =
      auctionType === "Live20min"
        ? BigInt(20 * 60 * 1_000_000_000)
        : BigInt(7 * 24 * 60 * 60 * 1_000_000_000);
    const basePriceVal = Math.round(Number.parseFloat(basePrice) * 100);
    const nowTs = BigInt(Date.now()) * BigInt(1_000_000);
    const newListing = {
      listingId: crypto.randomUUID(),
      sellerId: user?.userId ?? "demo-seller",
      title: autoTitle,
      model: finalModel,
      brand: brand,
      condition: condition,
      auctionType: auctionType,
      basePrice: BigInt(basePriceVal),
      endsAt: nowTs + durationNs,
      createdAt: nowTs,
      status: "Active" as const,
      storage: BigInt(Number.parseInt(finalStorage ?? "0") || 0),
      color: finalColor,
      description: "",
      imageUrl: "",
      batteryHealth: BigInt(100),
      warranty: BigInt(0),
      serialNumberHash: imei ? `imei:${imei}` : "",
      usbVerified: false,
      screenPassCertified: false,
      isDemo: false,
    };
    try {
      if (actor && user) {
        await actor.createListing(newListing);
      }
    } catch {
      // Backend unreachable - proceed with local state
    } finally {
      // Always add to shared state and navigate
      addSharedListing(newListing);
      toast.success("Listing published!");
      setPublishing(false);
      navigate({ to: "/app" });
    }
  };

  // Model-specific storage/color filtering
  const availableStorages =
    model && MODEL_SPECS[model] ? MODEL_SPECS[model].storages : STORAGES;
  const availableColors =
    model && MODEL_SPECS[model] ? MODEL_SPECS[model].colors : COLORS;

  return (
    <div
      className="mobile-container bg-[#F8F9FA] min-h-screen flex flex-col"
      style={{ position: "fixed", inset: 0, zIndex: 100, overflowY: "auto" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 bg-white"
        style={{ borderBottom: "1px solid #e5e7eb" }}
      >
        <button
          type="button"
          data-ocid="create.back.button"
          onClick={() =>
            step > 0 ? setStep(step - 1) : navigate({ to: "/app" })
          }
          className="flex items-center gap-1"
          style={{ color: "#002F34" }}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="text-[11px] text-gray-400 font-medium">
            Step {displayStep} of {totalSteps}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div
              className="h-1 rounded-full transition-all"
              style={{
                background: "#2C52A2",
                width: `${(displayStep / totalSteps) * 100}%`,
              }}
            />
          </div>
        </div>
        <span className="text-xs font-bold text-gray-400">
          {displayStep}/{totalSteps}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* STEP 0: IMEI first, then photos */}
        {step === 0 && (
          <div className="px-4 pt-5 pb-6 space-y-5">
            <h2 className="font-black text-xl" style={{ color: "#002F34" }}>
              Add IMEI & Photos
            </h2>

            {/* IMEI input — FIRST / TOP */}
            <div
              className="bg-white rounded-2xl p-4"
              style={{ border: "1px solid #e5e7eb" }}
            >
              {/* Label row */}
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="imei-input"
                  className="text-sm font-bold flex items-center gap-1.5"
                  style={{ color: "#002F34" }}
                >
                  IMEI Number
                  <span style={{ color: "#ef4444" }}>*</span>
                  {imeiStatus === "success" && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: "#dcfce7", color: "#166534" }}
                    >
                      ✓ Verified
                    </span>
                  )}
                </label>
                <div className="relative">
                  <button
                    type="button"
                    data-ocid="create.imei_info.button"
                    onClick={() => setShowImeiTooltip((v) => !v)}
                    className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"
                  >
                    <Info className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                  {showImeiTooltip && (
                    <div
                      className="absolute right-0 top-8 z-10 bg-gray-900 text-white text-[11px] px-3 py-2 rounded-xl w-48 leading-relaxed"
                      style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
                    >
                      Dial <span className="font-bold">*#06#</span> to find your
                      IMEI number
                      <div
                        className="absolute -top-1.5 right-2 w-3 h-3 bg-gray-900"
                        style={{ transform: "rotate(45deg)" }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* IMEI input field */}
              <div
                className="flex items-center rounded-xl px-3 py-3 gap-2"
                style={{
                  border: `1px solid ${
                    imeiStatus === "error"
                      ? "#fca5a5"
                      : imeiStatus === "success"
                        ? "#22c55e"
                        : "#e5e7eb"
                  }`,
                }}
              >
                <input
                  id="imei-input"
                  ref={imeiInputRef}
                  data-ocid="create.imei.input"
                  type="number"
                  inputMode="numeric"
                  maxLength={15}
                  className="flex-1 text-sm font-bold bg-transparent outline-none placeholder:text-gray-400"
                  style={{ color: "#002F34" }}
                  placeholder="Enter 15-digit IMEI (required)"
                  value={imei}
                  onChange={(e) => handleImeiChange(e.target.value)}
                />
                {imeiStatus === "loading" ? (
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0 animate-spin"
                    style={{
                      border: "2px solid #e5e7eb",
                      borderTopColor: "#2C52A2",
                    }}
                  />
                ) : imeiStatus === "success" ? (
                  <CheckCircle2
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: "#22c55e" }}
                  />
                ) : imeiStatus === "error" &&
                  imei.replace(/\D/g, "").length === 15 ? (
                  <span
                    className="text-[10px] font-bold flex-shrink-0"
                    style={{ color: "#f97316" }}
                  >
                    Check Number
                  </span>
                ) : (
                  <button
                    type="button"
                    data-ocid="create.imei_camera.button"
                    className="flex-shrink-0"
                    onClick={() => {
                      const inp = document.getElementById(
                        "imei-camera-capture",
                      ) as HTMLInputElement;
                      inp?.click();
                    }}
                  >
                    <CameraIcon
                      className="w-5 h-5"
                      style={{ color: "#2C52A2" }}
                    />
                  </button>
                )}
                {/* Camera capture fallback */}
                <input
                  id="imei-camera-capture"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      if ("BarcodeDetector" in window) {
                        const detector = new (window as any).BarcodeDetector({
                          formats: [
                            "ean_13",
                            "ean_8",
                            "code_128",
                            "code_39",
                            "qr_code",
                            "upc_a",
                          ],
                        });
                        const img = await createImageBitmap(file);
                        const barcodes = await detector.detect(img);
                        if (barcodes.length > 0) {
                          const raw = barcodes[0].rawValue
                            .replace(/\D/g, "")
                            .slice(0, 15);
                          handleImeiChange(raw);
                          toast.success("IMEI scanned successfully!");
                        } else {
                          toast.error(
                            "No barcode found. Please enter IMEI manually.",
                          );
                        }
                      } else {
                        // Fallback: try to extract digits from the image filename
                        const nameDigits = file.name
                          .replace(/\D/g, "")
                          .slice(0, 15);
                        if (nameDigits.length === 15) {
                          handleImeiChange(nameDigits);
                        } else {
                          toast(
                            "Scanner not supported on this device. Please enter IMEI manually.",
                          );
                        }
                      }
                    } catch {
                      toast.error(
                        "Could not read barcode. Please enter IMEI manually.",
                      );
                    }
                    e.target.value = "";
                  }}
                />
              </div>

              {/* Loading state */}
              {imeiStatus === "loading" && (
                <div
                  className="flex items-center gap-2 mt-3 p-4 rounded-2xl"
                  style={{
                    background: "#F8F9FA",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0 animate-spin"
                    style={{
                      border: "2px solid #2C52A2",
                      borderTopColor: "transparent",
                    }}
                  />
                  <span className="text-sm" style={{ color: "#002F34" }}>
                    Fetching device details...
                  </span>
                </div>
              )}

              {/* Success: Verified Specs */}
              {imeiStatus === "success" && verifiedDevice && (
                <div
                  className="mt-3 rounded-xl p-3"
                  style={{
                    border: "1.5px solid #22c55e",
                    background: "#fafafa",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span
                      className="font-bold text-xs"
                      style={{ color: "#002F34" }}
                    >
                      Verified Specs
                    </span>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: "#dcfce7", color: "#166534" }}
                    >
                      ✓ Verified
                    </span>
                  </div>
                  <div className="space-y-2">
                    {(
                      [
                        { key: "model_name" as const, label: "Model" },
                        { key: "storage_gb" as const, label: "Storage" },
                        { key: "color_name" as const, label: "Color" },
                      ] as const
                    ).map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-2">
                        <span
                          className="text-xs font-semibold w-14 flex-shrink-0"
                          style={{ color: "#002F34" }}
                        >
                          {label}
                        </span>
                        <input
                          type="text"
                          data-ocid={`create.verified_spec.${key}.input`}
                          value={editedSpecs[key]}
                          onChange={(e) =>
                            setEditedSpecs((prev) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                          className="flex-1 text-xs font-bold rounded-lg px-2 py-1.5 outline-none"
                          style={{
                            color: "#002F34",
                            border: "1px solid #e5e7eb",
                            background: "#F8F9FA",
                          }}
                          placeholder={`Enter ${label.toLowerCase()}`}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2">
                    Auto-filled from IMEI database. Tap any field to correct.
                  </p>
                </div>
              )}

              {/* Error state — device not found, but continue is still active */}
              {imeiStatus === "error" && imeiError && (
                <div
                  className="mt-3 rounded-xl p-3"
                  style={{
                    border: "1px solid #fca5a5",
                    background: "#fff5f5",
                  }}
                >
                  <p className="text-xs font-semibold text-red-600">
                    {imeiError}
                  </p>
                </div>
              )}

              <p className="text-[10px] text-gray-400 mt-1.5">
                Required — dial *#06# to find your IMEI
              </p>
            </div>

            {/* Photo upload — horizontal scrollable row below IMEI */}
            <div
              className="bg-white rounded-2xl p-4"
              style={{ border: "1px solid #e5e7eb" }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold" style={{ color: "#002F34" }}>
                  Device Photos (up to 5)
                </p>
                <label
                  className="text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                  style={{ background: "#2C52A2", color: "white" }}
                >
                  + Add Photos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleMultiPhotoSelect(e.target.files);
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <div
                className="overflow-x-auto pb-1"
                style={{ scrollbarWidth: "none" }}
              >
                <div className="flex gap-2" style={{ width: "max-content" }}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <button
                        type="button"
                        data-ocid={`create.photo_slot.upload_button.${i + 1}`}
                        className="relative rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden"
                        style={{
                          width: "64px",
                          height: "64px",
                          borderColor: uploadedPhotos[i]
                            ? "#2C52A2"
                            : "#d1d5db",
                          background: uploadedPhotos[i]
                            ? "transparent"
                            : "#f9fafb",
                          flexShrink: 0,
                        }}
                        onClick={() => setPhotoMenu(i)}
                      >
                        {uploadedPhotos[i] ? (
                          <>
                            <img
                              src={uploadedPhotos[i] as string}
                              alt={`Device ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              data-ocid={`create.photo_delete.button.${i + 1}`}
                              aria-label="Remove photo"
                              onClick={(e) => {
                                e.stopPropagation();
                                setUploadedPhotos((prev) => {
                                  const next = [...prev];
                                  next[i] = null;
                                  return next;
                                });
                              }}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ background: "rgba(0,0,0,0.55)" }}
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </>
                        ) : (
                          <>
                            <Plus className="w-5 h-5 text-gray-400" />
                            <span className="text-[8px] text-gray-400">
                              Add
                            </span>
                          </>
                        )}
                      </button>
                      {i === 0 && (
                        <span
                          className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ background: "#EFF6FF", color: "#2C52A2" }}
                        >
                          Cover
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hidden file inputs */}
            <input
              id="photo-camera"
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && photoMenu !== null) {
                  handlePhotoUpload(photoMenu, file);
                  setPhotoMenu(null);
                }
                e.target.value = "";
              }}
            />
            <input
              id="photo-gallery"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && photoMenu !== null) {
                  handlePhotoUpload(photoMenu, file);
                  setPhotoMenu(null);
                }
                e.target.value = "";
              }}
            />

            {/* Photo selection menu */}
            {photoMenu !== null && (
              <div
                className="fixed inset-0 z-50 flex items-end justify-center"
                style={{ background: "rgba(0,0,0,0.45)" }}
                onClick={() => setPhotoMenu(null)}
                onKeyDown={(e) => e.key === "Escape" && setPhotoMenu(null)}
              >
                <div
                  className="w-full max-w-[430px] bg-white rounded-t-3xl p-6 pb-10"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <p
                    className="text-center font-bold text-sm mb-5"
                    style={{ color: "#002F34" }}
                  >
                    Add Photo
                  </p>
                  <div className="space-y-3">
                    <button
                      type="button"
                      data-ocid="create.photo_camera.button"
                      className="w-full py-4 rounded-xl text-sm font-bold"
                      style={{ background: "#F2F4F5", color: "#002F34" }}
                      onClick={() => {
                        document.getElementById("photo-camera")?.click();
                      }}
                    >
                      Take Photo
                    </button>
                    <button
                      type="button"
                      data-ocid="create.photo_gallery.button"
                      className="w-full py-4 rounded-xl text-sm font-bold"
                      style={{ background: "#F2F4F5", color: "#002F34" }}
                      onClick={() => {
                        document.getElementById("photo-gallery")?.click();
                      }}
                    >
                      Choose from Gallery
                    </button>
                    <button
                      type="button"
                      data-ocid="create.photo_cancel.button"
                      className="w-full py-3 text-sm font-semibold text-gray-400"
                      onClick={() => setPhotoMenu(null)}
                      onKeyDown={(e) =>
                        e.key === "Escape" && setPhotoMenu(null)
                      }
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              data-ocid="create.step0.primary_button"
              onClick={() => {
                setBrandSearch("");
                setStep(1);
              }}
              disabled={!canContinueStep0}
              className="w-full py-4 text-white font-black text-base transition-all"
              style={{
                background: canContinueStep0 ? "#2C52A2" : "#9ca3af",
                cursor: canContinueStep0 ? "pointer" : "not-allowed",
                borderRadius: "12px",
              }}
            >
              {imeiStatus === "loading" ? "Verifying..." : "Continue →"}
            </button>
          </div>
        )}

        {/* STEP 1: Brand selection */}
        {step === 1 && (
          <div className="px-4 pt-5">
            <h2
              className="font-black text-xl mb-4"
              style={{ color: "#002F34" }}
            >
              Select Brand
            </h2>
            {/* Live search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search brands..."
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm font-bold bg-white outline-none search-step-input"
                style={{
                  color: "#002F34",
                  border: brandSearch
                    ? "1.5px solid #2C52A2"
                    : "1px solid #e5e7eb",
                }}
              />
            </div>
            <div className="space-y-2">
              {BRANDS.filter((b) =>
                b.toLowerCase().includes(brandSearch.toLowerCase()),
              ).map((b) => (
                <button
                  type="button"
                  key={b}
                  data-ocid={`create.brand.${b.toLowerCase()}.button`}
                  onClick={() => {
                    setBrand(b);
                    setModelSearch("");
                    setStep(2);
                  }}
                  className="w-full bg-white rounded-xl px-4 py-3.5 flex items-center justify-between text-left"
                  style={{
                    border:
                      brand === b ? "2px solid #2C52A2" : "1px solid #e5e7eb",
                  }}
                >
                  <span
                    className="font-bold text-sm"
                    style={{ color: "#002F34" }}
                  >
                    {b}
                  </span>
                  {brand === b && (
                    <CheckCircle2
                      className="w-4 h-4"
                      style={{ color: "#2C52A2" }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Model selection */}
        {step === 2 && (
          <div className="px-4 pt-5">
            <h2
              className="font-black text-xl mb-4"
              style={{ color: "#002F34" }}
            >
              Select Model
            </h2>
            {/* Live search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search models..."
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm font-bold bg-white outline-none search-step-input"
                style={{
                  color: "#002F34",
                  border: modelSearch
                    ? "1.5px solid #2C52A2"
                    : "1px solid #e5e7eb",
                }}
              />
            </div>
            <div className="space-y-2">
              {(MODELS[brand] || [])
                .filter((m) =>
                  m.toLowerCase().includes(modelSearch.toLowerCase()),
                )
                .map((m) => (
                  <button
                    type="button"
                    key={m}
                    data-ocid={`create.model.${m
                      .toLowerCase()
                      .replace(/\s+/g, "_")}.button`}
                    onClick={() => {
                      setModel(m);
                      // Reset storage/color to first available for this model
                      const specs = MODEL_SPECS[m];
                      if (specs) {
                        setStorage(specs.storages[0]);
                        setColor(specs.colors[0]);
                      } else {
                        setStorage("128GB");
                        setColor("Black");
                      }
                      setStep(3);
                    }}
                    className="w-full bg-white rounded-xl px-4 py-3.5 flex items-center justify-between text-left"
                    style={{
                      border:
                        model === m ? "2px solid #2C52A2" : "1px solid #e5e7eb",
                    }}
                  >
                    <span
                      className="font-bold text-sm"
                      style={{ color: "#002F34" }}
                    >
                      {m}
                    </span>
                    {model === m && (
                      <CheckCircle2
                        className="w-4 h-4"
                        style={{ color: "#2C52A2" }}
                      />
                    )}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* STEP 3: Storage + Color */}
        {step === 3 && (
          <div className="px-4 pt-5 space-y-6 pb-6">
            <div>
              <h2
                className="font-black text-xl mb-4"
                style={{ color: "#002F34" }}
              >
                Select Storage
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {availableStorages.map((s) => (
                  <button
                    type="button"
                    key={s}
                    data-ocid={`create.storage.${s
                      .toLowerCase()
                      .replace(/ /g, "")}.button`}
                    onClick={() => setStorage(s)}
                    className="py-4 rounded-xl text-sm font-black"
                    style={{
                      background: storage === s ? "#2C52A2" : "white",
                      color: storage === s ? "white" : "#002F34",
                      border:
                        storage === s
                          ? "2px solid #2C52A2"
                          : "1px solid #e5e7eb",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2
                className="font-black text-lg mb-3"
                style={{ color: "#002F34" }}
              >
                Device Color
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {availableColors.map((c) => (
                  <button
                    type="button"
                    key={c}
                    data-ocid={`create.color.${c.toLowerCase().replace(/ /g, "_")}.button`}
                    onClick={() => setColor(c)}
                    className="py-3 rounded-xl text-xs font-bold"
                    style={{
                      background: color === c ? "#2C52A2" : "white",
                      color: color === c ? "white" : "#002F34",
                      border:
                        color === c ? "2px solid #2C52A2" : "1px solid #e5e7eb",
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              data-ocid="create.step3.primary_button"
              onClick={() => setStep(4)}
              className="w-full py-4 text-white font-black text-base"
              style={{ background: "#2C52A2", borderRadius: "12px" }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* STEP 4: Condition + Age */}
        {step === 4 && (
          <div className="px-4 pt-5 pb-6 space-y-5">
            <div>
              <h2
                className="font-black text-xl mb-4"
                style={{ color: "#002F34" }}
              >
                Condition
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {CONDITIONS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    data-ocid={`create.condition.${c
                      .toLowerCase()
                      .replace(/ /g, "_")}.button`}
                    onClick={() => {
                      if (!isScrap) {
                        setCondition(c);
                      }
                    }}
                    disabled={isScrap && c !== "Fair"}
                    className="py-3.5 rounded-xl text-sm font-bold"
                    style={{
                      background: condition === c ? "#2C52A2" : "white",
                      color: condition === c ? "white" : "#002F34",
                      border:
                        condition === c
                          ? "2px solid #2C52A2"
                          : "1px solid #e5e7eb",
                      opacity: isScrap && c !== "Fair" ? 0.4 : 1,
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2
                className="font-black text-lg mb-3"
                style={{ color: "#002F34" }}
              >
                How Old?
              </h2>
              <select
                data-ocid="create.age.select"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none bg-white"
                style={{ color: "#002F34" }}
                value={age}
                onChange={(e) => setAge(e.target.value)}
              >
                {AGES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              data-ocid="create.step4.primary_button"
              onClick={() => setStep(5)}
              className="w-full py-4 text-white font-black text-base"
              style={{ background: "#2C52A2", borderRadius: "12px" }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* STEP 5: Auction Type + Price */}
        {step === 5 && (
          <div className="px-4 pt-5 space-y-4 pb-6">
            <h2 className="font-black text-xl" style={{ color: "#002F34" }}>
              Auction Type & Price
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                data-ocid="create.auction.live.toggle"
                onClick={() => setAuctionType("Live20min")}
                className="py-5 rounded-xl flex flex-col items-center gap-2"
                style={{
                  background: auctionType === "Live20min" ? "#2C52A2" : "white",
                  color: auctionType === "Live20min" ? "white" : "#2C52A2",
                  border: "2px solid #2C52A2",
                }}
              >
                <Zap className="w-6 h-6" />
                <span className="text-sm font-black">Live 20 min</span>
              </button>
              <button
                type="button"
                data-ocid="create.auction.7day.toggle"
                onClick={() => setAuctionType("SevenDay")}
                className="py-5 rounded-xl flex flex-col items-center gap-2"
                style={{
                  background: auctionType === "SevenDay" ? "#2C52A2" : "white",
                  color: auctionType === "SevenDay" ? "white" : "#2C52A2",
                  border: "2px solid #2C52A2",
                }}
              >
                <Calendar className="w-6 h-6" />
                <span className="text-sm font-black">7-Day Auction</span>
              </button>
            </div>
            <div
              className="bg-white rounded-xl p-4"
              style={{ border: "1px solid #e5e7eb" }}
            >
              <label
                htmlFor="base-price"
                className="text-xs font-semibold text-gray-400 mb-2 block"
              >
                Set Your Base Price (₹)
              </label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3">
                <span className="font-bold" style={{ color: "#002F34" }}>
                  ₹
                </span>
                <input
                  id="base-price"
                  data-ocid="create.base_price.input"
                  type="number"
                  className="flex-1 py-3 text-lg font-black bg-transparent outline-none"
                  style={{ color: "#002F34" }}
                  placeholder="e.g. 72000"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                />
              </div>
            </div>
            <div
              className="bg-white rounded-xl p-4"
              style={{ border: "1px solid #e5e7eb" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4" style={{ color: "#7c3aed" }} />
                <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  77mobiles Pro Certified
                </span>
              </div>
              {[
                ["Brand", brand],
                [
                  "Model",
                  editedSpecs.model_name ||
                    (verifiedDevice ? verifiedDevice.model_name : model),
                ],
                [
                  "Storage",
                  editedSpecs.storage_gb ||
                    (verifiedDevice ? verifiedDevice.storage_gb : storage),
                ],
                [
                  "Color",
                  editedSpecs.color_name ||
                    (verifiedDevice ? verifiedDevice.color_name : color),
                ],
                ["Condition", condition],
                ["Age", age],
                [
                  "Auction",
                  auctionType === "Live20min" ? "Live 20min" : "7-Day",
                ],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1">
                  <span className="text-xs text-gray-400">{k}</span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: "#002F34" }}
                  >
                    {v || "—"}
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              data-ocid="create.publish.primary_button"
              onClick={handlePublish}
              disabled={publishing || !basePrice}
              className="w-full py-4 text-white font-black text-base transition-all"
              style={{
                background: publishing || !basePrice ? "#9ca3af" : "#2C52A2",
                cursor: publishing || !basePrice ? "not-allowed" : "pointer",
                borderRadius: "12px",
              }}
            >
              {publishing ? "Publishing..." : "PUBLISH LISTING"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
