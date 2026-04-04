import { memo, useEffect, useState } from "react";

interface LiveCountdownProps {
  /** Unix milliseconds timestamp for when the auction ends */
  expiryTimestamp: number;
  className?: string;
}

/**
 * LiveCountdown — real-time MM:SS countdown.
 * Turns red when < 5 minutes remain.
 * Uses React.memo so only the timer numbers re-render, not the parent card.
 */
const LiveCountdown = memo(function LiveCountdown({
  expiryTimestamp,
  className,
}: LiveCountdownProps) {
  const [msLeft, setMsLeft] = useState(() => expiryTimestamp - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setMsLeft(expiryTimestamp - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [expiryTimestamp]);

  if (msLeft <= 0) {
    return (
      <span
        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${className ?? ""}`}
        style={{ background: "#FEF2F2", color: "#DC2626" }}
      >
        EXPIRED
      </span>
    );
  }

  const totalSecs = Math.floor(msLeft / 1000);
  const days = Math.floor(totalSecs / 86400);
  const h = Math.floor((totalSecs % 86400) / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;

  let display: string;
  if (days > 0) {
    display = `${days}d ${String(h).padStart(2, "0")}h`;
  } else if (h > 0) {
    display = `${h}h ${String(m).padStart(2, "0")}m`;
  } else {
    display = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  const isUrgent = totalSecs < 5 * 60; // < 5 minutes

  return (
    <span
      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${className ?? ""}`}
      style={{
        background: isUrgent ? "#FEF2F2" : "#EFF6FF",
        color: isUrgent ? "#DC2626" : "#1D4ED8",
      }}
    >
      ⏱ {display}
    </span>
  );
});

export default LiveCountdown;
