import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Clock,
  Gamepad2,
  Headphones,
  Laptop,
  Smartphone,
  Tablet,
  Wrench,
} from "lucide-react";

const CATEGORIES = [
  {
    id: "smartphones",
    name: "Smartphones",
    icon: Smartphone,
    iconBg: "#EFF6FF",
    iconColor: "#007AFF",
    description: "iPhones, Android & more",
    isImei: true,
  },
  {
    id: "laptops",
    name: "MacBooks & Laptops",
    icon: Laptop,
    iconBg: "#F0FDF4",
    iconColor: "#16A34A",
    description: "MacBooks, Windows, Chromebooks",
    isImei: false,
  },
  {
    id: "tablets",
    name: "Tablets & iPads",
    icon: Tablet,
    iconBg: "#FAF5FF",
    iconColor: "#7C3AED",
    description: "iPads, Android tablets",
    isImei: false,
  },
  {
    id: "watches",
    name: "Watches & Wearables",
    icon: Clock,
    iconBg: "#FFF8E1",
    iconColor: "#F59E0B",
    description: "Smartwatches, fitness trackers",
    isImei: false,
  },
  {
    id: "gaming",
    name: "Gaming Consoles",
    icon: Gamepad2,
    iconBg: "#FFF7ED",
    iconColor: "#EA580C",
    description: "PS5, Xbox, Nintendo & more",
    isImei: false,
  },
  {
    id: "accessories",
    name: "Accessories",
    icon: Headphones,
    iconBg: "#FFF1F2",
    iconColor: "#E11D48",
    description: "Cases, chargers, cables & more",
    isImei: false,
  },
  {
    id: "spare-parts",
    name: "Spare Parts",
    icon: Wrench,
    iconBg: "#F5F3FF",
    iconColor: "#7C3AED",
    description: "Screens, batteries, components",
    isImei: false,
  },
] as const;

export default function SellCategoryScreen() {
  const navigate = useNavigate();

  const handleCategoryTap = (cat: (typeof CATEGORIES)[number]) => {
    navigate({
      to: "/sell",
      search: {
        mode: "manual",
        scrap: "false",
        prefillBrand: "",
        prefillModel: "",
        category: cat.name,
      },
    });
  };

  return (
    <div
      className="bg-white min-h-screen flex flex-col"
      style={{ position: "fixed", inset: 0, zIndex: 100, overflowY: "auto" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-4 bg-white sticky top-0 z-10"
        style={{ borderBottom: "1px solid #e5e7eb" }}
      >
        <button
          type="button"
          data-ocid="sell_category.back.button"
          onClick={() => navigate({ to: "/app" })}
          className="w-9 h-9 flex items-center justify-center rounded-full flex-shrink-0"
          style={{ background: "#F2F2F7", color: "#002F34" }}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <p
            className="font-black text-base leading-tight"
            style={{ color: "#002F34" }}
          >
            What are you selling?
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Select a category to get started
          </p>
        </div>
      </div>

      {/* Category Grid */}
      <div className="flex-1 px-4 pt-5 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                type="button"
                key={cat.id}
                data-ocid={`sell_category.${cat.id}.button`}
                onClick={() => handleCategoryTap(cat)}
                className="bg-white rounded-2xl p-4 flex flex-col gap-3 text-left"
                style={{
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  transition: "transform 0.15s ease",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: cat.iconBg }}
                >
                  <Icon className="w-6 h-6" style={{ color: cat.iconColor }} />
                </div>
                <div className="flex-1">
                  <p
                    className="font-bold text-sm leading-tight mb-1"
                    style={{ color: "#002F34" }}
                  >
                    {cat.name}
                  </p>
                  <p className="text-[11px] text-gray-400 leading-snug">
                    {cat.description}
                  </p>
                </div>
                {cat.isImei && (
                  <span
                    className="self-start text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "#eff6ff", color: "#007AFF" }}
                  >
                    ✓ IMEI Verified
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Browse all methods */}
        <div className="mt-6 text-center">
          <button
            type="button"
            data-ocid="sell_category.browse_all.link"
            onClick={() => navigate({ to: "/sell-choice" })}
            className="text-sm font-semibold"
            style={{ color: "#007AFF" }}
          >
            Not sure? Browse all methods →
          </button>
        </div>
      </div>
    </div>
  );
}
