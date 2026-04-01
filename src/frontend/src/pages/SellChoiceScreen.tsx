import { Switch } from "@/components/ui/switch";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  FileText,
  Monitor,
  PenLine,
  Plus,
  ScanLine,
  ScanSearch,
  Smartphone,
  Usb,
} from "lucide-react";
import { useRef, useState } from "react";

type CardId = "usb" | "scan" | "manual";

export default function SellChoiceScreen() {
  const navigate = useNavigate();
  const [deadPhone, setDeadPhone] = useState(false);
  const [expandedCard, setExpandedCard] = useState<CardId>("usb");
  const scrapParam = deadPhone ? "true" : "false";
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleCardClick = (id: CardId) => {
    setExpandedCard(id);
  };

  const ImageGrid = ({ cardId }: { cardId: CardId }) => (
    <div
      className="mt-3 pt-3 overflow-hidden"
      style={{
        borderTop: "1px solid #e5e7eb",
        maxHeight: expandedCard === cardId ? "500px" : "0",
        opacity: expandedCard === cardId ? 1 : 0,
        transition: "max-height 0.3s ease, opacity 0.25s ease",
      }}
    >
      <p className="text-xs font-bold mb-2" style={{ color: "#007AFF" }}>
        Add Images
      </p>
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => {
          const inputKey = `${cardId}-${i}`;
          return (
            <label
              key={i}
              htmlFor={`img-${inputKey}`}
              className="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center bg-gray-50 cursor-pointer active:bg-blue-50 transition-colors"
              style={{ borderColor: "#007AFF" }}
            >
              <input
                id={`img-${inputKey}`}
                ref={(el) => {
                  fileInputRefs.current[inputKey] = el;
                }}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Preview could be added here
                  }
                }}
              />
              <Plus className="w-5 h-5" style={{ color: "#007AFF" }} />
            </label>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => {
          if (cardId === "usb")
            navigate({
              to: "/usb-diagnostic",
              search: { scrap: scrapParam } as never,
            });
          else if (cardId === "scan")
            navigate({
              to: "/doctor-test",
              search: { scrap: scrapParam } as never,
            });
          else
            navigate({
              to: "/sell",
              search: {
                mode: "manual",
                scrap: scrapParam,
                prefillBrand: "",
                prefillModel: "",
                category: "",
              },
            });
        }}
        className="w-full py-3 rounded-xl text-white text-sm font-bold mt-3"
        style={{ background: "#007AFF" }}
      >
        Continue
        {cardId === "usb" && " with USB Scan"}
        {cardId === "scan" && " with Phone Scan"}
        {cardId === "manual" && " with Manual Entry"}
      </button>
    </div>
  );

  return (
    <div className="mobile-container bg-white min-h-screen flex flex-col">
      <header
        className="bg-white px-4 py-3 flex items-center gap-3"
        style={{ borderBottom: "1px solid #e5e7eb" }}
      >
        <button
          type="button"
          data-ocid="sell_choice.back.button"
          onClick={() => navigate({ to: "/app" })}
          className="flex items-center gap-1"
          style={{ color: "#007AFF" }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-semibold">Back</span>
        </button>
        <h1 className="font-black text-base text-gray-900 flex-1 text-center">
          Choose Listing Method
        </h1>
        <div className="w-16" />
      </header>

      <div className="flex-1 px-4 py-5 space-y-4 overflow-y-auto pb-8">
        <div
          className="bg-white rounded-2xl p-4 flex items-center justify-between"
          style={{ border: "1px solid #e5e7eb" }}
        >
          <div>
            <p className="font-bold text-sm text-gray-900">
              Phone won&apos;t turn on?
            </p>
            <p className="text-xs text-gray-500">
              Toggle for Scrap / Parts mode
            </p>
          </div>
          <Switch
            data-ocid="sell_choice.dead_phone.switch"
            checked={deadPhone}
            onCheckedChange={setDeadPhone}
          />
        </div>

        {deadPhone && (
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ background: "#fef2f2", border: "1px solid #fca5a5" }}
          >
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-xs font-semibold text-red-700">
              Scrap/Parts mode will be activated
            </p>
          </div>
        )}

        {/* USB Scan Card */}
        <div
          className="bg-white rounded-2xl p-5 cursor-pointer transition-all"
          style={{
            border:
              expandedCard === "usb"
                ? "2px solid #007AFF"
                : "1px solid #e5e7eb",
            boxShadow:
              expandedCard === "usb"
                ? "0 2px 8px rgba(0,82,212,0.12)"
                : "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <button
            type="button"
            data-ocid="sell_choice.usb_scan.primary_button"
            onClick={() => handleCardClick("usb")}
            className="w-full text-left"
          >
            <div className="flex items-start gap-4 relative">
              <div className="absolute top-0 right-0">
                <span
                  className="text-[9px] font-black text-white px-2 py-0.5 rounded-full"
                  style={{ background: "#22c55e" }}
                >
                  RECOMMENDED
                </span>
              </div>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#EEF2FF" }}
              >
                <Usb className="w-7 h-7" style={{ color: "#007AFF" }} />
              </div>
              <div className="flex-1 pr-16">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base text-gray-900">
                    USB Scan (Verified)
                  </h3>
                  <Monitor className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Connect via USB to auto-verify specs and battery health.
                </p>
              </div>
            </div>
          </button>
          <ImageGrid cardId="usb" />
        </div>

        {/* Scan This Phone Card */}
        <div
          className="bg-white rounded-2xl p-5 cursor-pointer transition-all"
          style={{
            border:
              expandedCard === "scan"
                ? "2px solid #007AFF"
                : "1px solid #e5e7eb",
            boxShadow:
              expandedCard === "scan"
                ? "0 2px 8px rgba(0,82,212,0.12)"
                : "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <button
            type="button"
            data-ocid="sell_choice.scan_phone.secondary_button"
            onClick={() => handleCardClick("scan")}
            className="w-full text-left"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#f3f4f6" }}
              >
                <ScanSearch className="w-7 h-7 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base text-gray-900">
                    Scan This Phone
                  </h3>
                  <ScanLine className="w-4 h-4 text-blue-400" />
                  <Smartphone className="w-3.5 h-3.5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Run a 60-second diagnostic on this device.
                </p>
              </div>
            </div>
          </button>
          <ImageGrid cardId="scan" />
        </div>

        {/* Manual Entry Card */}
        <div
          className="bg-white rounded-2xl p-5 cursor-pointer transition-all"
          style={{
            border:
              expandedCard === "manual"
                ? "2px solid #007AFF"
                : "1px solid #e5e7eb",
            boxShadow:
              expandedCard === "manual"
                ? "0 2px 8px rgba(0,82,212,0.12)"
                : "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <button
            type="button"
            data-ocid="sell_choice.manual_entry.button"
            onClick={() => handleCardClick("manual")}
            className="w-full text-left"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#f3f4f6" }}
              >
                <FileText className="w-7 h-7 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base text-gray-900">
                    Manual Entry
                  </h3>
                  <PenLine className="w-4 h-4 text-orange-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Fill in specs manually without hardware verification.
                </p>
              </div>
            </div>
          </button>
          <ImageGrid cardId="manual" />
        </div>
      </div>
    </div>
  );
}
