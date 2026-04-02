import { useCallback, useEffect, useRef, useState } from "react";

export interface CarouselSlide {
  id: string;
  bgGradient?: string;
  bgColor?: string;
  theme?: "light" | "dark";
  accentColor?: string;
  badge?: { text: string; pulse?: boolean };
  title: string;
  subtitle: string;
  ctaText: string;
  ctaColor?: string;
  image?: string;
}

interface PortalCarouselProps {
  slides: CarouselSlide[];
  intervalMs?: number;
  onCtaClick?: (slideId: string, ctaText: string) => void;
}

// ── Sparkline slide (special rendering for id "b5") ──
function SparklineSlide({ total }: { total: number }) {
  const sparkData = [58000, 61000, 59500, 64000, 67000, 71000, 68500];
  const max = Math.max(...sparkData);
  const min = Math.min(...sparkData);
  const w = 120;
  const h = 40;
  const pts = sparkData
    .map((v, i) => {
      const x = (i / (sparkData.length - 1)) * w;
      const y = h - ((v - min) / (max - min)) * h;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  const lastX = w;
  const lastY = h - ((sparkData[6] - min) / (max - min)) * h;

  return (
    <div
      style={{
        width: `${100 / total}%`,
        flexShrink: 0,
        background: "#F0FDF4",
        display: "flex",
        alignItems: "stretch",
      }}
    >
      <div
        style={{
          padding: "16px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: "9px",
            fontWeight: 700,
            color: "#16a34a",
            background: "rgba(22,163,74,0.1)",
            padding: "3px 8px",
            borderRadius: "100px",
            alignSelf: "flex-start",
            marginBottom: "6px",
          }}
        >
          {"\uD83D\uDCC8 PRICE TREND"}
        </span>
        <p
          style={{
            color: "#111827",
            fontSize: "13px",
            fontWeight: 900,
            marginBottom: "3px",
          }}
        >
          Used iPhone 15 Market
        </p>
        <p
          style={{
            color: "#6B7280",
            fontSize: "10px",
            marginBottom: "10px",
          }}
        >
          Price trending up +18% this month
        </p>
        <svg
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          role="img"
          aria-label="Price history sparkline"
        >
          <polyline
            points={pts}
            fill="none"
            stroke="#16a34a"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx={lastX} cy={lastY} r="3" fill="#16a34a" />
        </svg>
        <p
          style={{
            color: "#16a34a",
            fontSize: "11px",
            fontWeight: 700,
            marginTop: "6px",
          }}
        >
          {"\u20B968,500 avg \u00B7 Rising"}
        </p>
      </div>
    </div>
  );
}

export default function PortalCarousel({
  slides,
  intervalMs = 5000,
  onCtaClick,
}: PortalCarouselProps) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = slides.length;

  const goNext = useCallback(() => {
    setCurrent((c) => (c + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    setCurrent((c) => (c - 1 + total) % total);
  }, [total]);

  const goTo = (idx: number) => setCurrent(idx);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(goNext, intervalMs);
  }, [goNext, intervalMs]);

  useEffect(() => {
    timerRef.current = setInterval(goNext, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [goNext, intervalMs]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
      resetTimer();
    }
  };

  return (
    <div
      className="relative overflow-hidden"
      style={{
        borderRadius: "12px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        border: "1px solid #e5e7eb",
      }}
      data-ocid="portal.carousel.panel"
    >
      {/* 16:9 aspect ratio wrapper */}
      <div style={{ paddingBottom: "38.25%", position: "relative" }}>
        {/* Slides track */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            width: `${total * 100}%`,
            transform: `translateX(-${(current / total) * 100}%)`,
            transition: "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {slides.map((slide) => {
            // Task 5: Special sparkline slide for id "b5"
            if (slide.id === "b5") {
              return <SparklineSlide key={slide.id} total={total} />;
            }

            const isLight = slide.theme === "light";
            const accent = slide.accentColor ?? "#00B5B5";
            const bg = isLight
              ? (slide.bgColor ?? "#F8F9FA")
              : (slide.bgGradient ?? "linear-gradient(135deg,#1a1a2e,#0f3460)");

            return (
              <div
                key={slide.id}
                style={{
                  width: `${100 / total}%`,
                  flexShrink: 0,
                  background: bg,
                  position: "relative",
                  display: "flex",
                  alignItems: isLight ? "stretch" : "flex-end",
                }}
              >
                {/* Dark gradient overlay — dark slides only */}
                {!isLight && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.12) 55%, transparent 100%)",
                      pointerEvents: "none",
                    }}
                  />
                )}

                {/* Device emoji */}
                {slide.image && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: isLight ? "16px" : "18px",
                      transform: isLight
                        ? "translateY(-50%)"
                        : "translateY(-58%)",
                      fontSize: isLight ? "56px" : "52px",
                      opacity: isLight ? 1 : 0.28,
                      pointerEvents: "none",
                      userSelect: "none",
                      lineHeight: 1,
                      filter: isLight
                        ? "drop-shadow(0 4px 12px rgba(0,0,0,0.18))"
                        : "none",
                    }}
                  >
                    {slide.image}
                  </div>
                )}

                {/* Text content */}
                <div
                  style={{
                    position: "relative",
                    zIndex: 2,
                    padding: isLight ? "16px 80px 16px 16px" : "14px 16px",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: isLight ? "center" : "flex-end",
                    minHeight: isLight ? "100%" : undefined,
                  }}
                >
                  {slide.badge && (
                    <span
                      className={slide.badge.pulse ? "animate-pulse" : ""}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "3px",
                        background: isLight
                          ? "rgba(0,181,181,0.08)"
                          : "rgba(255,255,255,0.15)",
                        border: isLight
                          ? `1px solid ${accent}`
                          : "1px solid rgba(255,255,255,0.22)",
                        borderRadius: "100px",
                        padding: "3px 8px",
                        fontSize: "9px",
                        fontWeight: 700,
                        color: isLight ? accent : "white",
                        marginBottom: "6px",
                        letterSpacing: "0.3px",
                        alignSelf: "flex-start",
                      }}
                    >
                      {slide.badge.text}
                    </span>
                  )}
                  <p
                    style={{
                      color: isLight ? "#333333" : "white",
                      fontSize: "13px",
                      fontWeight: 900,
                      lineHeight: "1.3",
                      marginBottom: "3px",
                      textShadow: isLight
                        ? "none"
                        : "0 1px 6px rgba(0,0,0,0.4)",
                    }}
                  >
                    {slide.title}
                  </p>
                  <p
                    style={{
                      color: isLight ? "#555555" : "rgba(255,255,255,0.78)",
                      fontSize: "10px",
                      lineHeight: "1.4",
                      marginBottom: "10px",
                    }}
                  >
                    {slide.subtitle}
                  </p>
                  <button
                    type="button"
                    onClick={() => onCtaClick?.(slide.id, slide.ctaText)}
                    style={{
                      background: isLight
                        ? accent
                        : slide.ctaColor || "#002F34",
                      color: "white",
                      border: "none",
                      borderRadius: isLight ? "100px" : "8px",
                      padding: isLight ? "7px 16px" : "6px 13px",
                      fontSize: "10px",
                      fontWeight: 700,
                      cursor: "pointer",
                      letterSpacing: "0.2px",
                      alignSelf: "flex-start",
                    }}
                  >
                    {slide.ctaText} {"\u2192"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dot indicators */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "5px",
          zIndex: 10,
        }}
      >
        {slides.map((slide, i) => {
          const isLight = slide.theme === "light" || slide.id === "b5";
          const accent =
            slide.id === "b5" ? "#16a34a" : (slide.accentColor ?? "#00B5B5");
          return (
            <button
              key={slide.id}
              type="button"
              data-ocid={`carousel.dot.${i + 1}`}
              onClick={() => {
                goTo(i);
                resetTimer();
              }}
              style={{
                width: i === current ? "18px" : "6px",
                height: "6px",
                borderRadius: "100px",
                background:
                  i === current
                    ? isLight
                      ? accent
                      : "white"
                    : isLight
                      ? "rgba(0,181,181,0.3)"
                      : "rgba(255,255,255,0.42)",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
