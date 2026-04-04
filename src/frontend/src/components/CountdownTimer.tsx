import { memo, useEffect, useState } from "react";

interface Props {
  expiryTimestamp: number; // Unix ms timestamp
  className?: string;
}

const CountdownTimer = memo(function CountdownTimer({
  expiryTimestamp,
  className,
}: Props) {
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
        className={`text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full ${className ?? ""}`}
      >
        EXPIRED
      </span>
    );
  }

  const totalSecs = Math.floor(msLeft / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  const display =
    h > 0
      ? `${h}h ${String(m).padStart(2, "0")}m`
      : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  return (
    <span
      className={`text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full ${className ?? ""}`}
    >
      ⏱ {display}
    </span>
  );
});

export default CountdownTimer;
